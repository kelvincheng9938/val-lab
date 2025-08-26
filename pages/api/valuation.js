export default async function handler(req, res) {
  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ error: '股票代码不能为空' })
  }

  try {
    const FMP_API_KEY = process.env.FMP_API_KEY || 'demo'

    // 獲取更多數據來做準確估值
    const [profileRes, metricsRes, estimatesRes, ratiosRes, growthRes] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${FMP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?period=annual&apikey=${FMP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${symbol}?apikey=${FMP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?period=annual&limit=5&apikey=${FMP_API_KEY}`)
    ])

    const [profile, metrics, estimates, ratios, growth] = await Promise.all([
      profileRes.json(),
      metricsRes.json(), 
      estimatesRes.json(),
      ratiosRes.json(),
      growthRes.json()
    ])

    if (!profile[0] || profile[0].error) {
      throw new Error('股票不存在或API錯誤')
    }

    const company = profile[0]
    const metric = metrics[0] || {}
    const ratio = ratios[0] || {}
    
    // 計算歷史增長率
    const historicalGrowthRates = growth && growth.length > 1 ? 
      growth.slice(0, 3).map(g => g.revenueGrowth || 0) : []
    
    const avgHistoricalGrowth = historicalGrowthRates.length > 0 ? 
      historicalGrowthRates.reduce((a, b) => a + b, 0) / historicalGrowthRates.length : 0

    // 獲取當前財務指標
    const currentPrice = company.price || 0
    const roe = ratio.returnOnEquityTTM || metric.roe || 0
    const roic = ratio.returnOnInvestedCapitalTTM || 0
    const debtToEquity = ratio.debtEquityRatioTTM || 0
    const currentRatio = ratio.currentRatioTTM || 0
    
    // EPS 數據
    let eps = {
      ttm: metric.netIncomePerShareTTM || 0,
      ntm: 0,
      fy1: 0,
      fy2: 0
    }

    // 使用分析師預估數據
    let analystGrowth = 0
    if (estimates && estimates.length > 0) {
      const currentYear = new Date().getFullYear()
      let fy1Eps = 0, fy2Eps = 0
      
      estimates.forEach(est => {
        const year = parseInt(est.date)
        if (year === currentYear + 1) {
          eps.ntm = est.estimatedEpsAvg || 0
          eps.fy1 = est.estimatedEpsAvg || 0
          fy1Eps = eps.fy1
        } else if (year === currentYear + 2) {
          eps.fy2 = est.estimatedEpsAvg || 0
          fy2Eps = eps.fy2
        }
      })
      
      // 計算分析師預期增長率
      if (fy1Eps > 0 && fy2Eps > 0) {
        analystGrowth = ((fy2Eps - fy1Eps) / fy1Eps) * 100
      }
    }

    // 如果沒有預估數據，使用TTM數據和歷史增長率
    if (eps.ntm === 0) eps.ntm = eps.ttm
    if (eps.fy1 === 0) eps.fy1 = eps.ttm
    if (eps.fy2 === 0) {
      const growthRate = analystGrowth || avgHistoricalGrowth || 10
      eps.fy2 = eps.fy1 * (1 + Math.max(Math.min(growthRate, 50), -20) / 100)
    }

    // 動態計算 PE bands - 根據公司質量和行業
    const currentPE = eps.ttm > 0 ? currentPrice / eps.ttm : 0
    
    // 基礎行業 PE（根據sector調整）
    const sectorPEMap = {
      'Technology': 25,
      'Healthcare': 22,
      'Consumer Cyclical': 18,
      'Consumer Defensive': 16,
      'Financial Services': 14,
      'Industrials': 17,
      'Energy': 12,
      'Utilities': 15,
      'Real Estate': 20,
      'Materials': 15,
      'Communication Services': 20
    }
    
    const baseSectorPE = sectorPEMap[company.sector] || 18
    
    // 質量評分 (0-1)
    const qualityScore = calculateQualityScore(roe, roic, debtToEquity, currentRatio)
    
    // 增長評分 (0-1)
    const growthScore = calculateGrowthScore(analystGrowth, avgHistoricalGrowth)
    
    // 動態調整 PE bands
    const qualityAdjustment = (qualityScore - 0.5) * 0.4 // ±20%
    const growthAdjustment = (growthScore - 0.5) * 0.6   // ±30%
    
    const adjustedBasePE = baseSectorPE * (1 + qualityAdjustment + growthAdjustment)
    
    const peBands = {
      low: Math.max(8, adjustedBasePE * 0.7),      // 保守估值
      base: Math.max(12, adjustedBasePE),          // 合理估值
      high: Math.max(15, adjustedBasePE * 1.4)     // 乐观估值
    }

    // 計算估值區間
    const valuations = {
      current: {
        price: currentPrice,
        pe: currentPE
      },
      bands: {
        low: {
          pe: peBands.low,
          price: eps.ntm * peBands.low
        },
        base: {
          pe: peBands.base,
          price: eps.ntm * peBands.base
        },
        high: {
          pe: peBands.high,
          price: eps.ntm * peBands.high
        }
      }
    }

    // 最終增長率
    const finalGrowthRate = analystGrowth || avgHistoricalGrowth || 
      (eps.fy2 > eps.fy1 ? ((eps.fy2 - eps.fy1) / eps.fy1 * 100) : 0)

    const result = {
      symbol: symbol.toUpperCase(),
      companyName: company.companyName,
      currentPrice,
      marketCap: company.mktCap,
      eps,
      valuations,
      growthRate: finalGrowthRate,
      sector: company.sector,
      industry: company.industry,
      description: company.description,
      // 額外的財務指標
      metrics: {
        roe: roe * 100, // 轉換為百分比
        roic: roic * 100,
        debtToEquity,
        currentRatio,
        qualityScore,
        growthScore
      }
    }

    res.status(200).json(result)

  } catch (error) {
    console.error('Valuation API Error:', error)
    res.status(500).json({ 
      error: '獲取估值數據失敗',
      details: error.message 
    })
  }
}

// 質量評分函數
function calculateQualityScore(roe, roic, debtToEquity, currentRatio) {
  let score = 0.5 // 基礎分數
  
  // ROE評分 (0-0.3)
  if (roe > 0.15) score += 0.3
  else if (roe > 0.10) score += 0.2
  else if (roe > 0.05) score += 0.1
  else if (roe < 0) score -= 0.2
  
  // ROIC評分 (0-0.25)
  if (roic > 0.15) score += 0.25
  else if (roic > 0.10) score += 0.15
  else if (roic > 0.05) score += 0.05
  else if (roic < 0) score -= 0.15
  
  // 債務評分 (0-0.15)
  if (debtToEquity < 0.3) score += 0.15
  else if (debtToEquity < 0.6) score += 0.1
  else if (debtToEquity < 1.0) score += 0.05
  else if (debtToEquity > 2.0) score -= 0.1
  
  // 流動性評分 (0-0.1)
  if (currentRatio > 2) score += 0.1
  else if (currentRatio > 1.5) score += 0.05
  else if (currentRatio < 1) score -= 0.05
  
  return Math.max(0, Math.min(1, score))
}

// 增長評分函數
function calculateGrowthScore(analystGrowth, historicalGrowth) {
  const avgGrowth = analystGrowth || historicalGrowth || 0
  
  let score = 0.5 // 基礎分數
  
  if (avgGrowth > 20) score = 0.9
  else if (avgGrowth > 15) score = 0.8
  else if (avgGrowth > 10) score = 0.7
  else if (avgGrowth > 5) score = 0.6
  else if (avgGrowth > 0) score = 0.5
  else if (avgGrowth > -5) score = 0.4
  else if (avgGrowth > -10) score = 0.3
  else score = 0.2
  
  return Math.max(0.1, Math.min(1, score))
}

export default async function handler(req, res) {
  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ error: '股票代码不能为空' })
  }

  try {
    const FMP_API_KEY = process.env.FMP_API_KEY || 'demo' // 使用demo key进行测试

    // 获取基本信息和财务数据
    const [profileRes, metricsRes, estimatesRes] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${FMP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?period=annual&apikey=${FMP_API_KEY}`)
    ])

    const [profile, metrics, estimates] = await Promise.all([
      profileRes.json(),
      metricsRes.json(),
      estimatesRes.json()
    ])

    if (!profile[0] || profile[0].error) {
      throw new Error('股票不存在或API错误')
    }

    const company = profile[0]
    const metric = metrics[0] || {}
    
    // 计算估值数据
    const currentPrice = company.price || 0
    
    // EPS 数据 - 优先使用分析师预估，回退到TTM
    let eps = {
      ttm: metric.netIncomePerShareTTM || 0,
      ntm: 0,
      fy1: 0,
      fy2: 0
    }

    if (estimates && estimates.length > 0) {
      // 使用分析师预估数据
      const currentYear = new Date().getFullYear()
      estimates.forEach(est => {
        const year = parseInt(est.date)
        if (year === currentYear + 1) {
          eps.ntm = est.estimatedEpsAvg || 0
          eps.fy1 = est.estimatedEpsAvg || 0
        } else if (year === currentYear + 2) {
          eps.fy2 = est.estimatedEpsAvg || 0
        }
      })
    }

    // 如果没有预估数据，使用TTM数据作为基准
    if (eps.ntm === 0) eps.ntm = eps.ttm
    if (eps.fy1 === 0) eps.fy1 = eps.ttm
    if (eps.fy2 === 0) eps.fy2 = eps.ttm * 1.1 // 假设10%增长

    // P/E 倍数计算 - 基于行业和增长率
    const currentPE = currentPrice / eps.ttm || 0
    const industryAvgPE = 20 // 可以从行业数据获取
    
    const peBands = {
      low: Math.max(12, industryAvgPE * 0.8),     // 保守估值
      base: Math.max(15, industryAvgPE),          // 合理估值  
      high: Math.max(25, industryAvgPE * 1.5)     // 乐观估值
    }

    // 计算估值区间
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

    // 计算增长率
    const growthRate = eps.fy2 > eps.fy1 ? ((eps.fy2 - eps.fy1) / eps.fy1 * 100) : 0

    const result = {
      symbol: symbol.toUpperCase(),
      companyName: company.companyName,
      currentPrice,
      marketCap: company.mktCap,
      eps,
      valuations,
      growthRate,
      sector: company.sector,
      industry: company.industry,
      description: company.description
    }

    res.status(200).json(result)

  } catch (error) {
    console.error('Valuation API Error:', error)
    res.status(500).json({ 
      error: '获取估值数据失败',
      details: error.message 
    })
  }
}

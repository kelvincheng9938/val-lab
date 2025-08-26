export default async function handler(req, res) {
  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ error: '股票代码不能为空' })
  }

  try {
    const FMP_API_KEY = process.env.FMP_API_KEY || 'demo'

    // 获取公司信息以确定行业
    const profileRes = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`)
    const profile = await profileRes.json()
    
    if (!profile[0]) {
      throw new Error('公司信息不存在')
    }

    const sector = profile[0].sector
    
    // 获取同行业公司 (简化版 - 实际应用中需要更精确的同行筛选)
    const peersData = [
      {
        symbol: symbol.toUpperCase(),
        name: profile[0].companyName,
        pe: 25.5,
        growth: 12.5,
        marketCap: profile[0].mktCap,
        isCurrent: true
      },
      // 添加一些示例同行数据
      {
        symbol: 'PEER1',
        name: '同行公司1',
        pe: 22.3,
        growth: 8.2,
        marketCap: 50000000000
      },
      {
        symbol: 'PEER2', 
        name: '同行公司2',
        pe: 28.7,
        growth: 15.1,
        marketCap: 75000000000
      },
      {
        symbol: 'PEER3',
        name: '同行公司3', 
        pe: 18.9,
        growth: 5.8,
        marketCap: 30000000000
      }
    ]

    res.status(200).json({
      sector,
      peers: peersData
    })

  } catch (error) {
    console.error('Peers API Error:', error)
    res.status(500).json({ 
      error: '获取同行数据失败',
      details: error.message 
    })
  }
}

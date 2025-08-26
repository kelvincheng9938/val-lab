export default async function handler(req, res) {
  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ error: '股票代码不能为空' })
  }

  try {
    const FMP_API_KEY = process.env.FMP_API_KEY || 'demo'

    // 在实际应用中，这里会获取真实的业务分部数据
    // 现在提供示例数据
    const segments = [
      {
        segment: '核心业务',
        revenue: 45000000000,
        percentage: 65
      },
      {
        segment: '云服务',
        revenue: 15000000000, 
        percentage: 22
      },
      {
        segment: '其他服务',
        revenue: 9000000000,
        percentage: 13
      }
    ]

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      segments,
      totalRevenue: segments.reduce((sum, seg) => sum + seg.revenue, 0)
    })

  } catch (error) {
    console.error('Segments API Error:', error)
    res.status(500).json({ 
      error: '获取业务分部数据失败',
      details: error.message 
    })
  }
}


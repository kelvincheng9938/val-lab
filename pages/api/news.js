export default async function handler(req, res) {
  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ error: '股票代码不能为空' })
  }

  try {
    const FMP_API_KEY = process.env.FMP_API_KEY || 'demo'

    const newsRes = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${FMP_API_KEY}`
    )
    const newsData = await newsRes.json()

    // 格式化新闻数据
    const news = (newsData || []).map(item => ({
      title: item.title,
      summary: item.text?.substring(0, 150) + '...' || '',
      url: item.url,
      publishedDate: item.publishedDate,
      source: item.site
    })).slice(0, 8)

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      news
    })

  } catch (error) {
    console.error('News API Error:', error)
    res.status(500).json({ 
      error: '获取新闻数据失败',
      details: error.message 
    })
  }
}

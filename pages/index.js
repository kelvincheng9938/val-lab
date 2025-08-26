import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, BarChart3, PieChart, Newspaper } from 'lucide-react'
import toast from 'react-hot-toast'
import ValuationChart from '../components/ValuationChart'
import SummaryCard from '../components/SummaryCard'
import PeersChart from '../components/PeersChart'
import SectorChart from '../components/SectorChart'
import NewsFeed from '../components/NewsFeed'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function Home() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      toast.error('请输入股票代码')
      return
    }

    setLoading(true)
    try {
      // 并行请求所有API
      const [valuation, peers, segments, news] = await Promise.allSettled([
        fetch(`/api/valuation?symbol=${ticker.toUpperCase()}`).then(res => res.json()),
        fetch(`/api/peers?symbol=${ticker.toUpperCase()}`).then(res => res.json()),
        fetch(`/api/segments?symbol=${ticker.toUpperCase()}`).then(res => res.json()),
        fetch(`/api/news?symbol=${ticker.toUpperCase()}`).then(res => res.json()),
      ])

      const result = {
        valuation: valuation.status === 'fulfilled' ? valuation.value : null,
        peers: peers.status === 'fulfilled' ? peers.value : null,
        segments: segments.status === 'fulfilled' ? segments.value : null,
        news: news.status === 'fulfilled' ? news.value : null,
      }

      // 检查是否有任何成功的数据
      const hasData = Object.values(result).some(v => v && !v.error)
      if (!hasData) {
        throw new Error('无法获取股票数据')
      }

      setData(result)
      
      // 显示部分失败的警告
      const failedServices = Object.entries(result)
        .filter(([key, value]) => !value || value.error)
        .map(([key]) => key)
      
      if (failedServices.length > 0) {
        toast.error(`部分数据获取失败: ${failedServices.join(', ')}`)
      } else {
        toast.success('数据获取成功!')
      }

    } catch (error) {
      console.error('分析失败:', error)
      toast.error('分析失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-blue-500/20 blur-3xl"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              VAL<span className="text-primary-400">·</span>LAB
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              专业股票估值分析平台
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="输入股票代码 (如: AAPL, CRM)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full mt-4 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? '分析中...' : '开始分析'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      {(loading || data) && (
        <div className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Charts Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {loading ? (
                    <LoadingSkeleton type="summary" />
                  ) : (
                    data?.valuation && <SummaryCard data={data.valuation} ticker={ticker} />
                  )}
                </motion.div>

                {/* Valuation Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {loading ? (
                    <LoadingSkeleton type="chart" />
                  ) : (
                    data?.valuation && <ValuationChart data={data.valuation} />
                  )}
                </motion.div>

                {/* Peers Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {loading ? (
                    <LoadingSkeleton type="chart" />
                  ) : (
                    data?.peers && <PeersChart data={data.peers} />
                  )}
                </motion.div>

              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                
                {/* Sector Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {loading ? (
                    <LoadingSkeleton type="pie" />
                  ) : (
                    data?.segments && <SectorChart data={data.segments} />
                  )}
                </motion.div>

                {/* News Feed */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {loading ? (
                    <LoadingSkeleton type="news" />
                  ) : (
                    data?.news && <NewsFeed data={data.news} />
                  )}
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


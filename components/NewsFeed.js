import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const SummaryCard = ({ data, ticker }) => {
  if (!data) return null

  const { companyName, currentPrice, marketCap, valuations, growthRate, sector } = data
  
  // 计算与估值的差异
  const baseTarget = valuations?.bands?.base?.price || 0
  const upside = baseTarget > currentPrice ? ((baseTarget - currentPrice) / currentPrice * 100) : 0
  const downside = baseTarget < currentPrice ? ((currentPrice - baseTarget) / currentPrice * 100) : 0

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num?.toFixed(2) || '0.00'}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{ticker?.toUpperCase()}</h2>
          <p className="text-gray-400 text-sm">{companyName}</p>
          <p className="text-gray-500 text-xs mt-1">{sector}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{formatNumber(currentPrice)}</div>
          {upside > 0 && (
            <div className="flex items-center text-green-400 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +{upside.toFixed(1)}% 潜在涨幅
            </div>
          )}
          {downside > 0 && (
            <div className="flex items-center text-red-400 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              -{downside.toFixed(1)}% 潜在跌幅
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
          <div className="text-2xl font-bold text-white">{formatNumber(marketCap)}</div>
          <div className="text-gray-400 text-sm">市值</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
          <div className="text-2xl font-bold text-primary-400">{formatNumber(baseTarget)}</div>
          <div className="text-gray-400 text-sm">合理价值</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
          <div className={`text-2xl font-bold ${growthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growthRate?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-gray-400 text-sm">预期增长</div>
        </div>
      </div>
    </motion.div>
  )
}

export default SummaryCard

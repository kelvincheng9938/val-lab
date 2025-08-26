import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const PeersChart = ({ data }) => {
  if (!data || !data.peers) return null

  const { sector, peers } = data

  // 准备散点图数据
  const chartData = {
    datasets: [
      {
        label: '同行对比',
        data: peers.map(peer => ({
          x: peer.pe || 0,
          y: peer.growth || 0,
          name: peer.symbol,
          isCurrent: peer.isCurrent
        })),
        backgroundColor: peers.map(peer => 
          peer.isCurrent 
            ? 'rgba(45, 212, 191, 0.8)'  // 当前股票用青色
            : 'rgba(156, 163, 175, 0.6)'  // 其他用灰色
        ),
        borderColor: peers.map(peer => 
          peer.isCurrent 
            ? 'rgba(45, 212, 191, 1)'
            : 'rgba(156, 163, 175, 0.8)'
        ),
        borderWidth: 2,
        pointRadius: peers.map(peer => peer.isCurrent ? 8 : 6),
        pointHoverRadius: peers.map(peer => peer.isCurrent ? 10 : 8),
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return context[0].raw.name
          },
          label: function(context) {
            return [
              `P/E: ${context.parsed.x.toFixed(1)}`,
              `增长率: ${context.parsed.y.toFixed(1)}%`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'P/E 倍数',
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9ca3af',
        },
        border: {
          display: false,
        }
      },
      y: {
        title: {
          display: true,
          text: '增长率 (%)',
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return value + '%'
          }
        },
        border: {
          display: false,
        }
      }
    }
  }

  const formatMarketCap = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    return `$${(num / 1e3).toFixed(1)}K`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">同行对比</h3>
        </div>
        <div className="text-sm text-gray-400">{sector}</div>
      </div>

      <div className="h-64 mb-6">
        <Scatter data={chartData} options={options} />
      </div>

      {/* Peers Table */}
      <div className="space-y-2">
        {peers.map((peer, index) => (
          <div 
            key={peer.symbol}
            className={`flex justify-between items-center p-3 rounded-lg ${
              peer.isCurrent 
                ? 'bg-primary-500/20 border border-primary-500/30' 
                : 'bg-gray-800/30'
            }`}
          >
            <div>
              <div className={`font-medium ${peer.isCurrent ? 'text-primary-400' : 'text-white'}`}>
                {peer.symbol}
              </div>
              <div className="text-sm text-gray-400">{peer.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">
                P/E: {peer.pe?.toFixed(1) || 'N/A'} | 增长: {peer.growth?.toFixed(1) || '0'}%
              </div>
              <div className="text-xs text-gray-500">
                {formatMarketCap(peer.marketCap)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default PeersChart

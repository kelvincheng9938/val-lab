import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const ValuationChart = ({ data }) => {
  if (!data) return null

  const { valuations, currentPrice, symbol } = data
  
  const chartData = {
    labels: ['保守估值', '合理估值', '乐观估值', '当前价格'],
    datasets: [
      {
        label: '股价 ($)',
        data: [
          valuations?.bands?.low?.price || 0,
          valuations?.bands?.base?.price || 0,
          valuations?.bands?.high?.price || 0,
          currentPrice || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // 红色 - 保守
          'rgba(45, 212, 191, 0.8)',  // 青色 - 合理
          'rgba(34, 197, 94, 0.8)',   // 绿色 - 乐观
          'rgba(156, 163, 175, 0.8)'  // 灰色 - 当前
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(45, 212, 191, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
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
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return '$' + value.toFixed(0)
          }
        },
        border: {
          display: false,
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center mb-6">
        <BarChart3 className="h-5 w-5 text-primary-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">估值分析</h3>
      </div>

      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {/* PE Ratios */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-400">保守 P/E</div>
          <div className="text-lg font-medium text-red-400">
            {valuations?.bands?.low?.pe?.toFixed(1) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">合理 P/E</div>
          <div className="text-lg font-medium text-primary-400">
            {valuations?.bands?.base?.pe?.toFixed(1) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">乐观 P/E</div>
          <div className="text-lg font-medium text-green-400">
            {valuations?.bands?.high?.pe?.toFixed(1) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">当前 P/E</div>
          <div className="text-lg font-medium text-gray-400">
            {valuations?.current?.pe?.toFixed(1) || 'N/A'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ValuationChart

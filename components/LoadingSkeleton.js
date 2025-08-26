import { motion } from 'framer-motion'

const LoadingSkeleton = ({ type = 'chart' }) => {
  const shimmerAnimation = {
    animate: {
      x: [-100, 100],
    },
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "linear"
    }
  }

  if (type === 'summary') {
    return (
      <div className="glass-panel p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gray-700 rounded shimmer" />
              <div className="h-6 w-24 bg-gray-700 rounded shimmer" />
            </div>
            <div className="h-10 w-20 bg-gray-700 rounded shimmer" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-700 rounded shimmer" />
            <div className="h-16 bg-gray-700 rounded shimmer" />
            <div className="h-16 bg-gray-700 rounded shimmer" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className="glass-panel p-6">
        <div className="space-y-4">
          <div className="h-6 w-40 bg-gray-700 rounded shimmer" />
          <div className="h-64 bg-gray-700 rounded shimmer" />
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    return (
      <div className="glass-panel p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-700 rounded shimmer" />
          <div className="h-48 bg-gray-700 rounded shimmer" />
        </div>
      </div>
    )
  }

  if (type === 'news') {
    return (
      <div className="glass-panel p-6">
        <div className="space-y-4">
          <div className="h-6 w-24 bg-gray-700 rounded shimmer" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-gray-700 rounded shimmer" />
              <div className="h-3 w-3/4 bg-gray-700 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default LoadingSkeleton

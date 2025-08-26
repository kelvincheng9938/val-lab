import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, Clock } from 'lucide-react'

const NewsFeed = ({ data }) => {
  if (!data || !data.news) return null

  const { news, symbol } = data

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1天前'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
    return `${Math.ceil(diffDays / 30)}月前`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center mb-6">
        <Newspaper className="h-5 w-5 text-primary-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">相关新闻</h3>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无相关新闻</p>
          </div>
        ) : (
          news.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors line-clamp-2 flex-1">
                    {article.title}
                  </h4>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors ml-2 flex-shrink-0" />
                </div>
                
                {article.summary && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {article.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-700 px-2 py-1 rounded">
                    {article.source || 'Unknown'}
                  </span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(article.publishedDate)}
                  </div>
                </div>
              </a>
            </motion.div>
          ))
        )}
      </div>

      {news.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            点击查看完整新闻内容
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default NewsFeed

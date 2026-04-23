import { useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import { getLatest } from '../services/api'
import NewsCard from '../components/features/NewsCard'

const PAGE_SIZE = 20

export default function FeedPage() {
  const {
    feedItems, feedTotal, feedLoading, feedError,
    feedCategory, feedOffset, setFeed, setFeedLoading, setFeedError,
  } = useStore()

  const load = useCallback(async (offset = 0) => {
    setFeedLoading(true)
    try {
      const params = { limit: PAGE_SIZE, offset }
      if (feedCategory) params.category = feedCategory
      const { data } = await getLatest(params)
      setFeed(data.items, data.total, offset)
    } catch (e) {
      setFeedError('Failed to load feed. Is the backend running?')
    }
  }, [feedCategory, setFeed, setFeedLoading, setFeedError])

  useEffect(() => { load(0) }, [feedCategory, load])

  const loadMore = () => load(feedOffset + PAGE_SIZE)

  if (feedError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-sm">{feedError}</p>
        <button onClick={() => load(0)} className="btn-primary mt-4 text-sm">Retry</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {feedCategory ? `${feedCategory} Updates` : 'Latest Feed'}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {feedTotal > 0 ? `${feedTotal} insights collected` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => load(0)}
          disabled={feedLoading}
          className="btn-ghost flex items-center gap-1.5 text-sm"
        >
          <RefreshCw size={14} className={feedLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Loading skeletons */}
      {feedLoading && feedItems.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-3 bg-bg-border rounded w-1/4 mb-3" />
              <div className="h-4 bg-bg-border rounded w-3/4 mb-2" />
              <div className="h-3 bg-bg-border rounded w-full mb-1" />
              <div className="h-3 bg-bg-border rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Feed items */}
      <div className="space-y-3">
        {feedItems.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Load more */}
      {feedItems.length < feedTotal && !feedLoading && (
        <button onClick={loadMore} className="w-full mt-4 py-3 text-sm text-text-secondary hover:text-text-primary border border-bg-border rounded-xl hover:border-accent-blue/30 transition-all">
          Load more ({feedTotal - feedItems.length} remaining)
        </button>
      )}

      {feedLoading && feedItems.length > 0 && (
        <div className="flex justify-center mt-4">
          <RefreshCw size={16} className="animate-spin text-text-muted" />
        </div>
      )}
    </div>
  )
}

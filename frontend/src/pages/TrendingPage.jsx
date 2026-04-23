import { useEffect } from 'react'
import { TrendingUp, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store/useStore'
import { getTrending } from '../services/api'
import NewsCard from '../components/features/NewsCard'
import CategoryBadge from '../components/ui/CategoryBadge'
import ImpactScore from '../components/ui/ImpactScore'

export default function TrendingPage() {
  const { trendingStories, detectedTrends, setTrending } = useStore()

  useEffect(() => {
    getTrending({ limit: 15, hours: 24 }).then(({ data }) => {
      setTrending(data.trending_stories, data.detected_trends)
    }).catch(console.error)
  }, [setTrending])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-400" />
          Trending Now
        </h1>
        <p className="text-xs text-text-muted mt-0.5">High-impact stories from the last 24 hours</p>
      </div>

      {/* Detected trends banner */}
      {detectedTrends.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Detected Trends</p>
          {detectedTrends.map((trend) => (
            <div key={trend.id} className="card border-l-2 border-l-orange-500/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={trend.category} />
                    <Zap size={12} className="text-orange-400" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{trend.topic}</p>
                  <p className="text-xs text-text-secondary mt-1">{trend.summary}</p>
                </div>
                <ImpactScore score={trend.avg_impact_score} />
              </div>
              <p className="text-xs text-text-muted mt-2">
                Detected {formatDistanceToNow(new Date(trend.detected_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Top trending stories */}
      <div className="space-y-3">
        {trendingStories.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
        {trendingStories.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No trending stories yet. Run a fetch to populate.</p>
          </div>
        )}
      </div>
    </div>
  )
}

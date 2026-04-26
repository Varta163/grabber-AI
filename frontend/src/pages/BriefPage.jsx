import { useEffect } from 'react'
import { LayoutDashboard, ArrowRight, Lightbulb, TrendingUp, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import useStore from '../store/useStore'
import { getDailyBrief } from '../services/api'
import CategoryBadge from '../components/ui/CategoryBadge'
import ImpactScore from '../components/ui/ImpactScore'

export default function BriefPage() {
  const { dailyBrief, briefLoading, setBrief, setBriefLoading } = useStore()

  useEffect(() => {
    setBriefLoading(true)
    getDailyBrief()
      .then(({ data }) => setBrief(data))
      .catch(() => setBrief(null))
  }, [setBrief, setBriefLoading])

  if (briefLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!dailyBrief) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
        <LayoutDashboard size={32} className="opacity-30 mb-3" />
        <p className="text-sm">Daily brief not ready yet.</p>
        <p className="text-xs text-text-muted mt-1">Run a pipeline fetch first via Admin.</p>
      </div>
    )
  }

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/20">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={16} className="text-accent-blue" />
          <span className="text-xs font-semibold text-accent-blue uppercase tracking-wider">Daily Brief</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">{today}</h1>
        <p className="text-xs text-text-muted mt-1">AI-curated intelligence for developers & designers</p>
      </div>

      {/* Category breakdown */}
      {dailyBrief.category_breakdown && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Object.entries(dailyBrief.category_breakdown).map(([cat, count]) => (
            <div key={cat} className="card text-center p-3">
              <p className="text-lg font-bold text-text-primary">{count}</p>
              <CategoryBadge category={cat} />
            </div>
          ))}
        </div>
      )}

      {/* Key trends */}
      {dailyBrief.key_trends?.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-orange-400" />
            <h2 className="text-sm font-semibold text-text-primary">Key Trends Today</h2>
          </div>
          <ul className="space-y-2">
            {dailyBrief.key_trends.map((trend, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-orange-400 font-mono text-xs mt-0.5 flex-shrink-0">0{i + 1}</span>
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action plan */}
      {dailyBrief.action_plan?.length > 0 && (
        <div className="card border-accent-cyan/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={15} className="text-accent-cyan" />
            <h2 className="text-sm font-semibold text-text-primary">Your Action Plan</h2>
          </div>
          <ul className="space-y-3">
            {dailyBrief.action_plan.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <ArrowRight size={14} className="text-accent-cyan mt-0.5 flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top stories */}
      {dailyBrief.top_stories?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Top Stories</h2>
          <div className="space-y-3">
            {dailyBrief.top_stories.map((story, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-bold text-bg-border font-mono flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={story.category} />
                      <ImpactScore score={story.impact_score} showBar={false} />
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{story.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{story.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

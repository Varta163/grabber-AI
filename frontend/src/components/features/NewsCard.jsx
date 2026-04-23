import { ExternalLink, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import CategoryBadge from '../ui/CategoryBadge'
import ImpactScore from '../ui/ImpactScore'

export default function NewsCard({ item, index = 0 }) {
  const [expanded, setExpanded] = useState(false)

  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="card group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CategoryBadge category={item.category} />
            <ImpactScore score={item.impact_score} />
            {item.is_trending && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Zap size={10} className="fill-orange-400" /> Trending
              </span>
            )}
          </div>

          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-primary font-semibold text-sm leading-snug hover:text-accent-blue transition-colors line-clamp-2 block"
            onClick={(e) => e.stopPropagation()}
          >
            {item.title}
          </a>
        </div>

        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-accent-blue transition-colors flex-shrink-0 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Summary */}
      <p className="text-text-secondary text-xs leading-relaxed mt-2 line-clamp-2">
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{item.source_name}</span>
          {timeAgo && (
            <>
              <span className="text-text-muted text-xs">·</span>
              <span className="text-xs text-text-muted">{timeAgo}</span>
            </>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-accent-blue transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-bg-border space-y-3"
        >
          <div>
            <p className="text-xs font-semibold text-accent-purple mb-1">Why it matters</p>
            <p className="text-xs text-text-secondary leading-relaxed">{item.why_it_matters}</p>
          </div>

          {item.action_items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-accent-cyan mb-2">Action items</p>
              <ul className="space-y-1">
                {item.action_items.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="text-accent-cyan mt-0.5 flex-shrink-0">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.article>
  )
}

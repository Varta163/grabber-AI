import clsx from 'clsx'

function getColor(score) {
  if (score >= 8) return { bar: 'bg-red-500', text: 'text-red-400' }
  if (score >= 6) return { bar: 'bg-orange-500', text: 'text-orange-400' }
  if (score >= 4) return { bar: 'bg-yellow-500', text: 'text-yellow-400' }
  return { bar: 'bg-green-500', text: 'text-green-400' }
}

export default function ImpactScore({ score, showBar = true }) {
  const { bar, text } = getColor(score)
  const pct = (score / 10) * 100

  return (
    <div className="flex items-center gap-2">
      <span className={clsx('text-xs font-mono font-semibold', text)}>
        {score.toFixed(1)}
      </span>
      {showBar && (
        <div className="impact-bar w-16">
          <div className={clsx('h-full rounded-full transition-all', bar)} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}

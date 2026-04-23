import clsx from 'clsx'

const COLORS = {
  AI: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  Dev: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Design: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  Jobs: 'bg-green-500/15 text-green-400 border-green-500/25',
  Market: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
}

export default function CategoryBadge({ category, size = 'sm' }) {
  return (
    <span className={clsx(
      'badge border',
      COLORS[category] || 'bg-gray-500/15 text-gray-400 border-gray-500/25',
      size === 'lg' && 'text-sm px-3 py-1'
    )}>
      {category}
    </span>
  )
}

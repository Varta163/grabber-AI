import { Cpu, Code2, Palette, Briefcase, TrendingUp, Newspaper, Zap, LayoutDashboard, MessageSquare, Shield } from 'lucide-react'
import clsx from 'clsx'
import useStore from '../../store/useStore'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { id: 'feed', label: 'Feed', icon: Newspaper },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'brief', label: 'Daily Brief', icon: LayoutDashboard },
  { id: 'chat', label: 'Ask AI', icon: MessageSquare },
]

const CATEGORIES = [
  { id: 'AI', label: 'AI & ML', icon: Cpu, color: 'text-purple-400' },
  { id: 'Dev', label: 'Development', icon: Code2, color: 'text-blue-400' },
  { id: 'Design', label: 'Design', icon: Palette, color: 'text-pink-400' },
  { id: 'Jobs', label: 'Jobs & Hiring', icon: Briefcase, color: 'text-green-400' },
  { id: 'Market', label: 'Market & Startups', icon: Zap, color: 'text-orange-400' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, feedCategory, setFeedCategory } = useStore()
  const { user } = useAuth()

  return (
    <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-bg-border bg-bg-secondary">
      <div className="px-4 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
            <Cpu size={14} className="text-white" />
          </div>
          <span className="font-bold text-text-primary text-sm tracking-tight">GrabberAI</span>
        </div>
        <p className="text-xs text-text-muted mt-1">Tech Intelligence</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">Navigation</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                activeTab === id
                  ? 'bg-accent-blue/10 text-accent-blue font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                activeTab === 'admin'
                  ? 'bg-accent-purple/10 text-accent-purple font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              <Shield size={15} />
              Admin
            </button>
          )}
        </div>

        {activeTab === 'feed' && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">Categories</p>
            <button
              onClick={() => setFeedCategory(null)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                !feedCategory ? 'bg-bg-hover text-text-primary font-medium' : 'text-text-secondary hover:bg-bg-hover'
              )}
            >
              All Topics
            </button>
            {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setFeedCategory(id)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                  feedCategory === id
                    ? 'bg-bg-hover text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-bg-hover'
                )}
              >
                <Icon size={14} className={color} />
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-bg-border">
        <p className="text-xs text-text-muted">Updates every 6h</p>
      </div>
    </aside>
  )
}

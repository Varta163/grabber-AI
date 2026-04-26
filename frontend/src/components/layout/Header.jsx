import { RefreshCw, PlayCircle, LogOut } from 'lucide-react'
import { useState } from 'react'
import { runAll } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState(null)

  const handleRunAll = async () => {
    setRunning(true)
    setStatus(null)
    try {
      await runAll()
      setStatus('Pipeline started — refresh in ~2 min')
      setTimeout(() => setStatus(null), 5000)
    } catch {
      setStatus('Error running pipeline')
    } finally {
      setRunning(false)
    }
  }

  return (
    <header className="h-12 border-b border-bg-border bg-bg-secondary flex items-center justify-end px-6 gap-3 sticky top-0 z-10">
      {status && (
        <span className="text-xs text-accent-green animate-fade-in">{status}</span>
      )}

      {user?.role === 'admin' && (
        <button
          onClick={handleRunAll}
          disabled={running}
          className="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-50"
          title="Fetch + Process + Generate Brief"
        >
          {running ? <RefreshCw size={13} className="animate-spin" /> : <PlayCircle size={13} />}
          {running ? 'Running...' : 'Run Pipeline'}
        </button>
      )}

      <div className="flex items-center gap-2 pl-2 border-l border-bg-border">
        <span className="text-xs text-text-muted">{user?.email}</span>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded hover:bg-bg-hover transition-colors text-text-muted hover:text-text-primary"
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  )
}

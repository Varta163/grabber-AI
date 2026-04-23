import { RefreshCw, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import { runAll } from '../../services/api'

export default function Header() {
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState(null)

  const handleRunAll = async () => {
    setRunning(true)
    setStatus(null)
    try {
      const { data } = await runAll()
      setStatus(`Fetched ${data.fetch?.rss?.total_new || 0} new items · Processed ${data.processing?.processed || 0}`)
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
      <button
        onClick={handleRunAll}
        disabled={running}
        className="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-50"
        title="Fetch + Process + Generate Brief"
      >
        {running
          ? <RefreshCw size={13} className="animate-spin" />
          : <PlayCircle size={13} />
        }
        {running ? 'Running...' : 'Run Pipeline'}
      </button>
    </header>
  )
}

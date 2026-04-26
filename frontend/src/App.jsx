import { useState, useEffect } from 'react'
import { Cpu } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import FeedPage from './pages/FeedPage'
import TrendingPage from './pages/TrendingPage'
import BriefPage from './pages/BriefPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import useStore from './store/useStore'
import { useAuth } from './context/AuthContext'

const PAGES = {
  feed: FeedPage,
  trending: TrendingPage,
  brief: BriefPage,
  chat: ChatPage,
  admin: AdminPage,
}

function PendingAccess({ onLogout }) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-4">
          <Cpu size={22} className="text-white" />
        </div>
        <h1 className="text-lg font-semibold text-text-primary mb-2">Access Pending</h1>
        <p className="text-sm text-text-muted mb-6">
          Your account is awaiting approval. An admin will grant you access shortly.
        </p>
        <button onClick={onLogout} className="text-sm text-accent-blue hover:underline">
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading, logout } = useAuth()
  const { activeTab } = useStore()
  const [authPage, setAuthPage] = useState('login')

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [logout])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return authPage === 'login'
      ? <LoginPage onSwitch={() => setAuthPage('signup')} />
      : <SignupPage onSwitch={() => setAuthPage('login')} />
  }

  const hasAccess = user.role === 'admin' || ['free', 'subscribed'].includes(user.subscription_status)
  if (!hasAccess) return <PendingAccess onLogout={logout} />

  const Page = PAGES[activeTab] || FeedPage

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Page />
        </main>
      </div>
    </div>
  )
}

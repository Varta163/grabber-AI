import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, useNavigate, useLocation, Navigate } from 'react-router-dom'
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
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LandingPage from './pages/LandingPage'
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
  const { refreshUser } = useAuth()

  useEffect(() => {
    const id = setInterval(async () => { await refreshUser() }, 5000)
    return () => clearInterval(id)
  }, [refreshUser])

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
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-pulse" />
          <span className="text-xs text-text-muted">Checking for approval...</span>
        </div>
        <button onClick={onLogout} className="text-sm text-accent-blue hover:underline">
          Sign out
        </button>
      </div>
    </div>
  )
}

function AppInner() {
  const { user, loading, logout } = useAuth()
  const { activeTab } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const resetToken = useMemo(
    () => new URLSearchParams(location.search).get('reset_token'),
    [location.search]
  )

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [logout])

  useEffect(() => { setSidebarOpen(false) }, [activeTab])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (resetToken) {
    return (
      <ResetPasswordPage
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, '', '/')
          window.location.reload()
        }}
      />
    )
  }

  if (!user) {
    const p = location.pathname
    if (p === '/login') {
      return (
        <LoginPage
          onSwitch={() => navigate('/signup')}
          onForgot={() => navigate('/forgot-password')}
        />
      )
    }
    if (p === '/signup') return <SignupPage onSwitch={() => navigate('/login')} />
    if (p === '/forgot-password') return <ForgotPasswordPage onBack={() => navigate('/login')} />
    return (
      <LandingPage
        onSignIn={() => navigate('/login')}
        onSignUp={() => navigate('/signup')}
      />
    )
  }

  // Logged-in user hitting auth pages → back to app
  if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return <Navigate to="/" replace />
  }

  const hasAccess = user.role === 'admin' || ['free', 'subscribed'].includes(user.subscription_status)
  if (!hasAccess) return <PendingAccess onLogout={logout} />

  const Page = PAGES[activeTab] || FeedPage

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
          <Page />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}

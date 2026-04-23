import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import FeedPage from './pages/FeedPage'
import TrendingPage from './pages/TrendingPage'
import BriefPage from './pages/BriefPage'
import ChatPage from './pages/ChatPage'
import useStore from './store/useStore'

const PAGES = {
  feed: FeedPage,
  trending: TrendingPage,
  brief: BriefPage,
  chat: ChatPage,
}

export default function App() {
  const { activeTab } = useStore()
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

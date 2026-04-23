import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Feed state
  feedItems: [],
  feedTotal: 0,
  feedLoading: false,
  feedError: null,
  feedCategory: null,
  feedOffset: 0,

  // Trending
  trendingStories: [],
  detectedTrends: [],

  // Daily brief
  dailyBrief: null,
  briefLoading: false,

  // Chat
  chatMessages: [],
  chatLoading: false,

  // UI
  activeTab: 'feed',
  sidebarOpen: true,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFeedCategory: (cat) => set({ feedCategory: cat, feedOffset: 0, feedItems: [] }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setFeed: (items, total, offset) =>
    set((state) => ({
      feedItems: offset === 0 ? items : [...state.feedItems, ...items],
      feedTotal: total,
      feedOffset: offset,
      feedLoading: false,
    })),

  setFeedLoading: (v) => set({ feedLoading: v }),
  setFeedError: (e) => set({ feedError: e, feedLoading: false }),

  setTrending: (stories, trends) =>
    set({ trendingStories: stories, detectedTrends: trends }),

  setBrief: (brief) => set({ dailyBrief: brief, briefLoading: false }),
  setBriefLoading: (v) => set({ briefLoading: v }),

  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  setChatLoading: (v) => set({ chatLoading: v }),
}))

export default useStore

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import { sendChat } from '../services/api'
import ReactMarkdown from 'react-markdown'

const SUGGESTIONS = [
  'What should I learn this week?',
  'What AI tools are trending right now?',
  'What are the top job market signals today?',
  'Summarize the biggest Dev updates',
]

export default function ChatPage() {
  const [input, setInput] = useState('')
  const { chatMessages, chatLoading, addChatMessage, setChatLoading } = useStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const submit = async (question) => {
    const q = question || input.trim()
    if (!q || chatLoading) return
    setInput('')
    addChatMessage({ role: 'user', content: q })
    setChatLoading(true)

    try {
      const { data } = await sendChat(q)
      addChatMessage({ role: 'assistant', content: data.answer, contextUsed: data.context_used })
    } catch {
      addChatMessage({ role: 'assistant', content: 'Sorry, I ran into an error. Make sure the backend is running.' })
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <MessageSquare size={20} className="text-accent-blue" />
          Ask GrabberAI
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Ask anything about today's tech landscape</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {chatMessages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-center h-24">
              <Bot size={40} className="text-bg-border" />
            </div>
            <p className="text-center text-sm text-text-muted">Try asking something:</p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="card text-left text-sm text-text-secondary hover:text-text-primary text-xs"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-accent-blue/20'
                  : 'bg-accent-purple/20'
              }`}>
                {msg.role === 'user'
                  ? <User size={14} className="text-accent-blue" />
                  : <Bot size={14} className="text-accent-purple" />
                }
              </div>
              <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block text-sm rounded-xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-accent-blue/15 text-text-primary'
                    : 'bg-bg-card border border-bg-border text-text-secondary'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.content}
                </div>
                {msg.contextUsed && (
                  <p className="text-xs text-text-muted mt-1 ml-1">
                    Based on {msg.contextUsed} recent stories
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {chatLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent-purple/20 flex items-center justify-center">
              <Bot size={14} className="text-accent-purple" />
            </div>
            <div className="card flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={13} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
          placeholder="Ask about AI tools, learning, trends..."
          className="flex-1 bg-bg-card border border-bg-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
        />
        <button
          onClick={() => submit()}
          disabled={!input.trim() || chatLoading}
          className="btn-primary flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

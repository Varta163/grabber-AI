import { useState } from 'react'
import { Cpu } from 'lucide-react'
import { forgotPassword } from '../services/api'

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="font-bold text-text-primary text-lg tracking-tight">GrabberAI</span>
        </div>

        <div className="bg-bg-secondary border border-bg-border rounded-xl p-8">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-text-primary mb-2">Check your email</h1>
              <p className="text-sm text-text-muted mb-6">
                If <span className="text-text-secondary">{email}</span> is registered, we've sent a
                reset link. Check your inbox (and spam folder).
              </p>
              <button onClick={onBack} className="text-sm text-accent-blue hover:underline">
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary mb-1">Forgot password?</h1>
              <p className="text-sm text-text-muted mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
              <p className="text-xs text-text-muted text-center mt-5">
                <button onClick={onBack} className="text-accent-blue hover:underline">
                  Back to sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

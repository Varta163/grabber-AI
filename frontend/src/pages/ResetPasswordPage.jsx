import { useState } from 'react'
import { Cpu, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../services/api'

export default function ResetPasswordPage({ token, onDone }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError(null)
    setLoading(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired reset link.')
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
          {success ? (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-text-primary mb-2">Password updated</h1>
              <p className="text-sm text-text-muted mb-6">Your password has been changed. You can now sign in.</p>
              <button onClick={onDone} className="text-sm text-accent-blue hover:underline">
                Go to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary mb-1">Set new password</h1>
              <p className="text-sm text-text-muted mb-6">Choose a new password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-secondary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
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
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

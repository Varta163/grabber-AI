import { useState, useEffect } from 'react'
import { Plus, Trash2, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react'
import { getUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../services/api'
import clsx from 'clsx'

const STATUS_COLORS = {
  none: 'text-text-muted bg-bg-hover',
  free: 'text-green-400 bg-green-400/10',
  subscribed: 'text-accent-blue bg-accent-blue/10',
}

const ROLE_COLORS = {
  user: 'text-text-secondary bg-bg-hover',
  admin: 'text-accent-purple bg-accent-purple/10',
}

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newStatus, setNewStatus] = useState('free')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id, status) => {
    await updateAdminUser(id, { subscription_status: status })
    setUsers(users.map(u => u.id === id ? { ...u, subscription_status: status } : u))
  }

  const handleToggleActive = async (id, is_active) => {
    await updateAdminUser(id, { is_active: !is_active })
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !is_active } : u))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    await deleteAdminUser(id)
    setUsers(users.filter(u => u.id !== id))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(null)
    setAdding(true)
    try {
      const { data } = await createAdminUser({ email: newEmail, password: newPassword, subscription_status: newStatus })
      setUsers([data, ...users])
      setNewEmail('')
      setNewPassword('')
      setShowAdd(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">User Management</h1>
          <p className="text-sm text-text-muted mt-0.5">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost flex items-center gap-1.5 text-xs">
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-xs bg-accent-blue hover:bg-accent-blue/90 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} /> Add Free User
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-secondary border border-bg-border rounded-xl p-5 mb-5 space-y-3">
          <h2 className="text-sm font-medium text-text-primary">Add user</h2>
          <div className="flex gap-3 flex-wrap">
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="flex-1 min-w-48 bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="flex-1 min-w-40 bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="free">Free</option>
              <option value="subscribed">Subscribed</option>
              <option value="none">No access</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={adding} className="text-xs bg-accent-blue text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
              {adding ? 'Adding...' : 'Add user'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost text-xs px-3 py-1.5">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-bg-secondary border border-bg-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-text-muted">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No users yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Access</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Joined</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-bg-border/50 hover:bg-bg-hover/30 transition-colors">
                  <td className="px-5 py-3 text-text-primary font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[u.role] || ROLE_COLORS.user)}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.subscription_status}
                      onChange={(e) => handleStatusChange(u.id, e.target.value)}
                      disabled={u.role === 'admin'}
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none disabled:opacity-60',
                        STATUS_COLORS[u.subscription_status] || STATUS_COLORS.none
                      )}
                    >
                      <option value="none">No access</option>
                      <option value="free">Free</option>
                      <option value="subscribed">Subscribed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs', u.is_active ? 'text-green-400' : 'text-red-400')}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        disabled={u.role === 'admin'}
                        title={u.is_active ? 'Disable user' : 'Enable user'}
                        className="p-1.5 rounded hover:bg-bg-hover transition-colors disabled:opacity-30"
                      >
                        {u.is_active
                          ? <UserX size={13} className="text-yellow-400" />
                          : <UserCheck size={13} className="text-green-400" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={u.role === 'admin'}
                        title="Delete user"
                        className="p-1.5 rounded hover:bg-bg-hover transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

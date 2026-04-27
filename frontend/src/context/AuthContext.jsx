import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, signupUser, getMe } from '../services/api'
import useStore from '../store/useStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('grabber_token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem('grabber_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await loginUser(email, password)
    useStore.getState().clearUserData()
    localStorage.setItem('grabber_token', data.token)
    setUser(data.user)
    return data.user
  }

  const signup = async (email, password) => {
    const { data } = await signupUser(email, password)
    useStore.getState().clearUserData()
    localStorage.setItem('grabber_token', data.token)
    setUser(data.user)
    return data.user
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('grabber_token')
    if (!token) return
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {}
  }

  const logout = () => {
    localStorage.removeItem('grabber_token')
    setUser(null)
    useStore.getState().clearUserData()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

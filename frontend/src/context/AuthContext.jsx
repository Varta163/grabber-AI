import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, signupUser, getMe } from '../services/api'

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
    localStorage.setItem('grabber_token', data.token)
    setUser(data.user)
    return data.user
  }

  const signup = async (email, password) => {
    const { data } = await signupUser(email, password)
    localStorage.setItem('grabber_token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('grabber_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

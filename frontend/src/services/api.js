import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('grabber_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('grabber_token')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  }
)

// Auth
export const loginUser = (email, password) => api.post('/auth/login', { email, password })
export const signupUser = (email, password) => api.post('/auth/signup', { email, password })
export const getMe = () => api.get('/auth/me')

// Content
export const getLatest = (params = {}) => api.get('/latest', { params })
export const getTrending = (params = {}) => api.get('/trending', { params })
export const getCategories = (params = {}) => api.get('/categories', { params })
export const getDailyBrief = () => api.get('/daily-brief')
export const getItem = (id) => api.get(`/item/${id}`)
export const sendChat = (question) => api.post('/chat', { question })

// Admin pipeline
export const triggerFetch = () => api.post('/admin/fetch')
export const triggerProcess = () => api.post('/admin/process')
export const runAll = () => api.post('/admin/run-all')

// Admin users
export const getUsers = () => api.get('/admin/users')
export const createAdminUser = (data) => api.post('/admin/users', data)
export const updateAdminUser = (id, data) => api.patch(`/admin/users/${id}`, data)
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`)

export default api

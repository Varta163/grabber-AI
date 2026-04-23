import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

export const getLatest = (params = {}) => api.get('/latest', { params })
export const getTrending = (params = {}) => api.get('/trending', { params })
export const getCategories = (params = {}) => api.get('/categories', { params })
export const getDailyBrief = () => api.get('/daily-brief')
export const getItem = (id) => api.get(`/item/${id}`)
export const sendChat = (question) => api.post('/chat', { question })

// Admin
export const triggerFetch = () => api.post('/admin/fetch')
export const triggerProcess = () => api.post('/admin/process')
export const runAll = () => api.post('/admin/run-all')

export default api

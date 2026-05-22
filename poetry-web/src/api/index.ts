import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth'
    }
    return Promise.reject(err.response?.data || err)
  }
)

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password })

export const forgotPassword = (email: string, code: string, new_password: string) =>
  api.post('/auth/forgot-password', { email, code, new_password })

export const sendCode = (email: string, purpose: string) =>
  api.post('/auth/send-code', { email, purpose })

// User
export const getProfile = () => api.get('/user/profile')

// Poetry
export const getDailyQuote = () => api.get('/poetry/daily-quote')

export const searchPoetry = (q: string) => api.get(`/poetry/search?q=${encodeURIComponent(q)}`)

export const getThreeHundred = (params: { page?: number; page_size?: number; author?: string }) =>
  api.get('/poetry/three-hundred', { params })

export const getPoemDetail = (id: number, source?: string) =>
  api.get(`/poetry/${id}`, { params: { source } })

// Poets
export const getPoetList = (search?: string) =>
  api.get('/poets', { params: { search } })

export const getPoetDetail = (id: number) => api.get(`/poets/${id}`)

// Interaction
export const toggleLike = (poem_id: number, poem_source: string) =>
  api.post('/interaction/like', { poem_id, poem_source })

export const toggleFavorite = (poem_id: number, poem_source: string) =>
  api.post('/interaction/favorite', { poem_id, poem_source })

export const getFavorites = () => api.get('/interaction/favorites')

export const getLikes = () => api.get('/interaction/likes')

export const addHistory = (poem_id: number, poem_source: string) =>
  api.post('/interaction/history', { poem_id, poem_source })

export const getHistory = () => api.get('/interaction/history')

export default api

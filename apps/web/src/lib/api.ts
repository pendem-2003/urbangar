import axios, { AxiosError } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data ?? res.data
        localStorage.setItem('accessToken', newAccess)
        localStorage.setItem('refreshToken', newRefresh)

        if (original.headers) {
          original.headers['Authorization'] = `Bearer ${newAccess}`
        }
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (process.env.NODE_ENV !== 'development') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export type ApiError = { message: string; statusCode: number }

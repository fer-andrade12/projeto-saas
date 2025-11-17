import axios, { InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
})

// Attach Authorization header from localStorage if present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch {}
  return config
})

// On 401, force logout and redirect to login
api.interceptors.response.use(
  (res: any) => res,
  (error: any) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } catch {}
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    }
    return Promise.reject(error)
  }
)

export default api

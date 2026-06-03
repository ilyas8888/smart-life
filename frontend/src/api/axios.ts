import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Single shared promise to prevent concurrent refresh races (token rotation)
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      const { refreshToken, email, firstName, lastName, setAuth, logout } = useAuthStore.getState()
      if (!refreshToken) {
        logout()
        window.location.href = import.meta.env.BASE_URL + 'login'
        return Promise.reject(error)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${import.meta.env.VITE_API_URL ?? ''}/api/auth/refresh`, { refreshToken })
            .then(({ data }) => {
              setAuth(data.accessToken, data.refreshToken ?? refreshToken, email ?? '', firstName, lastName)
              return data.accessToken as string
            })
            .finally(() => { refreshPromise = null })
        }
        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        logout()
        window.location.href = import.meta.env.BASE_URL + 'login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

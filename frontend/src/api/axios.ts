import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { refreshAccessToken } from './refreshToken'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
  withCredentials: false,
})

// Seuls les endpoints d'auth manipulent le cookie HttpOnly (refresh) : eux
// seuls ont besoin du mode credentials. Partout ailleurs on l'evite, car le
// proxy edge de HuggingFace repond aux preflight CORS sans en-tete
// 'Access-Control-Allow-Credentials', ce qui bloquerait toute requete
// credentialed cross-origin. L'auth normale passe par le header Bearer.
const CREDENTIALED_PATHS = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/logout']

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.withCredentials = CREDENTIALED_PATHS.some((p) => config.url?.startsWith(p))
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = import.meta.env.BASE_URL + 'login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

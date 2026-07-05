import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { refreshAccessToken } from './refreshToken'

// Pas de withCredentials : toute l'auth passe par le header Bearer et le refresh
// token voyage dans le body. Le proxy edge de HuggingFace repond aux preflight
// CORS sans 'Access-Control-Allow-Credentials', donc aucune requete credentialed
// cross-origin ne passerait.
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
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

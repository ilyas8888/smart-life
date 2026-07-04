import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

// Promesse partagée unique : évite que plusieurs 401 (ou un échec d'auth
// WebSocket) déclenchent plusieurs appels /refresh en parallèle. Le backend
// fait tourner le refresh token (rotation) — des appels concurrents
// s'invalideraient mutuellement.
let refreshPromise: Promise<string> | null = null

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const { email, firstName, lastName, setAuth } = useAuthStore.getState()
    refreshPromise = axios
      .post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        setAuth(data.accessToken, email ?? '', firstName, lastName)
        return data.accessToken as string
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

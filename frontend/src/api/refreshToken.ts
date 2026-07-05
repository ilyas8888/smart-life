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
    const { refreshToken, setToken, setRefreshToken } = useAuthStore.getState()
    // Refresh token envoye dans le body (plus de cookie/credentials) : le proxy
    // HuggingFace bloque les requetes credentialed cross-origin. Le backend fait
    // tourner le token, on stocke donc celui renvoye pour le prochain refresh.
    refreshPromise = axios
      .post(`${API_BASE}/api/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setToken(data.accessToken)
        if (data.refreshToken) setRefreshToken(data.refreshToken)
        return data.accessToken as string
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

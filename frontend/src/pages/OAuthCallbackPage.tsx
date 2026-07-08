import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken)

  useEffect(() => {
    // Tokens lus depuis le fragment (#), pas la query : ils ne transitent pas
    // par le serveur (ni logs ni Referer).
    const hash = window.location.hash.replace(/^#/, '')
    const params = new URLSearchParams(hash)
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')
    const email = params.get('email') ?? ''
    const firstName = params.get('firstName') ?? ''
    const lastName = params.get('lastName') ?? ''

    if (token) {
      setAuth(token, email, firstName, lastName)
      if (refreshToken) setRefreshToken(refreshToken)
      // Retire les tokens de l'URL/historique avant de continuer.
      window.history.replaceState({}, '', window.location.pathname)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, setAuth, setRefreshToken])

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <p className="text-gray-600 dark:text-gray-300">Connexion en cours...</p>
    </div>
  )
}

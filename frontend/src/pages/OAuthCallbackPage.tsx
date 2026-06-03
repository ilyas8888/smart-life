import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')
    const email = params.get('email') ?? ''
    const firstName = params.get('firstName') ?? ''
    const lastName = params.get('lastName') ?? ''

    if (token) {
      setAuth(token, email, firstName, lastName)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <p className="text-gray-600 dark:text-gray-300">Connexion en cours...</p>
    </div>
  )
}

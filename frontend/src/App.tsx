import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

const LoginPage        = lazy(() => import('./pages/LoginPage'))
const RegisterPage     = lazy(() => import('./pages/RegisterPage'))
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const AdminPage        = lazy(() => import('./pages/AdminPage'))
const OAuth2OtpPage    = lazy(() => import('./pages/OAuth2OtpPage'))
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'))
const SharedPublicPage = lazy(() => import('./pages/SharedPublicPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const isDark = useThemeStore((s) => s.isDark)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('keycloak_error')) {
      window.history.replaceState({}, '', window.location.pathname)
      toast.error('Connexion Keycloak échouée. Vérifiez la configuration.')
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/oauth2/otp" element={<OAuth2OtpPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
        <Route path="/share/:token" element={<SharedPublicPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

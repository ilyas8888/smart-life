import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [otp, setOtp] = useState('')
  const [otpUserId, setOtpUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      if (data.step === 'OTP_REQUIRED') {
        setOtpUserId(data.userId)
        toast.success('Code envoyé à votre email')
      } else {
        setAuth(data.token, data.refreshToken ?? null, data.email, data.firstName, data.lastName)
        navigate('/')
      }
    } catch {
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: otpUserId, code: otp })
      setAuth(data.token, data.refreshToken ?? null, data.email, data.firstName, data.lastName)
      navigate('/')
    } catch {
      toast.error('Code OTP invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Brain className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SmartLife</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestionnaire personnel intelligent</p>
          </div>
        </div>

        {otpUserId === null ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">Créer un compte</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Prénom</label>
                  <input className="input" autoComplete="given-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nom</label>
                  <input className="input" autoComplete="family-name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
                <input className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Mot de passe (min. 6 caractères)</label>
                <div className="relative">
                  <input
                    className="input pr-11"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-400">ou</span>
              </div>
            </div>
            <a
              href={`${BACKEND_URL}/oauth2/authorization/keycloak`}
              className="btn-primary w-full text-center block"
            >
              S'inscrire avec Keycloak
            </a>

            <p className="text-center text-sm text-gray-600 mt-6 dark:text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-medium dark:text-primary-400">
                Se connecter
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2 dark:text-gray-100">Vérification</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Entrez le code à 6 chiffres envoyé à votre email.
            </p>
            <form onSubmit={handleOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Code OTP</label>
                <input
                  className="input text-center text-2xl tracking-widest"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
                {loading ? 'Vérification...' : 'Confirmer'}
              </button>
              <button
                type="button"
                onClick={() => { setOtpUserId(null); setOtp('') }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Retour à l'inscription
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'

export default function OAuth2OtpPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const userId = params.get('userId')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      navigate('/login', { replace: true })
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: Number(userId), code: otp })
      setAuth(data.token, data.email, data.firstName, data.lastName)
      navigate('/', { replace: true })
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Vérification en deux étapes</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 dark:text-gray-100">Vérification</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Un code à 6 chiffres a été envoyé à votre adresse email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>
      </div>
    </div>
  )
}

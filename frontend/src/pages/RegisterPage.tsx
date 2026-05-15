import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.token, data.refreshToken ?? null, data.email, data.firstName, data.lastName)
      navigate('/')
    } catch {
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
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

        <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">Créer un compte</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Prénom</label>
              <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nom</label>
              <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Mot de passe (min. 6 caractères)</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 dark:text-gray-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium dark:text-primary-400">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

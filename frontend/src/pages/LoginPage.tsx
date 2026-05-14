import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.token, data.email, data.firstName, data.lastName)
      navigate('/')
    } catch {
      toast.error('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Brain className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SmartLife</h1>
            <p className="text-xs text-gray-500">Gestionnaire personnel intelligent</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Connexion</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Pas de compte ?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

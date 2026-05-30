import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Globe, Eye, Clock, ExternalLink, AlertCircle } from 'lucide-react'

const publicApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
})

const RESOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  FOOD_LOG:      { label: 'Food Diary',      icon: '🍎' },
  WORKOUT_PLAN:  { label: 'Programme Sport', icon: '💪' },
  SLEEP_LOG:     { label: 'Sommeil',         icon: '😴' },
  STUDY_SESSION: { label: 'Session Étude',   icon: '📚' },
  NOTE:          { label: 'Note',            icon: '📝' },
  JOURNAL:       { label: 'Journal',         icon: '📖' },
}

type ShareData = {
  linkId: number
  title: string | null
  resourceType: string
  resourceId: number
  viewCount: number
  owner: { username?: string; email?: string }
  permissions: { allowComments: boolean; allowReactions: boolean }
  maskCalories: boolean
  resource: Record<string, unknown>
  createdAt: string
}

type ErrorState = 'NOT_FOUND' | 'REVOKED' | 'EXPIRED' | 'ERROR'

const ERROR_CONFIG: Record<ErrorState, { icon: string; title: string; message: string }> = {
  NOT_FOUND: { icon: '🔍', title: 'Lien introuvable',  message: 'Ce lien de partage n\'existe pas.' },
  REVOKED:   { icon: '🚫', title: 'Lien révoqué',      message: 'L\'auteur a révoqué l\'accès à ce contenu.' },
  EXPIRED:   { icon: '⌛', title: 'Lien expiré',       message: 'Ce lien de partage a atteint sa date d\'expiration.' },
  ERROR:      { icon: '⚠️', title: 'Erreur',            message: 'Une erreur est survenue. Réessayez plus tard.' },
}

export default function SharedPublicPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData]     = useState<ShareData | null>(null)
  const [error, setError]   = useState<ErrorState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setError('NOT_FOUND'); setLoading(false); return }
    publicApi.get(`/public/shares/${token}`)
      .then(r => setData(r.data))
      .catch(err => {
        const status = err?.response?.status
        const code   = err?.response?.data?.error
        if (status === 404)                              setError('NOT_FOUND')
        else if (status === 410 && code === 'LINK_REVOKED') setError('REVOKED')
        else if (status === 410 && code === 'LINK_EXPIRED') setError('EXPIRED')
        else                                             setError('ERROR')
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="w-9 h-9 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    const cfg = ERROR_CONFIG[error]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-sm w-full text-center space-y-4">
          <span className="text-5xl block">{cfg.icon}</span>
          <h1 className="text-xl font-bold text-gray-800">{cfg.title}</h1>
          <p className="text-gray-500 text-sm">{cfg.message}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <Globe size={15} />
              Accéder à SmartLife
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const rt = RESOURCE_LABELS[data.resourceType] ?? { label: data.resourceType, icon: '📄' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5 font-bold text-gray-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Globe size={15} className="text-white" />
          </div>
          SmartLife
        </div>
        <Link
          to="/register"
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors shadow-sm"
        >
          Créer mon compte
          <ExternalLink size={13} />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Resource header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{rt.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-semibold text-sky-700 bg-sky-50 rounded-full px-2.5 py-0.5 mb-2">
                {rt.label}
              </span>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {data.title ?? rt.label}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Eye size={13} />
                  {data.viewCount} vue{data.viewCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {new Date(data.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Contenu partagé
          </h2>
          <ResourceView
            type={data.resourceType}
            resource={data.resource}
            maskCalories={data.maskCalories}
          />
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-7 text-white text-center space-y-3 shadow-lg">
          <h2 className="text-lg font-bold">Gérez votre vie avec SmartLife</h2>
          <p className="text-sky-100 text-sm leading-relaxed">
            Alimentation, sport, sommeil, étude, tâches — tout en un, intelligent et privé.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-50 transition-colors shadow-sm mt-1"
          >
            Créer mon compte gratuit
            <ExternalLink size={14} />
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Partagé via SmartLife — contenu en lecture seule
        </p>
      </div>
    </div>
  )
}

const SKIP_KEYS = new Set(['id', 'userId', 'user', 'createdAt', 'updatedAt'])
const CALORIE_KEYS = new Set(['calories', 'protein', 'carbs', 'fat', 'proteins', 'carbohydrates', 'kcal'])

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, c => c.toUpperCase())
}

function ResourceView({
  resource,
  maskCalories,
}: {
  type: string
  resource: Record<string, unknown>
  maskCalories: boolean
}) {
  const entries = Object.entries(resource).filter(([k]) => !SKIP_KEYS.has(k))

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">Aucune donnée disponible.</p>
  }

  return (
    <div className="divide-y divide-gray-50 dark:divide-gray-700">
      {entries.map(([key, value]) => {
        if (value === null || value === undefined) return null

        const isSensitive = maskCalories && CALORIE_KEYS.has(key.toLowerCase())

        return (
          <div key={key} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <span className="text-sm text-gray-500 shrink-0">{humanizeKey(key)}</span>
            {isSensitive ? (
              <span className="text-sm text-gray-300 flex items-center gap-1 italic">
                <AlertCircle size={12} />
                Masqué
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-800 text-right max-w-xs truncate">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

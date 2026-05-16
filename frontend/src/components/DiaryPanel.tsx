import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Trash2, Send } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface DiaryEntry {
  id: number
  content: string
  mood: string | null
  entryDate: string
  createdAt: string
}

const MOODS = [
  { value: 'great', label: '😄 Super' },
  { value: 'good', label: '🙂 Bien' },
  { value: 'neutral', label: '😐 Neutre' },
  { value: 'bad', label: '😕 Pas terrible' },
  { value: 'awful', label: '😞 Difficile' },
]

export default function DiaryPanel() {
  const qc = useQueryClient()
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')

  const { data: entries = [], isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ['diary'],
    queryFn: () => api.get('/diary').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/diary', { content, mood: mood || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diary'] })
      setContent('')
      setMood('')
      toast.success('Entrée ajoutée')
    },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/diary/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['diary'] }); toast.success('Entrée supprimée') },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate()
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <BookOpen className="text-primary-600" />
        Journal Personnel
      </h2>

      <form onSubmit={handleSubmit} className="card mb-6">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Nouvelle entrée</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                mood === m.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <textarea
          className="w-full resize-none border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-base leading-relaxed min-h-[120px]"
          placeholder="Comment s'est passée votre journée ? Vos pensées, vos émotions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={createMutation.isPending}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400">{content.length} caractères</span>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={!content.trim() || createMutation.isPending}
          >
            <Send size={14} />
            {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune entrée dans votre journal.</p>
          <p className="text-sm mt-1">Commencez à écrire votre première entrée !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((e) => {
            const moodLabel = MOODS.find((m) => m.value === e.mood)?.label
            return (
              <div key={e.id} className="card">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {format(new Date(e.entryDate), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </p>
                    {moodLabel && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{moodLabel}</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(e.id)}
                    className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {e.content}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Trash2, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, getDaysInMonth, startOfMonth, getDay, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { EmptyState, IllustrationDiary } from './EmptyState'

interface DiaryEntry {
  id: number
  content: string
  mood: string | null
  entryDate: string
  createdAt: string
}

const MOODS = [
  { value: 'great',   label: '😄 Super',        color: 'bg-green-500',  border: 'border-l-4 border-green-400', dot: 'bg-green-400' },
  { value: 'good',    label: '🙂 Bien',          color: 'bg-blue-500',   border: 'border-l-4 border-blue-400',  dot: 'bg-blue-400'  },
  { value: 'neutral', label: '😐 Neutre',        color: 'bg-gray-400',   border: 'border-l-4 border-gray-300',  dot: 'bg-gray-400'  },
  { value: 'bad',     label: '😕 Pas terrible',  color: 'bg-orange-500', border: 'border-l-4 border-orange-400',dot: 'bg-orange-400'},
  { value: 'awful',   label: '😞 Difficile',     color: 'bg-red-500',    border: 'border-l-4 border-red-400',   dot: 'bg-red-400'   },
]

function getMoodMeta(value: string | null) {
  return MOODS.find((m) => m.value === value) ?? null
}

function MoodCalendar({ entries }: { entries: DiaryEntry[] }) {
  const [offset, setOffset] = useState(0)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + offset

  const actualDate = new Date(year, month, 1)
  const daysInMonth = getDaysInMonth(actualDate)
  const firstDow = (getDay(startOfMonth(actualDate)) + 6) % 7 // Monday-first

  const byDate: Record<string, string | null> = {}
  entries.forEach((e) => {
    const d = e.entryDate.slice(0, 10)
    byDate[d] = e.mood
  })

  const cells: Array<{ day: number; mood: string | null } | null> = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = format(new Date(actualDate.getFullYear(), actualDate.getMonth(), d), 'yyyy-MM-dd')
    cells.push({ day: d, mood: byDate[key] ?? null })
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
          {format(actualDate, 'MMMM yyyy', { locale: fr })}
        </p>
        <div className="flex gap-1">
          <button onClick={() => setOffset((o) => o - 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const meta = getMoodMeta(cell.mood)
          return (
            <div
              key={i}
              className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-medium transition-all
                ${meta ? `${meta.color} text-white` : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {cell.day}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {MOODS.map((m) => (
          <div key={m.value} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className={`w-2.5 h-2.5 rounded-full ${m.dot}`} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  )
}

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
        <EmptyState
          illustration={<IllustrationDiary />}
          title="Votre journal est vide"
          subtitle="Écrivez votre première entrée. Exprimez vos pensées, émotions et moments de la journée."
        />
      ) : (
        <>
          <MoodCalendar entries={entries} />
          <div className="space-y-4">
            {entries.map((e) => {
              const moodMeta = getMoodMeta(e.mood)
              return (
                <div key={e.id} className={`card ${moodMeta ? moodMeta.border : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {format(parseISO(e.entryDate), 'EEEE dd MMMM yyyy', { locale: fr })}
                      </p>
                      {moodMeta && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{moodMeta.label}</span>
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
        </>
      )}
    </div>
  )
}

import { useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookMarked, BookOpen, ChevronLeft, ChevronRight, Edit2, Flame,
  Search, Send, Tag, Trash2, TrendingUp, X,
} from 'lucide-react'
import { EmptyPanel, IllustrationDiary } from './EmptyState'
import { format, getDay, getDaysInMonth, parseISO, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface DiaryEntry {
  id: number
  content: string
  mood: string | null
  tags: string[] | null
  entryDate: string
  createdAt: string
  updatedAt: string
}

const MOODS = [
  { value: 'great', label: '?? Super', color: 'bg-green-500', border: 'border-l-4 border-green-400', dot: 'bg-green-400' },
  { value: 'good', label: '?? Bien', color: 'bg-blue-500', border: 'border-l-4 border-blue-400', dot: 'bg-blue-400' },
  { value: 'neutral', label: '?? Neutre', color: 'bg-gray-400', border: 'border-l-4 border-gray-300', dot: 'bg-gray-400' },
  { value: 'bad', label: '?? Pas terrible', color: 'bg-orange-500', border: 'border-l-4 border-orange-400', dot: 'bg-orange-400' },
  { value: 'awful', label: '?? Difficile', color: 'bg-red-500', border: 'border-l-4 border-red-400', dot: 'bg-red-400' },
]

function getMoodMeta(value: string | null) {
  return MOODS.find((m) => m.value === value) ?? null
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function dateKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function MoodCalendar({ entries }: { entries: DiaryEntry[] }) {
  const [offset, setOffset] = useState(0)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + offset

  const actualDate = new Date(year, month, 1)
  const daysInMonth = getDaysInMonth(actualDate)
  const firstDow = (getDay(startOfMonth(actualDate)) + 6) % 7

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
        <p className="font-semibold text-gray-300 capitalize">
          {format(actualDate, 'MMMM yyyy', { locale: fr })}
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={() => setOffset((o) => o - 1)} className="p-1 rounded hover:bg-white/[0.05] text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0} className="p-1 rounded hover:bg-white/[0.05] text-gray-400 disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-[10px] font-semibold text-gray-500 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const meta = getMoodMeta(cell.mood)
          return (
            <div
              key={i}
              className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-medium transition-all ${
                meta ? `${meta.color} text-white` : 'text-gray-500 hover:bg-white/[0.05]'
              }`}
            >
              {cell.day}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/10 border-white/10">
        {MOODS.map((m) => (
          <div key={m.value} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className={`w-2.5 h-2.5 rounded-full ${m.dot}`} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function MoodTrend({ entries }: { entries: DiaryEntry[] }) {
  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const key = dateKey(d)
      const entry = entries.find(e => e.entryDate.slice(0, 10) === key)
      const moodIndex = entry?.mood ? MOODS.findIndex(m => m.value === entry.mood) : -1
      return { key, label: format(d, 'EEEEE', { locale: fr }), moodIndex: moodIndex >= 0 ? 4 - moodIndex : null }
    })
  }, [entries])

  const points = days
    .map((d, i) => d.moodIndex === null ? null : { x: 12 + i * 46, y: 52 - d.moodIndex * 10, moodIndex: d.moodIndex })
    .filter((p): p is { x: number; y: number; moodIndex: number } => p !== null)

  if (points.length < 3) return null

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={15} className="text-primary-600" />
        <p className="text-sm font-semibold text-gray-300">Tendance humeur</p>
      </div>
      <svg viewBox="0 0 300 76" className="w-full h-[76px] overflow-visible">
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary-500"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => {
          const mood = MOODS[4 - p.moodIndex] ?? MOODS[2]
          return <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="4" className={`${mood.dot} stroke-white dark:stroke-gray-800`} strokeWidth="2" />
        })}
        {days.map((d, i) => (
          <text key={d.key} x={12 + i * 46} y={72} textAnchor="middle" className="fill-gray-400 text-[10px]">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function EntryContent({ entry }: { entry: DiaryEntry }) {
  const [expanded, setExpanded] = useState(false)
  const shouldTruncate = entry.content.length > 250
  const content = shouldTruncate && !expanded ? `${entry.content.slice(0, 250).trim()}...` : entry.content

  return (
    <div>
      <p className={`text-gray-300 leading-relaxed whitespace-pre-wrap text-sm ${!expanded && shouldTruncate ? 'line-clamp-4' : ''}`}>
        {content}
      </p>
      {shouldTruncate && (
        <button type="button" onClick={() => setExpanded(v => !v)}
          className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-2 hover:underline">
          {expanded ? 'Réduire' : 'Lire la suite'}
        </button>
      )}
    </div>
  )
}

export default function DiaryPanel() {
  const qc = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')

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
    onError: () => toast.error("Erreur lors de l'ajout"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/diary/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['diary'] }); toast.success('Entrée supprimée') },
  })

  const totalWords = entries.reduce((s, e) => s + wordCount(e.content), 0)
  const streak = useMemo(() => {
    const daysWithEntries = new Set(entries.map(e => e.entryDate.slice(0, 10)))
    const current = new Date()
    current.setHours(0, 0, 0, 0)
    let count = 0
    while (daysWithEntries.has(dateKey(current))) {
      count += 1
      current.setDate(current.getDate() - 1)
    }
    return count
  }, [entries])
  const avgMood = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(today.getDate() - 6)
    const recent = entries
      .filter(e => {
        const d = new Date(`${e.entryDate.slice(0, 10)}T00:00:00`)
        return d >= start && d <= today && e.mood
      })
      .map(e => MOODS.findIndex(m => m.value === e.mood))
      .filter(i => i >= 0)
    if (recent.length === 0) return null
    return MOODS[Math.round(recent.reduce((s, i) => s + i, 0) / recent.length)]
  }, [entries])

  const filteredEntries = useMemo(() => entries.filter(e => {
    const matchesSearch = !searchQuery.trim() || e.content.toLowerCase().includes(searchQuery.trim().toLowerCase())
    const matchesMood = !filterMood || e.mood === filterMood
    return matchesSearch && matchesMood
  }), [entries, searchQuery, filterMood])

  const entriesByMonth = useMemo(() => filteredEntries.reduce((acc, e) => {
    const month = e.entryDate.slice(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(e)
    return acc
  }, {} as Record<string, DiaryEntry[]>), [filteredEntries])
  const sortedMonths = useMemo(() => Object.keys(entriesByMonth).sort((a, b) => b.localeCompare(a)), [entriesByMonth])

  const selectedMood = getMoodMeta(mood)
  const wordTotal = wordCount(content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate()
  }

  const startEdit = (e: DiaryEntry) => {
    setEditingId(e.id)
    setEditContent(e.content)
    setEditMood(e.mood ?? '')
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
    setEditMood('')
  }
  const saveEdit = (id: number) => {
    api.put(`/diary/${id}`, { content: editContent, mood: editMood || null })
      .then(() => { qc.invalidateQueries({ queryKey: ['diary'] }); cancelEdit(); toast.success('Modifié') })
      .catch(() => toast.error('Erreur'))
  }

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div className="w-full">
      <h2 className="font-black text-white text-2xl mb-4 flex items-center gap-2">
        <BookOpen className="text-primary-600" />
        Journal Personnel
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Streak', value: `${streak}j`, icon: <Flame size={15} /> },
          { label: 'Entrées', value: String(entries.length), icon: <BookMarked size={15} /> },
          { label: 'Mots', value: totalWords.toLocaleString('fr'), icon: <span>??</span> },
          { label: 'Humeur', value: avgMood ? avgMood.label.split(' ')[0] : '—', icon: <TrendingUp size={15} /> },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-white/[0.03] px-3 py-3 text-center">
            <div className="flex justify-center text-primary-600 dark:text-primary-400 mb-1">{stat.icon}</div>
            <p className="text-lg font-black text-white leading-none">{stat.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={`card mb-4 overflow-hidden ${selectedMood ? selectedMood.border : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Aujourd'hui</p>
            <p className="text-xl font-black text-white capitalize">
              {format(new Date(), 'EEEE dd MMMM', { locale: fr })}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${selectedMood ? `${selectedMood.color} text-white` : 'bg-white/[0.05]'}`}>
            {selectedMood ? selectedMood.label.split(' ')[0] : '??'}
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              className={`w-11 h-11 rounded-full text-xl flex items-center justify-center transition-all ${
                mood === m.value
                  ? `${m.color} text-white scale-110 shadow`
                  : 'bg-white/[0.05] opacity-70 hover:opacity-100'
              }`}
              title={m.label}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          className="w-full resize-none border-0 outline-none text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-[15px] leading-relaxed min-h-[160px]"
          placeholder="Comment s'est passée ta journée ? Tes pensées, tes émotions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={createMutation.isPending}
        />
        <div className="mt-3 pt-3 border-t border-white/10 border-white/10">
          <span className="text-xs text-gray-400">{wordTotal} mot{wordTotal > 1 ? 's' : ''}</span>
          <button
            type="submit"
            className={`w-full mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${selectedMood ? selectedMood.color : 'bg-primary-600 hover:bg-primary-700'}`}
            disabled={!content.trim() || createMutation.isPending}
          >
            <Send size={14} />
            {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher dans le journal..."
            className="input pl-9 py-2 text-sm" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button type="button" onClick={() => setFilterMood(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterMood === null ? 'bg-white/10 text-white' : 'bg-white/[0.05] text-gray-500'}`}>
            Tout
          </button>
          {MOODS.map(m => (
            <button key={m.value} type="button" onClick={() => setFilterMood(filterMood === m.value ? null : m.value)}
              className={`px-2.5 py-1.5 rounded-full text-sm transition-all ${filterMood === m.value ? `${m.color} text-white scale-110` : 'bg-white/[0.05]'}`}>
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {entries.length >= 3 && <MoodTrend entries={entries} />}

      {entries.length === 0 ? (
        <EmptyPanel
          illustration={<IllustrationDiary />}
          gradient="from-rose-500 to-fuchsia-500"
          headline="Ton journal t'attend"
          description="5 minutes par jour pour mieux te connaître. Humeur, pensées, accomplissements — tout compte."
          preview={
            <div className="card border-l-4 border-l-blue-400">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">??</div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Lundi 25 mai 2026</p>
                  <p className="text-xs text-gray-400">Bonne humeur · 124 mots</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2 italic">"Bonne journée aujourd'hui. J'ai terminé le rapport de stage et préparé la soutenance. Je me sens prêt..."</p>
            </div>
          }
          primaryLabel="?? Écrire ma première entrée"
          onPrimary={() => { textareaRef.current?.scrollIntoView({ behavior: 'smooth' }); textareaRef.current?.focus() }}
        />
      ) : (
        <>
          <MoodCalendar entries={filteredEntries} />
          {sortedMonths.map(month => {
            const [year, m] = month.split('-')
            const monthLabel = new Date(Number(year), Number(m) - 1).toLocaleString('fr', { month: 'long', year: 'numeric' })
            const monthEntries = entriesByMonth[month]
            return (
              <div key={month} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-bold text-gray-300 capitalize">{monthLabel}</h3>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                  <span className="text-xs text-gray-400">{monthEntries.length} entrée{monthEntries.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-4">
                  {monthEntries.map((e) => {
                    const moodMeta = getMoodMeta(e.mood)
                    return (
                      <div key={e.id} className={`card overflow-hidden group ${moodMeta ? moodMeta.border : ''}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                            moodMeta ? `${moodMeta.color} bg-opacity-10` : 'bg-white/[0.05]'
                          }`}>
                            {moodMeta ? moodMeta.label.split(' ')[0] : ''}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white">
                              {format(parseISO(e.entryDate), 'EEEE dd MMMM', { locale: fr })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {moodMeta ? moodMeta.label : 'Sans humeur'} · {wordCount(e.content)} mots
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => startEdit(e)}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit2 size={14} />
                            </button>
                            <button type="button" onClick={() => deleteMutation.mutate(e.id)}
                              className="p-1.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {editingId === e.id ? (
                          <div>
                            <div className="flex gap-1.5 mb-2">
                              {MOODS.map(moodOption => (
                                <button key={moodOption.value} type="button" onClick={() => setEditMood(moodOption.value)}
                                  className={`text-lg p-1 rounded-xl transition-all ${editMood === moodOption.value ? 'scale-125' : 'opacity-50'}`}>
                                  {moodOption.label.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                            <textarea className="input resize-none w-full min-h-[120px] text-sm mb-3"
                              value={editContent} onChange={e2 => setEditContent(e2.target.value)} />
                            <div className="flex gap-2 justify-end">
                              <button type="button" onClick={cancelEdit} className="btn-secondary text-sm py-1.5 px-3">Annuler</button>
                              <button type="button" onClick={() => saveEdit(e.id)} className="btn-primary text-sm py-1.5 px-3">Sauvegarder</button>
                            </div>
                          </div>
                        ) : (
                          <EntryContent entry={e} />
                        )}

                        {e.tags && e.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10 border-white/10">
                            {e.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 flex items-center gap-1">
                                <Tag size={9} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Moon, Plus, Star, Trash2, Edit2, X, Clock, TrendingUp, Bed } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface SleepLog {
  id: number
  sleepDate: string
  bedtime: string
  wakeTime: string
  durationMinutes: number
  quality: number
  notes: string | null
  createdAt: string
}

const QUALITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Très mauvais', color: 'text-red-500' },
  2: { label: 'Mauvais', color: 'text-orange-500' },
  3: { label: 'Correct', color: 'text-yellow-500' },
  4: { label: 'Bon', color: 'text-blue-500' },
  5: { label: 'Excellent', color: 'text-green-500' },
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`
}

function formatTime(iso: string): string {
  return iso.substring(11, 16)
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function todayLocalISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function toLocalDateTimeISO(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`
}

interface FormState {
  bedDate: string
  bedTime: string
  wakeDate: string
  wakeTime: string
  quality: number
  notes: string
}

function defaultForm(): FormState {
  const today = todayLocalISO()
  const yesterday = new Date(Date.now() - 86400000)
  const yd = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  return { bedDate: yd, bedTime: '23:00', wakeDate: today, wakeTime: '07:00', quality: 3, notes: '' }
}

function logToForm(log: SleepLog): FormState {
  return {
    bedDate: log.bedtime.substring(0, 10),
    bedTime: log.bedtime.substring(11, 16),
    wakeDate: log.wakeTime.substring(0, 10),
    wakeTime: log.wakeTime.substring(11, 16),
    quality: log.quality,
    notes: log.notes ?? '',
  }
}

export default function SleepPanel() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm())

  const { data: logs = [] } = useQuery<SleepLog[]>({
    queryKey: ['sleep-logs'],
    queryFn: () => api.get('/sleep-logs').then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      editingLog
        ? api.put(`/sleep-logs/${editingLog.id}`, payload).then(r => r.data)
        : api.post('/sleep-logs', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep-logs'] })
      toast.success(editingLog ? 'Nuit modifiée' : 'Nuit enregistrée')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error
      if (msg === 'WAKE_BEFORE_BED') toast.error('L\'heure de réveil doit être après le coucher')
      else toast.error('Erreur lors de l\'enregistrement')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sleep-logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep-logs'] })
      toast.success('Nuit supprimée')
    },
  })

  function openCreate() {
    setEditingLog(null)
    setForm(defaultForm())
    setShowModal(true)
  }

  function openEdit(log: SleepLog) {
    setEditingLog(log)
    setForm(logToForm(log))
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingLog(null)
  }

  function handleSave() {
    const bedtime = toLocalDateTimeISO(form.bedDate, form.bedTime)
    const wakeTime = toLocalDateTimeISO(form.wakeDate, form.wakeTime)
    saveMutation.mutate({ bedtime, wakeTime, quality: form.quality, notes: form.notes.trim() || null })
  }

  const last7 = logs.slice(0, 7)
  const avgDuration = last7.length
    ? Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length)
    : null
  const avgQuality = last7.length
    ? Math.round(last7.reduce((s, l) => s + l.quality, 0) / last7.length * 10) / 10
    : null
  const lastNight = logs[0] ?? null

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Moon size={22} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sommeil</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Suivi de vos nuits</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Ajouter une nuit
        </button>
      </div>

      {/* Stats */}
      {last7.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <Clock size={18} className="mx-auto text-indigo-400 mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgDuration ? formatDuration(avgDuration) : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Durée moyenne</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <Star size={18} className="mx-auto text-yellow-400 mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgQuality ?? '—'}<span className="text-sm font-normal text-gray-400">/5</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Qualité moyenne</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center">
            <Bed size={18} className="mx-auto text-blue-400 mb-1" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {lastNight ? formatDuration(lastNight.durationMinutes) : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dernière nuit</p>
          </div>
        </div>
      )}

      {/* 7-day bar chart */}
      {last7.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">7 dernières nuits</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[...last7].reverse().map((log) => {
              const pct = Math.min(100, Math.round((log.durationMinutes / 540) * 100))
              const qColor = log.quality >= 4 ? 'bg-green-400' : log.quality >= 3 ? 'bg-blue-400' : 'bg-orange-400'
              return (
                <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{formatDuration(log.durationMinutes)}</span>
                  <div className="w-full flex items-end" style={{ height: '60px' }}>
                    <div
                      className={`w-full rounded-t-md ${qColor} opacity-80`}
                      style={{ height: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">
                    {formatDate(log.sleepDate).split(' ')[1]}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Couleur = qualité · vert ≥4, bleu 3, orange ≤2 · barre = durée (max 9h)</p>
        </div>
      )}

      {/* Logs list */}
      {logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Moon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune nuit enregistrée</p>
          <p className="text-sm mt-1">Commencez à suivre votre sommeil</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const q = QUALITY_LABELS[log.quality]
            return (
              <div
                key={log.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatDate(log.sleepDate)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(log.bedtime)} → {formatTime(log.wakeTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatDuration(log.durationMinutes)}
                    </span>
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${q.color}`}>
                      {Array.from({ length: log.quality }).map((_, i) => (
                        <Star key={i} size={10} fill="currentColor" />
                      ))}
                      <span className="ml-1">{q.label}</span>
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{log.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(log)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(log.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingLog ? 'Modifier la nuit' : 'Nouvelle nuit'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Coucher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure du coucher
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={form.bedDate}
                  onChange={e => setForm(f => ({ ...f, bedDate: e.target.value }))}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={form.bedTime}
                  onChange={e => setForm(f => ({ ...f, bedTime: e.target.value }))}
                  className="w-28 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Réveil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure du réveil
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={form.wakeDate}
                  onChange={e => setForm(f => ({ ...f, wakeDate: e.target.value }))}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))}
                  className="w-28 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Durée calculée */}
            {(() => {
              try {
                const bed = new Date(toLocalDateTimeISO(form.bedDate, form.bedTime))
                const wake = new Date(toLocalDateTimeISO(form.wakeDate, form.wakeTime))
                const mins = Math.round((wake.getTime() - bed.getTime()) / 60000)
                if (mins > 0) {
                  return (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      Durée : {formatDuration(mins)}
                    </p>
                  )
                }
              } catch {}
              return null
            })()}

            {/* Qualité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualité du sommeil
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    onClick={() => setForm(f => ({ ...f, quality: q }))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.quality === q
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <p className={`text-xs mt-1 ${QUALITY_LABELS[form.quality].color}`}>
                {QUALITY_LABELS[form.quality].label}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Raisons d'un mauvais sommeil, rêves, etc."
                rows={2}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? 'Enregistrement...' : editingLog ? 'Modifier' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

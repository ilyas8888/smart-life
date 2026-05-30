import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Moon, Plus, Star, Trash2, Edit2, X, Clock, TrendingUp, Bed,
  Sunrise, Zap, Coffee, Smartphone, Dumbbell,
  Utensils, Volume2, ThermometerSun, Brain, Waves, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface SleepLog {
  id: number
  sleepDate: string
  bedtime: string
  wakeTime: string
  durationMinutes: number
  quality: number
  energy: number | null
  wakeUps: number
  factors: string[] | null
  notes: string | null
  createdAt: string
}

interface FormState {
  bedDate: string
  bedTime: string
  wakeDate: string
  wakeTime: string
  quality: number
  energy: number
  wakeUps: number
  factors: string[]
  notes: string
}

const TARGET_MINUTES = 8 * 60
const QUALITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Tres mauvais', color: 'text-red-500', bg: 'bg-red-500' },
  2: { label: 'Mauvais', color: 'text-orange-500', bg: 'bg-orange-500' },
  3: { label: 'Correct', color: 'text-yellow-500', bg: 'bg-yellow-500' },
  4: { label: 'Bon', color: 'text-blue-500', bg: 'bg-blue-500' },
  5: { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500' },
}

const ENERGY_LABELS: Record<number, string> = {
  1: 'Epuise',
  2: 'Faible',
  3: 'Moyen',
  4: 'Bon',
  5: 'Tres bon',
}

const FACTORS = [
  { id: 'CAFFEINE', label: 'Cafeine', icon: Coffee },
  { id: 'SCREEN', label: 'Ecran tard', icon: Smartphone },
  { id: 'STRESS', label: 'Stress', icon: Brain },
  { id: 'LATE_WORKOUT', label: 'Sport tard', icon: Dumbbell },
  { id: 'HEAVY_MEAL', label: 'Repas lourd', icon: Utensils },
  { id: 'NOISE', label: 'Bruit', icon: Volume2 },
  { id: 'TEMPERATURE', label: 'Temperature', icon: ThermometerSun },
  { id: 'NAP', label: 'Sieste', icon: Waves },
]

function todayLocalISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function yesterdayLocalISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function defaultForm(): FormState {
  return {
    bedDate: yesterdayLocalISO(),
    bedTime: '23:00',
    wakeDate: todayLocalISO(),
    wakeTime: '07:00',
    quality: 3,
    energy: 3,
    wakeUps: 0,
    factors: [],
    notes: '',
  }
}

function logToForm(log: SleepLog): FormState {
  return {
    bedDate: log.bedtime.substring(0, 10),
    bedTime: log.bedtime.substring(11, 16),
    wakeDate: log.wakeTime.substring(0, 10),
    wakeTime: log.wakeTime.substring(11, 16),
    quality: log.quality,
    energy: log.energy ?? 3,
    wakeUps: log.wakeUps ?? 0,
    factors: log.factors ?? [],
    notes: log.notes ?? '',
  }
}

function toLocalDateTimeISO(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`
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

function minutesFromTime(iso: string): number {
  const h = Number(iso.substring(11, 13))
  const m = Number(iso.substring(14, 16))
  return h * 60 + m
}

function bedtimeVariance(logs: SleepLog[]): number {
  if (logs.length < 2) return 0
  const values = logs.map(l => minutesFromTime(l.bedtime)).map(m => (m < 12 * 60 ? m + 24 * 60 : m))
  return Math.max(...values) - Math.min(...values)
}

function sleepScore(log: SleepLog | null, regularityMinutes: number): number | null {
  if (!log) return null
  const durationScore = Math.min(45, Math.round((Math.min(log.durationMinutes, TARGET_MINUTES) / TARGET_MINUTES) * 45))
  const qualityScore = Math.round((log.quality / 5) * 30)
  const energyScore = Math.round(((log.energy ?? 3) / 5) * 15)
  const regularityScore = Math.max(0, 10 - Math.round(regularityMinutes / 18))
  return Math.min(100, durationScore + qualityScore + energyScore + regularityScore)
}

function calculatedDuration(form: FormState): number | null {
  const bed = new Date(toLocalDateTimeISO(form.bedDate, form.bedTime))
  const wake = new Date(toLocalDateTimeISO(form.wakeDate, form.wakeTime))
  const mins = Math.round((wake.getTime() - bed.getTime()) / 60000)
  return mins > 0 ? mins : null
}

function factorLabel(id: string) {
  return FACTORS.find(f => f.id === id)?.label ?? id
}

function buildInsights(logs: SleepLog[]) {
  const last7 = logs.slice(0, 7)
  if (last7.length === 0) return ['Enregistrez votre premiere nuit pour obtenir des tendances utiles.']

  const insights: string[] = []
  const avgDuration = Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length)
  const variance = bedtimeVariance(last7)
  const shortNights = last7.filter(l => l.durationMinutes < 7 * 60).length
  const best = [...last7].sort((a, b) => b.quality - a.quality || b.durationMinutes - a.durationMinutes)[0]

  if (avgDuration < 7 * 60) {
    insights.push(`Votre moyenne 7 jours est ${formatDuration(avgDuration)}. Objectif utile: gagner 30 min cette semaine.`)
  } else if (avgDuration >= TARGET_MINUTES) {
    insights.push(`Vous atteignez une moyenne solide de ${formatDuration(avgDuration)} sur les dernieres nuits.`)
  } else {
    insights.push(`Vous etes proche de l'objectif: ${formatDuration(avgDuration)} de moyenne, cible ${formatDuration(TARGET_MINUTES)}.`)
  }

  if (variance >= 120) {
    insights.push(`Votre heure de coucher varie de ${formatDuration(variance)}. La regularite peut ameliorer la recuperation.`)
  } else if (last7.length >= 3) {
    insights.push('Votre rythme de coucher est plutot stable. Gardez cette base.')
  }

  if (shortNights >= 3) {
    insights.push(`${shortNights} nuits sous 7h cette semaine. Priorite: coucher plus tot, pas seulement reveil plus tard.`)
  }

  if (best) {
    insights.push(`Meilleure nuit recente: ${formatDate(best.sleepDate)}, ${formatDuration(best.durationMinutes)}, qualite ${best.quality}/5.`)
  }

  return insights.slice(0, 4)
}

function tonightPlan(logs: SleepLog[]) {
  const last7 = logs.slice(0, 7)
  const variance = bedtimeVariance(last7)
  const avgDuration = last7.length ? Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length) : 0
  const last = logs[0]

  if (!last) return 'Enregistrez la derniere nuit, puis SmartLife proposera une action simple pour ce soir.'
  if (avgDuration && avgDuration < 7 * 60) return 'Ce soir: visez 30 minutes de sommeil en plus. Commencez la routine avant 23:00.'
  if (variance >= 120) return 'Ce soir: stabilisez le coucher. Essayez une fenetre fixe autour de 23:30.'
  if ((last.factors ?? []).includes('SCREEN')) return 'Ce soir: coupez les ecrans 45 minutes avant le coucher.'
  if ((last.factors ?? []).includes('CAFFEINE')) return 'Ce soir: evitez la cafeine apres 16:00 et observez la qualite demain.'
  if (last.wakeUps >= 2) return 'Ce soir: notez lumiere, bruit et temperature si vous vous reveillez encore.'
  return 'Ce soir: gardez le meme rythme et visez une nuit complete autour de 8h.'
}

export default function SleepPanel() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm())

  const { data: logs = [], isLoading } = useQuery<SleepLog[]>({
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
      toast.success(editingLog ? 'Nuit modifiee' : 'Nuit enregistree')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error
      if (msg === 'WAKE_BEFORE_BED') toast.error("L'heure de reveil doit etre apres le coucher")
      else toast.error("Erreur lors de l'enregistrement")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sleep-logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep-logs'] })
      toast.success('Nuit supprimee')
    },
  })

  const last7 = useMemo(() => logs.slice(0, 7), [logs])
  const lastNight = logs[0] ?? null
  const avgDuration = last7.length ? Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length) : null
  const avgQuality = last7.length ? Math.round((last7.reduce((s, l) => s + l.quality, 0) / last7.length) * 10) / 10 : null
  const regularity = bedtimeVariance(last7)
  const score = sleepScore(lastNight, regularity)
  const insights = useMemo(() => buildInsights(logs), [logs])
  const plan = useMemo(() => tonightPlan(logs), [logs])

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

  function toggleFactor(id: string) {
    setForm(f => ({
      ...f,
      factors: f.factors.includes(id) ? f.factors.filter(x => x !== id) : [...f.factors, id],
    }))
  }

  function handleSave() {
    const bedtime = toLocalDateTimeISO(form.bedDate, form.bedTime)
    const wakeTime = toLocalDateTimeISO(form.wakeDate, form.wakeTime)
    saveMutation.mutate({
      bedtime,
      wakeTime,
      quality: form.quality,
      energy: form.energy,
      wakeUps: form.wakeUps,
      factors: form.factors,
      notes: form.notes.trim() || null,
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Moon size={23} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Sleep Coach</h1>
            <p className="text-sm text-gray-400">Duree, regularite, energie et facteurs de sommeil</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Enregistrer la nuit derniere
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <EmptySleepState onCreate={openCreate} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard icon={Sparkles} label="Score sommeil" value={score !== null ? `${score}/100` : '--'} hint="Derniere nuit" tone="indigo" />
            <MetricCard icon={Bed} label="Derniere nuit" value={lastNight ? formatDuration(lastNight.durationMinutes) : '--'} hint={lastNight ? `${formatTime(lastNight.bedtime)} - ${formatTime(lastNight.wakeTime)}` : 'Aucune'} tone="blue" />
            <MetricCard icon={Clock} label="Moyenne 7 jours" value={avgDuration ? formatDuration(avgDuration) : '--'} hint={`Cible ${formatDuration(TARGET_MINUTES)}`} tone="emerald" />
            <MetricCard icon={Star} label="Qualite moyenne" value={avgQuality ? `${avgQuality}/5` : '--'} hint={regularity ? `Regularite ${formatDuration(regularity)}` : '7 dernieres nuits'} tone="amber" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <WeeklyChart logs={last7} />
            <div className="space-y-4">
              <div className="glass-card p-4 border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-indigo-500" />
                  <h2 className="text-sm font-black text-white">Plan pour ce soir</h2>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{plan}</p>
              </div>
              <div className="glass-card p-4 border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-indigo-500" />
                  <h2 className="text-sm font-black text-white">Smart insights</h2>
                </div>
                <div className="space-y-2">
                  {insights.map((insight, idx) => (
                    <p key={idx} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white">Historique des nuits</h2>
                <p className="text-xs text-gray-400">Scannez duree, qualite, energie et facteurs</p>
              </div>
              <span className="text-xs font-medium text-gray-400">{logs.length} nuit{logs.length > 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {logs.map(log => (
                <SleepRow key={log.id} log={log} onEdit={openEdit} onDelete={id => deleteMutation.mutate(id)} />
              ))}
            </div>
          </div>
        </>
      )}

      {showModal && (
        <SleepModal
          form={form}
          editing={Boolean(editingLog)}
          saving={saveMutation.isPending}
          onClose={closeModal}
          onChange={setForm}
          onToggleFactor={toggleFactor}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function EmptySleepState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="min-h-[420px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <Moon size={32} className="text-indigo-500" />
        </div>
        <h2 className="text-lg font-black text-white">Commencez par votre derniere nuit</h2>
        <p className="text-sm text-gray-400 mt-2 mb-5">
          SmartLife suivra votre duree, votre regularite et les facteurs qui influencent votre recuperation.
        </p>
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
          <Plus size={16} />
          Enregistrer la nuit derniere
        </button>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone }: {
  icon: typeof Moon
  label: string
  value: string
  hint: string
  tone: 'indigo' | 'blue' | 'emerald' | 'amber'
}) {
  const tones = {
    indigo: 'bg-indigo-500/10 text-indigo-500',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
  }
  return (
    <div className="glass-card p-4 border-white/10">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="font-black text-white text-2xl leading-none">{value}</p>
      <p className="text-xs font-medium text-gray-400 mt-2">{label}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{hint}</p>
    </div>
  )
}

function WeeklyChart({ logs }: { logs: SleepLog[] }) {
  return (
    <div className="glass-card p-4 border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <h2 className="text-sm font-black text-white">7 dernieres nuits</h2>
        </div>
        <span className="text-xs text-gray-400">Ligne cible: 8h</span>
      </div>
      <div className="relative h-44">
        <div className="absolute left-0 right-0 top-[33%] border-t border-dashed border-indigo-800" />
        <div className="h-full flex items-end gap-2">
          {[...logs].reverse().map(log => {
            const pct = Math.min(100, Math.round((log.durationMinutes / (10 * 60)) * 100))
            const q = QUALITY_LABELS[log.quality]
            return (
              <div key={log.id} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-gray-400">{formatDuration(log.durationMinutes)}</span>
                <div className="w-full h-28 flex items-end">
                  <div className={`w-full rounded-t-lg ${q.bg} opacity-85`} style={{ height: `${Math.max(8, pct)}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 truncate w-full text-center">{formatDate(log.sleepDate).split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-400">
        <span>Vert: excellent</span>
        <span>Bleu: bon</span>
        <span>Orange/Rouge: a corriger</span>
      </div>
    </div>
  )
}

function SleepRow({ log, onEdit, onDelete }: {
  log: SleepLog
  onEdit: (log: SleepLog) => void
  onDelete: (id: number) => void
}) {
  const q = QUALITY_LABELS[log.quality]
  const factors = log.factors ?? []
  return (
    <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-white text-sm">{formatDate(log.sleepDate)}</span>
          <span className="text-xs text-gray-400">{formatTime(log.bedtime)} - {formatTime(log.wakeTime)}</span>
          <span className={`text-xs font-semibold ${q.color}`}>{q.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">{formatDuration(log.durationMinutes)}</span>
          <span className="flex items-center gap-1"><Sunrise size={12} /> Energie {log.energy ?? '-'}/5</span>
          <span>Reveils: {log.wakeUps ?? 0}</span>
        </div>
        {(factors.length > 0 || log.notes) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {factors.slice(0, 4).map(f => (
              <span key={f} className="text-[10px] px-2 py-1 rounded-full bg-white/[0.05] text-gray-400">
                {factorLabel(f)}
              </span>
            ))}
            {log.notes && <span className="text-[10px] text-gray-400 truncate max-w-xs">{log.notes}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button onClick={() => onEdit(log)} className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-blue-500 transition-colors" title="Modifier">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(log.id)} className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function SleepModal({ form, editing, saving, onClose, onChange, onToggleFactor, onSave }: {
  form: FormState
  editing: boolean
  saving: boolean
  onClose: () => void
  onChange: (value: FormState | ((prev: FormState) => FormState)) => void
  onToggleFactor: (id: string) => void
  onSave: () => void
}) {
  const duration = calculatedDuration(form)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white/5 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/5 px-5 py-4 border-b border-white/10 border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">{editing ? 'Modifier la nuit' : 'Journal rapide de nuit'}</h2>
            <p className="text-xs text-gray-400">Capturez ce qui explique vraiment votre recuperation.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-white/[0.05]">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <DateTimeField
              label="Coucher"
              date={form.bedDate}
              time={form.bedTime}
              onDate={bedDate => onChange(f => ({ ...f, bedDate }))}
              onTime={bedTime => onChange(f => ({ ...f, bedTime }))}
            />
            <DateTimeField
              label="Reveil"
              date={form.wakeDate}
              time={form.wakeTime}
              onDate={wakeDate => onChange(f => ({ ...f, wakeDate }))}
              onTime={wakeTime => onChange(f => ({ ...f, wakeTime }))}
            />
          </div>

          <div className="rounded-xl bg-indigo-900/20 px-4 py-3 flex items-center justify-between border border-indigo-500/20">
            <span className="text-sm font-medium text-indigo-300">Duree calculee</span>
            <span className="text-lg font-bold text-indigo-300">{duration ? formatDuration(duration) : '--'}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <ScorePicker
              label="Qualite du sommeil"
              value={form.quality}
              labels={QUALITY_LABELS}
              onChange={quality => onChange(f => ({ ...f, quality }))}
            />
            <EnergyPicker
              value={form.energy}
              onChange={energy => onChange(f => ({ ...f, energy }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reveils nocturnes</label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(f => ({ ...f, wakeUps: n }))}
                  className={`rounded-xl py-2 text-sm font-semibold border transition-colors ${
                    form.wakeUps === n ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/10 text-gray-400'
                  }`}
                >
                  {n === 4 ? '4+' : n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Facteurs possibles</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FACTORS.map(factor => {
                const Icon = factor.icon
                const active = form.factors.includes(factor.id)
                return (
                  <button
                    key={factor.id}
                    type="button"
                    onClick={() => onToggleFactor(factor.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                        : 'border-white/10 text-gray-400 hover:border-indigo-400'
                    }`}
                  >
                    <Icon size={14} />
                    {factor.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Note optionnelle</label>
            <textarea
              value={form.notes}
              onChange={e => onChange(f => ({ ...f, notes: e.target.value }))}
              placeholder="Ex: reveil a 4h, stress, chambre chaude..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/[0.05] transition-colors">
              Annuler
            </button>
            <button onClick={onSave} disabled={saving || !duration} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DateTimeField({ label, date, time, onDate, onTime }: {
  label: string
  date: string
  time: string
  onDate: (value: string) => void
  onTime: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="flex gap-2">
        <input type="date" value={date} onChange={e => onDate(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <input type="time" value={time} onChange={e => onTime(e.target.value)}
          className="w-28 rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
    </div>
  )
}

function ScorePicker({ label, value, labels, onChange }: {
  label: string
  value: number
  labels: typeof QUALITY_LABELS
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(q => (
          <button key={q} type="button" onClick={() => onChange(q)}
            className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
              value === q ? 'bg-indigo-600 text-white border-indigo-600' : 'border-white/10 text-gray-400 hover:border-indigo-400'
            }`}>
            {q}
          </button>
        ))}
      </div>
      <p className={`text-xs mt-1 ${labels[value].color}`}>{labels[value].label}</p>
    </div>
  )
}

function EnergyPicker({ value, onChange }: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Energie au reveil</label>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(q => (
          <button key={q} type="button" onClick={() => onChange(q)}
            className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
              value === q ? 'bg-emerald-600 text-white border-emerald-600' : 'border-white/10 text-gray-400 hover:border-emerald-400'
            }`}>
            {q}
          </button>
        ))}
      </div>
      <p className="text-xs mt-1 text-emerald-500">{ENERGY_LABELS[value]}</p>
    </div>
  )
}
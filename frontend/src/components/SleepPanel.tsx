import { useMemo, useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Moon, Star, Trash2, Edit2, X, Clock, TrendingUp, Bed,
  Sunrise, Coffee, Smartphone, Dumbbell, ChevronLeft, ChevronRight,
  Utensils, Volume2, ThermometerSun, Brain, Waves, Sparkles,
  CheckCircle2, Zap, BarChart3, Calendar, Leaf,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

// ─── Types ──────────────────────────────────────────────────────────────────

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
  score?: number
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

// ─── Constants ───────────────────────────────────────────────────────────────

const TARGET_MINUTES = 8 * 60

const QUALITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Tres mauvais', color: 'text-red-500', bg: 'bg-red-500' },
  2: { label: 'Mauvais', color: 'text-orange-500', bg: 'bg-orange-500' },
  3: { label: 'Correct', color: 'text-yellow-500', bg: 'bg-yellow-500' },
  4: { label: 'Bon', color: 'text-blue-500', bg: 'bg-blue-500' },
  5: { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500' },
}

const ENERGY_EMOJIS = [
  { value: 1, emoji: '😵', label: 'Épuisé', color: 'text-red-400', ring: 'ring-red-500' },
  { value: 2, emoji: '😪', label: 'Fatigué', color: 'text-orange-400', ring: 'ring-orange-500' },
  { value: 3, emoji: '😐', label: 'Correct', color: 'text-yellow-400', ring: 'ring-yellow-500' },
  { value: 4, emoji: '😊', label: 'Reposé', color: 'text-blue-400', ring: 'ring-blue-500' },
  { value: 5, emoji: '⚡', label: 'En forme', color: 'text-emerald-400', ring: 'ring-emerald-500' },
]

const FACTORS = [
  { id: 'CAFFEINE', label: 'Caféine', icon: Coffee },
  { id: 'SCREEN', label: 'Écran tard', icon: Smartphone },
  { id: 'STRESS', label: 'Stress', icon: Brain },
  { id: 'LATE_WORKOUT', label: 'Sport tard', icon: Dumbbell },
  { id: 'HEAVY_MEAL', label: 'Repas lourd', icon: Utensils },
  { id: 'NOISE', label: 'Bruit', icon: Volume2 },
  { id: 'TEMPERATURE', label: 'Température', icon: ThermometerSun },
  { id: 'NAP', label: 'Sieste', icon: Waves },
]

// ─── Utilities ───────────────────────────────────────────────────────────────

function todayLocalISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function yesterdayLocalISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function offsetDays(base: string, delta: number): string {
  const d = new Date(base + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  const today = todayLocalISO()
  const yesterday = yesterdayLocalISO()
  if (iso === today) return "Aujourd'hui"
  if (iso === yesterday) return 'Hier soir'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`
}

function formatTime(iso: string): string {
  return iso.substring(11, 16)
}

function toLocalDateTimeISO(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`
}

function calculatedDuration(form: FormState): number | null {
  const bed = new Date(toLocalDateTimeISO(form.bedDate, form.bedTime))
  const wake = new Date(toLocalDateTimeISO(form.wakeDate, form.wakeTime))
  const mins = Math.round((wake.getTime() - bed.getTime()) / 60000)
  return mins > 0 ? mins : null
}

function defaultForm(baseDate?: string): FormState {
  const wakeDate = baseDate ?? todayLocalISO()
  const bedDate = offsetDays(wakeDate, -1)
  return { bedDate, bedTime: '23:00', wakeDate, wakeTime: '07:00', quality: 3, energy: 3, wakeUps: 0, factors: [], notes: '' }
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

function factorLabel(id: string) {
  return FACTORS.find(f => f.id === id)?.label ?? id
}

// ─── Live score (mirrors backend SleepScoreService formula) ──────────────────

function computeLiveScore(form: FormState): number | null {
  const duration = calculatedDuration(form)
  if (!duration || duration <= 0) return null
  const h = duration / 60
  let durScore: number
  if (h >= 7 && h <= 9) durScore = 100
  else if (h > 9) durScore = 88
  else if (h >= 6) durScore = 75
  else if (h >= 5) durScore = 55
  else durScore = 30
  const qualScore = form.quality * 20
  const energyScore = form.energy * 20
  const wakeScore = Math.max(0, 100 - form.wakeUps * 15)
  return Math.round(0.50 * durScore + 0.30 * qualScore + 0.15 * energyScore + 0.05 * wakeScore)
}

function scoreBand(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500' }
  if (score >= 70) return { label: 'Bon', color: 'text-blue-400', bg: 'bg-blue-500' }
  if (score >= 55) return { label: 'Correct', color: 'text-yellow-400', bg: 'bg-yellow-500' }
  if (score >= 35) return { label: 'Faible', color: 'text-orange-400', bg: 'bg-orange-500' }
  return { label: 'Mauvais', color: 'text-red-400', bg: 'bg-red-500' }
}

// ─── Timeline visualization (20:00 → 12:00 = 28h window) ────────────────────

const TIMELINE_RANGE = 28 * 60 // 1680 minutes
const TIMELINE_MARKERS = [
  { offset: 0, label: '20h' },
  { offset: 4 * 60, label: '0h' },
  { offset: 8 * 60, label: '4h' },
  { offset: 12 * 60, label: '8h' },
  { offset: 16 * 60, label: '12h' },
]

function timeStringToOffset(timeStr: string, isNextDay: boolean): number {
  const [h, m] = timeStr.split(':').map(Number)
  const totalMins = h * 60 + m
  if (isNextDay || totalMins < 20 * 60) {
    return totalMins + (24 * 60) - (20 * 60)
  }
  return totalMins - 20 * 60
}

function SleepTimeline({ form }: { form: FormState }) {
  const bedOffset = timeStringToOffset(form.bedTime, false)
  const wakeOffset = timeStringToOffset(form.wakeTime, true)

  const bedPct = Math.max(0, Math.min(100, (bedOffset / TIMELINE_RANGE) * 100))
  const wakePct = Math.max(0, Math.min(100, (wakeOffset / TIMELINE_RANGE) * 100))
  const duration = calculatedDuration(form)
  const cycles = duration ? Math.floor(duration / 90) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span className="font-medium text-white">Fenêtre de sommeil</span>
        {duration && duration > 0 && (
          <span className="text-indigo-300 font-semibold">
            {formatDuration(duration)}
            {cycles > 0 && <span className="text-gray-400 font-normal ml-1">· {cycles} cycle{cycles > 1 ? 's' : ''}</span>}
          </span>
        )}
      </div>

      {/* Timeline bar */}
      <div className="relative h-10 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]">
        {/* Background gradient (night feel) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-indigo-950/60 to-slate-800/50" />

        {/* Sleep window highlight */}
        {duration && duration > 0 && bedPct < wakePct && (
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-indigo-600/70 to-indigo-500/50 rounded-xl transition-all duration-200"
            style={{ left: `${bedPct}%`, width: `${wakePct - bedPct}%` }}
          />
        )}

        {/* Midnight marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/20"
          style={{ left: `${(4 * 60 / TIMELINE_RANGE) * 100}%` }}
        />

        {/* Bedtime handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 transition-all duration-200"
          style={{ left: `calc(${bedPct}% - 14px)` }}
        >
          <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-400 shadow-lg shadow-indigo-900/50 flex items-center justify-center">
            <Moon size={12} className="text-indigo-600" />
          </div>
        </div>

        {/* Wake handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 transition-all duration-200"
          style={{ left: `calc(${wakePct}% - 14px)` }}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-400 border-2 border-white shadow-lg shadow-indigo-900/50 flex items-center justify-center">
            <Sunrise size={12} className="text-white" />
          </div>
        </div>
      </div>

      {/* Hour markers */}
      <div className="flex justify-between px-1">
        {TIMELINE_MARKERS.map(({ label, offset }) => (
          <span key={offset} className="text-[10px] text-gray-500">{label}</span>
        ))}
      </div>

      {/* Optimal wake suggestions */}
      {duration && duration > 0 && cycles >= 4 && (
        <p className="text-[11px] text-emerald-400/80 text-center">
          ✓ {cycles} cycles complets — réveil optimal
        </p>
      )}
      {duration && duration > 0 && cycles < 4 && (
        <p className="text-[11px] text-amber-400/80 text-center">
          Objectif : {formatDuration(TARGET_MINUTES)} (5 cycles de 90 min)
        </p>
      )}
    </div>
  )
}

// ─── Emoji energy picker ──────────────────────────────────────────────────────

function EmojiPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const selected = ENERGY_EMOJIS.find(e => e.value === value)
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">Comment te sens-tu ce matin ?</label>
      <div className="flex gap-2 justify-between">
        {ENERGY_EMOJIS.map(e => (
          <button
            key={e.value}
            type="button"
            onClick={() => onChange(e.value)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-150 ${
              value === e.value
                ? `border-current ${e.color} bg-white/[0.07] scale-105 shadow-lg`
                : 'border-white/10 text-gray-500 hover:border-white/20 hover:scale-102'
            }`}
          >
            <span className="text-2xl leading-none">{e.emoji}</span>
            <span className="text-[10px] font-medium leading-none">{e.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <p className={`text-xs text-center font-medium ${selected.color}`}>
          {selected.emoji} {selected.label}
        </p>
      )}
    </div>
  )
}

// ─── Live score display ───────────────────────────────────────────────────────

function LiveScore({ score }: { score: number | null }) {
  if (score === null) return null
  const band = scoreBand(score)
  const pct = score

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">Score estimé</span>
        <span className={`text-2xl font-black ${band.color}`}>{score}<span className="text-sm font-normal text-gray-400">/100</span></span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${band.bg} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-semibold mt-2 ${band.color}`}>{band.label}</p>
    </div>
  )
}

// ─── Insights & plan ─────────────────────────────────────────────────────────

function buildInsights(logs: SleepLog[]) {
  const last7 = logs.slice(0, 7)
  if (last7.length === 0) return ['Enregistrez votre première nuit pour obtenir des tendances.']

  const insights: string[] = []
  const avgDuration = Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length)
  const variance = bedtimeVariance(last7)
  const shortNights = last7.filter(l => l.durationMinutes < 7 * 60).length
  const best = [...last7].sort((a, b) => b.quality - a.quality || b.durationMinutes - a.durationMinutes)[0]

  if (avgDuration < 7 * 60)
    insights.push(`Moyenne 7 jours : ${formatDuration(avgDuration)}. Gagnez 30 min cette semaine.`)
  else if (avgDuration >= TARGET_MINUTES)
    insights.push(`Moyenne solide de ${formatDuration(avgDuration)} sur les dernières nuits.`)
  else
    insights.push(`Proche de l'objectif : ${formatDuration(avgDuration)}, cible ${formatDuration(TARGET_MINUTES)}.`)

  if (variance >= 120)
    insights.push(`Coucher variable de ${formatDuration(variance)}. La régularité améliore la récupération.`)
  else if (last7.length >= 3)
    insights.push('Rythme de coucher stable — gardez cette base.')

  if (shortNights >= 3)
    insights.push(`${shortNights} nuits sous 7h cette semaine. Couchez-vous plus tôt.`)

  if (best)
    insights.push(`Meilleure nuit : ${formatDateShort(best.sleepDate)}, ${formatDuration(best.durationMinutes)}, qualité ${best.quality}/5.`)

  return insights.slice(0, 4)
}

function tonightPlan(logs: SleepLog[]) {
  const last7 = logs.slice(0, 7)
  const variance = bedtimeVariance(last7)
  const avgDuration = last7.length ? Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length) : 0
  const last = logs[0]

  if (!last) return 'Enregistrez la dernière nuit, SmartLife proposera une action pour ce soir.'
  if (avgDuration && avgDuration < 7 * 60) return 'Ce soir : visez 30 minutes en plus. Commencez la routine avant 23h.'
  if (variance >= 120) return 'Ce soir : stabilisez le coucher autour de 23h30.'
  if ((last.factors ?? []).includes('SCREEN')) return 'Ce soir : coupez les écrans 45 min avant le coucher.'
  if ((last.factors ?? []).includes('CAFFEINE')) return 'Ce soir : évitez la caféine après 16h.'
  if (last.wakeUps >= 2) return 'Ce soir : notez lumière, bruit et température si vous vous réveillez.'
  return 'Ce soir : gardez le même rythme et visez une nuit complète autour de 8h.'
}

// ─── Planifier helpers ────────────────────────────────────────────────────────

interface EnvStep { id: string; label: string; minutesBefore: number; enabled: boolean }

const DEFAULT_ENV_STEPS: EnvStep[] = [
  { id: 'caffeine', label: 'Dernière caféine', minutesBefore: 360, enabled: true },
  { id: 'meal', label: 'Dernier repas lourd', minutesBefore: 180, enabled: true },
  { id: 'screens', label: 'Écrans éteints', minutesBefore: 60, enabled: true },
  { id: 'room', label: 'Chambre préparée', minutesBefore: 30, enabled: true },
  { id: 'relax', label: 'Relaxation / lecture', minutesBefore: 10, enabled: true },
]

function getCycleOptions(wakeTime: string): { time: string; cycles: number; duration: string }[] {
  if (!wakeTime || !wakeTime.includes(':')) return []
  const [h, m] = wakeTime.split(':').map(Number)
  const wakeMins = h * 60 + m
  return [4.5, 5, 5.5, 6].map(cycles => {
    const sleepMins = wakeMins - cycles * 90 - 15
    const norm = ((sleepMins % 1440) + 1440) % 1440
    const hh = Math.floor(norm / 60)
    const mm = norm % 60
    return {
      time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
      cycles: Math.round(cycles),
      duration: `${cycles * 1.5}h`,
    }
  })
}

function subtractMinutes(baseTime: string, minutes: number): string {
  if (!baseTime || !baseTime.includes(':')) return '--'
  const [h, m] = baseTime.split(':').map(Number)
  const total = ((h * 60 + m - minutes) % 1440 + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'nuit' | 'historique' | 'planifier' | 'environnement'

export default function SleepPanel() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('nuit')
  const [selectedDate, setSelectedDate] = useState(yesterdayLocalISO())
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [form, setForm] = useState<FormState>(() => defaultForm())
  const [planForm, setPlanForm] = useState({ targetBedtime: '23:00', targetWakeTime: '07:00', notes: '' })
  const [envBedtime, setEnvBedtime] = useState('23:00')
  const [envSteps, setEnvSteps] = useState<EnvStep[]>(DEFAULT_ENV_STEPS)
  const [aiResult, setAiResult] = useState<any>(null)

  const { data: logs = [], isLoading } = useQuery<SleepLog[]>({
    queryKey: ['sleep-logs'],
    queryFn: () => api.get('/sleep-logs').then(r => r.data),
  })

  // Upsert via new endpoint; fallback to POST for compatibility
  const upsertMutation = useMutation({
    mutationFn: (payload: { date: string; body: object }) =>
      api.put(`/sleep-logs/nights/${payload.date}`, payload.body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep-logs'] })
      qc.invalidateQueries({ queryKey: ['day-score'] })
      toast.success('Nuit enregistrée ✓')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error
      if (msg === 'WAKE_BEFORE_BED') toast.error("L'heure de réveil doit être après le coucher")
      else toast.error("Erreur lors de l'enregistrement")
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; body: object }) =>
      api.put(`/sleep-logs/${payload.id}`, payload.body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep-logs'] })
      qc.invalidateQueries({ queryKey: ['day-score'] })
      toast.success('Nuit modifiée')
      setShowEditModal(false)
      setEditingLog(null)
    },
    onError: () => toast.error("Erreur lors de la modification"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sleep-logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep-logs'] })
      qc.invalidateQueries({ queryKey: ['day-score'] })
      toast.success('Nuit supprimée')
    },
  })

  // Sleep plan queries
  const { data: sleepPlanData } = useQuery({
    queryKey: ['sleep-plan', selectedDate],
    queryFn: () => api.get(`/sleep/plans/${selectedDate}`).then(r => r.data).catch(() => null),
    enabled: activeTab === 'planifier',
  })

  const { data: envPlanData } = useQuery({
    queryKey: ['sleep-env-plan'],
    queryFn: () => api.get('/sleep/environment-plan').then(r => r.data),
    enabled: activeTab === 'environnement',
  })

  useEffect(() => {
    if (!envPlanData) return
    if (envPlanData.targetBedtime) setEnvBedtime(envPlanData.targetBedtime.substring(0, 5))
    if (envPlanData.steps) {
      try { setEnvSteps(JSON.parse(envPlanData.steps)) } catch { /* keep defaults */ }
    }
  }, [envPlanData])

  const planMutation = useMutation({
    mutationFn: (payload: { date: string; body: object }) =>
      api.put(`/sleep/plans/${payload.date}`, payload.body).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sleep-plan'] }); toast.success('Plan enregistré ✓') },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  })

  const envMutation = useMutation({
    mutationFn: (body: object) => api.put('/sleep/environment-plan', body).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sleep-env-plan'] }); toast.success('Programme enregistré ✓') },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  })

  const { data: aiStatus } = useQuery({
    queryKey: ['sleep-ai-status'],
    queryFn: () => api.get('/sleep/ai/status').then(r => r.data),
  })

  const aiMutation = useMutation({
    mutationFn: (analysisType: string) =>
      api.post('/sleep/ai/analyze', { analysisType }).then(r => r.data),
    onSuccess: (data) => {
      setAiResult(data)
      qc.invalidateQueries({ queryKey: ['sleep-ai-status'] })
      toast.success('Analyse terminée ✓')
    },
    onError: (err: any) => {
      if (err?.response?.data?.error === 'SLEEP_AI_QUOTA_EXCEEDED') {
        toast.error('Quota d\'analyses épuisé')
      } else {
        toast.error('Erreur lors de l\'analyse')
      }
    },
  })

  const selectedLog = useMemo(() => logs.find(l => l.sleepDate === selectedDate) ?? null, [logs, selectedDate])
  const last7 = useMemo(() => logs.slice(0, 7), [logs])
  const lastNight = logs[0] ?? null
  const avgDuration = last7.length ? Math.round(last7.reduce((s, l) => s + l.durationMinutes, 0) / last7.length) : null
  const avgQuality = last7.length ? Math.round((last7.reduce((s, l) => s + l.quality, 0) / last7.length) * 10) / 10 : null
  const insights = useMemo(() => buildInsights(logs), [logs])
  const plan = useMemo(() => tonightPlan(logs), [logs])

  const liveScore = useMemo(() => computeLiveScore(form), [form])

  const navigateDate = useCallback((delta: number) => {
    setSelectedDate(prev => {
      const next = offsetDays(prev, delta)
      if (next > todayLocalISO()) return prev
      return next
    })
  }, [])

  // When date changes, reset form for that date
  function handleUpsert() {
    upsertMutation.mutate({
      date: selectedDate,
      body: {
        bedtime: toLocalDateTimeISO(form.bedDate, form.bedTime),
        wakeTime: toLocalDateTimeISO(form.wakeDate, form.wakeTime),
        quality: form.quality,
        energy: form.energy,
        wakeUps: form.wakeUps,
        factors: form.factors,
        notes: form.notes.trim() || null,
      },
    })
  }

  function openEdit(log: SleepLog) {
    setEditingLog(log)
    setForm(logToForm(log))
    setShowEditModal(true)
  }

  const tabs: { id: Tab; label: string; icon: typeof Moon }[] = [
    { id: 'nuit', label: 'Hier soir', icon: Moon },
    { id: 'historique', label: 'Historique', icon: BarChart3 },
    { id: 'planifier', label: 'Planifier', icon: Calendar },
    { id: 'environnement', label: 'Environnement', icon: Leaf },
  ]

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Moon size={23} className="text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Sleep Coach</h1>
          <p className="text-sm text-gray-400">Durée, régularité, énergie et facteurs</p>
        </div>
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-base font-bold text-white capitalize">{formatDateLabel(selectedDate)}</p>
          <p className="text-xs text-gray-400">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => navigateDate(1)}
          disabled={selectedDate >= yesterdayLocalISO()}
          className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-2xl p-1 border border-white/[0.06]">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── TAB: Nuit ─────────────────────────────────────────────────────── */}
      {activeTab === 'nuit' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Existing log badge */}
              {selectedLog && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span className="text-sm text-emerald-300 font-medium">Nuit enregistrée</span>
                    <span className="text-xs text-emerald-400/70">{formatTime(selectedLog.bedtime)} → {formatTime(selectedLog.wakeTime)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(selectedLog)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteMutation.mutate(selectedLog.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick log form */}
              <div className="glass-card border-white/10 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-white">
                    {selectedLog ? 'Modifier la nuit' : 'Enregistrer la nuit'}
                  </h2>
                  {liveScore !== null && <LiveScorePill score={liveScore} />}
                </div>

                {/* Timeline visual */}
                <SleepTimeline form={form} />

                {/* Time inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      <Moon size={11} className="inline mr-1 text-indigo-400" />
                      Coucher
                    </label>
                    <div className="flex gap-1.5">
                      <input type="date" value={form.bedDate}
                        onChange={e => setForm(f => ({ ...f, bedDate: e.target.value }))}
                        className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <input type="time" value={form.bedTime}
                        onChange={e => setForm(f => ({ ...f, bedTime: e.target.value }))}
                        className="w-20 rounded-xl border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      <Sunrise size={11} className="inline mr-1 text-amber-400" />
                      Réveil
                    </label>
                    <div className="flex gap-1.5">
                      <input type="date" value={form.wakeDate}
                        onChange={e => setForm(f => ({ ...f, wakeDate: e.target.value }))}
                        className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <input type="time" value={form.wakeTime}
                        onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))}
                        className="w-20 rounded-xl border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Emoji picker */}
                <EmojiPicker value={form.energy} onChange={energy => setForm(f => ({ ...f, energy }))} />

                {/* Live score */}
                <LiveScore score={liveScore} />

                {/* Collapsible details */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDetails(d => !d)}
                    className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-white py-1 transition-colors"
                  >
                    <span>Détails optionnels</span>
                    <ChevronRight size={14} className={`transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  </button>

                  {showDetails && (
                    <div className="space-y-4 mt-3 pt-3 border-t border-white/[0.06]">
                      {/* Quality */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Qualité du sommeil</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(q => (
                            <button key={q} type="button" onClick={() => setForm(f => ({ ...f, quality: q }))}
                              className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                                form.quality === q ? 'bg-indigo-600 text-white border-indigo-600' : 'border-white/10 text-gray-400'
                              }`}>
                              {q}
                            </button>
                          ))}
                        </div>
                        <p className={`text-xs mt-1 ${QUALITY_LABELS[form.quality].color}`}>{QUALITY_LABELS[form.quality].label}</p>
                      </div>

                      {/* Wake-ups */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Réveils nocturnes</label>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4].map(n => (
                            <button key={n} type="button" onClick={() => setForm(f => ({ ...f, wakeUps: n }))}
                              className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                                form.wakeUps === n ? 'bg-indigo-600 text-white border-indigo-600' : 'border-white/10 text-gray-400'
                              }`}>
                              {n === 4 ? '4+' : n}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Factors */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Facteurs perturbateurs</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {FACTORS.map(factor => {
                            const Icon = factor.icon
                            const active = form.factors.includes(factor.id)
                            return (
                              <button key={factor.id} type="button"
                                onClick={() => setForm(f => ({
                                  ...f,
                                  factors: f.factors.includes(factor.id)
                                    ? f.factors.filter(x => x !== factor.id)
                                    : [...f.factors, factor.id],
                                }))}
                                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors ${
                                  active ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' : 'border-white/10 text-gray-400 hover:border-indigo-400'
                                }`}>
                                <Icon size={12} />
                                {factor.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Note libre</label>
                        <textarea value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Ex: réveil à 4h, stress, chambre chaude..."
                          rows={2}
                          className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={handleUpsert}
                  disabled={upsertMutation.isPending || !calculatedDuration(form)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-900/30"
                >
                  {upsertMutation.isPending ? 'Enregistrement...' : selectedLog ? '✓ Mettre à jour la nuit' : '✓ Enregistrer la nuit'}
                </button>
              </div>

              {/* Tonight plan */}
              <div className="glass-card p-4 border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={15} className="text-indigo-400" />
                  <h2 className="text-sm font-black text-white">Plan pour ce soir</h2>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{plan}</p>
              </div>

              {/* AI Coach */}
              <SleepAiCoach
                status={aiStatus}
                result={aiResult}
                loading={aiMutation.isPending}
                onAnalyze={type => aiMutation.mutate(type)}
                onClear={() => setAiResult(null)}
              />
            </>
          )}
        </div>
      )}

      {/* ── TAB: Historique ───────────────────────────────────────────────── */}
      {activeTab === 'historique' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Moon size={32} className="mx-auto mb-3 text-indigo-500/40" />
              <p className="text-sm">Aucune nuit enregistrée</p>
            </div>
          ) : (
            <>
              {/* Metric cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard icon={Sparkles} label="Score dernière nuit" value={lastNight ? `${lastNight.score ?? '--'}/100` : '--'} hint="Calculé par l'IA" tone="indigo" />
                <MetricCard icon={Bed} label="Dernière nuit" value={lastNight ? formatDuration(lastNight.durationMinutes) : '--'} hint={lastNight ? `${formatTime(lastNight.bedtime)} → ${formatTime(lastNight.wakeTime)}` : 'Aucune'} tone="blue" />
                <MetricCard icon={Clock} label="Moyenne 7 jours" value={avgDuration ? formatDuration(avgDuration) : '--'} hint={`Cible ${formatDuration(TARGET_MINUTES)}`} tone="emerald" />
                <MetricCard icon={Star} label="Qualité moyenne" value={avgQuality ? `${avgQuality}/5` : '--'} hint="7 dernières nuits" tone="amber" />
              </div>

              {/* Chart + insights */}
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <WeeklyChart logs={last7} />
                <div className="glass-card p-4 border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={15} className="text-indigo-400" />
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

              {/* History table */}
              <div className="glass-card border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-white">Toutes les nuits</h2>
                    <p className="text-xs text-gray-400">Durée, qualité, énergie et facteurs</p>
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
        </div>
      )}

      {/* ── TAB: Planifier ────────────────────────────────────────────────── */}
      {activeTab === 'planifier' && (
        <div className="space-y-4">
          {/* Existing plan badge */}
          {sleepPlanData && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <CheckCircle2 size={14} className="text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Plan existant</span>
              <span className="text-xs text-indigo-400/70">
                {sleepPlanData.targetBedtime?.substring(0,5)} → {sleepPlanData.targetWakeTime?.substring(0,5)}
              </span>
            </div>
          )}

          {/* Plan form */}
          <div className="glass-card border-white/10 p-5 space-y-5">
            <h2 className="text-sm font-black text-white">
              Planifier la nuit du {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  <Moon size={11} className="inline mr-1 text-indigo-400" />Coucher cible
                </label>
                <input type="time" value={planForm.targetBedtime}
                  onChange={e => setPlanForm(f => ({ ...f, targetBedtime: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  <Sunrise size={11} className="inline mr-1 text-amber-400" />Réveil cible
                </label>
                <input type="time" value={planForm.targetWakeTime}
                  onChange={e => setPlanForm(f => ({ ...f, targetWakeTime: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Cycle optimizer */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">
                Heures de coucher optimales pour {planForm.targetWakeTime}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {getCycleOptions(planForm.targetWakeTime).map(opt => (
                  <button key={opt.time} type="button"
                    onClick={() => setPlanForm(f => ({ ...f, targetBedtime: opt.time }))}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-colors ${
                      planForm.targetBedtime === opt.time
                        ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                        : 'border-white/10 text-gray-400 hover:border-indigo-400'
                    }`}>
                    <span className="font-bold">{opt.time}</span>
                    <span>{opt.cycles} cycles · {opt.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Note (optionnel)</label>
              <input type="text" value={planForm.notes}
                onChange={e => setPlanForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: réunion tôt demain..."
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <button onClick={() => planMutation.mutate({ date: selectedDate, body: { targetBedtime: planForm.targetBedtime, targetWakeTime: planForm.targetWakeTime, notes: planForm.notes || null } })}
              disabled={planMutation.isPending}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {planMutation.isPending ? 'Enregistrement...' : '✓ Enregistrer le plan'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Environnement ────────────────────────────────────────────── */}
      {activeTab === 'environnement' && (
        <div className="space-y-4">
          <div className="glass-card border-white/10 p-5 space-y-5">
            <div>
              <h2 className="text-sm font-black text-white mb-1">Programme du soir</h2>
              <p className="text-xs text-gray-400">Routine personnalisée basée sur votre heure de coucher cible.</p>
            </div>

            {/* Target bedtime */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                <Moon size={11} className="inline mr-1 text-indigo-400" />Coucher cible ce soir
              </label>
              <input type="time" value={envBedtime}
                onChange={e => setEnvBedtime(e.target.value)}
                className="w-40 rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400">Étapes de routine</p>
              {envSteps.map((step, idx) => {
                const stepTime = envBedtime ? subtractMinutes(envBedtime, step.minutesBefore) : '--'
                return (
                  <div key={step.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                      step.enabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.06] bg-white/[0.02]'
                    }`}>
                    <div className="flex items-center gap-3">
                      <button type="button"
                        onClick={() => setEnvSteps(s => s.map((st, i) => i === idx ? { ...st, enabled: !st.enabled } : st))}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          step.enabled ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'
                        }`}>
                        {step.enabled && <span className="text-white text-[10px]">✓</span>}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${step.enabled ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                        <p className="text-[11px] text-gray-500">−{step.minutesBefore < 60 ? `${step.minutesBefore} min` : `${step.minutesBefore / 60}h`} avant le coucher</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${step.enabled ? 'text-emerald-400' : 'text-gray-600'}`}>
                      {stepTime}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Insight from last 7 nights */}
            {last7.length >= 3 && (() => {
              const screenNights = last7.filter(l => (l.factors ?? []).includes('SCREEN'))
              const screenAvg = screenNights.length > 0
                ? Math.round(screenNights.reduce((s, l) => s + l.durationMinutes, 0) / screenNights.length)
                : null
              const noScreenNights = last7.filter(l => !(l.factors ?? []).includes('SCREEN'))
              const noScreenAvg = noScreenNights.length > 0
                ? Math.round(noScreenNights.reduce((s, l) => s + l.durationMinutes, 0) / noScreenNights.length)
                : null
              if (screenAvg && noScreenAvg && noScreenAvg > screenAvg) {
                const diff = noScreenAvg - screenAvg
                return (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                    <p className="text-xs text-amber-300">
                      💡 Sans écran le soir, tu dors en moyenne <span className="font-bold">{formatDuration(diff)} de plus</span> sur tes 7 dernières nuits.
                    </p>
                  </div>
                )
              }
              return null
            })()}

            <button
              onClick={() => envMutation.mutate({ targetBedtime: envBedtime || null, steps: JSON.stringify(envSteps) })}
              disabled={envMutation.isPending}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {envMutation.isPending ? 'Enregistrement...' : '✓ Enregistrer le programme'}
            </button>
          </div>
        </div>
      )}

      {/* Edit modal (for history edits) */}
      {showEditModal && editingLog && (
        <EditModal
          form={form}
          saving={updateMutation.isPending}
          onClose={() => { setShowEditModal(false); setEditingLog(null) }}
          onChange={setForm}
          onSave={() => updateMutation.mutate({
            id: editingLog.id,
            body: {
              bedtime: toLocalDateTimeISO(form.bedDate, form.bedTime),
              wakeTime: toLocalDateTimeISO(form.wakeDate, form.wakeTime),
              quality: form.quality,
              energy: form.energy,
              wakeUps: form.wakeUps,
              factors: form.factors,
              notes: form.notes.trim() || null,
            },
          })}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LiveScorePill({ score }: { score: number }) {
  const band = scoreBand(score)
  return (
    <span className={`text-xs font-black px-2.5 py-1 rounded-full bg-white/[0.06] ${band.color}`}>
      {score}/100 · {band.label}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone }: {
  icon: typeof Moon; label: string; value: string; hint: string
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
          <TrendingUp size={15} className="text-indigo-400" />
          <h2 className="text-sm font-black text-white">7 dernières nuits</h2>
        </div>
        <span className="text-xs text-gray-400">Cible 8h</span>
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
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {formatDateShort(log.sleepDate).split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-400">
        <span className="text-emerald-400">■ Excellent</span>
        <span className="text-blue-400">■ Bon</span>
        <span className="text-orange-400">■ À corriger</span>
      </div>
    </div>
  )
}

function SleepRow({ log, onEdit, onDelete }: {
  log: SleepLog; onEdit: (log: SleepLog) => void; onDelete: (id: number) => void
}) {
  const q = QUALITY_LABELS[log.quality]
  const factors = log.factors ?? []
  return (
    <div className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-white text-sm capitalize">{formatDateShort(log.sleepDate)}</span>
          <span className="text-xs text-gray-400">{formatTime(log.bedtime)} → {formatTime(log.wakeTime)}</span>
          <span className={`text-xs font-semibold ${q.color}`}>{q.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="font-bold text-indigo-400 text-sm">{formatDuration(log.durationMinutes)}</span>
          <span className="flex items-center gap-1"><Sunrise size={11} /> Énergie {log.energy ?? '-'}/5</span>
          <span>{log.wakeUps ?? 0} réveil{(log.wakeUps ?? 0) !== 1 ? 's' : ''}</span>
          {log.score && <span className="text-indigo-300">{log.score}/100</span>}
        </div>
        {(factors.length > 0 || log.notes) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {factors.slice(0, 4).map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">
                {factorLabel(f)}
              </span>
            ))}
            {log.notes && <span className="text-[10px] text-gray-400 truncate max-w-xs">{log.notes}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button onClick={() => onEdit(log)} className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-blue-400 transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(log.id)} className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Sleep AI Coach ───────────────────────────────────────────────────────────

const ANALYSIS_TYPES = [
  { id: 'night', label: 'Analyser la nuit', desc: 'Insights sur ta dernière nuit', cost: 1 },
  { id: 'week', label: 'Analyser 7 nuits', desc: 'Patterns de la semaine', cost: 1 },
  { id: 'program', label: 'Programme 7 jours', desc: 'Plan personnalisé', cost: 2 },
]

function SleepAiCoach({ status, result, loading, onAnalyze, onClear }: {
  status: any
  result: any
  loading: boolean
  onAnalyze: (type: string) => void
  onClear: () => void
}) {
  const remaining = status?.remaining ?? 5
  const used = status?.sleepAiUsed ?? 0
  const quota = status?.sleepAiQuota ?? 5
  const isExhausted = remaining <= 0

  return (
    <div className="glass-card border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-400" />
          <h2 className="text-sm font-black text-white">Sleep Coach IA</h2>
        </div>
        {/* Quota dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: quota }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < used ? 'bg-indigo-900' : 'bg-indigo-400'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">{remaining}/{quota}</span>
        </div>
      </div>

      {isExhausted ? (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-5 text-center space-y-2">
          <p className="text-sm font-semibold text-white">Quota épuisé</p>
          <p className="text-xs text-gray-400">Tes 5 analyses gratuites ont été utilisées.</p>
          <p className="text-xs text-gray-500">Contacte le support pour en obtenir davantage.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {ANALYSIS_TYPES.map(type => (
            <button key={type.id}
              onClick={() => onAnalyze(type.id)}
              disabled={loading || remaining < type.cost}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left ${
                remaining < type.cost
                  ? 'border-white/[0.06] opacity-40 cursor-not-allowed'
                  : 'border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/5'
              }`}>
              <div>
                <p className="text-sm font-semibold text-white">{type.label}</p>
                <p className="text-xs text-gray-400">{type.desc}</p>
              </div>
              <span className="text-xs text-indigo-300 font-medium shrink-0 ml-3">
                {type.cost} crédit{type.cost > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Analyse en cours...</span>
        </div>
      )}

      {result && !loading && (
        <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">
              Analyse · {result.nights_analyzed} nuit{result.nights_analyzed > 1 ? 's' : ''}
            </span>
            <button onClick={onClear} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
          </div>
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {result.analysis}
          </div>
        </div>
      )}
    </div>
  )
}

function EditModal({ form, saving, onClose, onChange, onSave }: {
  form: FormState; saving: boolean
  onClose: () => void; onChange: (v: FormState | ((p: FormState) => FormState)) => void; onSave: () => void
}) {
  const duration = calculatedDuration(form)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#0f1117] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/[0.08]">
        <div className="sticky top-0 bg-[#0f1117] px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-black text-white">Modifier la nuit</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/[0.05]">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Coucher', dateKey: 'bedDate', timeKey: 'bedTime' },
              { label: 'Réveil', dateKey: 'wakeDate', timeKey: 'wakeTime' },
            ].map(({ label, dateKey, timeKey }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <div className="flex gap-1.5">
                  <input type="date" value={(form as any)[dateKey]}
                    onChange={e => onChange(f => ({ ...f, [dateKey]: e.target.value }))}
                    className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  <input type="time" value={(form as any)[timeKey]}
                    onChange={e => onChange(f => ({ ...f, [timeKey]: e.target.value }))}
                    className="w-20 rounded-xl border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
            ))}
          </div>
          {duration && (
            <div className="text-center text-sm font-bold text-indigo-300">
              {formatDuration(duration)}
            </div>
          )}
          <EmojiPicker value={form.energy} onChange={energy => onChange(f => ({ ...f, energy }))} />
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/[0.05]">
              Annuler
            </button>
            <button onClick={onSave} disabled={saving || !duration}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity, ArrowLeft, Check, ChevronDown, ChevronUp, Clock, Dumbbell,
  Flame, MessageSquareText, Play, Plus, SkipForward, Timer, Trash2, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface PlanExercise { name: string; sets: number | null; reps: number | null; weightKg: number | null; notes: string }
interface PlanDay { id: number; dayNumber: number; label: string; exercises: PlanExercise[] }
interface WorkoutPlan { id: number; name: string; goal: string; weeks: number; daysPerWeek: number; status: string; startDate: string; days: PlanDay[] }
interface PlanProgress { totalSessions: number; doneSessions: number; percent: number; weeksElapsed: number; completedDayIds: number[] }
interface WorkoutExercise { id: number; name: string; sets: number | null; reps: number | null; weightKg: number | null; durationSeconds: number | null }
interface WorkoutSession { id: number; title: string; sessionDate: string; durationMinutes: number | null; caloriesBurned: number | null; notes: string | null; exercises: WorkoutExercise[]; planDayId: number | null }
interface ExerciseForm { name: string; sets: string; reps: string; weightKg: string; durationSeconds: string }
interface SetLog { setNumber: number; weightKg: string; reps: string }
interface ExerciseProgress { exercise: PlanExercise; setLogs: SetLog[] }
type Mode = null | 'guided' | 'prompt'
type GoalType = 'MUSCLE_GAIN' | 'FAT_LOSS' | 'ENDURANCE' | 'GENERAL'
type TabType = 'sessions' | 'programs'
type WorkoutView = 'list' | 'detail' | 'session'
type WorkoutPhase = 'exercising' | 'resting' | 'done'

const SPORT_PRESETS = [
  { label: 'Muscu', emoji: '', rate: 5 },
  { label: 'Course', emoji: '', rate: 10 },
  { label: 'Vélo', emoji: '', rate: 8 },
  { label: 'Natation', emoji: '', rate: 9 },
  { label: 'Yoga', emoji: '', rate: 3 },
  { label: 'Marche', emoji: '', rate: 4 },
  { label: 'Football', emoji: '⚽', rate: 8 },
  { label: 'Tennis', emoji: '', rate: 7 },
  { label: 'Boxe', emoji: '', rate: 9 },
  { label: 'CrossFit', emoji: '️', rate: 11 },
]

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const imgUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

const GOAL_IMAGES: Record<GoalType, string> = {
  MUSCLE_GAIN: imgUrl('images/goals/muscle.jpg'),
  FAT_LOSS: imgUrl('images/goals/fat-loss.jpg'),
  ENDURANCE: imgUrl('images/goals/endurance.jpg'),
  GENERAL: imgUrl('images/goals/general.jpg'),
}

const SPORT_IMAGES: [RegExp, string][] = [
  [/muscu|gym|musculation|bench|squat|deadlift|push|pull|legs/i, imgUrl('images/sports/gym.png')],
  [/course|running|run|jogging/i, imgUrl('images/sports/running.png')],
  [/vélo|velo|cycling|bike/i, imgUrl('images/sports/cycling.png')],
  [/yoga|pilates/i, imgUrl('images/sports/yoga.png')],
  [/boxe|boxing|mma/i, imgUrl('images/sports/boxing.png')],
]

function sportImage(title: string): string | null {
  for (const [pattern, img] of SPORT_IMAGES) {
    if (pattern.test(title)) return img
  }
  return null
}

interface ExerciseGroup { name: string; sets: WorkoutExercise[] }

function groupExercises(exercises: WorkoutExercise[]): ExerciseGroup[] {
  const map = new Map<string, WorkoutExercise[]>()
  for (const ex of exercises) {
    if (!map.has(ex.name)) map.set(ex.name, [])
    map.get(ex.name)!.push(ex)
  }
  return Array.from(map.entries()).map(([name, sets]) => ({ name, sets }))
}

function isPR(sessions: WorkoutSession[], exerciseName: string, weightKg: number | null, sessionDate: string): boolean {
  if (!weightKg) return false
  const maxBefore = sessions
    .filter(s => s.sessionDate < sessionDate)
    .flatMap(s => s.exercises)
    .filter(e => e.name === exerciseName && e.weightKg !== null)
    .reduce((max, e) => Math.max(max, e.weightKg!), 0)
  return weightKg > maxBefore
}

const GOAL_LABELS: Record<GoalType, string> = {
  MUSCLE_GAIN: 'Prise de masse',
  FAT_LOSS: 'Perte de poids',
  ENDURANCE: 'Endurance',
  GENERAL: 'Général',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  PAUSED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ARCHIVED: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif', PAUSED: 'Pause', COMPLETED: 'Terminé', ARCHIVED: 'Archivé',
}

const GOAL_CONFIG: Record<GoalType, {
  label: string; emoji: string; gradient: string; accentText: string; borderLeft: string; badge: string
}> = {
  MUSCLE_GAIN: {
    label: 'Prise de masse', emoji: '🏋️',
    gradient: 'from-amber-500/10 to-orange-500/5',
    accentText: 'text-amber-600 dark:text-amber-400',
    borderLeft: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  FAT_LOSS: {
    label: 'Perte de poids', emoji: '🔥',
    gradient: 'from-red-500/10 to-rose-500/5',
    accentText: 'text-red-600 dark:text-red-400',
    borderLeft: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  ENDURANCE: {
    label: 'Endurance', emoji: '🏃',
    gradient: 'from-green-500/10 to-emerald-500/5',
    accentText: 'text-green-600 dark:text-green-400',
    borderLeft: 'border-l-green-500',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  GENERAL: {
    label: 'Général', emoji: '⚡',
    gradient: 'from-blue-500/10 to-indigo-500/5',
    accentText: 'text-blue-600 dark:text-blue-400',
    borderLeft: 'border-l-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
}

function goalAccentBtn(goal: string) {
  if (goal === 'FAT_LOSS') return 'bg-red-500 hover:bg-red-600'
  if (goal === 'ENDURANCE') return 'bg-green-500 hover:bg-green-600'
  if (goal === 'GENERAL') return 'bg-blue-500 hover:bg-blue-600'
  return 'bg-amber-500 hover:bg-amber-600'
}

function goalProgressBar(goal: string) {
  if (goal === 'FAT_LOSS') return 'bg-red-500'
  if (goal === 'ENDURANCE') return 'bg-green-500'
  if (goal === 'GENERAL') return 'bg-blue-500'
  return 'bg-amber-500'
}

function goalTodayBg(goal: string) {
  if (goal === 'FAT_LOSS') return 'bg-red-50 dark:bg-red-900/20'
  if (goal === 'ENDURANCE') return 'bg-green-50 dark:bg-green-900/20'
  if (goal === 'GENERAL') return 'bg-blue-50 dark:bg-blue-900/20'
  return 'bg-amber-50 dark:bg-amber-900/20'
}

function goalTodayBorder(goal: string) {
  if (goal === 'FAT_LOSS') return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
  if (goal === 'ENDURANCE') return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
  if (goal === 'GENERAL') return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
  return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
}

function goalDayBorder(goal: string) {
  if (goal === 'FAT_LOSS') return 'border-red-300 dark:border-red-700'
  if (goal === 'ENDURANCE') return 'border-green-300 dark:border-green-700'
  if (goal === 'GENERAL') return 'border-blue-300 dark:border-blue-700'
  return 'border-amber-300 dark:border-amber-700'
}

const EXERCISE_LIBRARY: Record<string, PlanExercise[]> = {
  Push: [
    { name: 'Développé couché', sets: 4, reps: 10, weightKg: 60, notes: '' },
    { name: 'Développé militaire', sets: 4, reps: 8, weightKg: 40, notes: '' },
    { name: 'Développé incliné', sets: 3, reps: 10, weightKg: 50, notes: '' },
    { name: 'Écarté haltères', sets: 3, reps: 12, weightKg: 15, notes: '' },
    { name: 'Dips', sets: 3, reps: 10, weightKg: null, notes: '' },
    { name: 'Triceps poulie', sets: 3, reps: 12, weightKg: 25, notes: '' },
    { name: 'Extension triceps', sets: 3, reps: 12, weightKg: 20, notes: '' },
  ],
  Pull: [
    { name: 'Tractions', sets: 4, reps: 8, weightKg: null, notes: '' },
    { name: 'Rowing barre', sets: 4, reps: 10, weightKg: 60, notes: '' },
    { name: 'Rowing haltère', sets: 3, reps: 12, weightKg: 25, notes: '' },
    { name: 'Tirage vertical', sets: 4, reps: 10, weightKg: 55, notes: '' },
    { name: 'Face pull', sets: 3, reps: 15, weightKg: 20, notes: '' },
    { name: 'Curl biceps barre', sets: 3, reps: 12, weightKg: 30, notes: '' },
    { name: 'Curl haltères', sets: 3, reps: 12, weightKg: 12, notes: '' },
    { name: 'Curl marteau', sets: 3, reps: 12, weightKg: 14, notes: '' },
  ],
  Legs: [
    { name: 'Squat', sets: 4, reps: 8, weightKg: 80, notes: '' },
    { name: 'Leg press', sets: 4, reps: 10, weightKg: 120, notes: '' },
    { name: 'Fentes haltères', sets: 3, reps: 12, weightKg: 20, notes: '' },
    { name: 'Soulevé de terre', sets: 4, reps: 6, weightKg: 100, notes: '' },
    { name: 'Leg curl', sets: 3, reps: 12, weightKg: 40, notes: '' },
    { name: 'Leg extension', sets: 3, reps: 12, weightKg: 40, notes: '' },
    { name: 'Mollets debout', sets: 4, reps: 15, weightKg: 60, notes: '' },
    { name: 'Hip thrust', sets: 4, reps: 10, weightKg: 80, notes: '' },
  ],
  'Full Body': [
    { name: 'Deadlift', sets: 4, reps: 5, weightKg: 100, notes: '' },
    { name: 'Squat', sets: 3, reps: 8, weightKg: 70, notes: '' },
    { name: 'Développé couché', sets: 3, reps: 8, weightKg: 60, notes: '' },
    { name: 'Tractions', sets: 3, reps: 8, weightKg: null, notes: '' },
    { name: 'Pompes', sets: 3, reps: 15, weightKg: null, notes: '' },
    { name: 'Gainage', sets: 3, reps: null, weightKg: null, notes: '60 secondes' },
  ],
  Cardio: [
    { name: 'Course à pied', sets: null, reps: null, weightKg: null, notes: '30 min' },
    { name: 'Vélo stationnaire', sets: null, reps: null, weightKg: null, notes: '45 min' },
    { name: 'Corde à sauter', sets: 5, reps: null, weightKg: null, notes: '2 min/série' },
    { name: 'Rameur', sets: null, reps: null, weightKg: null, notes: '20 min' },
    { name: 'HIIT 20-40', sets: 8, reps: null, weightKg: null, notes: '20s effort / 40s repos' },
  ],
}

const SPORT_BADGE_MAP: [RegExp, string][] = [
  [/muscu|gym|musculation|bench|squat|deadlift/i, '🏋️'],
  [/course|running|run|jogging/i, '🏃'],
  [/vélo|velo|cycling|bike/i, '🚴'],
  [/natation|swimming|swim|piscine/i, '🏊'],
  [/yoga|pilates/i, '🧘'],
  [/marche|walk/i, '🚶'],
  [/football|foot|soccer/i, '⚽'],
  [/tennis/i, '🎾'],
  [/boxe|boxing|mma/i, '🥊'],
  [/crossfit|cross.?fit/i, '💪'],
  [/hiit/i, '⚡'],
  [/escalade|climbing/i, '🧗'],
  [/basket|basketball/i, '🏀'],
]

function sportBadge(title: string): string | null {
  for (const [pattern, emoji] of SPORT_BADGE_MAP) {
    if (pattern.test(title)) return emoji
  }
  return null
}

const SPORT_CARD_STYLES: [RegExp, string][] = [
  [/muscu|gym|musculation|bench|squat|deadlift|push|pull|legs/i, 'border-l-[3px] border-amber-400'],
  [/course|running|run|jogging/i,                                'border-l-[3px] border-green-500'],
  [/vélo|velo|cycling|bike/i,                                    'border-l-[3px] border-blue-500'],
  [/natation|swimming|swim/i,                                    'border-l-[3px] border-cyan-500'],
  [/yoga|pilates/i,                                              'border-l-[3px] border-purple-500'],
  [/marche|walk/i,                                               'border-l-[3px] border-teal-500'],
  [/football|foot|soccer/i,                                      'border-l-[3px] border-emerald-500'],
  [/tennis/i,                                                    'border-l-[3px] border-lime-500'],
  [/boxe|boxing|mma/i,                                           'border-l-[3px] border-red-500'],
  [/crossfit|cross.?fit/i,                                       'border-l-[3px] border-orange-500'],
  [/hiit/i,                                                      'border-l-[3px] border-yellow-500'],
]

function sessionCardBorder(title: string): string {
  for (const [pattern, cls] of SPORT_CARD_STYLES) {
    if (pattern.test(title)) return cls
  }
  return ''
}

const SPORT_CATEGORIES: { label: string; pattern: RegExp; color: string }[] = [
  { label: 'Musculation', pattern: /muscu|gym|musculation|bench|squat|deadlift|push|pull|legs/i, color: '#f59e0b' },
  { label: 'Course',      pattern: /course|running|run|jogging/i,                                 color: '#22c55e' },
  { label: 'Vélo',        pattern: /vélo|velo|cycling|bike/i,                                     color: '#3b82f6' },
  { label: 'Natation',    pattern: /natation|swimming|swim/i,                                     color: '#06b6d4' },
  { label: 'Yoga',        pattern: /yoga|pilates/i,                                               color: '#a855f7' },
  { label: 'Boxe/MMA',    pattern: /boxe|boxing|mma/i,                                            color: '#ef4444' },
  { label: 'CrossFit',    pattern: /crossfit|cross.?fit/i,                                        color: '#f97316' },
  { label: 'HIIT',        pattern: /hiit/i,                                                       color: '#eab308' },
  { label: 'Football',    pattern: /football|foot|soccer/i,                                       color: '#10b981' },
  { label: 'Tennis',      pattern: /tennis/i,                                                     color: '#84cc16' },
]

function getSportCategory(title: string): string {
  for (const cat of SPORT_CATEGORIES) {
    if (cat.pattern.test(title)) return cat.label
  }
  return 'Autre'
}

function ActivityHeatmap({ sessions }: { sessions: WorkoutSession[] }) {
  const WEEKS = 12
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const countByDate: Record<string, number> = {}
  sessions.forEach((s) => { countByDate[s.sessionDate] = (countByDate[s.sessionDate] ?? 0) + 1 })

  const dow = (today.getDay() + 6) % 7 // 0=Mon
  const totalDays = WEEKS * 7
  const start = new Date(today)
  start.setDate(start.getDate() - (totalDays - 1) + (6 - dow))

  const cells: Array<{ date: string; count: number }> = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    cells.push({ date: key, count: countByDate[key] ?? 0 })
  }

  const cellColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700'
    if (count === 1) return 'bg-amber-200 dark:bg-amber-800'
    if (count === 2) return 'bg-amber-400 dark:bg-amber-600'
    return 'bg-amber-500 dark:bg-amber-500'
  }

  return (
    <div className="card mb-5">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Activité des 12 dernières semaines</p>
      <div className="flex gap-0.5">
        {Array.from({ length: WEEKS }).map((_, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-1">
            {cells.slice(wi * 7, wi * 7 + 7).map((cell) => (
              <div
                key={cell.date}
                title={cell.count > 0 ? `${cell.date}: ${cell.count} séance${cell.count > 1 ? 's' : ''}` : cell.date}
                className={`aspect-square rounded-[2px] ${cellColor(cell.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
        <span>Moins</span>
        {['bg-gray-100 dark:bg-gray-700', 'bg-amber-200 dark:bg-amber-800', 'bg-amber-400 dark:bg-amber-600', 'bg-amber-500'].map((cls, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${cls}`} />
        ))}
        <span>Plus</span>
      </div>
    </div>
  )
}

function GlobalStats({ sessions }: { sessions: WorkoutSession[] }) {
  const totalCalories = sessions.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0)
  const totalMinutes = sessions.reduce((s, w) => s + (w.durationMinutes ?? 0), 0)
  const totalVolume = sessions.reduce((sum, w) =>
    sum + w.exercises.reduce((es, ex) => es + (ex.sets ?? 0) * (ex.reps ?? 0) * (ex.weightKg ?? 0), 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)

  const stats = [
    { label: 'Séances',       value: String(sessions.length),                                          icon: '🏋️', bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-700 dark:text-amber-300' },
    { label: 'kcal brûlées',  value: totalCalories > 0 ? totalCalories.toLocaleString('fr') : '—',    icon: '🔥', bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-700 dark:text-red-300' },
    { label: 'heures totales', value: totalHours > 0 ? `${totalHours}h` : '—',                        icon: '⏱️', bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-300' },
    { label: 'kg soulevés',   value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : totalVolume > 0 ? `${Math.round(totalVolume)}kg` : '—', icon: '⚖️', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-2xl ${s.bg} px-3 py-3 text-center`}>
          <span className="text-xl block mb-1">{s.icon}</span>
          <p className={`text-xl font-bold leading-none ${s.text}`}>{s.value}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function SportDonut({ sessions }: { sessions: WorkoutSession[] }) {
  if (sessions.length === 0) return null

  const counts: Record<string, number> = {}
  sessions.forEach((s) => {
    const cat = getSportCategory(s.title)
    counts[cat] = (counts[cat] ?? 0) + 1
  })

  const total = sessions.length
  const allColors: Record<string, string> = Object.fromEntries(
    [...SPORT_CATEGORIES.map((c) => [c.label, c.color]), ['Autre', '#9ca3af']]
  )
  const segments = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, color: allColors[label] ?? '#9ca3af' }))

  const r = 38
  const C = 2 * Math.PI * r
  let cumul = 0
  const arcs = segments.map((seg) => {
    const len = (seg.count / total) * C
    const off = C / 4 - cumul
    cumul += len
    return { ...seg, len, off }
  })

  return (
    <div className="card flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width={96} height={96} className="overflow-visible">
          <circle cx={48} cy={48} r={r} fill="none" strokeWidth={10} className="stroke-gray-100 dark:stroke-gray-700" />
          {arcs.map((arc) => (
            <circle key={arc.label} cx={48} cy={48} r={r} fill="none" strokeWidth={10}
              stroke={arc.color}
              strokeDasharray={`${arc.len} ${C - arc.len}`}
              strokeDashoffset={arc.off}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{total}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">séances</p>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Répartition</p>
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{seg.label}</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{seg.count}</span>
            <span className="text-[10px] text-gray-400 w-7 text-right">{Math.round((seg.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getIsoWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  const thu = new Date(d)
  thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3)
  const firstThu = new Date(thu.getFullYear(), 0, 4)
  const week = 1 + Math.round((thu.getTime() - firstThu.getTime()) / 604800000)
  return `${thu.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function WeeklyVolumeChart({ sessions }: { sessions: WorkoutSession[] }) {
  if (sessions.length === 0) return null

  const WEEKS = 8
  const today = new Date()
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (WEEKS - 1 - i) * 7)
    const mon = new Date(d)
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = getIsoWeekKey(mon.toISOString().split('T')[0])
    return { key, label: format(mon, 'd MMM', { locale: fr }), calories: 0, minutes: 0, count: 0 }
  })

  sessions.forEach((s) => {
    const key = getIsoWeekKey(s.sessionDate)
    const w = weeks.find((wk) => wk.key === key)
    if (w) { w.calories += s.caloriesBurned ?? 0; w.minutes += s.durationMinutes ?? 0; w.count++ }
  })

  const useCalories = weeks.some((w) => w.calories > 0)
  const values = weeks.map((w) => useCalories ? w.calories : w.minutes)
  const maxVal = Math.max(...values, 1)
  const unit = useCalories ? 'kcal' : 'min'
  const BAR_H = 72

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        {unit === 'kcal' ? 'Calories brûlées / semaine' : 'Durée / semaine'}
      </p>
      <div className="flex items-end gap-1.5" style={{ height: BAR_H + 32 }}>
        {weeks.map((week, i) => {
          const h = values[i] > 0 ? Math.max((values[i] / maxVal) * BAR_H, 4) : 0
          const isCurrent = i === WEEKS - 1
          return (
            <div key={week.key} className="flex-1 flex flex-col items-center gap-1 group">
              {values[i] > 0 && (
                <span className="text-[9px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {values[i]}
                </span>
              )}
              <div className="w-full flex items-end" style={{ height: BAR_H }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${isCurrent ? 'bg-amber-500' : 'bg-amber-200 dark:bg-amber-700/50'}`}
                  style={{ height: h }}
                  title={`${week.label} : ${values[i]} ${unit}`}
                />
              </div>
              <span className={`text-[9px] truncate w-full text-center leading-tight ${isCurrent ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {week.label}
              </span>
              {week.count > 0 && (
                <span className="text-[8px] text-gray-400 dark:text-gray-500">{week.count}x</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionCard({
  session, sessions, isExpanded, onToggleExpand, onDelete,
}: {
  session: WorkoutSession; sessions: WorkoutSession[]
  isExpanded: boolean; onToggleExpand: () => void; onDelete: () => void
}) {
  const badge = sportBadge(session.title)
  const borderCls = sessionCardBorder(session.title)
  const sImg = sportImage(session.title)
  const groups = groupExercises(session.exercises)
  const totalVolume = session.exercises.reduce((s, e) =>
    s + (e.sets ?? 1) * (e.reps ?? 0) * (e.weightKg ?? 0), 0)

  return (
    <div className={`card overflow-hidden ${borderCls}`}>
      <div className="flex items-start gap-3">
        {sImg ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
            <img src={sImg} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 text-2xl">
            {badge ?? '️'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{session.title}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {format(new Date(`${session.sessionDate}T00:00:00`), 'EEEE dd MMMM yyyy', { locale: fr })}
                {session.planDayId && (
                  <span className="ml-2 text-amber-500">· Programme</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {groups.length > 0 && (
                <button type="button" onClick={onToggleExpand}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
              <button type="button" onClick={onDelete}
                className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {session.durationMinutes && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                <Clock size={10} /> {session.durationMinutes}min
              </span>
            )}
            {session.caloriesBurned != null && session.caloriesBurned > 0 && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                <Flame size={10} /> {session.caloriesBurned} kcal
              </span>
            )}
            {totalVolume > 0 && (
              <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                ⚖️ {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)}kg`}
              </span>
            )}
            {groups.length > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                {groups.length} exercice{groups.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isExpanded && groups.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {groups.slice(0, 4).map(g => (
            <span key={g.name}
              className="text-[11px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {g.name} · {g.sets.length} série{g.sets.length > 1 ? 's' : ''}
            </span>
          ))}
          {groups.length > 4 && (
            <span className="text-[11px] text-gray-400 self-center">+{groups.length - 4}</span>
          )}
        </div>
      )}

      {isExpanded && groups.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-4">
          {groups.map(group => (
            <div key={group.name}>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                {group.name}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <th className="text-left pb-1 font-medium w-10">Série</th>
                    <th className="text-center pb-1 font-medium">Poids</th>
                    <th className="text-center pb-1 font-medium">Reps</th>
                    <th className="text-center pb-1 font-medium">Volume</th>
                    <th className="w-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {group.sets.map((set, i) => {
                    const vol = (set.reps ?? 0) * (set.weightKg ?? 0)
                    const pr = isPR(sessions, set.name, set.weightKg, session.sessionDate)
                    return (
                      <tr key={set.id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-1.5">
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-1.5 text-center font-semibold">
                          {set.weightKg != null ? `${set.weightKg} kg` : '—'}
                        </td>
                        <td className="py-1.5 text-center">{set.reps ?? '—'}</td>
                        <td className="py-1.5 text-center text-gray-400 dark:text-gray-500 text-xs">
                          {vol > 0 ? `${vol} kg` : '—'}
                        </td>
                        <td className="py-1.5 text-center">
                          {pr && (
                            <span title="Personal Record" className="text-xs">PR</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
          {session.notes && (
            <p className="text-xs text-gray-400 italic pt-1 border-t border-gray-100 dark:border-gray-700">
              {session.notes}
            </p>
          )}
        </div>
      )}
      {!isExpanded && session.notes && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">{session.notes}</p>
      )}
    </div>
  )
}

const emptyExercise = (): ExerciseForm => ({ name: '', sets: '', reps: '', weightKg: '', durationSeconds: '' })
const planExerciseWeight = (ex: PlanExercise) => ex.weightKg ?? (ex as unknown as { weight_kg?: number | null }).weight_kg ?? null

function ProgressRing({ percent, size = 64 }: { percent: number; size?: number }) {
  const r = (size - 8) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percent / 100) * circumference
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5}
        className="stroke-gray-100 dark:stroke-gray-700" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5}
        className="stroke-amber-500 transition-all duration-500"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  )
}

function PlanExerciseLine({ ex }: { ex: PlanExercise }) {
  const weight = planExerciseWeight(ex)
  const parts = [
    ex.sets ? `${ex.sets}s` : '',
    ex.reps ? `${ex.reps} reps` : '',
    weight ? `${weight}kg` : '',
  ].filter(Boolean)
  return (
    <li className="flex items-center justify-between gap-3 text-sm py-1.5">
      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{ex.name}</span>
      <span className="text-xs text-gray-400 shrink-0">{parts.join(' · ')}{ex.notes ? ` · ${ex.notes}` : ''}</span>
    </li>
  )
}

function AddWorkoutModal({
  onClose, onSuccess, prefillExercises, prefillTitle, prefillPlanDayId,
}: {
  onClose: () => void; onSuccess: () => void; prefillExercises?: PlanExercise[]; prefillTitle?: string; prefillPlanDayId?: number
}) {
  const qc = useQueryClient()
  const initialExercises = prefillExercises?.map(e => ({
    name: e.name,
    sets: String(e.sets ?? ''),
    reps: String(e.reps ?? ''),
    weightKg: String(planExerciseWeight(e) ?? ''),
    durationSeconds: '',
  })) ?? [emptyExercise()]
  const [mode, setMode] = useState<Mode>(prefillExercises || prefillTitle ? 'guided' : null)
  const [sportLabel, setSportLabel] = useState(prefillTitle?.split(' ')[0] || (prefillExercises ? 'Muscu' : ''))
  const [customSport, setCustomSport] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [caloriesOverride, setCaloriesOverride] = useState('')
  const [showCaloriesOverride, setShowCaloriesOverride] = useState(false)
  const [exercises, setExercises] = useState<ExerciseForm[]>(initialExercises)
  const [showExercises, setShowExercises] = useState(Boolean(prefillExercises?.length))
  const [promptText, setPromptText] = useState('')
  const [notes, setNotes] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  const selectedRate = SPORT_PRESETS.find(p => p.label === sportLabel)?.rate ?? 6
  const activeSport = sportLabel === 'Autre' ? customSport.trim() : sportLabel
  const durationValue = parseInt(durationMinutes) || 0
  const estimatedCalories = selectedRate * durationValue
  const caloriesDisplayed = caloriesOverride ? parseInt(caloriesOverride) : estimatedCalories

  const guidedMutation = useMutation({
    mutationFn: () => api.post('/workouts', {
      title: `${prefillTitle || activeSport}${durationMinutes ? ` — ${durationMinutes}min` : ''}`,
      durationMinutes: parseInt(durationMinutes) || null,
      caloriesBurned: caloriesDisplayed || null,
      notes: notes || null,
      planDayId: prefillPlanDayId ?? null,
      exercises: exercises.filter(e => e.name.trim()).map(e => ({
        name: e.name.trim(),
        sets: e.sets ? parseInt(e.sets) : null,
        reps: e.reps ? parseInt(e.reps) : null,
        weightKg: e.weightKg ? parseFloat(e.weightKg) : null,
        durationSeconds: e.durationSeconds ? parseInt(e.durationSeconds) : null,
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      qc.invalidateQueries({ queryKey: ['workout-plans'] })
      toast.success('Séance enregistrée')
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  })

  const promptMutation = useMutation({
    mutationFn: () => api.post('/workouts/from-prompt', { prompt: promptText }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Séance enregistrée')
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'analyse"),
  })

  const isLoading = guidedMutation.isPending || promptMutation.isPending
  const canSaveGuided = Boolean(activeSport || prefillTitle) && Boolean(durationMinutes)
  const addExercise = () => setExercises(prev => [...prev, emptyExercise()])
  const removeExercise = (index: number) => setExercises(prev => prev.filter((_, i) => i !== index))
  const updateExercise = (index: number, field: keyof ExerciseForm, value: string) =>
    setExercises(prev => prev.map((exercise, i) => i === index ? { ...exercise, [field]: value } : exercise))
  const selectSport = (label: string) => {
    setSportLabel(label)
    if (label === 'Autre') setTimeout(() => customInputRef.current?.focus(), 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isLoading ? undefined : onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Dumbbell size={20} className="text-amber-500" /> Nouvelle séance
          </h3>
          <button type="button" onClick={onClose} disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {mode === null && (
            <div className="space-y-3">
              <button type="button" onClick={() => setMode('guided')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 group-hover:scale-110 transition-transform">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Par activité</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Choisissez le sport et la durée, les calories sont estimées automatiquement.
                  </p>
                </div>
              </button>
              <button type="button" onClick={() => setMode('prompt')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 group-hover:scale-110 transition-transform">
                  <MessageSquareText size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Par description</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Décrivez votre séance, l'IA extrait tout automatiquement.
                  </p>
                </div>
              </button>
            </div>
          )}

          {mode === 'guided' && (
            <div>
              {!prefillTitle && (
                <button type="button" onClick={() => setMode(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                  ← Retour
                </button>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'activité</label>
                <div className="grid grid-cols-5 gap-2">
                  {SPORT_PRESETS.map(preset => (
                    <button key={preset.label} type="button" onClick={() => selectSport(preset.label)}
                      className={`min-h-14 rounded-xl border-2 px-1.5 py-2 text-xs font-medium transition-colors ${
                        sportLabel === preset.label
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300'
                      }`}>
                      {preset.emoji && <span className="block text-base leading-none mb-1">{preset.emoji}</span>}
                      {preset.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => selectSport('Autre')}
                    className={`min-h-14 rounded-xl border-2 px-1.5 py-2 text-xs font-medium transition-colors ${
                      sportLabel === 'Autre'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300'
                    }`}>
                    Autre
                  </button>
                </div>
                {sportLabel === 'Autre' && (
                  <input ref={customInputRef} className="input mt-3" value={customSport}
                    onChange={e => setCustomSport(e.target.value)} placeholder="Nom de l'activité" />
                )}
              </div>
              <div className="relative mb-4">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="Durée (min)" className="input pl-8" value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)} min="1" />
              </div>
              <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Flame size={15} /> ≈ {Number.isFinite(caloriesDisplayed) ? caloriesDisplayed : 0} kcal estimées
                  </p>
                  <button type="button" onClick={() => setShowCaloriesOverride(v => !v)}
                    className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline">
                    Modifier
                  </button>
                </div>
                {showCaloriesOverride && (
                  <input type="number" className="input mt-2" value={caloriesOverride}
                    onChange={e => setCaloriesOverride(e.target.value)} min="0" placeholder="Calories brûlées" />
                )}
              </div>
              <button type="button" onClick={() => setShowExercises(v => !v)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <span className="flex items-center gap-2">
                  <Dumbbell size={15} className="text-amber-500" />
                  {exercises.filter(e => e.name.trim()).length > 0
                    ? `Exercices · ${exercises.filter(e => e.name.trim()).length} ajouté${exercises.filter(e => e.name.trim()).length > 1 ? 's' : ''}`
                    : 'Exercices (facultatif)'}
                </span>
                {showExercises ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showExercises && (
                <div className="space-y-2 mb-4">
                  {/* Bibliothèque rapide si le sport correspond */}
                  {(EXERCISE_LIBRARY as Record<string, typeof EXERCISE_LIBRARY[keyof typeof EXERCISE_LIBRARY]>)[sportLabel] && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 px-3 py-2.5">
                      <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Bibliothèque rapide — {sportLabel}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(EXERCISE_LIBRARY as Record<string, typeof EXERCISE_LIBRARY[keyof typeof EXERCISE_LIBRARY]>)[sportLabel].map(ex => (
                          <button key={ex.name} type="button"
                            onClick={() => {
                              const newEx: ExerciseForm = { name: ex.name, sets: String(ex.sets ?? ''), reps: String(ex.reps ?? ''), weightKg: String(ex.weightKg ?? ''), durationSeconds: '' }
                              setExercises(prev => [...prev.filter(e => e.name.trim()), newEx])
                            }}
                            className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-medium transition-colors">
                            + {ex.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cartes exercices */}
                  {exercises.map((exercise, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                      {/* Header carte */}
                      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <input
                          className="flex-1 bg-transparent font-semibold text-sm text-gray-900 dark:text-gray-100 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                          value={exercise.name}
                          onChange={e => updateExercise(i, 'name', e.target.value)}
                          placeholder="Nom de l'exercice"
                        />
                        <button type="button" onClick={() => removeExercise(i)}
                          className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                      {/* Blocs métriques */}
                      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                        {[
                          { label: 'Séries', field: 'sets' as keyof ExerciseForm, step: '1' },
                          { label: 'Répétitions', field: 'reps' as keyof ExerciseForm, step: '1' },
                          { label: 'Poids (kg)', field: 'weightKg' as keyof ExerciseForm, step: '0.5' },
                        ].map(({ label, field, step }) => (
                          <div key={field} className="flex flex-col items-center py-3 px-2">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
                            <input
                              type="number" min="0" step={step}
                              className="w-full text-center font-bold text-xl text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none p-0 leading-none"
                              value={exercise[field]}
                              onChange={e => updateExercise(i, field, e.target.value)}
                              placeholder="—"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={addExercise}
                    className="w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-3 text-sm text-gray-400 dark:text-gray-500 hover:border-amber-400 hover:text-amber-500 dark:hover:text-amber-400 flex items-center justify-center gap-2 transition-colors font-medium">
                    <Plus size={15} /> Ajouter un exercice
                  </button>
                </div>
              )}
              <textarea className="input resize-none min-h-[70px] mb-4 text-sm" value={notes}
                onChange={e => setNotes(e.target.value)} placeholder="Notes (optionnel)" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Annuler</button>
                <button type="button" onClick={() => guidedMutation.mutate()} disabled={!canSaveGuided || isLoading}
                  className="btn-primary">Enregistrer la séance</button>
              </div>
            </div>
          )}

          {mode === 'prompt' && (
            <div>
              <button type="button" onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                ← Retour
              </button>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Décrivez votre séance</label>
              <textarea className="input resize-none mb-4" rows={5} value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Ex: J'ai fait 45min de muscu, dos et biceps. Tractions 4×10, Rowing 4×12 à 60kg. Puis 20min de vélo." />
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-3">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  L'IA analyse votre séance…
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Annuler</button>
                <button type="button" onClick={() => promptMutation.mutate()} disabled={!promptText.trim() || isLoading}
                  className="btn-primary flex items-center gap-2">✨ Analyser et sauvegarder</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const REST_SECONDS = 90

function ActiveWorkoutSession({ plan, day, onFinish, onDiscard }: {
  plan: WorkoutPlan; day: PlanDay
  onFinish: () => void; onDiscard: () => void
}) {
  const qc = useQueryClient()
  const [elapsed, setElapsed] = useState(0)
  const [exercises] = useState<ExerciseProgress[]>(() =>
    day.exercises.map(ex => ({ exercise: ex, setLogs: [] }))
  )
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [currentSetNum, setCurrentSetNum] = useState(1)
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  const [phase, setPhase] = useState<WorkoutPhase>('exercising')
  const [restRemaining, setRestRemaining] = useState(REST_SECONDS)
  const [, forceUpdate] = useState(0)
  const [showDiscard, setShowDiscard] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== 'resting') return
    if (restRemaining <= 0) { advanceAfterRest(); return }
    const id = setInterval(() => setRestRemaining(r => r - 1), 1000)
    return () => clearInterval(id)
  }, [phase, restRemaining])

  const currentEx = exercises[currentExIdx]
  const targetSets = currentEx?.exercise.sets ?? 3
  const isLastExercise = currentExIdx === exercises.length - 1
  const isLastSet = currentSetNum === targetSets

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const confirmSet = () => {
    if (!currentEx) return
    currentEx.setLogs.push({ setNumber: currentSetNum, weightKg: weightInput, reps: repsInput })
    forceUpdate(n => n + 1)
    if (isLastSet) {
      if (isLastExercise) {
        setPhase('done')
      } else {
        setCurrentExIdx(i => i + 1)
        setCurrentSetNum(1)
        setWeightInput('')
        setRepsInput('')
      }
    } else {
      setPhase('resting')
      setRestRemaining(REST_SECONDS)
    }
  }

  const advanceAfterRest = () => {
    if (!currentEx) return
    const last = currentEx.setLogs[currentEx.setLogs.length - 1]
    setWeightInput(last?.weightKg ?? '')
    setRepsInput(last?.reps ?? '')
    setCurrentSetNum(n => n + 1)
    setPhase('exercising')
  }

  const cfg = GOAL_CONFIG[(plan.goal as GoalType) in GOAL_CONFIG ? plan.goal as GoalType : 'GENERAL']

  const saveMutation = useMutation({
    mutationFn: () => api.post('/workouts', {
      title: `${plan.name} — ${day.label}`,
      durationMinutes: Math.max(1, Math.round(elapsed / 60)),
      caloriesBurned: null,
      planDayId: day.id,
      notes: null,
      exercises: exercises.flatMap(ep =>
        ep.setLogs.length > 0
          ? ep.setLogs.map(log => ({
              name: ep.exercise.name,
              sets: 1,
              reps: log.reps ? parseInt(log.reps) : ep.exercise.reps,
              weightKg: log.weightKg ? parseFloat(log.weightKg) : planExerciseWeight(ep.exercise),
              durationSeconds: null,
            }))
          : [{
              name: ep.exercise.name,
              sets: ep.exercise.sets,
              reps: ep.exercise.reps,
              weightKg: planExerciseWeight(ep.exercise),
              durationSeconds: null,
            }]
      ),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      qc.invalidateQueries({ queryKey: ['workout-plans'] })
      qc.invalidateQueries({ queryKey: ['plan-progress'] })
      toast.success('Séance enregistrée !')
      onFinish()
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  })

  const totalSets = exercises.reduce((s, e) => s + (e.exercise.sets ?? 3), 0)
  const doneSets = exercises.reduce((s, e) => s + e.setLogs.length, 0)

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 text-white overflow-y-auto flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => setShowDiscard(true)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
          <X size={16} /> Abandonner
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-500 truncate">{plan.name} — {day.label}</p>
          <p className="text-2xl font-mono font-bold text-amber-400 leading-none mt-0.5">{formatTime(elapsed)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{doneSets}/{totalSets} séries</p>
          <p className="text-xs font-semibold text-amber-400">{currentExIdx + 1}/{exercises.length} ex.</p>
        </div>
      </div>

      <div className="h-1 bg-gray-800 shrink-0">
        <div className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${totalSets > 0 ? (doneSets / totalSets) * 100 : 0}%` }} />
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {phase === 'done' ? (
          <div>
            <div className="text-center py-8">
              <div className="text-6xl mb-3"></div>
              <h2 className="text-2xl font-bold">Séance terminée !</h2>
              <p className="text-gray-400 mt-1">{formatTime(elapsed)} · {doneSets} séries</p>
            </div>
            <div className="space-y-3 mb-6">
              {exercises.map((ep, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <p className="font-semibold">{ep.exercise.name}</p>
                  </div>
                  {ep.setLogs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {ep.setLogs.map((log, j) => (
                        <div key={j} className="bg-gray-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                          <Check size={12} className="text-green-400 shrink-0" />
                          <span className="text-gray-300">S{j + 1} · {log.weightKg || '—'}kg × {log.reps || '—'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 italic">Non effectué</p>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 rounded-2xl font-bold text-black text-lg transition-colors">
              {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer la séance'}
            </button>
          </div>
        ) : currentEx ? (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
              {exercises.map((ep, i) => (
                <div key={i} className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  i < currentExIdx ? 'bg-green-900/50 text-green-400' :
                  i === currentExIdx ? 'bg-amber-500 text-black' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {i < currentExIdx ? '✓ ' : ''}{ep.exercise.name.split(' ').slice(0, 2).join(' ')}
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 mb-4">
              <div className="relative p-4 border-b border-gray-800 overflow-hidden">
                {sportImage(currentEx.exercise.name) && (
                  <img
                    src={sportImage(currentEx.exercise.name)!}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10"
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient} opacity-60`} />
                <div className="relative z-10">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                    Exercice {currentExIdx + 1}/{exercises.length}
                  </p>
                  <h3 className="text-xl font-bold">{currentEx.exercise.name}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {targetSets} séries
                    {currentEx.exercise.reps ? ` × ${currentEx.exercise.reps} reps` : ''}
                    {planExerciseWeight(currentEx.exercise) ? ` · ${planExerciseWeight(currentEx.exercise)} kg cible` : ''}
                  </p>
                </div>
              </div>

              {currentEx.setLogs.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-800 space-y-2">
                  {currentEx.setLogs.map((log, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-green-400" />
                      </div>
                      <span className="text-gray-400">Série {log.setNumber}</span>
                      <span className="font-semibold text-white">{log.weightKg || '—'} kg × {log.reps || '—'} reps</span>
                    </div>
                  ))}
                </div>
              )}

              {phase === 'exercising' && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-sm font-bold">
                      Série {currentSetNum}/{targetSets}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 text-center">Poids (kg)</p>
                      <input type="number" inputMode="decimal" min="0" step="2.5"
                        className="w-full text-center text-4xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-700"
                        value={weightInput}
                        onChange={e => setWeightInput(e.target.value)}
                        placeholder="0" />
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 text-center">Répétitions</p>
                      <input type="number" inputMode="numeric" min="0" step="1"
                        className="w-full text-center text-4xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-700"
                        value={repsInput}
                        onChange={e => setRepsInput(e.target.value)}
                        placeholder="0" />
                    </div>
                  </div>
                  <button type="button" onClick={confirmSet}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-xl font-bold text-black text-base transition-all flex items-center justify-center gap-2">
                    <Check size={20} /> Valider la série {currentSetNum}
                  </button>
                </div>
              )}
            </div>

            {phase === 'resting' && (
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                  <Timer size={14} /> Temps de repos
                </p>
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <svg className="-rotate-90" width="112" height="112">
                    <circle cx="56" cy="56" r="46" fill="none" strokeWidth="7" className="stroke-gray-700" />
                    <circle cx="56" cy="56" r="46" fill="none" strokeWidth="7" stroke="#f59e0b"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={`${(2 * Math.PI * 46) * (1 - restRemaining / REST_SECONDS)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {Math.floor(restRemaining / 60)}:{String(restRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">Préparez-vous pour la série {currentSetNum}</p>
                <button type="button" onClick={advanceAfterRest}
                  className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500">
                  <SkipForward size={14} /> Sauter le repos
                </button>
              </div>
            )}

            {!isLastExercise && exercises[currentExIdx + 1] && (
              <div className="bg-gray-900/50 rounded-xl p-3 flex items-center gap-3 border border-gray-800">
                <span className="text-xl">⏭</span>
                <div>
                  <p className="text-xs text-gray-500">Prochain exercice</p>
                  <p className="text-sm font-medium">{exercises[currentExIdx + 1].exercise.name}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-bold">Aucun exercice</h2>
            <button type="button" onClick={onDiscard}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold">
              Retour
            </button>
          </div>
        )}
      </div>

      {showDiscard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
            <h3 className="font-bold text-lg mb-2">Abandonner la séance ?</h3>
            <p className="text-gray-400 text-sm mb-5">La progression en cours sera perdue.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDiscard(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm font-medium hover:bg-gray-800">
                Continuer
              </button>
              <button type="button" onClick={onDiscard}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold">
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgramDetailView({ plan, onBack, onStartSession, onStatusChange }: {
  plan: WorkoutPlan
  onBack: () => void
  onStartSession: (day: PlanDay) => void
  onStatusChange: (id: number, status: string) => void
}) {
  const [progress, setProgress] = useState<PlanProgress | null>(null)
  const [localStatus, setLocalStatus] = useState(plan.status)
  const cfg = GOAL_CONFIG[(plan.goal as GoalType) in GOAL_CONFIG ? plan.goal as GoalType : 'GENERAL']
  const jsDow = new Date().getDay()
  const planDow = jsDow === 0 ? 7 : jsDow
  const today = plan.days.find(day => day.dayNumber === planDow)
  const isTodayRest = !today || today.label.toLowerCase() === 'repos'

  useEffect(() => {
    api.get(`/workout-plans/${plan.id}/progress`).then(r => setProgress(r.data))
  }, [plan.id])

  const changeStatus = (newStatus: string) => {
    api.patch(`/workout-plans/${plan.id}/status`, { status: newStatus })
      .then(() => { setLocalStatus(newStatus); onStatusChange(plan.id, newStatus) })
      .catch(() => toast.error('Erreur lors du changement de statut'))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button type="button" onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-5 transition-colors">
        <ArrowLeft size={16} /> Retour aux programmes
      </button>

      <div className="relative rounded-2xl overflow-hidden mb-5">
        <img
          src={GOAL_IMAGES[(plan.goal as GoalType) in GOAL_IMAGES ? plan.goal as GoalType : 'GENERAL']}
          alt={cfg.label}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{cfg.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm bg-black/30 text-white border border-white/20">{cfg.label}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20 ${STATUS_COLORS[localStatus] ?? STATUS_COLORS.ARCHIVED}`}>
                    {localStatus === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                    {STATUS_LABELS[localStatus] ?? localStatus}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {localStatus === 'ACTIVE' && <>
                    <button type="button" onClick={() => changeStatus('PAUSED')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
                      ⏸ Mettre en pause
                    </button>
                    <button type="button" onClick={() => changeStatus('COMPLETED')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      ✓ Marquer terminé
                    </button>
                  </>}
                  {localStatus === 'PAUSED' && <>
                    <button type="button" onClick={() => changeStatus('ACTIVE')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      ▶ Réactiver
                    </button>
                    <button type="button" onClick={() => changeStatus('COMPLETED')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      ✓ Marquer terminé
                    </button>
                  </>}
                  {localStatus === 'COMPLETED' && (
                    <button type="button" onClick={() => changeStatus('ACTIVE')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      ↺ Relancer le programme
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div>
                <p className="text-base font-bold text-white">
                  {progress?.doneSessions ?? 0}/{progress?.totalSessions ?? 0}
                </p>
                <p className="text-[10px] text-white/70">séances</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {progress?.weeksElapsed ?? 1}/{plan.weeks}
                </p>
                <p className="text-[10px] text-white/70">semaines</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">{plan.daysPerWeek}j</p>
                <p className="text-[10px] text-white/70">par semaine</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Progression</span>
                <span className="font-semibold">{progress?.percent ?? 0}%</span>
              </div>
              <div className="h-2 bg-white/25 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${goalProgressBar(plan.goal)}`}
                  style={{ width: `${progress?.percent ?? 0}%` }} />
              </div>
            </div>
          </div>
          <div className="relative shrink-0">
            <ProgressRing percent={progress?.percent ?? 0} size={56} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {progress?.percent ?? 0}%
            </span>
          </div>
          </div>
        </div>
      </div>

      {!isTodayRest && today && (
        <div className={`rounded-2xl border-2 p-4 mb-5 ${goalTodayBorder(plan.goal)} ${goalTodayBg(plan.goal)}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${cfg.accentText}`}>Séance d'aujourd'hui</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{today.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{today.exercises.length} exercices</p>
            </div>
            <button type="button" onClick={() => onStartSession(today)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-colors ${goalAccentBtn(plan.goal)}`}>
              <Play size={16} /> Démarrer
            </button>
          </div>
          <ul className="space-y-0 divide-y divide-gray-100/60 dark:divide-gray-700/60">
            {today.exercises.slice(0, 5).map((ex, i) => <PlanExerciseLine key={`today-${ex.name}-${i}`} ex={ex} />)}
            {today.exercises.length > 5 && (
              <li className="text-xs text-gray-400 pt-1.5">+{today.exercises.length - 5} autres exercices</li>
            )}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Planning de la semaine</p>
        <div className="space-y-2">
          {DAY_LABELS.map((label, index) => {
            const dayNumber = index + 1
            const day = plan.days.find(d => d.dayNumber === dayNumber)
            const isRest = !day || day.label.toLowerCase() === 'repos'
            const isToday = dayNumber === planDow
            const completed = day ? progress?.completedDayIds.includes(day.id) : false
            return (
              <div key={dayNumber} className={`rounded-xl border p-3 transition-colors ${
                isToday ? goalDayBorder(plan.goal) : 'border-gray-100 dark:border-gray-700'
              } ${isRest ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isToday ? goalAccentBtn(plan.goal).split(' ')[0] + ' text-white' :
                    completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {completed && !isToday ? <Check size={14} /> : label.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                      {isToday && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>Aujourd'hui</span>
                      )}
                      {completed && !isToday && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">✓ Complété</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {isRest ? 'Repos' : `${day?.label} · ${day?.exercises.length} exercices`}
                    </p>
                  </div>
                  {!isRest && day && (
                    <button type="button" onClick={() => onStartSession(day)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0">
                      <Play size={14} />
                    </button>
                  )}
                </div>
                {!isRest && day && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {day.exercises.map((ex, i) => {
                      const weight = planExerciseWeight(ex)
                      const parts = [
                        ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets ? `${ex.sets}s` : '',
                        weight ? `${weight}kg` : '',
                      ].filter(Boolean)
                      return (
                        <div key={`${day.id}-${ex.name}-${i}`} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 px-3 py-2 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ex.name}</span>
                          {parts.length > 0 && <span className="text-xs text-gray-400 shrink-0">{parts.join(' · ')}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CreatePlanModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const qc = useQueryClient()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState<GoalType>('MUSCLE_GAIN')
  const [weeks, setWeeks] = useState(8)
  const [dayConfigs, setDayConfigs] = useState(
    DAY_LABELS.map((_, i) => ({ dayNumber: i + 1, active: i < 5, label: i < 5 ? (i % 3 === 0 ? 'Push' : i % 3 === 1 ? 'Pull' : 'Legs') : 'Repos' }))
  )
  const [dayExercises, setDayExercises] = useState<Record<number, PlanExercise[]>>({})
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [customExercise, setCustomExercise] = useState({ name: '', sets: '', reps: '', weightKg: '' })
  const activeDays = dayConfigs.filter(d => d.active)
  const currentDay = activeDays[currentDayIndex] ?? activeDays[0]

  const createMutation = useMutation({
    mutationFn: () => api.post('/workout-plans', {
      name, goal, weeks,
      daysPerWeek: activeDays.length,
      days: activeDays.map(d => ({
        dayNumber: d.dayNumber,
        label: d.label,
        exercises: (dayExercises[d.dayNumber] ?? []).map(e => ({
          name: e.name, sets: e.sets, reps: e.reps, weight_kg: planExerciseWeight(e), notes: e.notes,
        })),
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-plans'] })
      toast.success('Programme créé !')
      onSuccess()
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const updateDay = (dayNumber: number, patch: Partial<{ active: boolean; label: string }>) =>
    setDayConfigs(prev => prev.map(day => day.dayNumber === dayNumber ? {
      ...day,
      ...patch,
      label: patch.active === false ? 'Repos' : patch.label ?? day.label,
    } : day))
  const addExerciseToDay = (dayNumber: number, exercise: PlanExercise) =>
    setDayExercises(prev => ({ ...prev, [dayNumber]: [...(prev[dayNumber] ?? []), { ...exercise }] }))
  const removeExerciseFromDay = (dayNumber: number, index: number) =>
    setDayExercises(prev => ({ ...prev, [dayNumber]: (prev[dayNumber] ?? []).filter((_, i) => i !== index) }))
  const updateDayExercise = (dayNumber: number, index: number, field: keyof PlanExercise, value: string) =>
    setDayExercises(prev => ({
      ...prev,
      [dayNumber]: (prev[dayNumber] ?? []).map((ex, i) => i === index ? {
        ...ex,
        [field]: field === 'name' || field === 'notes' ? value : value ? Number(value) : null,
      } : ex),
    }))
  const addCustomExercise = () => {
    if (!currentDay || !customExercise.name.trim()) return
    addExerciseToDay(currentDay.dayNumber, {
      name: customExercise.name.trim(),
      sets: customExercise.sets ? Number(customExercise.sets) : null,
      reps: customExercise.reps ? Number(customExercise.reps) : null,
      weightKg: customExercise.weightKg ? Number(customExercise.weightKg) : null,
      notes: '',
    })
    setCustomExercise({ name: '', sets: '', reps: '', weightKg: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={createMutation.isPending ? undefined : onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Créer un programme</h3>
          <button type="button" onClick={onClose} disabled={createMutation.isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {step === 1 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Programme</h4>
              <input className="input mb-4" value={name} onChange={e => setName(e.target.value)} placeholder="Nom du programme" />
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(Object.keys(GOAL_LABELS) as GoalType[]).map(g => (
                  <button key={g} type="button" onClick={() => setGoal(g)}
                    className={`rounded-xl border-2 p-3 text-sm font-medium text-left ${goal === g ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                    {GOAL_LABELS[g]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-5">
                {[4, 6, 8, 10, 12].map(value => (
                  <button key={value} type="button" onClick={() => setWeeks(value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${weeks === value ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {value} sem.
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(2)} disabled={!name.trim()} className="btn-primary">Suivant →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button type="button" onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4">← Retour</button>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Planning semainier</h4>
              <div className="space-y-2 mb-4">
                {dayConfigs.map(day => (
                  <div key={day.dayNumber} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                    <button type="button" onClick={() => updateDay(day.dayNumber, { active: !day.active })}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors ${day.active ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${day.active ? 'translate-x-4' : ''}`} />
                    </button>
                    <span className="w-20 text-sm font-medium text-gray-800 dark:text-gray-200">{DAY_LABELS[day.dayNumber - 1]}</span>
                    {day.active ? (
                      <select className="input flex-1" value={day.label} onChange={e => updateDay(day.dayNumber, { label: e.target.value })}>
                        {['Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Repos'].map(label => <option key={label} value={label}>{label}</option>)}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-400">Repos</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{activeDays.length} jours d'entraînement / semaine</p>
              <div className="flex justify-end">
                <button type="button" onClick={() => { setCurrentDayIndex(0); setStep(3) }} disabled={activeDays.length === 0} className="btn-primary">Suivant →</button>
              </div>
            </div>
          )}

          {step === 3 && currentDay && (
            <div>
              <button type="button" onClick={() => setStep(2)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4">← Retour</button>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Exercices par jour</h4>
              <div className="overflow-x-auto flex gap-2 mb-4">
                {activeDays.map((day, index) => (
                  <button key={day.dayNumber} type="button" onClick={() => setCurrentDayIndex(index)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${currentDayIndex === index ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {DAY_SHORT[day.dayNumber - 1]} · {day.label}
                  </button>
                ))}
              </div>
              {EXERCISE_LIBRARY[currentDay.label] && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bibliothèque</p>
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_LIBRARY[currentDay.label].map(ex => (
                      <button key={ex.name} type="button" onClick={() => addExerciseToDay(currentDay.dayNumber, ex)}
                        className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-3 py-1.5 text-xs font-medium hover:bg-amber-100">
                        + {ex.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <input className="input col-span-5 sm:col-span-1" value={customExercise.name} onChange={e => setCustomExercise(prev => ({ ...prev, name: e.target.value }))} placeholder="Exercice" />
                <input className="input" type="number" value={customExercise.sets} onChange={e => setCustomExercise(prev => ({ ...prev, sets: e.target.value }))} placeholder="Séries" />
                <input className="input" type="number" value={customExercise.reps} onChange={e => setCustomExercise(prev => ({ ...prev, reps: e.target.value }))} placeholder="Reps" />
                <input className="input" type="number" value={customExercise.weightKg} onChange={e => setCustomExercise(prev => ({ ...prev, weightKg: e.target.value }))} placeholder="Poids" />
                <button type="button" onClick={addCustomExercise} className="btn-secondary flex items-center justify-center gap-1"><Plus size={14} /></button>
              </div>
              <div className="space-y-2 mb-5">
                {(dayExercises[currentDay.dayNumber] ?? []).map((ex, index) => (
                  <div key={`${ex.name}-${index}`} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                    <div className="flex gap-2 mb-2">
                      <input className="input flex-1" value={ex.name} onChange={e => updateDayExercise(currentDay.dayNumber, index, 'name', e.target.value)} />
                      <button type="button" onClick={() => removeExerciseFromDay(currentDay.dayNumber, index)}
                        className="p-2 text-gray-300 hover:text-red-400"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input className="input" type="number" value={ex.sets ?? ''} onChange={e => updateDayExercise(currentDay.dayNumber, index, 'sets', e.target.value)} placeholder="Séries" />
                      <input className="input" type="number" value={ex.reps ?? ''} onChange={e => updateDayExercise(currentDay.dayNumber, index, 'reps', e.target.value)} placeholder="Reps" />
                      <input className="input" type="number" value={planExerciseWeight(ex) ?? ''} onChange={e => updateDayExercise(currentDay.dayNumber, index, 'weightKg', e.target.value)} placeholder="Poids" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => createMutation.mutate()} disabled={!name.trim() || activeDays.length === 0 || createMutation.isPending}
                  className="btn-primary flex items-center gap-2">
                  <Check size={16} /> Créer le programme
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgramCard({ plan, onClick, onDelete }: {
  plan: WorkoutPlan
  onClick: () => void
  onDelete: () => void
}) {
  const cfg = GOAL_CONFIG[(plan.goal as GoalType) in GOAL_CONFIG ? plan.goal as GoalType : 'GENERAL']
  const { data: progress } = useQuery<PlanProgress>({
    queryKey: ['plan-progress', plan.id],
    queryFn: () => api.get(`/workout-plans/${plan.id}/progress`).then(r => r.data),
  })

  return (
    <div onClick={onClick}
      className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all bg-white dark:bg-gray-800 group">
      <div className="h-40 relative overflow-hidden">
        <img
          src={GOAL_IMAGES[(plan.goal as GoalType) in GOAL_IMAGES ? plan.goal as GoalType : 'GENERAL']}
          alt={cfg.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="text-2xl drop-shadow-lg">{cfg.emoji}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm bg-black/30 text-white border border-white/20">
            {cfg.label}
          </span>
        </div>
        {plan.status === 'ACTIVE' && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-white shadow-lg" />
        )}
        {plan.status === 'PAUSED' && (
          <span className="absolute top-3 right-3 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">⏸</span>
        )}
        {plan.status === 'COMPLETED' && (
          <span className="absolute top-3 right-3 text-[10px] bg-blue-400 text-white font-bold px-2 py-0.5 rounded-full">✓</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">{plan.name}</h3>
          <button type="button" onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-0.5">
            <Trash2 size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {plan.daysPerWeek}j/sem · {plan.weeks}sem
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${goalProgressBar(plan.goal)} transition-all`}
              style={{ width: `${progress?.percent ?? 0}%` }} />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{progress?.doneSessions ?? 0}/{progress?.totalSessions ?? 0}</span>
        </div>
      </div>
    </div>
  )
}

export default function WorkoutPanel() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [view, setView] = useState<WorkoutView>('list')
  const [detailPlan, setDetailPlan] = useState<WorkoutPlan | null>(null)
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null)
  const [activeDay, setActiveDay] = useState<PlanDay | null>(null)

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<WorkoutSession[]>({
    queryKey: ['workouts'],
    queryFn: () => api.get('/workouts').then(r => r.data),
  })
  const { data: plans = [], isLoading: plansLoading } = useQuery<WorkoutPlan[]>({
    queryKey: ['workout-plans'],
    queryFn: () => api.get('/workout-plans').then(r => r.data),
  })
  const deleteSessionMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/workouts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Séance supprimée')
    },
  })
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/workout-plans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-plans'] })
      toast.success('Programme supprimé')
    },
  })

  const sessionsByMonth = useMemo(() => sessions.reduce((acc, s) => {
    const month = s.sessionDate.slice(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(s)
    return acc
  }, {} as Record<string, WorkoutSession[]>), [sessions])
  const sortedMonths = useMemo(() =>
    Object.keys(sessionsByMonth).sort((a, b) => b.localeCompare(a)),
    [sessionsByMonth]
  )
  const weekSessions = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return sessions.filter(session => new Date(`${session.sessionDate}T00:00:00`) >= start)
  }, [sessions])
  const weekStats = useMemo(() => ({
    count: weekSessions.length,
    minutes: weekSessions.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
    calories: weekSessions.reduce((sum, session) => sum + (session.caloriesBurned ?? 0), 0),
  }), [weekSessions])

  const handleAddSuccess = () => {
    qc.invalidateQueries({ queryKey: ['workouts'] })
    qc.invalidateQueries({ queryKey: ['timeline'] })
    qc.invalidateQueries({ queryKey: ['plan-progress'] })
    setShowAddModal(false)
  }

  if (sessionsLoading || plansLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement…</div>

  if (view === 'session' && activePlan && activeDay) {
    return (
      <ActiveWorkoutSession
        plan={activePlan}
        day={activeDay}
        onFinish={() => { setView('detail'); setActivePlan(null); setActiveDay(null) }}
        onDiscard={() => { setView('detail'); setActivePlan(null); setActiveDay(null) }}
      />
    )
  }

  if (view === 'detail' && detailPlan) {
    const currentPlan = plans.find(p => p.id === detailPlan.id) ?? detailPlan
    return (
      <ProgramDetailView
        plan={currentPlan}
        onBack={() => setView('list')}
        onStartSession={(day) => {
          setActivePlan(currentPlan)
          setActiveDay(day)
          setView('session')
        }}
        onStatusChange={(id, status) => {
          qc.setQueryData<WorkoutPlan[]>(['workout-plans'], prev =>
            prev?.map(p => p.id === id ? { ...p, status } : p) ?? []
          )
        }}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Dumbbell className="text-amber-500" /> Sport & Entraînement
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nouvelle séance
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 mb-6">
        {[
          ['sessions', 'Historique'],
          ['programs', 'Programmes'],
        ].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key as TabType)}
            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === key ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && (
        <>
          {sessions.length > 0 && <GlobalStats sessions={sessions} />}
          {sessions.length > 0 && <ActivityHeatmap sessions={sessions} />}
          {sessions.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <SportDonut sessions={sessions} />
              <WeeklyVolumeChart sessions={sessions} />
            </div>
          )}
          {weekSessions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-3 py-1.5 text-sm font-medium">
                {weekStats.count} séance{weekStats.count > 1 ? 's' : ''} cette semaine
              </span>
              <span className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium">
                {Math.floor(weekStats.minutes / 60)}h {weekStats.minutes % 60}min
              </span>
              <span className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium">
                {weekStats.calories} kcal brûlées
              </span>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <img src={imgUrl('images/empty/no-sessions.png')} alt="Aucune séance"
                className="w-48 h-auto mx-auto mb-4 opacity-90" />
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Aucune séance enregistrée</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Commence par enregistrer ta première séance</p>
            </div>
          ) : (
            <>
              {sortedMonths.map(month => {
                const [year, m] = month.split('-')
                const monthLabel = new Date(Number(year), Number(m) - 1).toLocaleString('fr', { month: 'long', year: 'numeric' })
                const monthSessions = sessionsByMonth[month]
                const monthVolume = monthSessions.reduce((s, w) =>
                  s + w.exercises.reduce((es, ex) => es + (ex.sets ?? 1) * (ex.reps ?? 0) * (ex.weightKg ?? 0), 0), 0)
                return (
                  <div key={month} className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{monthLabel}</h3>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                      <span className="text-xs text-gray-400">{monthSessions.length} séance{monthSessions.length > 1 ? 's' : ''}</span>
                      {monthVolume > 0 && (
                        <span className="text-xs text-gray-400">{monthVolume >= 1000 ? `${(monthVolume / 1000).toFixed(1)}t` : `${Math.round(monthVolume)}kg`}</span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {monthSessions.map(s => (
                        <SessionCard key={s.id} session={s} sessions={sessions}
                          isExpanded={expandedId === s.id}
                          onToggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                          onDelete={() => deleteSessionMutation.mutate(s.id)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </>
      )}

      {activeTab === 'programs' && (
        plans.length === 0 ? (
          <div className="text-center py-12">
            <img src={imgUrl('images/empty/no-programs.png')} alt="Aucun programme"
              className="w-48 h-auto mx-auto mb-4 opacity-90" />
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Aucun programme créé</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Crée ton premier programme d'entraînement</p>
            <button type="button" onClick={() => setShowCreatePlan(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} /> Créer un programme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {plans.map(plan => (
              <ProgramCard key={plan.id} plan={plan}
                onClick={() => { setDetailPlan(plan); setView('detail') }}
                onDelete={() => deletePlanMutation.mutate(plan.id)} />
            ))}
            <button type="button" onClick={() => setShowCreatePlan(true)}
              className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-48 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-amber-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors group">
              <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium">Nouveau programme</span>
            </button>
          </div>
        )
      )}

      {showAddModal && (
        <AddWorkoutModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {showCreatePlan && (
        <CreatePlanModal
          onClose={() => setShowCreatePlan(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['workout-plans'] }); setShowCreatePlan(false) }}
        />
      )}
    </div>
  )
}

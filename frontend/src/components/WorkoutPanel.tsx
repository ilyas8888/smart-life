import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity, Check, ChevronDown, ChevronUp, Clock, Dumbbell,
  Flame, MessageSquareText, Play, Plus, Trash2, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { EmptyState, IllustrationWorkout, IllustrationPrograms } from './EmptyState'

interface PlanExercise { name: string; sets: number | null; reps: number | null; weightKg: number | null; notes: string }
interface PlanDay { id: number; dayNumber: number; label: string; exercises: PlanExercise[] }
interface WorkoutPlan { id: number; name: string; goal: string; weeks: number; daysPerWeek: number; status: string; startDate: string; days: PlanDay[] }
interface PlanProgress { totalSessions: number; doneSessions: number; percent: number; weeksElapsed: number; completedDayIds: number[] }
interface WorkoutExercise { id: number; name: string; sets: number | null; reps: number | null; weightKg: number | null; durationSeconds: number | null }
interface WorkoutSession { id: number; title: string; sessionDate: string; durationMinutes: number | null; caloriesBurned: number | null; notes: string | null; exercises: WorkoutExercise[]; planDayId: number | null }
interface ExerciseForm { name: string; sets: string; reps: string; weightKg: string; durationSeconds: string }
type Mode = null | 'guided' | 'prompt'
type GoalType = 'MUSCLE_GAIN' | 'FAT_LOSS' | 'ENDURANCE' | 'GENERAL'
type TabType = 'sessions' | 'programs'

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

const GOAL_LABELS: Record<GoalType, string> = {
  MUSCLE_GAIN: 'Prise de masse',
  FAT_LOSS: 'Perte de poids',
  ENDURANCE: 'Endurance',
  GENERAL: 'Général',
}

const GOAL_COLORS: Record<GoalType, string> = {
  MUSCLE_GAIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  FAT_LOSS: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  ENDURANCE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  GENERAL: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
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
  session, isExpanded, onToggleExpand, onDelete,
}: {
  session: WorkoutSession; isExpanded: boolean; onToggleExpand: () => void; onDelete: () => void
}) {
  const badge = sportBadge(session.title)
  const borderCls = sessionCardBorder(session.title)
  const volume = session.exercises.reduce((sum, ex) =>
    sum + (ex.sets ?? 0) * (ex.reps ?? 0) * (ex.weightKg ?? 0), 0)

  return (
    <div className={`card overflow-hidden ${borderCls}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {badge && <span className="text-lg leading-none">{badge}</span>}
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{session.title}</p>
            {session.planDayId && (
              <span className="text-xs rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-2 py-0.5 shrink-0">
                Programme
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {format(new Date(`${session.sessionDate}T00:00:00`), 'EEEE dd MMMM yyyy', { locale: fr })}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {session.durationMinutes && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                <Clock size={10} /> {session.durationMinutes}min
              </span>
            )}
            {session.caloriesBurned && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                <Flame size={10} /> {session.caloriesBurned} kcal
              </span>
            )}
            {volume > 0 && (
              <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                ⚖️ {volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${Math.round(volume)}kg`} soulevés
              </span>
            )}
          </div>

          {session.exercises.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {session.exercises.slice(0, 4).map((ex) => {
                const p: string[] = []
                if (ex.sets && ex.reps) p.push(`${ex.sets}×${ex.reps}`)
                if (ex.weightKg) p.push(`${ex.weightKg}kg`)
                return (
                  <span key={ex.id}
                    className="text-[11px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {ex.name}{p.length ? ` · ${p.join(' ')}` : ''}
                  </span>
                )
              })}
              {session.exercises.length > 4 && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 self-center">
                  +{session.exercises.length - 4} autres
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {session.exercises.length > 0 && (
            <button type="button" onClick={onToggleExpand}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button type="button" onClick={onDelete}
            className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && session.exercises.length > 0 && (
        <ul className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          {session.exercises.map((ex) => <ExerciseLine key={ex.id} ex={ex} />)}
        </ul>
      )}
      {session.notes && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">{session.notes}</p>
      )}
    </div>
  )
}

const emptyExercise = (): ExerciseForm => ({ name: '', sets: '', reps: '', weightKg: '', durationSeconds: '' })
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60); const s = seconds % 60
  return m > 0 ? (s > 0 ? `${m}min ${s}s` : `${m}min`) : `${s}s`
}
const todayString = () => new Date().toISOString().split('T')[0]
const yesterdayString = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }
const dayLabel = (date: string) => {
  if (date === todayString()) return "Aujourd'hui"
  if (date === yesterdayString()) return 'Hier'
  return format(new Date(`${date}T00:00:00`), 'dd MMM', { locale: fr })
}
const goalLabel = (goal: string) => GOAL_LABELS[(goal as GoalType) in GOAL_LABELS ? goal as GoalType : 'GENERAL']
const goalColor = (goal: string) => GOAL_COLORS[(goal as GoalType) in GOAL_COLORS ? goal as GoalType : 'GENERAL']
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

function ExerciseLine({ ex }: { ex: WorkoutExercise }) {
  const parts: string[] = []
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`)
  else if (ex.sets) parts.push(`${ex.sets} séries`)
  else if (ex.reps) parts.push(`${ex.reps} reps`)
  if (ex.weightKg) parts.push(`${ex.weightKg}kg`)
  if (ex.durationSeconds) parts.push(formatDuration(ex.durationSeconds))
  return (
    <li className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
      <span className="font-medium text-gray-800 dark:text-gray-200">{ex.name}</span>
      {parts.length > 0 && <span className="text-gray-400">— {parts.join(', ')}</span>}
    </li>
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
                Ajouter des exercices (facultatif)
                {showExercises ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showExercises && (
                <div className="space-y-2 mb-4">
                  {exercises.map((exercise, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                      <div className="flex gap-2">
                        <input className="input flex-1 text-sm" value={exercise.name}
                          onChange={e => updateExercise(i, 'name', e.target.value)} placeholder="Nom exercice" />
                        {exercises.length > 1 && (
                          <button type="button" onClick={() => removeExercise(i)}
                            className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <input type="number" className="input text-sm" value={exercise.sets}
                          onChange={e => updateExercise(i, 'sets', e.target.value)} placeholder="Séries" min="1" />
                        <input type="number" className="input text-sm" value={exercise.reps}
                          onChange={e => updateExercise(i, 'reps', e.target.value)} placeholder="Reps" min="1" />
                        <input type="number" className="input text-sm" value={exercise.weightKg}
                          onChange={e => updateExercise(i, 'weightKg', e.target.value)} placeholder="Poids" min="0" step="0.5" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addExercise}
                    className="w-full rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-2 text-sm text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-1">
                    <Plus size={14} /> Ajouter une ligne
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

function PlanDetailModal({ plan, onClose, onStartSession }: { plan: WorkoutPlan; onClose: () => void; onStartSession: (day: PlanDay) => void }) {
  const [progress, setProgress] = useState<PlanProgress | null>(null)
  const jsDow = new Date().getDay()
  const planDow = jsDow === 0 ? 7 : jsDow
  const today = plan.days.find(day => day.dayNumber === planDow)

  useEffect(() => {
    api.get(`/workout-plans/${plan.id}/progress`).then(r => setProgress(r.data))
  }, [plan.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
            <span className={`inline-flex mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[plan.status] ?? STATUS_COLORS.ARCHIVED}`}>
              {STATUS_LABELS[plan.status] ?? plan.status}
            </span>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Semaine {progress?.weeksElapsed ?? 1}/{plan.weeks}</span>
              <span>{progress?.percent ?? 0}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress?.percent ?? 0}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-5">
            {DAY_SHORT.map((label, index) => {
              const dayNumber = index + 1
              const day = plan.days.find(d => d.dayNumber === dayNumber)
              const isRest = !day || day.label.toLowerCase() === 'repos'
              const completed = day ? progress?.completedDayIds.includes(day.id) : false
              return (
                <div key={label}
                  className={`rounded-xl border p-2 text-center min-h-20 ${dayNumber === planDow ? 'border-amber-500' : 'border-gray-100 dark:border-gray-700'} ${isRest ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400' : 'bg-white dark:bg-gray-800'}`}>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[11px] mt-1 truncate">{isRest ? 'Repos' : day.label}</p>
                  <p className="text-lg mt-1">{isRest ? '—' : completed ? '✅' : '⬜'}</p>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Séance du jour</h4>
            {!today || today.label.toLowerCase() === 'repos' ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Repos aujourd'hui</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-50 dark:divide-gray-700 mb-4">
                  {today.exercises.map((ex, i) => <PlanExerciseLine key={`${ex.name}-${i}`} ex={ex} />)}
                </ul>
                <button type="button" onClick={() => onStartSession(today)}
                  className="btn-primary inline-flex items-center gap-2">
                  <Play size={16} /> Démarrer la séance
                </button>
              </>
            )}
          </div>
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

function ProgramCard({ plan, onViewDetail, onDelete }: { plan: WorkoutPlan; onViewDetail: () => void; onDelete: () => void }) {
  const { data: progress } = useQuery<PlanProgress>({
    queryKey: ['plan-progress', plan.id],
    queryFn: () => api.get(`/workout-plans/${plan.id}/progress`).then(r => r.data),
  })
  const percent = progress?.percent ?? 0
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <ProgressRing percent={percent} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">{percent}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{plan.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[plan.status] ?? STATUS_COLORS.ARCHIVED}`}>
              {STATUS_LABELS[plan.status] ?? plan.status}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${goalColor(plan.goal)}`}>
              {goalLabel(plan.goal)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progress?.doneSessions ?? 0}/{progress?.totalSessions ?? 0} séances · Semaine {progress?.weeksElapsed ?? 1}/{plan.weeks}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {plan.daysPerWeek} jours/sem · {plan.weeks} semaines
          </p>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onViewDetail} className="btn-secondary text-sm">Voir le détail</button>
            <button type="button" onClick={onDelete}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkoutPanel() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [startFromDay, setStartFromDay] = useState<PlanDay | null>(null)

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

  const dates = useMemo(() =>
    Array.from(new Set(sessions.map(s => s.sessionDate))).sort((a, b) => b.localeCompare(a)),
    [sessions]
  )
  const sessionsToShow = useMemo(() =>
    selectedDate ? sessions.filter(s => s.sessionDate === selectedDate) : sessions,
    [selectedDate, sessions]
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

  const handleStartFromPlan = (day: PlanDay) => {
    setStartFromDay(day)
    setSelectedPlan(null)
    setShowAddModal(true)
  }
  const handleAddSuccess = () => {
    qc.invalidateQueries({ queryKey: ['workouts'] })
    qc.invalidateQueries({ queryKey: ['timeline'] })
    qc.invalidateQueries({ queryKey: ['plan-progress'] })
    setShowAddModal(false)
    setStartFromDay(null)
  }

  if (sessionsLoading || plansLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement…</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Dumbbell className="text-amber-500" /> Sport & Entraînement
        </h2>
        <div className="flex gap-2">
          {activeTab === 'programs' && (
            <button type="button" onClick={() => setShowCreatePlan(true)}
              className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={16} /> Programme
            </button>
          )}
          <button type="button" onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nouvelle séance
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 mb-6">
        {[
          ['sessions', 'Séances'],
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

          {sessions.length > 0 && (
            <div className="overflow-x-auto flex gap-2 mb-6">
              <button type="button" onClick={() => setSelectedDate(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${selectedDate === null ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
                Toutes
              </button>
              {dates.map(date => (
                <button key={date} type="button" onClick={() => setSelectedDate(date)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${selectedDate === date ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
                  {dayLabel(date)}
                </button>
              ))}
            </div>
          )}

          {sessions.length === 0 ? (
            <EmptyState
              illustration={<IllustrationWorkout />}
              title="Aucune séance enregistrée"
              subtitle="Commencez à tracker vos entraînements et suivez votre progression."
              action={
                <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2">
                  <Plus size={16} /> Ajouter votre première séance
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {sessionsToShow.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  isExpanded={expandedId === s.id}
                  onToggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  onDelete={() => deleteSessionMutation.mutate(s.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'programs' && (
        plans.length === 0 ? (
          <EmptyState
            illustration={<IllustrationPrograms />}
            title="Aucun programme"
            subtitle="Créez un programme structuré pour atteindre vos objectifs sportifs."
            action={
              <button type="button" onClick={() => setShowCreatePlan(true)} className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Créer votre premier programme
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {plans.map(plan => (
              <ProgramCard key={plan.id} plan={plan}
                onViewDetail={() => setSelectedPlan(plan)}
                onDelete={() => deletePlanMutation.mutate(plan.id)} />
            ))}
          </div>
        )
      )}

      {showAddModal && (
        <AddWorkoutModal
          onClose={() => { setShowAddModal(false); setStartFromDay(null) }}
          onSuccess={handleAddSuccess}
          prefillExercises={startFromDay?.exercises}
          prefillTitle={startFromDay?.label}
          prefillPlanDayId={startFromDay?.id}
        />
      )}
      {showCreatePlan && (
        <CreatePlanModal
          onClose={() => setShowCreatePlan(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['workout-plans'] }); setShowCreatePlan(false) }}
        />
      )}
      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onStartSession={handleStartFromPlan}
        />
      )}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Bell, UtensilsCrossed, Dumbbell, FileText, BookOpen, ChevronRight, Flame, Lock } from 'lucide-react'
import { format, differenceInCalendarDays, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'
import SmartDayScore from './SmartDayScore'

const QUOTES = [
  'La discipline est le pont entre les objectifs et les accomplissements.',
  'Chaque jour est une nouvelle chance de progresser.',
  'Le succès est la somme de petits efforts répétés jour après jour.',
  'Votre seule limite, c\'est vous-même.',
  'La santé est la vraie richesse.',
  'Commencez là où vous êtes, utilisez ce que vous avez.',
  'Un petit progrès chaque jour mène à de grands résultats.',
  'La motivation vous lance, l\'habitude vous maintient.',
  'Prendre soin de soi n\'est pas un luxe, c\'est une nécessité.',
  'Chaque effort compte, même les petits.',
  'Le meilleur moment pour commencer était hier, le second meilleur est maintenant.',
  'Votre corps peut tout faire, c\'est votre esprit qu\'il faut convaincre.',
  'Progresser, pas la perfection.',
  'Un jour à la fois, une habitude à la fois.',
  'Votre futur vous remerciera pour les efforts d\'aujourd\'hui.',
]

function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  )
  return QUOTES[dayOfYear % QUOTES.length]
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort().reverse()
  const today = format(new Date(), 'yyyy-MM-dd')
  if (sorted[0] !== today) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i - 1]), parseISO(sorted[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  glow: string
  onClick: () => void
}

function StatCard({ icon: Icon, label, value, sub, color, glow, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card-hover text-left p-4 sm:p-5 w-full group relative overflow-hidden"
      style={{ boxShadow: `0 0 30px ${glow}, 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 30% 50%, ${glow} 0%, transparent 70%)` }} />
      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
        <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors mt-1" />
      </div>
      <p className="relative text-3xl sm:text-4xl font-black text-white mb-1 leading-none tracking-tight">{value}</p>
      <p className="relative text-xs font-semibold tracking-widest text-gray-500 uppercase mt-2">{label}</p>
      {sub && <p className="relative text-xs text-gray-600 mt-1">{sub}</p>}
    </button>
  )
}

interface Task {
  status: string
  title: string
  priority: string
  dueDate: string | null
}
interface Reminder {
  isDone: boolean
  title: string
  remindAt: string
}
interface FoodSummary { totalCalories: number; mealCount: number }
interface WorkoutSession { sessionDate: string; caloriesBurned: number | null; durationMinutes: number | null }
interface Note { id: number }
interface DiaryEntry { id: number; entryDate: string }
type AiAccessStatus = {
  status: 'FREE' | 'APPROVED' | 'PREMIUM' | 'ADMIN' | 'BLOCKED'
  planName: string
  trialUsed: number
  trialQuota: number
  monthlyUsed: number
  monthlyQuota: number
  lastRequestStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
}

type Panel = 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout' | 'sleep' | 'study' | 'social' | 'prompt'

interface HomePanelProps {
  onNavigate: (panel: Panel) => void
  displayName: string
}

function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function getGreetingEmoji(hour: number) {
  if (hour < 6) return '🌙'
  if (hour < 12) return '☀️'
  if (hour < 18) return '🌤️'
  return '🌙'
}

export default function HomePanel({ onNavigate, displayName }: HomePanelProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = getWeekStart().toISOString().split('T')[0]

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((r) => r.data),
  })

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders').then((r) => r.data),
  })

  const { data: nutritionSummary } = useQuery<FoodSummary>({
    queryKey: ['food-summary-today'],
    queryFn: () => api.get('/food-logs/summary/today').then((r) => r.data),
  })

  const { data: workouts = [] } = useQuery<WorkoutSession[]>({
    queryKey: ['workouts'],
    queryFn: () => api.get('/workouts').then((r) => r.data),
  })

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: () => api.get('/notes').then((r) => r.data),
  })

  const { data: diary = [] } = useQuery<DiaryEntry[]>({
    queryKey: ['diary'],
    queryFn: () => api.get('/diary').then((r) => r.data),
  })

  const { data: aiStatus } = useQuery<AiAccessStatus>({
    queryKey: ['ai-access-status'],
    queryFn: () => api.get('/ai-access/status').then((r) => r.data),
  })

  const tasksTodo = tasks.filter((t) => t.status === 'TODO').length
  const tasksDone = tasks.filter((t) => t.status === 'DONE').length
  const pendingReminders = reminders.filter(
    (r) => !r.isDone && r.remindAt && r.remindAt >= today
  ).length
  const priorityRank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  const activeTasks = tasks
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3))
    .slice(0, 3)
  const nextReminder = reminders
    .filter((reminder) => !reminder.isDone && reminder.remindAt >= today)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt))[0]

  const weekWorkouts = workouts.filter((w) => w.sessionDate >= weekStart)
  const weekCaloriesBurned = weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned ?? 0), 0)
  const weekDuration = weekWorkouts.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0)

  const todayCalories = nutritionSummary?.totalCalories ?? 0

  const workoutDates = workouts.map((w) => w.sessionDate)
  const diaryDates = diary.map((d) => d.entryDate)
  const allActivityDates = [...new Set([...workoutDates, ...diaryDates])]
  const streak = computeStreak(allActivityDates)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const emoji = getGreetingEmoji(hour)
  const firstName = displayName.split(' ')[0]
  const quote = getDailyQuote()
  const aiTrialRemaining = aiStatus
    ? Math.max(0, aiStatus.trialQuota - aiStatus.trialUsed)
    : 0
  const isAiPromptAvailable = !aiStatus
    || aiStatus.status === 'ADMIN'
    || aiStatus.status === 'APPROVED'
    || aiStatus.status === 'PREMIUM'
    || (aiStatus.status === 'FREE' && aiTrialRemaining > 0)
  const aiPlanLabel = aiStatus?.status === 'ADMIN'
    ? 'Admin'
    : aiStatus?.status === 'PREMIUM'
      ? 'Premium'
      : aiStatus?.status === 'APPROVED'
        ? 'Pro'
        : aiStatus?.status === 'FREE'
          ? `${aiTrialRemaining} essais restants`
          : 'Acces bloque'
  const isAiRequestPending = aiStatus?.lastRequestStatus === 'PENDING'
  const isAiRestricted = aiStatus?.status === 'BLOCKED'
    || (aiStatus?.status === 'FREE' && aiTrialRemaining <= 0)
  const promptCardActionLabel = isAiRestricted ? 'Demander l\'acces' : 'Utiliser le Prompt IA'

  const priorityGlassStyle: Record<string, { dot: string; badge: string; label: string }> = {
    HIGH:   { dot: 'bg-red-500',    badge: 'bg-red-500/10 text-red-400 border border-red-500/20',    label: 'Haute' },
    MEDIUM: { dot: 'bg-amber-500',  badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', label: 'Moyenne' },
    LOW:    { dot: 'bg-gray-600',   badge: 'bg-white/5 text-gray-500 border border-white/10',        label: 'Basse' },
  }

  return (
    <div className="w-full space-y-5">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 40%, rgba(14,165,233,0.1) 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10 pointer-events-none" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-indigo-400 font-medium mb-2">
              {capitalize(format(new Date(), "EEEE dd MMMM yyyy", { locale: fr }))}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
              {emoji} {greeting}, {firstName} !
            </h1>
            <p className="text-gray-500 text-sm italic">"{quote}"</p>
          </div>
          {streak > 0 && (
            <div className="self-start flex flex-row sm:flex-col items-center gap-3 sm:gap-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 min-w-[80px]">
              <span className="text-4xl">🔥</span>
              <div className="sm:text-center">
                <p className="text-3xl font-black text-white leading-none">{streak}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  {streak === 1 ? 'jour' : 'jours'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Smart Day Score ──────────────────────────────────────── */}
      <SmartDayScore onNavigate={(panel) => onNavigate(panel as Panel)} />

      {/* ── Stats grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={CheckSquare}
          label="Tâches à faire"
          value={tasksTodo}
          sub={tasksDone > 0 ? `${tasksDone} terminée${tasksDone > 1 ? 's' : ''}` : undefined}
          color="from-indigo-500 to-violet-500"
          glow="rgba(99,102,241,0.18)"
          onClick={() => onNavigate('tasks')}
        />
        <StatCard
          icon={Bell}
          label="Rappels actifs"
          value={pendingReminders}
          sub={reminders.length > 0 ? `${reminders.length} au total` : undefined}
          color="from-amber-500 to-orange-500"
          glow="rgba(245,158,11,0.18)"
          onClick={() => onNavigate('reminders')}
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Calories"
          value={todayCalories > 0 ? `${todayCalories}` : '0'}
          sub={todayCalories > 0 ? 'kcal aujourd\'hui' : 'kcal'}
          color="from-emerald-500 to-teal-500"
          glow="rgba(16,185,129,0.18)"
          onClick={() => onNavigate('food')}
        />
        <StatCard
          icon={Dumbbell}
          label="Sport semaine"
          value={weekWorkouts.length}
          sub={weekWorkouts.length > 0 ? `${weekDuration} min · ${weekCaloriesBurned} kcal` : 'séances'}
          color="from-orange-400 to-red-400"
          glow="rgba(249,115,22,0.18)"
          onClick={() => onNavigate('workout')}
        />
        <StatCard
          icon={FileText}
          label="Notes"
          value={notes.length}
          color="from-violet-500 to-purple-500"
          glow="rgba(139,92,246,0.18)"
          onClick={() => onNavigate('notes')}
        />
        <StatCard
          icon={BookOpen}
          label="Journal"
          value={diary.length}
          sub={diary.length > 0 ? 'entrées' : 'entrées'}
          color="from-rose-500 to-pink-500"
          glow="rgba(244,63,94,0.18)"
          onClick={() => onNavigate('diary')}
        />
      </div>

      {/* ── Widgets row ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <CheckSquare size={16} className="text-indigo-400" />
              </div>
              <h2 className="font-bold text-white text-sm">À faire aujourd'hui</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Voir toutes →
            </button>
          </div>
          {activeTasks.length === 0 ? (
            <p className="text-sm font-semibold text-emerald-400">✓ Tout est à jour</p>
          ) : (
            <div className="space-y-2.5">
              {activeTasks.map((task, index) => {
                const style = priorityGlassStyle[task.priority] ?? priorityGlassStyle.LOW
                return (
                  <div key={`${task.title}-${index}`} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    <span className="text-sm text-gray-300 truncate flex-1">{task.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {nextReminder ? (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <Bell size={16} className="text-amber-400" />
              </div>
              <h2 className="font-bold text-white text-sm">Prochain rappel</h2>
            </div>
            <p className="text-base font-bold text-white mb-1">{nextReminder.title}</p>
            <p className="text-sm text-gray-500">
              {capitalize(format(parseISO(nextReminder.remindAt), "EEEE d MMMM 'à' HH'h'mm", { locale: fr }))}
            </p>
          </div>
        ) : (
          <div className="glass-card p-5 flex items-center justify-center">
            <p className="text-sm text-gray-600">Aucun rappel à venir</p>
          </div>
        )}
      </div>

      {/* ── Prompt IA card ────────────────────────────────────────── */}
      <div className={`relative overflow-hidden glass-card p-5 sm:p-6 ${isAiRestricted ? 'opacity-70' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl shadow-[0_0_16px_rgba(139,92,246,0.4)]">
              {isAiPromptAvailable ? <Flame size={18} className="text-white" /> : <Lock size={18} className="text-white" />}
            </div>
            <p className="font-black text-lg text-white">Prompt IA</p>
          </div>
          {aiPlanLabel && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
              isAiPromptAvailable
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-white/5 text-gray-500 border-white/10'
            }`}>
              {aiPlanLabel}
            </span>
          )}
        </div>
        <p className="relative text-sm text-gray-400 mb-4">
          Décrivez votre journée — l'IA extrait tâches, repas, sport, journal et plus.
        </p>
        {isAiRequestPending ? (
          <div className="inline-flex items-center rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-400">
            Demande en cours de révision
          </div>
        ) : (
          <button
            onClick={() => onNavigate('prompt')}
            className="btn-primary flex items-center gap-2"
          >
            {isAiRestricted ? <Lock size={15} /> : <Flame size={15} />}
            {promptCardActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Bell, UtensilsCrossed, Dumbbell, FileText, BookOpen, ChevronRight, Flame } from 'lucide-react'
import { format, differenceInCalendarDays, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'

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
  onClick: () => void
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3.5 rounded-2xl ${color} shadow-sm`}>
          <Icon size={26} className="text-white" />
        </div>
        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors mt-1" />
      </div>
      <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
      <p className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">{label}</p>
      {sub && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
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

type Panel = 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout' | 'prompt'

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

  const tasksTodo = tasks.filter((t) => t.status === 'TODO').length
  const tasksDone = tasks.filter((t) => t.status === 'DONE').length
  const pendingReminders = reminders.filter(
    (r) => !r.isDone && r.remindAt && r.remindAt >= today
  ).length
  const priorityRank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  const priorityStyle: Record<string, { dot: string; badge: string; label: string }> = {
    HIGH: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: 'Haute' },
    MEDIUM: { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', label: 'Moyenne' },
    LOW: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', label: 'Basse' },
  }
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
  const netCalories = todayCalories - (workouts.filter((w) => w.sessionDate === today).reduce((s, w) => s + (w.caloriesBurned ?? 0), 0))

  const workoutDates = workouts.map((w) => w.sessionDate)
  const diaryDates = diary.map((d) => d.entryDate)
  const allActivityDates = [...new Set([...workoutDates, ...diaryDates])]
  const streak = computeStreak(allActivityDates)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const emoji = getGreetingEmoji(hour)
  const firstName = displayName.split(' ')[0]
  const quote = getDailyQuote()

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="card mb-6 bg-gradient-to-br from-primary-600 to-blue-700 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-base mb-1 font-medium">
              {capitalize(format(new Date(), "EEEE dd MMMM yyyy", { locale: fr }))}
            </p>
            <h1 className="text-3xl font-bold mb-1">
              {emoji} {greeting}, {firstName} !
            </h1>
            <p className="text-primary-100 text-base italic opacity-90">"{quote}"</p>
          </div>
          {streak > 0 && (
            <div className="flex flex-col items-center bg-white/15 rounded-2xl px-5 py-3 min-w-[72px]">
              <span className="text-3xl">🔥</span>
              <span className="text-3xl font-bold leading-none">{streak}</span>
              <span className="text-xs text-primary-100 uppercase tracking-widest mt-1">
                {streak === 1 ? 'jour' : 'jours'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={CheckSquare}
          label="Tâches à faire"
          value={tasksTodo}
          sub={tasksDone > 0 ? `${tasksDone} terminée${tasksDone > 1 ? 's' : ''}` : undefined}
          color="bg-blue-500"
          onClick={() => onNavigate('tasks')}
        />
        <StatCard
          icon={Bell}
          label="Rappels actifs"
          value={pendingReminders}
          sub={reminders.length > 0 ? `${reminders.length} au total` : undefined}
          color="bg-orange-500"
          onClick={() => onNavigate('reminders')}
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Calories aujourd'hui"
          value={todayCalories > 0 ? `${todayCalories} kcal` : '—'}
          sub={netCalories !== todayCalories && todayCalories > 0 ? `Net: ${netCalories} kcal` : nutritionSummary?.mealCount ? `${nutritionSummary.mealCount} repas` : undefined}
          color="bg-green-500"
          onClick={() => onNavigate('food')}
        />
        <StatCard
          icon={Dumbbell}
          label="Sport cette semaine"
          value={weekWorkouts.length === 0 ? '—' : `${weekWorkouts.length} séance${weekWorkouts.length > 1 ? 's' : ''}`}
          sub={weekCaloriesBurned > 0 ? `${weekCaloriesBurned} kcal · ${weekDuration}min` : undefined}
          color="bg-amber-500"
          onClick={() => onNavigate('workout')}
        />
        <StatCard
          icon={FileText}
          label="Notes"
          value={notes.length}
          color="bg-violet-500"
          onClick={() => onNavigate('notes')}
        />
        <StatCard
          icon={BookOpen}
          label="Entrées journal"
          value={diary.length}
          color="bg-rose-500"
          onClick={() => onNavigate('diary')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-blue-500" />
              <h2 className="font-bold text-gray-900 dark:text-gray-100">À faire aujourd'hui</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Voir toutes
            </button>
          </div>
          {activeTasks.length === 0 ? (
            <p className="text-base font-medium text-green-600 dark:text-green-400">Tout est à jour ✓</p>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task, index) => {
                const style = priorityStyle[task.priority] ?? priorityStyle.LOW
                return (
                  <div key={`${task.title}-${index}`} className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${style.dot}`} />
                    <span className="text-base text-gray-700 dark:text-gray-200 truncate flex-1">{task.title}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {nextReminder && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-orange-500" />
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Prochain rappel</h2>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{nextReminder.title}</p>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {capitalize(format(parseISO(nextReminder.remindAt), "EEEE d MMMM 'à' HH'h'mm", { locale: fr }))}
            </p>
          </div>
        )}
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-100 dark:border-primary-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Flame size={20} className="text-white" />
          </div>
          <p className="font-bold text-lg text-primary-900 dark:text-primary-200">Prompt IA</p>
        </div>
        <p className="text-base text-primary-700 dark:text-primary-300 mb-4">
          Décrivez votre journée en langage naturel — l'IA extrait tâches, repas, sport, journal et plus.
        </p>
        <button
          onClick={() => onNavigate('prompt')}
          className="btn-primary flex items-center gap-2"
        >
          <Flame size={16} />
          Utiliser le Prompt IA
        </button>
      </div>
    </div>
  )
}

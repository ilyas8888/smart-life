import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Bell, UtensilsCrossed, Dumbbell, FileText, BookOpen, ChevronRight, TrendingUp, Flame } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'

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
      className="card text-left hover:shadow-md transition-shadow group w-full"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors mt-1" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">{value}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </button>
  )
}

interface Task { status: string }
interface Reminder { isDone: boolean; remindAt: string | null }
interface FoodSummary { totalCalories: number; mealCount: number }
interface WorkoutSession { sessionDate: string; caloriesBurned: number | null; durationMinutes: number | null }
interface Note { id: number }
interface DiaryEntry { id: number }

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

  const weekWorkouts = workouts.filter((w) => w.sessionDate >= weekStart)
  const weekCaloriesBurned = weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned ?? 0), 0)
  const weekDuration = weekWorkouts.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0)

  const todayCalories = nutritionSummary?.totalCalories ?? 0
  const netCalories = todayCalories - (workouts.filter((w) => w.sessionDate === today).reduce((s, w) => s + (w.caloriesBurned ?? 0), 0))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
          {format(new Date(), "EEEE dd MMMM yyyy", { locale: fr })}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Voici votre résumé du jour
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
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

      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-100 dark:border-primary-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-primary-600 rounded-lg">
            <TrendingUp size={16} className="text-white" />
          </div>
          <p className="font-semibold text-primary-900 dark:text-primary-200">Prompt IA</p>
        </div>
        <p className="text-sm text-primary-700 dark:text-primary-300 mb-3">
          Décrivez votre journée en langage naturel — l'IA extrait tâches, repas, sport, journal et plus.
        </p>
        <button
          onClick={() => onNavigate('prompt')}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Flame size={14} />
          Utiliser le Prompt IA
        </button>
      </div>
    </div>
  )
}

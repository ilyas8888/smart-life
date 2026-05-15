import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Dumbbell, Flame, Trash2, UtensilsCrossed } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface FoodLog {
  id: number
  logDate: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | string | null
  foodItem: string
  quantity: string | null
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  fiberG: number | null
  notes: string | null
  nutritionDetails: Record<string, string | number | null> | null
  loggedAt: string
}

const dailyGoals = {
  calories: 2000,
  proteinG: 50,
  carbsG: 250,
  fatG: 70,
  fiberG: 25,
}

const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

const mealLabels: Record<string, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Snack',
}

const mealDots: Record<string, string> = {
  BREAKFAST: 'bg-yellow-400',
  LUNCH: 'bg-green-500',
  DINNER: 'bg-blue-500',
  SNACK: 'bg-gray-400',
}

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatValue = (value: number, unit = 'g') => {
  const rounded = Math.round(value * 10) / 10
  return `${rounded}${unit}`
}

const progressColor = (percent: number) => {
  if (percent > 100) return 'bg-red-500'
  if (percent >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

const todayString = () => new Date().toISOString().split('T')[0]

const yesterdayString = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

function dayLabel(date: string) {
  if (date === todayString()) return "Aujourd'hui"
  if (date === yesterdayString()) return 'Hier'
  return format(new Date(`${date}T00:00:00`), 'dd MMM', { locale: fr })
}

function hasDetails(details: FoodLog['nutritionDetails']) {
  return Object.entries(details ?? {}).filter(([, value]) => value !== null && value !== '').length > 0
}

function detailsEntries(details: FoodLog['nutritionDetails']) {
  return Object.entries(details ?? {}).filter(([, value]) => value !== null && value !== '')
}

function MacroCard({
  label,
  value,
  goal,
  unit,
  icon: Icon,
}: {
  label: string
  value: number
  goal: number
  unit: string
  icon: typeof Flame
}) {
  const percent = goal > 0 ? (value / goal) * 100 : 0
  const width = Math.min(percent, 100)

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {unit === 'kcal' ? Math.round(value) : formatValue(value)}
            <span className="text-sm font-medium text-gray-400"> / {goal}{unit === 'kcal' ? ' kcal' : 'g'}</span>
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
          <Icon size={20} />
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
        <div className={`h-full rounded-full ${progressColor(percent)}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function FoodLogRow({
  log,
  onDelete,
}: {
  log: FoodLog
  onDelete: (id: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const details = detailsEntries(log.nutritionDetails)

  return (
    <div className="py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{log.foodItem}</p>
          {log.quantity && <p className="text-xs text-gray-400 mt-0.5">{log.quantity}</p>}
          {log.notes && <p className="text-xs text-gray-400 mt-1 truncate">{log.notes}</p>}
          {hasDetails(log.nutritionDetails) && (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Détails
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-gray-700">{Math.round(toNumber(log.calories))} kcal</p>
          <p className="text-xs text-gray-400">
            P: {formatValue(toNumber(log.proteinG))} · G: {formatValue(toNumber(log.carbsG))} · L: {formatValue(toNumber(log.fatG))}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(log.id)}
          className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isExpanded && details.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-gray-50">
          {details.map(([key, value]) => (
            <div key={key} className="text-xs text-gray-500">
              <span className="font-medium text-gray-600">{key.replace(/_/g, ' ')}</span>
              <span className="text-gray-400"> : {String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FoodLogsPanel() {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(todayString())

  const { data: foodLogs = [], isLoading } = useQuery<FoodLog[]>({
    queryKey: ['food-logs'],
    queryFn: () => api.get('/food-logs').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/food-logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food-logs'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Repas supprimé')
    },
  })

  const dates = useMemo(() => {
    return Array.from(new Set(foodLogs.map((log) => log.logDate))).sort((a, b) => b.localeCompare(a))
  }, [foodLogs])

  useEffect(() => {
    if (dates.length === 0) return
    if (dates.includes(selectedDate)) return
    setSelectedDate(dates.includes(todayString()) ? todayString() : dates[0])
  }, [dates, selectedDate])

  const selectedLogs = useMemo(() => {
    return foodLogs.filter((log) => log.logDate === selectedDate)
  }, [foodLogs, selectedDate])

  const calories = selectedLogs.reduce((sum, log) => sum + toNumber(log.calories), 0)
  const proteinG = selectedLogs.reduce((sum, log) => sum + toNumber(log.proteinG), 0)
  const carbsG = selectedLogs.reduce((sum, log) => sum + toNumber(log.carbsG), 0)
  const fatG = selectedLogs.reduce((sum, log) => sum + toNumber(log.fatG), 0)
  const fiberG = selectedLogs.reduce((sum, log) => sum + toNumber(log.fiberG), 0)
  const fiberPercent = dailyGoals.fiberG > 0 ? (fiberG / dailyGoals.fiberG) * 100 : 0

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Chargement...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <UtensilsCrossed className="text-primary-600" />
        Alimentation ({foodLogs.length})
      </h2>

      {foodLogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun repas enregistré. Utilisez le prompt IA pour ajouter votre alimentation.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto flex gap-2 mb-6">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDate === date
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dayLabel(date)}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <MacroCard label="Calories" value={calories} goal={dailyGoals.calories} unit="kcal" icon={Flame} />
              <MacroCard label="Protéines" value={proteinG} goal={dailyGoals.proteinG} unit="g" icon={Dumbbell} />
              <MacroCard label="Glucides" value={carbsG} goal={dailyGoals.carbsG} unit="g" icon={UtensilsCrossed} />
              <MacroCard label="Lipides" value={fatG} goal={dailyGoals.fatG} unit="g" icon={UtensilsCrossed} />
            </div>

            <div className="card mt-4 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Fibres</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatValue(fiberG)} / {dailyGoals.fiberG}g
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progressColor(fiberPercent)}`}
                  style={{ width: `${Math.min(fiberPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="max-w-4xl">
            {mealOrder.map((mealType) => {
              const logs = selectedLogs.filter((log) => (log.mealType ?? 'SNACK') === mealType)
              if (logs.length === 0) return null

              const totalCalories = logs.reduce((sum, log) => sum + toNumber(log.calories), 0)

              return (
                <section key={mealType} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${mealDots[mealType]}`} />
                      {mealLabels[mealType]}
                    </h3>
                    <span className="text-xs text-gray-400">{Math.round(totalCalories)} kcal</span>
                  </div>

                  <div>
                    {logs.map((log) => (
                      <FoodLogRow
                        key={log.id}
                        log={log}
                        onDelete={(id) => deleteMutation.mutate(id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

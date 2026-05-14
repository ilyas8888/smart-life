import { useMemo, useState } from 'react'
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

interface NutritionSummary {
  totalCalories: number | string | null
  totalProteinG: number | string | null
  totalCarbsG: number | string | null
  totalFatG: number | string | null
  totalFiberG: number | string | null
  mealCount: number
  meals: Record<string, unknown>[]
}

const dailyGoals = {
  calories: 2000,
  proteinG: 50,
  carbsG: 250,
  fatG: 70,
  fiberG: 25,
}

const mealColors: Record<string, string> = {
  BREAKFAST: 'bg-yellow-100 text-yellow-700',
  LUNCH: 'bg-green-100 text-green-700',
  DINNER: 'bg-blue-100 text-blue-700',
  SNACK: 'bg-gray-100 text-gray-700',
}

const mealLabels: Record<string, string> = {
  BREAKFAST: 'Petit-dejeuner',
  LUNCH: 'Dejeuner',
  DINNER: 'Diner',
  SNACK: 'Snack',
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

export default function FoodLogsPanel() {
  const qc = useQueryClient()
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const { data: foodLogs = [], isLoading: isLoadingLogs } = useQuery<FoodLog[]>({
    queryKey: ['food-logs'],
    queryFn: () => api.get('/food-logs').then((r) => r.data),
  })

  const { data: summary, isLoading: isLoadingSummary } = useQuery<NutritionSummary>({
    queryKey: ['nutrition-summary'],
    queryFn: () => api.get('/food-logs/summary/today').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/food-logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food-logs'] })
      qc.invalidateQueries({ queryKey: ['nutrition-summary'] })
      toast.success('Repas supprime')
    },
  })

  const groupedLogs = useMemo(() => {
    return foodLogs.reduce<Record<string, FoodLog[]>>((groups, log) => {
      groups[log.logDate] = groups[log.logDate] ?? []
      groups[log.logDate].push(log)
      return groups
    }, {})
  }, [foodLogs])

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoadingLogs || isLoadingSummary) {
    return <div className="text-center py-12 text-gray-400">Chargement...</div>
  }

  const calories = toNumber(summary?.totalCalories)
  const proteinG = toNumber(summary?.totalProteinG)
  const carbsG = toNumber(summary?.totalCarbsG)
  const fatG = toNumber(summary?.totalFatG)
  const fiberG = toNumber(summary?.totalFiberG)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <UtensilsCrossed className="text-primary-600" />
        Alimentation ({foodLogs.length})
      </h2>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MacroCard label="Calories" value={calories} goal={dailyGoals.calories} unit="kcal" icon={Flame} />
          <MacroCard label="Proteines" value={proteinG} goal={dailyGoals.proteinG} unit="g" icon={Dumbbell} />
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
              className={`h-full rounded-full ${progressColor((fiberG / dailyGoals.fiberG) * 100)}`}
              style={{ width: `${Math.min((fiberG / dailyGoals.fiberG) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {foodLogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun repas enregistre. Utilisez le prompt IA pour ajouter votre alimentation.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <section key={date}>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                {format(new Date(date), 'dd MMM yyyy', { locale: fr })} ({logs.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {logs.map((log) => {
                  const mealType = log.mealType ?? 'SNACK'
                  const details = Object.entries(log.nutritionDetails ?? {}).filter(([, value]) => value !== null && value !== '')
                  const expanded = expandedIds.has(log.id)

                  return (
                    <div key={log.id} className="card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mealColors[mealType] ?? mealColors.SNACK}`}>
                              {mealLabels[mealType] ?? mealType}
                            </span>
                          </div>

                          <p className="font-semibold text-gray-900">{log.foodItem}</p>
                          {log.quantity && <p className="text-sm text-gray-500 mt-0.5">{log.quantity}</p>}
                          {log.notes && <p className="text-sm text-gray-500 mt-2">{log.notes}</p>}

                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{log.calories ?? 0}cal</span>
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{formatValue(log.proteinG ?? 0)} prot</span>
                            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">{formatValue(log.carbsG ?? 0)} gluc</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{formatValue(log.fatG ?? 0)} lip</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteMutation.mutate(log.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {details.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => toggleExpanded(log.id)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            Details nutritionnels
                            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>

                          {expanded && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                              {details.map(([key, value]) => (
                                <div key={key} className="bg-gray-50 text-gray-600 rounded-lg px-2 py-1.5">
                                  <p className="text-xs font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-xs text-gray-400">{String(value)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

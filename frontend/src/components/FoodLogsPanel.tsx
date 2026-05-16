import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, ChevronUp, Dumbbell, Flame, Plus, Trash2, UtensilsCrossed, X } from 'lucide-react'
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

const headerBg: Record<string, string> = {
  BREAKFAST: 'bg-yellow-50 dark:bg-yellow-900/20',
  LUNCH: 'bg-green-50 dark:bg-green-900/20',
  DINNER: 'bg-blue-50 dark:bg-blue-900/20',
  SNACK: 'bg-gray-50 dark:bg-gray-700',
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
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {unit === 'kcal' ? Math.round(value) : formatValue(value)}
            <span className="text-sm font-medium text-gray-400 dark:text-gray-500"> / {goal}{unit === 'kcal' ? ' kcal' : 'g'}</span>
          </p>
        </div>
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
          <Icon size={20} />
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
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
    <div className="py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{log.foodItem}</p>
          {log.quantity && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{log.quantity}</p>}
          {log.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{log.notes}</p>}

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-1.5 py-0.5 rounded font-medium">
              P {formatValue(toNumber(log.proteinG))}
            </span>
            <span className="text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-1.5 py-0.5 rounded font-medium">
              G {formatValue(toNumber(log.carbsG))}
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
              L {formatValue(toNumber(log.fatG))}
            </span>
          </div>

          {hasDetails(log.nutritionDetails) && (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Détails nutritionnels
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        <div className="shrink-0 flex items-start gap-2">
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">
            {Math.round(toNumber(log.calories))} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">kcal</span>
          </p>
          <button
            type="button"
            onClick={() => onDelete(log.id)}
            className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors mt-0.5"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && details.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
          {details.map(([key, value]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1.5 text-xs">
              <p className="font-medium text-gray-600 dark:text-gray-300 capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-gray-400 dark:text-gray-500">{String(value)}</p>
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
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [foodItem, setFoodItem] = useState('')
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH')
  const [calories, setCalories] = useState('')
  const [proteinG, setProteinG] = useState('')
  const [carbsG, setCarbsG] = useState('')
  const [fatG, setFatG] = useState('')
  const [quantity, setQuantity] = useState('')

  const { data: foodLogs = [], isLoading } = useQuery<FoodLog[]>({
    queryKey: ['food-logs'],
    queryFn: () => api.get('/food-logs').then((r) => r.data),
  })

  const resetForm = () => {
    setFoodItem('')
    setMealType('LUNCH')
    setCalories('')
    setProteinG('')
    setCarbsG('')
    setFatG('')
    setQuantity('')
  }

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/food-logs', {
        foodItem,
        mealType,
        calories: calories ? Number(calories) : null,
        proteinG: proteinG ? Number(proteinG) : null,
        carbsG: carbsG ? Number(carbsG) : null,
        fatG: fatG ? Number(fatG) : null,
        quantity: quantity || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food-logs'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      resetForm()
      setShowForm(false)
      toast.success('Repas ajouté')
    },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/food-logs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food-logs'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Repas supprimé')
    },
  })

  const toggleMeal = (type: string) =>
    setCollapsedMeals((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
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

  const caloriesTotal = selectedLogs.reduce((sum, log) => sum + toNumber(log.calories), 0)
  const proteinTotal = selectedLogs.reduce((sum, log) => sum + toNumber(log.proteinG), 0)
  const carbsTotal = selectedLogs.reduce((sum, log) => sum + toNumber(log.carbsG), 0)
  const fatTotal = selectedLogs.reduce((sum, log) => sum + toNumber(log.fatG), 0)
  const fiberG = selectedLogs.reduce((sum, log) => sum + toNumber(log.fiberG), 0)
  const fiberPercent = dailyGoals.fiberG > 0 ? (fiberG / dailyGoals.fiberG) * 100 : 0
  const visibleMealTypes = mealOrder.filter((mealType) =>
    selectedLogs.some((log) => (log.mealType ?? 'SNACK') === mealType)
  )
  const allVisibleMealsCollapsed = visibleMealTypes.every((mealType) => collapsedMeals.has(mealType))
  const shouldShowForm = showForm || foodLogs.length === 0

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <UtensilsCrossed className="text-primary-600" />
        Alimentation ({foodLogs.length})
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary ml-2 flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Ajouter
        </button>
        <button
          type="button"
          onClick={() =>
            setCollapsedMeals(
              allVisibleMealsCollapsed
                ? new Set()
                : new Set(visibleMealTypes)
            )
          }
          className="ml-auto text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-normal transition-colors"
        >
          {allVisibleMealsCollapsed ? 'Tout développer' : 'Tout réduire'}
        </button>
      </h2>

      {foodLogs.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Utilisez le prompt IA ou ajoutez manuellement.
        </p>
      )}

      {shouldShowForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!foodItem.trim()) return
            createMutation.mutate()
          }}
          className="card mb-6 max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Aliment (ex: Poulet grillé)"
              required
            />
            <select
              className="input"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK')}
            >
              <option value="BREAKFAST">Petit-déjeuner</option>
              <option value="LUNCH">Déjeuner</option>
              <option value="DINNER">Dîner</option>
              <option value="SNACK">Snack</option>
            </select>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:col-span-2">
              <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Kcal"
              />
              <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                placeholder="Protéines g"
              />
              <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
                placeholder="Glucides g"
              />
              <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={fatG}
                onChange={(e) => setFatG(e.target.value)}
                placeholder="Lipides g"
              />
            </div>
            <input
              className="input md:col-span-2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantité (ex: 200g)"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <X size={16} />
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!foodItem.trim() || createMutation.isPending}
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {foodLogs.length > 0 && (
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
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {dayLabel(date)}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <MacroCard label="Calories" value={caloriesTotal} goal={dailyGoals.calories} unit="kcal" icon={Flame} />
              <MacroCard label="Protéines" value={proteinTotal} goal={dailyGoals.proteinG} unit="g" icon={Dumbbell} />
              <MacroCard label="Glucides" value={carbsTotal} goal={dailyGoals.carbsG} unit="g" icon={UtensilsCrossed} />
              <MacroCard label="Lipides" value={fatTotal} goal={dailyGoals.fatG} unit="g" icon={UtensilsCrossed} />
            </div>

            <div className="card mt-4 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fibres</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatValue(fiberG)} / {dailyGoals.fiberG}g
                </p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
                <section key={mealType} className="mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div
                    className={`flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer select-none ${headerBg[mealType]}`}
                    onClick={() => toggleMeal(mealType)}
                  >
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      {collapsedMeals.has(mealType)
                        ? <ChevronRight size={15} className="text-gray-400 dark:text-gray-500" />
                        : <ChevronDown size={15} className="text-gray-400 dark:text-gray-500" />}
                      <span className={`w-2.5 h-2.5 rounded-full ${mealDots[mealType]}`} />
                      {mealLabels[mealType]}
                      <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{logs.length} repas</span>
                    </h3>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{Math.round(totalCalories)} kcal</span>
                  </div>

                  {!collapsedMeals.has(mealType) && (
                    <div className="px-4">
                      {logs.map((log) => (
                        <FoodLogRow
                          key={log.id}
                          log={log}
                          onDelete={(id) => deleteMutation.mutate(id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

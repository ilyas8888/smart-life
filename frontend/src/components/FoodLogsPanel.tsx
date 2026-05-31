import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown, ChevronRight, ChevronUp, Droplet, Droplets,
  Edit2, ListPlus, MessageSquareText, Plus, Trash2, UtensilsCrossed, X,
} from 'lucide-react'
import { addDays, format, startOfWeek, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { EmptyPanel, IllustrationFood } from './EmptyState'
import { FoodAutocomplete } from './FoodAutocomplete'

type RichPortion = { grams: number; label: string; source: string; confidence: number }
type PortionMap = Record<string, RichPortion | number>

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

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
type Mode = null | 'items' | 'prompt'
type FoodItemDraft = {
  name: string
  quantity: string
  unit: string
  hasNutrition: boolean
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  fiberG?: number
  portions?: PortionMap
}
type SelectedMacros = {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  portions?: PortionMap
}
type UserFood = {
  id: number
  name: string
  calories: number
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  fiberG: number | null
  portions?: PortionMap | null
  createdAt: string
}

const dailyGoals = { calories: 2000, proteinG: 50, carbsG: 250, fatG: 70, fiberG: 25 }
const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
const mealLabels: Record<string, string> = {
  BREAKFAST: 'Petit-déjeuner', LUNCH: 'Déjeuner', DINNER: 'Dîner', SNACK: 'Snack',
}
const mealDots: Record<string, string> = {
  BREAKFAST: 'bg-yellow-400', LUNCH: 'bg-green-500', DINNER: 'bg-blue-500', SNACK: 'bg-gray-400',
}
const foodUnits = ['g', 'oz', 'ml', 'piece', 'cup', 'bowl', 'tbsp', 'tsp']
const CUSTOM_PORTION_UNITS = ['piece', 'cup', 'tbsp', 'tsp', 'bowl', 'slice']
const UNIT_GRAMS: Record<string, number> = {
  g: 1, ml: 1, oz: 28.35, piece: 100, cup: 240, bowl: 300, tbsp: 15, tsp: 5,
}
const getPortionGrams = (portions: PortionMap | undefined, unit: string): number => {
  if (!portions) return UNIT_GRAMS[unit] ?? 100
  const p = portions[unit]
  if (!p) return UNIT_GRAMS[unit] ?? 100
  return typeof p === 'object' ? p.grams : p
}
const getPortionConfidence = (portions: PortionMap | undefined, unit: string): number => {
  if (!portions) return 0.2
  const p = portions[unit]
  if (!p) return 0.2
  return typeof p === 'object' ? p.confidence : 1.0
}
const getPortionLabel = (portions: PortionMap | undefined, unit: string): string | null => {
  if (!portions) return null
  const p = portions[unit]
  if (!p || typeof p === 'number') return null
  return p.label
}
const computeScale = (
  qty: string,
  unit: string,
  portions?: PortionMap
): number => {
  const q = parseFloat(qty) || 1
  if (unit === 'g' || unit === 'ml') return q / 100
  if (unit === 'oz') return (q * 28.35) / 100
  return (q * getPortionGrams(portions, unit)) / 100
}
const headerBg: Record<string, string> = {
  BREAKFAST: 'bg-yellow-900/20',
  LUNCH: 'bg-green-900/20',
  DINNER: 'bg-blue-900/20',
  SNACK: 'bg-white/[0.03]',
}
const headerBorder: Record<string, string> = {
  BREAKFAST: 'border-l-2 border-yellow-400',
  LUNCH: 'border-l-2 border-green-500',
  DINNER: 'border-l-2 border-blue-500',
  SNACK: 'border-l-2 border-gray-400',
}

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
const formatValue = (value: number, unit = 'g') => `${Math.round(value * 10) / 10}${unit}`
const todayString = () => new Date().toISOString().split('T')[0]
function hasDetails(details: FoodLog['nutritionDetails']) {
  return Object.entries(details ?? {}).filter(([, v]) => v !== null && v !== '').length > 0
}
function detailsEntries(details: FoodLog['nutritionDetails']) {
  return Object.entries(details ?? {}).filter(([, v]) => v !== null && v !== '')
}

function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat
  if (total === 0) return null
  const r = 38
  const circumference = 2 * Math.PI * r
  const segments = [
    { value: protein, color: '#22c55e', label: 'Protéines', unit: 'g' },
    { value: carbs, color: '#f59e0b', label: 'Glucides', unit: 'g' },
    { value: fat, color: '#3b82f6', label: 'Lipides', unit: 'g' },
  ]
  let cumulative = 0
  const arcs = segments.map((seg) => {
    const length = (seg.value / total) * circumference
    const offset = circumference / 4 - cumulative
    cumulative += length
    return { ...seg, length, offset }
  })

  return (
    <div className="card flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={96} height={96} className="overflow-visible">
          <circle cx={48} cy={48} r={r} fill="none" strokeWidth={10}
            className="stroke-gray-100 dark:stroke-gray-700" />
          {arcs.map((arc) => (
            <circle key={arc.label} cx={48} cy={48} r={r} fill="none" strokeWidth={10}
              stroke={arc.color}
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
              className="-rotate-90 origin-center"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-300 leading-none">{Math.round(total)}g</p>
          <p className="text-[10px] text-gray-500">macros</p>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-gray-300" />
            <span className="text-xs text-gray-400 flex-1">{seg.label}</span>
            <span className="text-xs font-semibold text-white">
              {Math.round(seg.value)}{seg.unit}
            </span>
            <span className="text-xs text-gray-400 w-8 text-right">
              {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

void MacroDonut

function calorieColor(percent: number) {
  if (percent > 105) return 'fill-red-400'
  if (percent >= 85) return 'fill-yellow-400'
  return 'fill-green-400'
}

function calorieStroke(percent: number) {
  if (percent > 105) return '#f87171'
  if (percent >= 85) return '#facc15'
  return '#4ade80'
}

function WeeklyCalorieChart({
  logs,
  selectedDate,
  onSelectDate,
  goal,
}: {
  logs: FoodLog[]
  selectedDate: string
  onSelectDate: (d: string) => void
  goal: number
}) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  return (
    <div className="card mb-4">
      <div className="flex items-end justify-between gap-2">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const total = logs
            .filter((log) => log.logDate === key)
            .reduce((sum, log) => sum + toNumber(log.calories), 0)
          const percent = goal > 0 ? (total / goal) * 100 : 0
          const height = total > 0 ? Math.max(4, Math.min(64, Math.round((percent / 100) * 64))) : 4
          const selected = selectedDate === key
          const barColor = total > 0 ? calorieColor(percent) : 'fill-gray-200 dark:fill-gray-600'

          return (
            <button
              key={key}
              type="button"
              title={`${Math.round(total)}kcal`}
              onClick={() => onSelectDate(key)}
              className="flex flex-1 flex-col items-center gap-2 rounded-xl px-1 py-2 hover:bg-white/[0.05] transition-colors"
            >
              <div className={`h-16 flex items-end rounded-full ${selected ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}>
                <svg width="20" height="64" viewBox="0 0 20 64" aria-hidden="true">
                  <rect x="0" y={64 - height} width="20" height={height} rx="10" className={barColor} />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-medium text-gray-400 capitalize">
                  {format(day, 'EEE', { locale: fr }).slice(0, 3)}
                </p>
                <p className={`text-xs font-semibold ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {format(day, 'd')}
                </p>
                <span className={`block h-1.5 mt-0.5 text-primary-600 ${key === todayString() ? 'opacity-100' : 'opacity-0'}`}>•</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NutritionDashboard({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  goals,
}: {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  goals: typeof dailyGoals
}) {
  const caloriePercent = goals.calories > 0 ? (calories / goals.calories) * 100 : 0
  const radius = 68
  const circumference = 2 * Math.PI * radius
  const dash = circumference * Math.min(caloriePercent, 100) / 100
  const macros = [
    { label: 'Prot&#xe9;ines', value: protein, goal: goals.proteinG, color: 'fill-blue-500' },
    { label: 'Glucides', value: carbs, goal: goals.carbsG, color: 'fill-amber-500' },
    { label: 'Lipides', value: fat, goal: goals.fatG, color: 'fill-rose-500' },
    { label: 'Fibres', value: fiber, goal: goals.fiberG, color: 'fill-emerald-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="card flex flex-col items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 160 160" className="-rotate-90 w-40 h-40">
            <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="14" className="stroke-gray-700" />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              strokeWidth="14"
              stroke={calorieStroke(caloriePercent)}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-black text-white">{Math.round(calories)}</p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">/ {goals.calories} kcal</p>
      </div>

      <div className="card space-y-4">
        {macros.map((macro) => {
          const percent = macro.goal > 0 ? (macro.value / macro.goal) * 100 : 0
          return (
            <div key={macro.label}>
              <div className="flex items-center gap-3 mb-1.5">
                <p className="text-sm font-medium text-gray-300 flex-1">{macro.label}</p>
                <p className="text-xs text-gray-400">
                  {formatValue(macro.value)} / {macro.goal}g
                </p>
                <p className="text-xs text-gray-500 w-9 text-right">{Math.round(percent)}%</p>
              </div>
              <svg viewBox="0 0 100 8" className="h-2 w-full rounded-full overflow-hidden" preserveAspectRatio="none" aria-hidden="true">
                <rect x="0" y="0" width="100" height="8" rx="4" className="fill-gray-700" />
                <rect x="0" y="0" width={Math.min(percent, 100)} height="8" rx="4" className={macro.color} />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StreakBadge({ logs }: { logs: FoodLog[] }) {
  const trackedDates = new Set(logs.map((log) => log.logDate))
  const today = todayString()
  let cursor = trackedDates.has(today) ? new Date(`${today}T00:00:00`) : subDays(new Date(`${today}T00:00:00`), 1)
  let streak = 0

  while (trackedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }

  if (streak === 0) return null

  return (
    <span className="bg-orange-900/30 text-orange-300 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold">
      {streak} jour{streak > 1 ? 's' : ''} de tracking consécutif{streak > 1 ? 's' : ''}
    </span>
  )
}

function HydrationWidget({ count, onChange }: { count: number; onChange: (count: number) => void }) {
  return (
    <div className="card mb-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <Droplets size={20} className="text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Hydratation</p>
          <p className="text-xs text-gray-500">{count} / 8 verres</p>
        </div>
      </div>
      <div className="flex w-full sm:w-auto items-center justify-between gap-1 sm:ml-auto">
        {Array.from({ length: 8 }).map((_, index) => {
          const filled = index < count
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(filled && index + 1 === count ? index : index + 1)}
              className={`p-1 rounded-xl transition-transform hover:scale-110 ${filled ? 'text-blue-500' : 'text-gray-200 dark:text-gray-600'}`}
            >
              <Droplet size={18} fill="currentColor" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FoodLogRow({ log, onDelete }: { log: FoodLog; onDelete: (id: number) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const details = detailsEntries(log.nutritionDetails)
  return (
    <div className="py-3 border-b border-gray-50 border-white/10 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{log.foodItem}</p>
          {log.quantity && <p className="text-xs text-gray-500 mt-0.5">{log.quantity}</p>}
          {log.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{log.notes}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded-md font-semibold border border-blue-500/20">
              P {formatValue(toNumber(log.proteinG))}
            </span>
            <span className="text-xs bg-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded-md font-semibold border border-amber-500/20">
              G {formatValue(toNumber(log.carbsG))}
            </span>
            <span className="text-xs bg-rose-900/30 text-rose-300 px-1.5 py-0.5 rounded-md font-semibold border border-rose-500/20">
              L {formatValue(toNumber(log.fatG))}
            </span>
          </div>
          {hasDetails(log.nutritionDetails) && (
            <button type="button" onClick={() => setIsExpanded(v => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Détails nutritionnels {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
        <div className="shrink-0 flex items-start gap-2">
          <p className="text-base font-bold text-white">
            {Math.round(toNumber(log.calories))} <span className="text-xs font-normal text-gray-500">kcal</span>
          </p>
          <button type="button" onClick={() => onDelete(log.id)}
            className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors mt-0.5">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {isExpanded && details.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-gray-50 border-white/10">
          {details.map(([key, value]) => (
            <div key={key} className="bg-white/[0.03] rounded-xl px-2 py-1.5 text-xs">
              <p className="font-medium text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-gray-500">{String(value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UserFoodFormModal({
  food,
  onClose,
  onSubmit,
  isSaving,
}: {
  food: UserFood | null
  onClose: () => void
  onSubmit: (payload: Omit<UserFood, 'id' | 'createdAt'>) => void
  isSaving: boolean
}) {
  const [name, setName] = useState(food?.name ?? '')
  const [calories, setCalories] = useState(String(food?.calories ?? ''))
  const [proteinG, setProteinG] = useState(String(food?.proteinG ?? ''))
  const [carbsG, setCarbsG] = useState(String(food?.carbsG ?? ''))
  const [fatG, setFatG] = useState(String(food?.fatG ?? ''))
  const [fiberG, setFiberG] = useState(String(food?.fiberG ?? ''))
  const [portionDrafts, setPortionDrafts] = useState<Record<string, { enabled: boolean; grams: string }>>(() => {
    const portions = food?.portions ?? {}
    return Object.fromEntries(CUSTOM_PORTION_UNITS.map(unit => {
      const portion = portions[unit]
      const grams = typeof portion === 'object' && portion !== null && 'grams' in portion
        ? String((portion as RichPortion).grams)
        : typeof portion === 'number'
          ? String(portion)
          : ''
      return [unit, { enabled: Boolean(grams), grams }]
    }))
  })

  const numberOrNull = (value: string) => value.trim() === '' ? null : Number(value)
  const submit = () => {
    const portions: PortionMap = {}
    Object.entries(portionDrafts).forEach(([unit, draft]) => {
      const grams = Number(draft.grams)
      if (draft.enabled && Number.isFinite(grams) && grams > 0) {
        portions[unit] = { grams, label: `1 ${unit}`, source: 'user', confidence: 1.0 }
      }
    })
    onSubmit({
      name: name.trim(),
      calories: Number(calories),
      proteinG: numberOrNull(proteinG),
      carbsG: numberOrNull(carbsG),
      fatG: numberOrNull(fatG),
      fiberG: numberOrNull(fiberG),
      portions: Object.keys(portions).length > 0 ? portions : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/5 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 border-white/10">
          <h3 className="font-black text-white">{food ? 'Modifier un aliment' : 'Créer un aliment'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Nom de l'aliment*" />
          <input className="input" type="number" min="0" step="0.1" value={calories} onChange={e => setCalories(e.target.value)} placeholder="Calories pour 100g*" />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" min="0" step="0.1" value={proteinG} onChange={e => setProteinG(e.target.value)} placeholder="Protéines (g)" />
            <input className="input" type="number" min="0" step="0.1" value={carbsG} onChange={e => setCarbsG(e.target.value)} placeholder="Glucides (g)" />
            <input className="input" type="number" min="0" step="0.1" value={fatG} onChange={e => setFatG(e.target.value)} placeholder="Lipides (g)" />
            <input className="input" type="number" min="0" step="0.1" value={fiberG} onChange={e => setFiberG(e.target.value)} placeholder="Fibres (g)" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Portions optionnelles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CUSTOM_PORTION_UNITS.map(unit => (
                <label key={unit} className="flex items-center gap-2 rounded-xl border border-white/10 border-white/10 px-3 py-2">
                  <input type="checkbox" checked={portionDrafts[unit]?.enabled ?? false}
                    onChange={e => setPortionDrafts(prev => ({ ...prev, [unit]: { ...(prev[unit] ?? { grams: '' }), enabled: e.target.checked } }))}
                    className="accent-primary-600" />
                  <span className="text-xs font-semibold text-gray-400 w-12">{unit}</span>
                  <input type="number" min="0" step="0.1" value={portionDrafts[unit]?.grams ?? ''}
                    onChange={e => setPortionDrafts(prev => ({ ...prev, [unit]: { ...(prev[unit] ?? { enabled: true }), grams: e.target.value } }))}
                    className="input py-1 text-xs" placeholder="grammes" />
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Annuler</button>
            <button type="button" onClick={submit} disabled={!name.trim() || !calories || isSaving} className="btn-primary w-full sm:w-auto">
              {isSaving ? 'Sauvegarde...' : food ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MyFoodsView() {
  const qc = useQueryClient()
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [editingFood, setEditingFood] = useState<UserFood | null>(null)
  const { data: userFoods = [], isLoading } = useQuery<UserFood[]>({
    queryKey: ['user-foods'],
    queryFn: () => api.get('/user-foods').then(r => r.data),
  })

  const createFoodMutation = useMutation({
    mutationFn: (payload: Omit<UserFood, 'id' | 'createdAt'>) => api.post('/user-foods', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-foods'] })
      setShowFoodForm(false)
      toast.success('Aliment créé')
    },
  })
  const updateFoodMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Omit<UserFood, 'id' | 'createdAt'> }) => api.put(`/user-foods/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-foods'] })
      setEditingFood(null)
      toast.success('Aliment mis à jour')
    },
  })
  const deleteFoodMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/user-foods/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-foods'] })
      toast.success('Aliment supprimé')
    },
  })

  const openCreate = () => {
    setEditingFood(null)
    setShowFoodForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-black text-white">Mes Aliments</h3>
          <p className="text-xs text-gray-500">Aliments et recettes personnalisés pour 100g.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Créer un aliment
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : userFoods.length === 0 ? (
        <div className="glass-card text-center py-10">
          <p className="text-sm font-semibold text-white">Aucun aliment personnalisé</p>
          <p className="text-xs text-gray-500 mt-1">Créez vos recettes maison et aliments fréquents.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {userFoods.map(food => {
            const portions = food.portions ? Object.entries(food.portions) : []
            return (
              <div key={food.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-black text-white truncate">{food.name}</h4>
                    <p className="text-sm text-amber-400 font-semibold mt-1">{food.calories} kcal / 100g</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => setEditingFood(food)} className="p-1.5 text-gray-400 hover:text-blue-500">
                      <Edit2 size={15} />
                    </button>
                    <button type="button" onClick={() => { if (window.confirm('Supprimer cet aliment ?')) deleteFoodMutation.mutate(food.id) }} className="p-1.5 text-gray-400 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">P {formatValue(toNumber(food.proteinG))}</span>
                  <span className="text-xs bg-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">G {formatValue(toNumber(food.carbsG))}</span>
                  <span className="text-xs bg-rose-900/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">L {formatValue(toNumber(food.fatG))}</span>
                  <span className="text-xs bg-emerald-900/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">F {formatValue(toNumber(food.fiberG))}</span>
                </div>
                {portions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {portions.map(([unit, portion]) => {
                      const grams = typeof portion === 'object' && portion !== null && 'grams' in portion
                        ? (portion as RichPortion).grams
                        : portion
                      return (
                        <span key={unit} className="text-[10px] rounded-full bg-white/[0.05] text-gray-400 px-2 py-0.5">
                          {unit} ≈ {String(grams)}g
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {(showFoodForm || editingFood) && (
        <UserFoodFormModal
          food={editingFood}
          onClose={() => { setShowFoodForm(false); setEditingFood(null) }}
          isSaving={createFoodMutation.isPending || updateFoodMutation.isPending}
          onSubmit={(payload) => {
            if (editingFood) updateFoodMutation.mutate({ id: editingFood.id, payload })
            else createFoodMutation.mutate(payload)
          }}
        />
      )}
    </div>
  )
}

function AddFoodModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>(null)
  const [mealType, setMealType] = useState<MealType>('LUNCH')
  const [foodItems, setFoodItems] = useState<FoodItemDraft[]>([])
  const [newFood, setNewFood] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newUnit, setNewUnit] = useState('g')
  const [selectedMacros, setSelectedMacros] = useState<SelectedMacros | null>(null)
  const [promptText, setPromptText] = useState('')
  const foodInputRef = useRef<HTMLInputElement>(null)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const withNutrition = foodItems.filter(f => f.hasNutrition)
      const withoutNutrition = foodItems.filter(f => !f.hasNutrition)

      const directPromises = withNutrition.map(f => {
        const factor = computeScale(f.quantity, f.unit, f.portions)
        return api.post('/food-logs', {
          foodItem: f.name,
          mealType,
          quantity: `${f.quantity} ${f.unit}`,
          calories: Math.round((f.calories ?? 0) * factor),
          proteinG: parseFloat(((f.proteinG ?? 0) * factor).toFixed(2)),
          carbsG: parseFloat(((f.carbsG ?? 0) * factor).toFixed(2)),
          fatG: parseFloat(((f.fatG ?? 0) * factor).toFixed(2)),
          fiberG: f.fiberG ? parseFloat((f.fiberG * factor).toFixed(2)) : null,
        })
      })

      const aiPromise = withoutNutrition.length > 0
        ? api.post('/food-logs/quick-add', {
            foods: withoutNutrition.map(f => ({
              name: f.name,
              quantity: f.quantity || null,
              unit: f.unit,
            })),
            mealType,
          })
        : Promise.resolve({ data: [] })

      await Promise.all([...directPromises, aiPromise])
    },
    onSuccess: () => {
      const count = foodItems.length
      toast.success(`${count} aliment${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''} ?`)
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  })

  const fromPromptMutation = useMutation({
    mutationFn: () => api.post('/food-logs/from-prompt', {
      prompt: promptText,
      mealType: mealType || null,
    }),
    onSuccess: (res) => {
      const count = Array.isArray(res.data) ? res.data.length : 1
      toast.success(`${count} aliment${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''} ?`)
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'analyse"),
  })

  const isLoading = saveMutation.isPending || fromPromptMutation.isPending

  const addFoodItem = () => {
    if (!newFood.trim()) return
    setFoodItems(prev => [...prev, {
      name: newFood.trim(),
      quantity: newQty.trim(),
      unit: newUnit,
      hasNutrition: selectedMacros !== null,
      calories: selectedMacros?.calories,
      proteinG: selectedMacros?.proteinG,
      carbsG: selectedMacros?.carbsG,
      fatG: selectedMacros?.fatG,
      fiberG: selectedMacros?.fiberG,
      portions: selectedMacros?.portions,
    }])
    setNewFood('')
    setNewQty('')
    setNewUnit('g')
    setSelectedMacros(null)
    setTimeout(() => foodInputRef.current?.focus(), 0)
  }

  const handleFoodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addFoodItem() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isLoading ? undefined : onClose} />
      <div className="relative bg-white/5 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 border-white/10">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-primary-600" />
            Ajouter un repas
          </h3>
          <button type="button" onClick={onClose} disabled={isLoading}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/[0.05] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Mode selector */}
          {mode === null && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Comment souhaitez-vous enregistrer votre repas ?
              </p>
              <button type="button" onClick={() => setMode('items')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-white/10 border-white/10 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 group-hover:scale-110 transition-transform">
                  <ListPlus size={22} />
                </div>
                <div>
                  <p className="font-semibold text-white">Par aliments</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Entrez les aliments un par un, l'IA calcule automatiquement les nutriments.
                  </p>
                </div>
              </button>

              <button type="button" onClick={() => setMode('prompt')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-white/10 border-white/10 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 group-hover:scale-110 transition-transform">
                  <MessageSquareText size={22} />
                </div>
                <div>
                  <p className="font-semibold text-white">Par description libre</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Décrivez votre repas en quelques mots, l'IA extrait et estime tout.
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Mode: par aliments */}
          {mode === 'items' && (
            <div>
              <button type="button" onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                ? Retour
              </button>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Type de repas</label>
                <select className="input" value={mealType} onChange={e => setMealType(e.target.value as MealType)}>
                  <option value="BREAKFAST">Petit-déjeuner</option>
                  <option value="LUNCH">Déjeuner</option>
                  <option value="DINNER">Dîner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Ajouter un aliment
                </label>
                <div className="flex flex-wrap gap-2">
                  <FoodAutocomplete
                    ref={foodInputRef}
                    value={newFood}
                    onChange={value => { setNewFood(value); setSelectedMacros(null) }}
                    onSelect={item => {
                      const portions = (item as typeof item & { portions?: PortionMap }).portions
                      setNewFood(item.name)
                      setNewQty('100')
                      setNewUnit('g')
                      setSelectedMacros({
                        calories: item.calories,
                        proteinG: item.proteinG,
                        carbsG: item.carbsG,
                        fatG: item.fatG,
                        fiberG: item.fiberG ?? 0,
                        portions: portions ?? undefined,
                      })
                      setTimeout(() => {
                        const qtyInput = document.querySelector<HTMLInputElement>('input[placeholder="Qté"]')
                        qtyInput?.focus()
                        qtyInput?.select()
                      }, 50)
                    }}
                    onEnter={addFoodItem}
                  />
                  <input className="input flex-1 sm:flex-none sm:w-24" value={newQty}
                    onChange={e => setNewQty(e.target.value)} onKeyDown={handleFoodKeyDown}
                    placeholder="Qté" />
                  <select className="input w-24" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                    {foodUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <button type="button" onClick={addFoodItem}
                    className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shrink-0">
                    <Plus size={18} />
                  </button>
                </div>
                {selectedMacros && (() => {
                  const scale = computeScale(newQty || '1', newUnit, selectedMacros?.portions)
                  const gramsPerUnit = getPortionGrams(selectedMacros?.portions, newUnit)
                  const totalG = Math.round((parseFloat(newQty) || 1) * gramsPerUnit)
                  const showEstimatedWeight = newUnit !== 'g' && newUnit !== 'ml' && newUnit !== 'oz'
                  const conf = getPortionConfidence(selectedMacros?.portions, newUnit)
                  const lbl = getPortionLabel(selectedMacros?.portions, newUnit)
                  const portionEntries = selectedMacros?.portions ? Object.entries(selectedMacros.portions) : []
                  const reliablePortions = portionEntries.filter(([unit]) => getPortionConfidence(selectedMacros?.portions, unit) >= 0.5)
                  const estimatedPortions = portionEntries.filter(([unit]) => getPortionConfidence(selectedMacros?.portions, unit) < 0.5)
                  const renderPortionButton = ([unit, portion]: [string, RichPortion | number], estimated = false) => {
                    const grams = typeof portion === 'object' ? portion.grams : portion
                    const label = typeof portion === 'object' ? portion.label : `1 ${unit}`
                    const confidence = typeof portion === 'object' ? portion.confidence : 1.0
                    const isSelected = newUnit === unit
                    return (
                      <button key={unit} type="button"
                        onClick={() => { setNewQty('1'); setNewUnit(unit) }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                          isSelected ? 'bg-primary-600 text-white border-primary-600'
                            : estimated
                              ? 'bg-white/5 text-gray-400 border-white/10 border-dashed hover:border-primary-400'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:border-primary-400'
                        }`}>
                        <span>{label}</span>
                        <span className={isSelected ? 'text-primary-200' : 'text-gray-400'}>≈{grams}g</span>
                        {(estimated || confidence < 0.5) && (
                          <span className="text-yellow-500 text-[10px]">estimé</span>
                        )}
                      </button>
                    )
                  }
                  return (
                    <>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                        ≈ {Math.round(selectedMacros.calories * scale)} kcal
                        {' · '}P {(selectedMacros.proteinG * scale).toFixed(1)}g
                        {' · '}G {(selectedMacros.carbsG * scale).toFixed(1)}g
                        {' · '}L {(selectedMacros.fatG * scale).toFixed(1)}g
                        {selectedMacros.fiberG > 0 && (
                          <> · F {(selectedMacros.fiberG * scale).toFixed(1)}g</>
                        )}
                        <span className="text-gray-500" title={lbl ?? undefined}>
                          {showEstimatedWeight && <> (≈ {totalG}g{conf < 0.5 ? ' estimé' : ''})</>}
                          {' '}(pour {newQty || 1} {newUnit})
                        </span>
                      </p>
                      {portionEntries.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <button type="button"
                            onClick={() => { setNewQty('100'); setNewUnit('g') }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
                              newUnit === 'g' ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-primary-400'
                            }`}>
                            100g
                          </button>
                          {reliablePortions.map(entry => renderPortionButton(entry))}
                          {estimatedPortions.length > 0 && (
                            <>
                              <span className="text-[10px] text-gray-400 mt-1 w-full">Estimations :</span>
                              {estimatedPortions.map(entry => renderPortionButton(entry, true))}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )
                })()}
                <p className="text-xs text-gray-500 mt-1">Appuyez sur Entrée pour ajouter rapidement</p>
              </div>

              {foodItems.length > 0 && (
                <div className="mb-4 rounded-xl border border-white/10 border-white/10 divide-y divide-gray-50 dark:divide-gray-700">
                  {foodItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5">
                      <div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                        {item.hasNutrition && item.calories != null && (() => {
                          const scale = computeScale(item.quantity || '1', item.unit, item.portions)
                          return (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {Math.round(item.calories * scale)} kcal
                              {' · '}P {((item.proteinG ?? 0) * scale).toFixed(1)}g
                              {' · '}G {((item.carbsG ?? 0) * scale).toFixed(1)}g
                              {' · '}L {((item.fatG ?? 0) * scale).toFixed(1)}g
                            </p>
                          )
                        })()}
                        {!item.hasNutrition && (
                          <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
                            ? Valeurs estimées par l'IA
                          </p>
                        )}
                        {item.quantity && (
                          <span className="ml-2 text-xs text-gray-500">· {item.quantity} {item.unit}</span>
                        )}
                      </div>
                      <button type="button" onClick={() => setFoodItems(prev => prev.filter((_, j) => j !== i))}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {foodItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Ajoutez au moins un aliment pour continuer.
                </p>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  {foodItems.some(f => !f.hasNutrition)
                    ? <><div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-primary-600 dark:text-primary-400">L'IA calcule les nutriments…</span></>
                    : <><div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-emerald-600 dark:text-emerald-400">Enregistrement…</span></>
                  }
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary w-full sm:w-auto">Annuler</button>
                <button type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={foodItems.length === 0 || isLoading}
                  className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                  {foodItems.some(f => !f.hasNutrition) ? '? Analyser et sauvegarder' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          )}

          {/* Mode: par description */}
          {mode === 'prompt' && (
            <div>
              <button type="button" onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                ? Retour
              </button>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Type de repas <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <select className="input" value={mealType} onChange={e => setMealType(e.target.value as MealType)}>
                  <option value="BREAKFAST">Petit-déjeuner</option>
                  <option value="LUNCH">Déjeuner</option>
                  <option value="DINNER">Dîner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Décrivez ce que vous avez mangé
                </label>
                <textarea className="input resize-none" rows={4} value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Ex: J'ai mangé une assiette de couscous avec du poulet et une salade verte, plus une banane en dessert" />
                <p className="text-xs text-gray-500 mt-1">
                  L'IA décompose votre repas et estime les valeurs nutritionnelles de chaque aliment.
                </p>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  L'IA analyse votre repas…
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary w-full sm:w-auto">Annuler</button>
                <button type="button"
                  onClick={() => fromPromptMutation.mutate()}
                  disabled={!promptText.trim() || isLoading}
                  className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                  ? Analyser et sauvegarder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FoodLogsPanel() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'logs' | 'myfoods'>('logs')
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [hydrationCount, setHydrationCount] = useState(0)
  const skipHydrationSave = useRef(false)

  const { data: foodLogs = [], isLoading } = useQuery<FoodLog[]>({
    queryKey: ['food-logs'],
    queryFn: () => api.get('/food-logs').then(r => r.data),
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
    setCollapsedMeals(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })

  useEffect(() => {
    skipHydrationSave.current = true
    const stored = window.localStorage.getItem(`hydration-${selectedDate}`)
    setHydrationCount(stored ? Number(stored) || 0 : 0)
  }, [selectedDate])

  useEffect(() => {
    if (skipHydrationSave.current) {
      skipHydrationSave.current = false
      return
    }
    window.localStorage.setItem(`hydration-${selectedDate}`, String(hydrationCount))
  }, [hydrationCount, selectedDate])

  const selectedLogs = useMemo(() =>
    foodLogs.filter(log => log.logDate === selectedDate), [foodLogs, selectedDate]
  )
  const distinctTrackedDays = useMemo(() => new Set(foodLogs.map(log => log.logDate)).size, [foodLogs])
  const totalCaloriesAll = foodLogs.reduce((s, l) => s + toNumber(l.calories), 0)
  const averageCalories = distinctTrackedDays > 0 ? Math.round(totalCaloriesAll / distinctTrackedDays) : 0
  const caloriesTotal = selectedLogs.reduce((s, l) => s + toNumber(l.calories), 0)
  const proteinTotal = selectedLogs.reduce((s, l) => s + toNumber(l.proteinG), 0)
  const carbsTotal = selectedLogs.reduce((s, l) => s + toNumber(l.carbsG), 0)
  const fatTotal = selectedLogs.reduce((s, l) => s + toNumber(l.fatG), 0)
  const fiberTotal = selectedLogs.reduce((s, l) => s + toNumber(l.fiberG), 0)
  const visibleMealTypes = mealOrder.filter(m => selectedLogs.some(l => (l.mealType ?? 'SNACK') === m))
  const allCollapsed = visibleMealTypes.every(m => collapsedMeals.has(m))

  const handleModalSuccess = () => {
    qc.invalidateQueries({ queryKey: ['food-logs'] })
    qc.invalidateQueries({ queryKey: ['timeline'] })
    setShowModal(false)
  }

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement…</div>

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-black text-white text-2xl flex items-center gap-2">
            <UtensilsCrossed className="text-primary-600" />
            Alimentation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {foodLogs.length} repas · {distinctTrackedDays} jours trackés · {averageCalories} kcal/jour moy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {activeTab === 'logs' && <StreakBadge logs={foodLogs} />}
        {activeTab === 'logs' && (
          <button type="button" onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm font-medium">
            <Plus size={16} /> Ajouter
          </button>
        )}
        {activeTab === 'logs' && visibleMealTypes.length > 0 && (
          <button type="button"
            onClick={() => setCollapsedMeals(allCollapsed ? new Set() : new Set(visibleMealTypes))}
            className="text-xs text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-normal transition-colors">
            {allCollapsed ? 'Tout développer' : 'Tout réduire'}
          </button>
        )}
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06] w-fit">
        {([
          ['logs', 'Journal'],
          ['myfoods', 'Mes Aliments'],
        ] as const).map(([tab, label]) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'myfoods' && <MyFoodsView />}

      {activeTab === 'logs' && (
        <>

      {foodLogs.length === 0 && (
        <EmptyPanel
          illustration={<IllustrationFood />}
          gradient="from-green-600 to-teal-400"
          headline="Prends soin de ton alimentation"
          description="Suis tes calories, protéines, glucides et lipides. SmartLife calcule tout automatiquement."
          preview={
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">??</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Déjeuner</span>
                <span className="ml-auto text-xs text-gray-400">500 kcal</span>
              </div>
              <div className="space-y-2">
                {[['Poulet grillé', '320 kcal'], ['Riz basmati', '180 kcal']].map(([name, cal]) => (
                  <div key={name} className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-1.5">
                    <span className="text-sm text-green-800 dark:text-green-300">{name}</span>
                    <span className="text-xs text-green-600 dark:text-green-400">{cal}</span>
                  </div>
                ))}
              </div>
            </div>
          }
          primaryLabel="+ Enregistrer mon premier repas"
          onPrimary={() => setShowModal(true)}
        />
      )}

      {foodLogs.length > 0 && (
        <>
          <WeeklyCalorieChart
            logs={foodLogs}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            goal={dailyGoals.calories}
          />

          <HydrationWidget count={hydrationCount} onChange={setHydrationCount} />

          <NutritionDashboard
            calories={caloriesTotal}
            protein={proteinTotal}
            carbs={carbsTotal}
            fat={fatTotal}
            fiber={fiberTotal}
            goals={dailyGoals}
          />

          <div className="w-full">
            {mealOrder.map(mealType => {
              const logs = selectedLogs.filter(l => (l.mealType ?? 'SNACK') === mealType)
              if (logs.length === 0) return null
              const totalCal = logs.reduce((s, l) => s + toNumber(l.calories), 0)
              return (
                <section key={mealType} className="mb-4 glass-card border-white/10  overflow-hidden">
                  <div className={`flex items-center justify-between px-4 py-3 border-b border-white/[0.06] cursor-pointer select-none ${headerBg[mealType]} ${headerBorder[mealType]}`}
                    onClick={() => toggleMeal(mealType)}>
                    <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                      {collapsedMeals.has(mealType)
                        ? <ChevronRight size={15} className="text-gray-500" />
                        : <ChevronDown size={15} className="text-gray-500" />}
                      <span className={`w-2.5 h-2.5 rounded-full ${mealDots[mealType]}`} />
                      {mealLabels[mealType]}
                      <span className="text-xs font-normal text-gray-500">{logs.length} repas</span>
                    </h3>
                    <span className="text-sm font-semibold text-gray-400">{Math.round(totalCal)} kcal</span>
                  </div>
                  {!collapsedMeals.has(mealType) && (
                    <div className="px-4">
                      {logs.map(log => (
                        <FoodLogRow key={log.id} log={log} onDelete={id => deleteMutation.mutate(id)} />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}

      {showModal && (
        <AddFoodModal
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
        </>
      )}
    </div>
  )
}
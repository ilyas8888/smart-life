import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown, ChevronRight, ChevronUp, Dumbbell, Flame,
  ListPlus, MessageSquareText, Plus, Trash2, UtensilsCrossed, X,
} from 'lucide-react'
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

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
type Mode = null | 'items' | 'prompt'

const dailyGoals = { calories: 2000, proteinG: 50, carbsG: 250, fatG: 70, fiberG: 25 }
const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
const mealLabels: Record<string, string> = {
  BREAKFAST: 'Petit-déjeuner', LUNCH: 'Déjeuner', DINNER: 'Dîner', SNACK: 'Snack',
}
const mealDots: Record<string, string> = {
  BREAKFAST: 'bg-yellow-400', LUNCH: 'bg-green-500', DINNER: 'bg-blue-500', SNACK: 'bg-gray-400',
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
const formatValue = (value: number, unit = 'g') => `${Math.round(value * 10) / 10}${unit}`
const progressColor = (percent: number) =>
  percent > 100 ? 'bg-red-500' : percent >= 80 ? 'bg-yellow-500' : 'bg-green-500'
const todayString = () => new Date().toISOString().split('T')[0]
const yesterdayString = () => {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
}
function dayLabel(date: string) {
  if (date === todayString()) return "Aujourd'hui"
  if (date === yesterdayString()) return 'Hier'
  return format(new Date(`${date}T00:00:00`), 'dd MMM', { locale: fr })
}
function hasDetails(details: FoodLog['nutritionDetails']) {
  return Object.entries(details ?? {}).filter(([, v]) => v !== null && v !== '').length > 0
}
function detailsEntries(details: FoodLog['nutritionDetails']) {
  return Object.entries(details ?? {}).filter(([, v]) => v !== null && v !== '')
}

function MacroCard({ label, value, goal, unit, icon: Icon }: {
  label: string; value: number; goal: number; unit: string; icon: typeof Flame
}) {
  const percent = goal > 0 ? (value / goal) * 100 : 0
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
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600"><Icon size={20} /></div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
        <div className={`h-full rounded-full ${progressColor(percent)}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  )
}

function FoodLogRow({ log, onDelete }: { log: FoodLog; onDelete: (id: number) => void }) {
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
            <button type="button" onClick={() => setIsExpanded(v => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Détails nutritionnels {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
        <div className="shrink-0 flex items-start gap-2">
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">
            {Math.round(toNumber(log.calories))} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">kcal</span>
          </p>
          <button type="button" onClick={() => onDelete(log.id)}
            className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors mt-0.5">
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

function AddFoodModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>(null)
  const [mealType, setMealType] = useState<MealType>('LUNCH')
  const [foodItems, setFoodItems] = useState<{ name: string; quantity: string }[]>([])
  const [newFood, setNewFood] = useState('')
  const [newQty, setNewQty] = useState('')
  const [promptText, setPromptText] = useState('')
  const foodInputRef = useRef<HTMLInputElement>(null)

  const quickAddMutation = useMutation({
    mutationFn: () => api.post('/food-logs/quick-add', {
      foods: foodItems.map(f => ({ name: f.name, quantity: f.quantity || null })),
      mealType,
    }),
    onSuccess: (res) => {
      const count = Array.isArray(res.data) ? res.data.length : 1
      toast.success(`${count} aliment${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''} ✓`)
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'analyse"),
  })

  const fromPromptMutation = useMutation({
    mutationFn: () => api.post('/food-logs/from-prompt', {
      prompt: promptText,
      mealType: mealType || null,
    }),
    onSuccess: (res) => {
      const count = Array.isArray(res.data) ? res.data.length : 1
      toast.success(`${count} aliment${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''} ✓`)
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'analyse"),
  })

  const isLoading = quickAddMutation.isPending || fromPromptMutation.isPending

  const addFoodItem = () => {
    if (!newFood.trim()) return
    setFoodItems(prev => [...prev, { name: newFood.trim(), quantity: newQty.trim() }])
    setNewFood('')
    setNewQty('')
    setTimeout(() => foodInputRef.current?.focus(), 0)
  }

  const handleFoodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addFoodItem() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isLoading ? undefined : onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-primary-600" />
            Ajouter un repas
          </h3>
          <button type="button" onClick={onClose} disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Mode selector */}
          {mode === null && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Comment souhaitez-vous enregistrer votre repas ?
              </p>
              <button type="button" onClick={() => setMode('items')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 group-hover:scale-110 transition-transform">
                  <ListPlus size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Par aliments</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Entrez les aliments un par un, l'IA calcule automatiquement les nutriments.
                  </p>
                </div>
              </button>

              <button type="button" onClick={() => setMode('prompt')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 group-hover:scale-110 transition-transform">
                  <MessageSquareText size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Par description libre</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
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
                ← Retour
              </button>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type de repas</label>
                <select className="input" value={mealType} onChange={e => setMealType(e.target.value as MealType)}>
                  <option value="BREAKFAST">Petit-déjeuner</option>
                  <option value="LUNCH">Déjeuner</option>
                  <option value="DINNER">Dîner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ajouter un aliment
                </label>
                <div className="flex gap-2">
                  <input ref={foodInputRef} className="input flex-1" value={newFood}
                    onChange={e => setNewFood(e.target.value)} onKeyDown={handleFoodKeyDown}
                    placeholder="Ex: Poulet grillé" />
                  <input className="input w-24" value={newQty}
                    onChange={e => setNewQty(e.target.value)} onKeyDown={handleFoodKeyDown}
                    placeholder="Qté" />
                  <button type="button" onClick={addFoodItem}
                    className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shrink-0">
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Appuyez sur Entrée pour ajouter rapidement</p>
              </div>

              {foodItems.length > 0 && (
                <div className="mb-4 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
                  {foodItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5">
                      <div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                        {item.quantity && (
                          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">· {item.quantity}</span>
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
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Ajoutez au moins un aliment pour continuer.
                </p>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 mb-3">
                  <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  L'IA calcule les nutriments…
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Annuler</button>
                <button type="button"
                  onClick={() => quickAddMutation.mutate()}
                  disabled={foodItems.length === 0 || isLoading}
                  className="btn-primary flex items-center gap-2">
                  ✨ Analyser et sauvegarder
                </button>
              </div>
            </div>
          )}

          {/* Mode: par description */}
          {mode === 'prompt' && (
            <div>
              <button type="button" onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                ← Retour
              </button>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Décrivez ce que vous avez mangé
                </label>
                <textarea className="input resize-none" rows={4} value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Ex: J'ai mangé une assiette de couscous avec du poulet et une salade verte, plus une banane en dessert" />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  L'IA décompose votre repas et estime les valeurs nutritionnelles de chaque aliment.
                </p>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  L'IA analyse votre repas…
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Annuler</button>
                <button type="button"
                  onClick={() => fromPromptMutation.mutate()}
                  disabled={!promptText.trim() || isLoading}
                  className="btn-primary flex items-center gap-2">
                  ✨ Analyser et sauvegarder
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
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)

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

  const dates = useMemo(() =>
    Array.from(new Set(foodLogs.map(log => log.logDate))).sort((a, b) => b.localeCompare(a)),
    [foodLogs]
  )

  useEffect(() => {
    if (dates.length === 0) return
    if (!dates.includes(selectedDate))
      setSelectedDate(dates.includes(todayString()) ? todayString() : dates[0])
  }, [dates, selectedDate])

  const selectedLogs = useMemo(() =>
    foodLogs.filter(log => log.logDate === selectedDate), [foodLogs, selectedDate]
  )

  const caloriesTotal = selectedLogs.reduce((s, l) => s + toNumber(l.calories), 0)
  const proteinTotal = selectedLogs.reduce((s, l) => s + toNumber(l.proteinG), 0)
  const carbsTotal = selectedLogs.reduce((s, l) => s + toNumber(l.carbsG), 0)
  const fatTotal = selectedLogs.reduce((s, l) => s + toNumber(l.fatG), 0)
  const fiberTotal = selectedLogs.reduce((s, l) => s + toNumber(l.fiberG), 0)
  const fiberPercent = dailyGoals.fiberG > 0 ? (fiberTotal / dailyGoals.fiberG) * 100 : 0
  const visibleMealTypes = mealOrder.filter(m => selectedLogs.some(l => (l.mealType ?? 'SNACK') === m))
  const allCollapsed = visibleMealTypes.every(m => collapsedMeals.has(m))

  const handleModalSuccess = () => {
    qc.invalidateQueries({ queryKey: ['food-logs'] })
    qc.invalidateQueries({ queryKey: ['timeline'] })
    setShowModal(false)
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement…</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <UtensilsCrossed className="text-primary-600" />
        Alimentation ({foodLogs.length})
        <button type="button" onClick={() => setShowModal(true)}
          className="btn-primary ml-2 flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Ajouter
        </button>
        {visibleMealTypes.length > 0 && (
          <button type="button"
            onClick={() => setCollapsedMeals(allCollapsed ? new Set() : new Set(visibleMealTypes))}
            className="ml-auto text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-normal transition-colors">
            {allCollapsed ? 'Tout développer' : 'Tout réduire'}
          </button>
        )}
      </h2>

      {foodLogs.length === 0 && (
        <div className="text-center py-16">
          <UtensilsCrossed size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun repas enregistré aujourd'hui.</p>
          <button type="button" onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Ajouter votre premier repas
          </button>
        </div>
      )}

      {foodLogs.length > 0 && (
        <>
          <div className="overflow-x-auto flex gap-2 mb-6">
            {dates.map(date => (
              <button key={date} type="button" onClick={() => setSelectedDate(date)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDate === date
                    ? 'bg-slate-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}>
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
                  {formatValue(fiberTotal)} / {dailyGoals.fiberG}g
                </p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${progressColor(fiberPercent)}`}
                  style={{ width: `${Math.min(fiberPercent, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="max-w-4xl">
            {mealOrder.map(mealType => {
              const logs = selectedLogs.filter(l => (l.mealType ?? 'SNACK') === mealType)
              if (logs.length === 0) return null
              const totalCal = logs.reduce((s, l) => s + toNumber(l.calories), 0)
              return (
                <section key={mealType} className="mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer select-none ${headerBg[mealType]}`}
                    onClick={() => toggleMeal(mealType)}>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      {collapsedMeals.has(mealType)
                        ? <ChevronRight size={15} className="text-gray-400 dark:text-gray-500" />
                        : <ChevronDown size={15} className="text-gray-400 dark:text-gray-500" />}
                      <span className={`w-2.5 h-2.5 rounded-full ${mealDots[mealType]}`} />
                      {mealLabels[mealType]}
                      <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{logs.length} repas</span>
                    </h3>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{Math.round(totalCal)} kcal</span>
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
    </div>
  )
}

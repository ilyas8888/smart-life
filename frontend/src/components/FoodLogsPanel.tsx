import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Utensils } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface FoodLog {
  id: number
  logDate: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | string | null
  foodItem: string
  calories: number | null
  notes: string | null
  loggedAt: string
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

export default function FoodLogsPanel() {
  const qc = useQueryClient()
  const { data: foodLogs = [], isLoading } = useQuery<FoodLog[]>({
    queryKey: ['food-logs'],
    queryFn: () => api.get('/food-logs').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/food-logs/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['food-logs'] }); toast.success('Repas supprime') },
  })

  const groupedLogs = useMemo(() => {
    return foodLogs.reduce<Record<string, FoodLog[]>>((groups, log) => {
      const key = log.logDate
      groups[key] = groups[key] ?? []
      groups[key].push(log)
      return groups
    }, {})
  }, [foodLogs])

  if (isLoading) return <div className="text-center py-12 text-gray-400">Chargement...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Utensils className="text-primary-600" />
        Alimentation ({foodLogs.length})
      </h2>

      {foodLogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Utensils size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun repas enregistre. Utilisez le prompt IA pour ajouter votre alimentation.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <section key={date}>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                {format(new Date(date), 'dd MMM yyyy', { locale: fr })} ({logs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logs.map((log) => {
                  const mealType = log.mealType ?? 'SNACK'
                  return (
                    <div key={log.id} className="card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mealColors[mealType] ?? mealColors.SNACK}`}>
                              {mealLabels[mealType] ?? mealType}
                            </span>
                            {log.calories !== null && (
                              <span className="text-xs text-gray-400">{log.calories} kcal</span>
                            )}
                          </div>
                          <p className="font-medium text-gray-900">{log.foodItem}</p>
                          {log.notes && <p className="text-sm text-gray-500 mt-1">{log.notes}</p>}
                        </div>
                        <button
                          onClick={() => deleteMutation.mutate(log.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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

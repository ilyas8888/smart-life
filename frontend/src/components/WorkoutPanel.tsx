import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dumbbell, Plus, Trash2, ChevronDown, ChevronUp, Flame, Clock, X } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface WorkoutExercise {
  id: number
  name: string
  sets: number | null
  reps: number | null
  weightKg: number | null
  durationSeconds: number | null
}

interface WorkoutSession {
  id: number
  title: string
  sessionDate: string
  durationMinutes: number | null
  caloriesBurned: number | null
  notes: string | null
  exercises: WorkoutExercise[]
}

interface ExerciseForm {
  name: string
  sets: string
  reps: string
  weightKg: string
  durationSeconds: string
}

const emptyExercise = (): ExerciseForm => ({ name: '', sets: '', reps: '', weightKg: '', durationSeconds: '' })

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? (s > 0 ? `${m}min ${s}s` : `${m}min`) : `${s}s`
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

export default function WorkoutPanel() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseForm[]>([emptyExercise()])

  const { data: sessions = [], isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ['workouts'],
    queryFn: () => api.get('/workouts').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/workouts', {
        title,
        durationMinutes: duration ? parseInt(duration) : null,
        caloriesBurned: calories ? parseInt(calories) : null,
        notes: notes || null,
        exercises: exercises
          .filter((e) => e.name.trim())
          .map((e) => ({
            name: e.name.trim(),
            sets: e.sets ? parseInt(e.sets) : null,
            reps: e.reps ? parseInt(e.reps) : null,
            weightKg: e.weightKg ? parseFloat(e.weightKg) : null,
            durationSeconds: e.durationSeconds ? parseInt(e.durationSeconds) : null,
          })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      setTitle('')
      setDuration('')
      setCalories('')
      setNotes('')
      setExercises([emptyExercise()])
      setShowForm(false)
      toast.success('Séance enregistrée')
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/workouts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); toast.success('Séance supprimée') },
  })

  const addExercise = () => setExercises((prev) => [...prev, emptyExercise()])
  const removeExercise = (i: number) => setExercises((prev) => prev.filter((_, idx) => idx !== i))
  const updateExercise = (i: number, field: keyof ExerciseForm, value: string) =>
    setExercises((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate()
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Dumbbell className="text-amber-500" />
          Sport & Entraînement
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Nouvelle séance
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Nouvelle séance</p>

          <input
            type="text"
            placeholder="Titre de la séance (ex: Muscu dos/biceps, Course 5km...)"
            className="input mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="relative">
              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                placeholder="Durée (min)"
                className="input pl-8"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
              />
            </div>
            <div className="relative">
              <Flame size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                placeholder="Calories brûlées"
                className="input pl-8"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Exercices</p>
              <button type="button" onClick={addExercise} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Exercice (ex: Squat)"
                      className="input col-span-2 text-sm"
                      value={ex.name}
                      onChange={(e) => updateExercise(i, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Séries"
                      className="input text-sm"
                      value={ex.sets}
                      onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Répétitions"
                      className="input text-sm"
                      value={ex.reps}
                      onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Poids (kg)"
                      className="input text-sm"
                      value={ex.weightKg}
                      onChange={(e) => updateExercise(i, 'weightKg', e.target.value)}
                      min="0"
                      step="0.5"
                    />
                    <input
                      type="number"
                      placeholder="Durée (sec)"
                      className="input text-sm"
                      value={ex.durationSeconds}
                      onChange={(e) => updateExercise(i, 'durationSeconds', e.target.value)}
                      min="1"
                    />
                  </div>
                  {exercises.length > 1 && (
                    <button type="button" onClick={() => removeExercise(i)} className="p-1 text-gray-300 hover:text-red-400 mt-1">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Notes (facultatif)"
            className="input resize-none min-h-[60px] mb-4 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary text-sm"
              disabled={!title.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune séance enregistrée.</p>
          <p className="text-sm mt-1">Ajoutez votre première séance ou décrivez-la dans le Prompt IA !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isExpanded = expandedId === s.id
            return (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{s.title}</p>
                      {s.durationMinutes && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={11} /> {s.durationMinutes}min
                        </span>
                      )}
                      {s.caloriesBurned && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <Flame size={11} /> {s.caloriesBurned} kcal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {format(new Date(s.sessionDate), 'EEEE dd MMMM yyyy', { locale: fr })}
                      {s.exercises.length > 0 && ` · ${s.exercises.length} exercice${s.exercises.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.exercises.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(s.id)}
                      className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && s.exercises.length > 0 && (
                  <ul className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                    {s.exercises.map((ex) => <ExerciseLine key={ex.id} ex={ex} />)}
                  </ul>
                )}

                {s.notes && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">{s.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

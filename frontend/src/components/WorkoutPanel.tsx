import { useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dumbbell, Plus, Trash2, ChevronDown, ChevronUp, Flame, Clock, X, MessageSquareText, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface WorkoutExercise { id: number; name: string; sets: number | null; reps: number | null; weightKg: number | null; durationSeconds: number | null }
interface WorkoutSession { id: number; title: string; sessionDate: string; durationMinutes: number | null; caloriesBurned: number | null; notes: string | null; exercises: WorkoutExercise[] }
interface ExerciseForm { name: string; sets: string; reps: string; weightKg: string; durationSeconds: string }
type Mode = null | 'guided' | 'prompt'

const SPORT_PRESETS = [
  { label: 'Muscu', emoji: '', rate: 5 },
  { label: 'Course', emoji: '', rate: 10 },
  { label: 'Vélo', emoji: '', rate: 8 },
  { label: 'Natation', emoji: '', rate: 9 },
  { label: 'Yoga', emoji: '', rate: 3 },
  { label: 'Marche', emoji: '', rate: 4 },
  { label: 'Football', emoji: '⚽', rate: 8 },
  { label: 'Tennis', emoji: '', rate: 7 },
  { label: 'Boxe', emoji: '', rate: 9 },
  { label: 'CrossFit', emoji: '️', rate: 11 },
]

const emptyExercise = (): ExerciseForm => ({ name: '', sets: '', reps: '', weightKg: '', durationSeconds: '' })
function formatDuration(seconds: number) { const m = Math.floor(seconds / 60); const s = seconds % 60; return m > 0 ? (s > 0 ? `${m}min ${s}s` : `${m}min`) : `${s}s` }

function todayString() { return new Date().toISOString().split('T')[0] }
function yesterdayString() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }
function dayLabel(date: string) {
  if (date === todayString()) return "Aujourd'hui"
  if (date === yesterdayString()) return 'Hier'
  return format(new Date(`${date}T00:00:00`), 'dd MMM', { locale: fr })
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

function AddWorkoutModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const qc = useQueryClient()
  const [mode, setMode] = useState<Mode>(null)
  const [sportLabel, setSportLabel] = useState('')
  const [customSport, setCustomSport] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [caloriesOverride, setCaloriesOverride] = useState('')
  const [showCaloriesOverride, setShowCaloriesOverride] = useState(false)
  const [exercises, setExercises] = useState<ExerciseForm[]>([emptyExercise()])
  const [showExercises, setShowExercises] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [notes, setNotes] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  const selectedRate = SPORT_PRESETS.find(p => p.label === sportLabel)?.rate ?? 6
  const activeSport = sportLabel === 'Autre' ? customSport.trim() : sportLabel
  const durationValue = parseInt(durationMinutes) || 0
  const estimatedCalories = selectedRate * durationValue
  const caloriesDisplayed = caloriesOverride ? parseInt(caloriesOverride) : estimatedCalories

  const guidedMutation = useMutation({
    mutationFn: () => api.post('/workouts', {
      title: `${activeSport}${durationMinutes ? ` — ${durationMinutes}min` : ''}`,
      durationMinutes: parseInt(durationMinutes) || null,
      caloriesBurned: caloriesDisplayed || null,
      notes: notes || null,
      exercises: exercises.filter(e => e.name.trim()).map(e => ({
        name: e.name,
        sets: e.sets ? parseInt(e.sets) : null,
        reps: e.reps ? parseInt(e.reps) : null,
        weightKg: e.weightKg ? parseFloat(e.weightKg) : null,
        durationSeconds: e.durationSeconds ? parseInt(e.durationSeconds) : null,
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Séance enregistrée')
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  })

  const promptMutation = useMutation({
    mutationFn: () => api.post('/workouts/from-prompt', { prompt: promptText }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Séance enregistrée')
      onSuccess()
    },
    onError: () => toast.error("Erreur lors de l'analyse"),
  })

  const isLoading = guidedMutation.isPending || promptMutation.isPending
  const canSaveGuided = Boolean(activeSport) && Boolean(durationMinutes)
  const addExercise = () => setExercises(prev => [...prev, emptyExercise()])
  const removeExercise = (index: number) => setExercises(prev => prev.filter((_, i) => i !== index))
  const updateExercise = (index: number, field: keyof ExerciseForm, value: string) =>
    setExercises(prev => prev.map((exercise, i) => i === index ? { ...exercise, [field]: value } : exercise))

  const selectSport = (label: string) => {
    setSportLabel(label)
    if (label === 'Autre') setTimeout(() => customInputRef.current?.focus(), 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isLoading ? undefined : onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Dumbbell size={20} className="text-amber-500" />
            Nouvelle séance
          </h3>
          <button type="button" onClick={onClose} disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {mode === null && (
            <div className="space-y-3">
              <button type="button" onClick={() => setMode('guided')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 group-hover:scale-110 transition-transform">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Par activité</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Choisissez le sport et la durée, les calories sont estimées automatiquement.
                  </p>
                </div>
              </button>
              <button type="button" onClick={() => setMode('prompt')}
                className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 group-hover:scale-110 transition-transform">
                  <MessageSquareText size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Par description</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Décrivez votre séance, l'IA extrait tout automatiquement.
                  </p>
                </div>
              </button>
            </div>
          )}

          {mode === 'guided' && (
            <div>
              <button type="button" onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                ← Retour
              </button>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'activité</label>
                <div className="grid grid-cols-5 gap-2">
                  {SPORT_PRESETS.map(preset => (
                    <button key={preset.label} type="button" onClick={() => selectSport(preset.label)}
                      className={`min-h-14 rounded-xl border-2 px-1.5 py-2 text-xs font-medium transition-colors ${
                        sportLabel === preset.label
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300'
                      }`}>
                      {preset.emoji && <span className="block text-base leading-none mb-1">{preset.emoji}</span>}
                      {preset.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => selectSport('Autre')}
                    className={`min-h-14 rounded-xl border-2 px-1.5 py-2 text-xs font-medium transition-colors ${
                      sportLabel === 'Autre'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300'
                    }`}>
                    Autre
                  </button>
                </div>
                {sportLabel === 'Autre' && (
                  <input ref={customInputRef} className="input mt-3" value={customSport}
                    onChange={e => setCustomSport(e.target.value)} placeholder="Nom de l'activité" />
                )}
              </div>

              <div className="relative mb-4">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" placeholder="Durée (min)" className="input pl-8" value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)} min="1" />
              </div>

              <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Flame size={15} /> ≈ {Number.isFinite(caloriesDisplayed) ? caloriesDisplayed : 0} kcal estimées
                  </p>
                  <button type="button" onClick={() => setShowCaloriesOverride(v => !v)}
                    className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline">
                    Modifier
                  </button>
                </div>
                {showCaloriesOverride && (
                  <input type="number" className="input mt-2" value={caloriesOverride}
                    onChange={e => setCaloriesOverride(e.target.value)} min="0" placeholder="Calories brûlées" />
                )}
              </div>

              <button type="button" onClick={() => setShowExercises(v => !v)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Ajouter des exercices (facultatif)
                {showExercises ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showExercises && (
                <div className="space-y-2 mb-4">
                  {exercises.map((exercise, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                      <div className="flex gap-2">
                        <input className="input flex-1 text-sm" value={exercise.name}
                          onChange={e => updateExercise(i, 'name', e.target.value)} placeholder="Nom exercice" />
                        {exercises.length > 1 && (
                          <button type="button" onClick={() => removeExercise(i)}
                            className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <input type="number" className="input text-sm" value={exercise.sets}
                          onChange={e => updateExercise(i, 'sets', e.target.value)} placeholder="Séries" min="1" />
                        <input type="number" className="input text-sm" value={exercise.reps}
                          onChange={e => updateExercise(i, 'reps', e.target.value)} placeholder="Reps" min="1" />
                        <input type="number" className="input text-sm" value={exercise.weightKg}
                          onChange={e => updateExercise(i, 'weightKg', e.target.value)} placeholder="Poids" min="0" step="0.5" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addExercise}
                    className="w-full rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-2 text-sm text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-1">
                    <Plus size={14} /> Ajouter une ligne
                  </button>
                </div>
              )}

              <textarea className="input resize-none min-h-[70px] mb-4 text-sm" value={notes}
                onChange={e => setNotes(e.target.value)} placeholder="Notes (optionnel)" />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Annuler</button>
                <button type="button" onClick={() => guidedMutation.mutate()} disabled={!canSaveGuided || isLoading}
                  className="btn-primary">Enregistrer la séance</button>
              </div>
            </div>
          )}

          {mode === 'prompt' && (
            <div>
              <button type="button" onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 flex items-center gap-1">
                ← Retour
              </button>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Décrivez votre séance</label>
              <textarea className="input resize-none mb-4" rows={5} value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Ex: J'ai fait 45min de muscu, dos et biceps. Tractions 4×10, Rowing 4×12 à 60kg. Puis 20min de vélo." />
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-3">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  L'IA analyse votre séance…
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Annuler</button>
                <button type="button" onClick={() => promptMutation.mutate()} disabled={!promptText.trim() || isLoading}
                  className="btn-primary flex items-center gap-2">✨ Analyser et sauvegarder</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkoutPanel() {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: sessions = [], isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ['workouts'],
    queryFn: () => api.get('/workouts').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/workouts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      toast.success('Séance supprimée')
    },
  })

  const dates = useMemo(() =>
    Array.from(new Set(sessions.map(s => s.sessionDate))).sort((a, b) => b.localeCompare(a)),
    [sessions]
  )

  const weeklyStats = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    const recent = sessions.filter(session => new Date(`${session.sessionDate}T00:00:00`) >= start)
    return {
      totalSessions: recent.length,
      totalMinutes: recent.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      totalCalories: recent.reduce((sum, session) => sum + (session.caloriesBurned ?? 0), 0),
    }
  }, [sessions])

  const sessionsToShow = useMemo(() =>
    selectedDate ? sessions.filter(s => s.sessionDate === selectedDate) : sessions,
    [selectedDate, sessions]
  )

  const handleSuccess = () => {
    qc.invalidateQueries({ queryKey: ['workouts'] })
    qc.invalidateQueries({ queryKey: ['timeline'] })
    setShowModal(false)
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Dumbbell className="text-amber-500" />
          Sport & Entraînement ({sessions.length})
        </h2>
        <button type="button" onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Nouvelle séance
        </button>
      </div>

      {sessions.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-3 py-1.5 text-sm font-medium">
              {weeklyStats.totalSessions} séance{weeklyStats.totalSessions > 1 ? 's' : ''} cette semaine
            </span>
            <span className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium">
              {Math.floor(weeklyStats.totalMinutes / 60)}h {weeklyStats.totalMinutes % 60}min
            </span>
            <span className="rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm font-medium">
              {weeklyStats.totalCalories} kcal brûlées
            </span>
          </div>

          <div className="overflow-x-auto flex gap-2 mb-6">
            <button type="button" onClick={() => setSelectedDate(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDate === null
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}>
              Toutes
            </button>
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
        </>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune séance enregistrée.</p>
          <button type="button" onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Ajouter votre première séance
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessionsToShow.map((s) => {
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
                      {format(new Date(`${s.sessionDate}T00:00:00`), 'EEEE dd MMMM yyyy', { locale: fr })}
                      {s.exercises.length > 0 && ` · ${s.exercises.length} exercice${s.exercises.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.exercises.length > 0 && (
                      <button type="button" onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                    <button type="button" onClick={() => deleteMutation.mutate(s.id)}
                      className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors">
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

      {showModal && <AddWorkoutModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
    </div>
  )
}

import { useMemo, useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Trash2, Clock, Plus, Flag, Edit2, X, Search, AlertTriangle, Play, RotateCcw, Check } from 'lucide-react'
import { EmptyPanel, IllustrationTasks } from './EmptyState'
import { format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DateTimePicker from './DateTimePicker'

const TASK_CATEGORIES = {
  PERSONAL: { label: 'Personnel', emoji: '', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  WORK: { label: 'Travail', emoji: '', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  SCHOOL: { label: 'École', emoji: '', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  FREELANCE: { label: 'Freelance', emoji: '', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  HEALTH: { label: 'Santé', emoji: '❤️', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  LEARNING: { label: 'Apprentissage', emoji: '', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  SOCIAL: { label: 'Social', emoji: '', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  PRODUCTIVITY: { label: 'Productivité', emoji: '⚡', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
}

interface Task {
  id: number
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  category?: string
  dueDate: string | null
  createdAt: string
}

const PRIORITY = {
  HIGH: { label: 'Haute', strip: 'border-l-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  MEDIUM: { label: 'Moyenne', strip: 'border-l-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  LOW: { label: 'Basse', strip: 'border-l-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
} satisfies Record<Task['priority'], { label: string; strip: string; badge: string }>

const STATUS_LABEL = { TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Terminé' }
const STATUS_NEXT: Record<Task['status'], Task['status']> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' }
const STATUS_COLORS = {
  TODO: 'text-gray-500 dark:text-gray-400',
  IN_PROGRESS: 'text-yellow-600 dark:text-yellow-400',
  DONE: 'text-green-600 dark:text-green-400',
}
type TaskCategory = keyof typeof TASK_CATEGORIES
type SortBy = 'date' | 'priority' | 'category'

const CATEGORY_KEYS = Object.keys(TASK_CATEGORIES) as TaskCategory[]
const PRIORITY_ORDER: Record<Task['priority'], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function toInputDateTime(value: string | null) {
  return value ? value.slice(0, 16) : ''
}

function priorityOf(task: Task) {
  return PRIORITY[task.priority ?? 'MEDIUM'] ?? PRIORITY.MEDIUM
}

function categoryOf(task: Task) {
  const key = (task.category ?? 'PERSONAL') as TaskCategory
  return TASK_CATEGORIES[key] ?? TASK_CATEGORIES.PERSONAL
}

function CategoryPicker({ value, onChange }: { value: string; onChange: (category: string) => void }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Catégorie</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORY_KEYS.map(category => {
          const meta = TASK_CATEGORIES[category]
          const selected = value === category
          return (
            <button key={category} type="button" onClick={() => onChange(category)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selected ? meta.color : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
              }`}>
              {meta.emoji && <span>{meta.emoji}</span>}
              <span>{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TaskEditModal({
  task, onClose, onSaved,
}: {
  task: Task
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<Task['priority']>(task.priority ?? 'MEDIUM')
  const [status, setStatus] = useState<Task['status']>(task.status)
  const [category, setCategory] = useState(task.category ?? 'PERSONAL')
  const [dueDate, setDueDate] = useState(toInputDateTime(task.dueDate))
  const [saving, setSaving] = useState(false)

  const save = () => {
    if (!title.trim()) return
    setSaving(true)
    api.put(`/tasks/${task.id}`, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      category,
      dueDate: dueDate || null,
    })
      .then(() => {
        onSaved()
        toast.success('Tâche mise à jour')
        onClose()
      })
      .catch(() => toast.error('Erreur lors de la mise à jour'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Modifier</p>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Tâche</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" />
          <textarea className="input min-h-[90px] resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnel)" />
          <DateTimePicker value={dueDate} onChange={setDueDate} placeholder="Choisir une date et heure..." />
          <CategoryPicker value={category} onChange={setCategory} />
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Priorité</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY) as Task['priority'][]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Statut</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABEL) as Task['status'][]).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${status === s ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Annuler</button>
            <button type="button" onClick={save} disabled={!title.trim() || saving} className="btn-primary w-full sm:w-auto">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TasksPanel() {
  const qc = useQueryClient()
  const [formExpanded, setFormExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM')
  const [newCategory, setNewCategory] = useState('PERSONAL')
  const [dueDate, setDueDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortAsc, setSortAsc] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/tasks', {
        title,
        description: description || null,
        priority,
        category: newCategory,
        status: 'TODO',
        dueDate: dueDate || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setNewCategory('PERSONAL')
      setDueDate('')
      setFormExpanded(false)
      toast.success('Tâche créée')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/tasks/${id}/status?status=${status}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tâche supprimée') },
  })

  const filteredTasks = useMemo(() => [...tasks]
    .filter(task => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch = !q || task.title.toLowerCase().includes(q) || (task.description ?? '').toLowerCase().includes(q)
      const matchesCategory = !filterCategory || (task.category ?? 'PERSONAL') === filterCategory
      const matchesPriority = !filterPriority || task.priority === filterPriority
      return matchesSearch && matchesCategory && matchesPriority
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      if (sortBy === 'priority') cmp = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
      if (sortBy === 'category') cmp = (a.category ?? 'PERSONAL').localeCompare(b.category ?? 'PERSONAL')
      return sortAsc ? cmp : -cmp
    }), [tasks, searchQuery, filterCategory, filterPriority, sortBy, sortAsc])

  const todo = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgress = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const done = filteredTasks.filter((t) => t.status === 'DONE')
  const allDone = tasks.filter((t) => t.status === 'DONE')
  const progress = tasks.length > 0 ? (allDone.length / tasks.length) * 100 : 0
  const formIsEmpty = !title.trim() && !description.trim() && !dueDate && priority === 'MEDIUM' && newCategory === 'PERSONAL'

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate()
  }

  const handleFormBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    if (formIsEmpty) setFormExpanded(false)
  }

  const handleSort = (nextSortBy: SortBy) => {
    if (sortBy === nextSortBy) {
      setSortAsc(value => !value)
      return
    }
    setSortBy(nextSortBy)
    setSortAsc(true)
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const meta = priorityOf(task)
    const categoryMeta = categoryOf(task)
    const due = task.dueDate ? new Date(task.dueDate) : null
    const overdue = Boolean(due && isPast(due) && task.status !== 'DONE')
    const nextStatus = STATUS_NEXT[task.status]
    const NextIcon = task.status === 'TODO' ? Play : task.status === 'IN_PROGRESS' ? Check : RotateCcw

    return (
      <div className={`card border-l-4 ${meta.strip} ${overdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50' : task.status === 'DONE' ? 'opacity-75' : ''}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                <Flag size={9} className="inline mr-1" />{meta.label}
              </span>
              <span className={`text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABEL[task.status]}</span>
              {overdue && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  ⚠ En retard
                </span>
              )}
            </div>
            <p className={`font-semibold ${task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {task.title}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${categoryMeta.color}`}>
              {categoryMeta.emoji && <span>{categoryMeta.emoji}</span>}
              <span>{categoryMeta.label}</span>
            </span>
            {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
            {due && (
              <div className={`flex items-center gap-1.5 text-xs mt-2 ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                <Clock size={12} />
                <span>{format(due, 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            <button type="button"
              onClick={() => statusMutation.mutate({ id: task.id, status: nextStatus })}
              className="p-1.5 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              title={STATUS_LABEL[nextStatus]}>
              <NextIcon size={15} />
            </button>
            <button type="button" onClick={() => setEditingTask(task)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Modifier">
              <Edit2 size={15} />
            </button>
            <button type="button" onClick={() => deleteMutation.mutate(task.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Supprimer">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <CheckSquare className="text-primary-600" />
        Tâches
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Total', value: tasks.length, icon: <CheckSquare size={15} /> },
          { label: 'À faire', value: tasks.filter(t => t.status === 'TODO').length, icon: <AlertTriangle size={15} /> },
          { label: 'En cours', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: <Clock size={15} /> },
          { label: 'Terminées', value: allDone.length, icon: <Check size={15} /> },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-3 text-center">
            <div className="flex justify-center text-primary-600 dark:text-primary-400 mb-1">{stat.icon}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">{stat.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} onBlur={handleFormBlur} className="card mb-5">
        {!formExpanded ? (
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
            placeholder="Ajouter une tâche..."
            onFocus={() => setFormExpanded(true)}
          />
        ) : (
          <div className="space-y-3">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la tâche" autoFocus />
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" />
            <DateTimePicker value={dueDate} onChange={setDueDate} placeholder="Choisir une échéance..." />
            <CategoryPicker value={newCategory} onChange={setNewCategory} />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY) as Task['priority'][]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!title.trim() || createMutation.isPending}>
              <Plus size={16} />
              {createMutation.isPending ? 'Création...' : 'Ajouter'}
            </button>
          </div>
        )}
      </form>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher dans les tâches..."
            className="input pl-9 py-2 text-sm w-full" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setFilterCategory(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
              !filterCategory ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
            }`}>
            Tout
          </button>
          {CATEGORY_KEYS.map(category => {
            const meta = TASK_CATEGORIES[category]
            const active = filterCategory === category
            return (
              <button key={category} type="button" onClick={() => setFilterCategory(active ? null : category)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1 ${
                  active ? meta.color : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                }`}>
                {meta.emoji && <span>{meta.emoji}</span>}
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Priorité :</span>
          {(Object.keys(PRIORITY) as Task['priority'][]).map(p => (
            <button key={p} type="button" onClick={() => setFilterPriority(filterPriority === p ? null : p)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                filterPriority === p ? PRIORITY[p].badge : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
              }`}>
              {p}
            </button>
          ))}
          <span className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          {([
            ['date', 'Date'],
            ['priority', 'Priorité'],
            ['category', 'Catégorie'],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => handleSort(key)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                sortBy === key ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
              }`}>
              {label} {sortBy === key ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1.5">
            <span>{allDone.length} / {tasks.length} terminée{allDone.length !== 1 ? 's' : ''}</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{Math.round(progress)} %</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyPanel
          illustration={<IllustrationTasks />}
          gradient="from-blue-600 to-cyan-400"
          headline="Prêt à conquérir ta journée ?"
          description="Organise tes priorités, suis ta progression et coche chaque victoire — grande ou petite."
          preview={
            <div className="card border-l-4 border-l-red-500">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">🚩 Haute</span>
                    <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">En cours</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Finaliser le rapport de stage</p>
                  <div className="flex items-center gap-1.5 text-xs mt-2 text-gray-400"><Clock size={12} /><span>Vendredi 30 mai 2026 à 18:00</span></div>
                </div>
              </div>
            </div>
          }
          primaryLabel="+ Créer ma première tâche"
          onPrimary={() => setFormExpanded(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">À faire ({todo.length})</h3>
            <div className="space-y-3">{todo.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-300 mb-3 uppercase tracking-wide">En cours ({inProgress.length})</h3>
            <div className="space-y-3">{inProgress.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-300 mb-3 uppercase tracking-wide">Terminé ({done.length})</h3>
            <div className="space-y-3">{done.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          </div>
        </div>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['tasks'] })}
        />
      )}
    </div>
  )
}

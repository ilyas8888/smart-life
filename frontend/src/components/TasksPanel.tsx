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
  PERSONAL: { label: 'Personnel', emoji: '', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  WORK: { label: 'Travail', emoji: '', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  SCHOOL: { label: '�cole', emoji: '', color: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
  FREELANCE: { label: 'Freelance', emoji: '', color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
  HEALTH: { label: 'Sant�', emoji: '??', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  LEARNING: { label: 'Apprentissage', emoji: '', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  SOCIAL: { label: 'Social', emoji: '', color: 'bg-pink-500/10 text-pink-400 border border-pink-500/20' },
  PRODUCTIVITY: { label: 'Productivit�', emoji: '?', color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
}

interface Task {
  id: number
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  category?: string
  startDate?: string | null
  dueDate: string | null
  createdAt: string
  checklist?: ChecklistItem[]
}

interface ChecklistItem {
  id: number
  text: string
  done: boolean
  position: number
}

const PRIORITY = {
  HIGH: { label: 'Haute', strip: 'border-l-red-500', badge: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  MEDIUM: { label: 'Moyenne', strip: 'border-l-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  LOW: { label: 'Basse', strip: 'border-l-green-500', badge: 'bg-green-500/10 text-green-400 border border-green-500/20' },
} satisfies Record<Task['priority'], { label: string; strip: string; badge: string }>

const STATUS_LABEL = { TODO: '� faire', IN_PROGRESS: 'En cours', DONE: 'Termin�' }
const STATUS_NEXT: Record<Task['status'], Task['status']> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' }
const STATUS_COLORS = {
  TODO: 'text-gray-400',
  IN_PROGRESS: 'text-yellow-400',
  DONE: 'text-green-400',
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
      <p className="text-xs font-medium text-gray-400 mb-2">Cat�gorie</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORY_KEYS.map(category => {
          const meta = TASK_CATEGORIES[category]
          const selected = value === category
          return (
            <button key={category} type="button" onClick={() => onChange(category)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selected ? meta.color : 'bg-white/[0.05] text-gray-400'
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
  const [startDate, setStartDate] = useState(toInputDateTime(task.startDate ?? null))
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
      startDate: startDate || null,
      dueDate: dueDate || null,
    })
      .then(() => {
        onSaved()
        toast.success('T�che mise � jour')
        onClose()
      })
      .catch(() => toast.error('Erreur lors de la mise � jour'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/5 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 border-white/10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Modifier</p>
            <h3 className="font-black text-white">T�che</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" />
          <textarea className="input min-h-[90px] resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnel)" />
          <label className="block">
            <span className="block text-xs font-medium text-gray-400 mb-1.5">D�but (optionnel)</span>
            <input type="datetime-local" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>
          <DateTimePicker value={dueDate} onChange={setDueDate} placeholder="Choisir une date et heure..." />
          <CategoryPicker value={category} onChange={setCategory} />
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Priorit�</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY) as Task['priority'][]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-white/[0.05] text-gray-400'}`}>
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Statut</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABEL) as Task['status'][]).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${status === s ? 'bg-white/10 text-white' : 'bg-white/[0.05] text-gray-400'}`}>
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

function TaskDetailPanel({
  task,
  onClose,
  onSaved,
  onDelete,
  onAddChecklist,
  onToggleChecklist,
  onDeleteChecklist,
}: {
  task: Task
  onClose: () => void
  onSaved: () => void
  onDelete: (id: number) => void
  onAddChecklist: (payload: { taskId: number; text: string }) => void
  onToggleChecklist: (payload: { taskId: number; itemId: number; done: boolean }) => void
  onDeleteChecklist: (payload: { taskId: number; itemId: number }) => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [newItem, setNewItem] = useState('')
  const categoryMeta = categoryOf(task)
  const priorityMeta = priorityOf(task)
  const checklist = task.checklist ?? []
  const doneCount = checklist.filter(item => item.done).length
  const checklistPercent = checklist.length > 0 ? (doneCount / checklist.length) * 100 : 0

  const saveInline = (patch: Partial<Pick<Task, 'title' | 'description'>>) => {
    api.put(`/tasks/${task.id}`, {
      title: Object.prototype.hasOwnProperty.call(patch, 'title') ? patch.title : task.title,
      description: Object.prototype.hasOwnProperty.call(patch, 'description') ? patch.description : task.description,
      priority: task.priority,
      status: task.status,
      category: task.category ?? 'PERSONAL',
      startDate: task.startDate ?? null,
      dueDate: task.dueDate ?? null,
    })
      .then(() => onSaved())
      .catch(() => toast.error('Erreur lors de la mise � jour'))
  }

  const addItem = () => {
    const text = newItem.trim()
    if (!text) return
    onAddChecklist({ taskId: task.id, text })
    setNewItem('')
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white/5 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 border-white/10">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide">D�tail</p>
            <p className="font-black text-white truncate">T�che</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            {editingTitle ? (
              <input className="input text-lg font-semibold" value={title} autoFocus
                onChange={e => setTitle(e.target.value)}
                onBlur={() => {
                  setEditingTitle(false)
                  if (title.trim() && title.trim() !== task.title) saveInline({ title: title.trim() })
                }} />
            ) : (
              <button type="button" onClick={() => setEditingTitle(true)}
                className="text-left text-lg font-semibold text-white hover:text-primary-600">
                {task.title}
              </button>
            )}
            {editingDescription ? (
              <textarea className="input min-h-[90px] resize-none mt-3" value={description} autoFocus
                onChange={e => setDescription(e.target.value)}
                onBlur={() => {
                  setEditingDescription(false)
                  if (description.trim() !== (task.description ?? '')) saveInline({ description: description.trim() || null })
                }} />
            ) : (
              <button type="button" onClick={() => setEditingDescription(true)}
                className="block text-left text-sm text-gray-400 mt-3">
                {task.description || 'Ajouter une description'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryMeta.color}`}>
              {categoryMeta.emoji && `${categoryMeta.emoji} `}{categoryMeta.label}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityMeta.badge}`}>
              <Flag size={9} className="inline mr-1" />{priorityMeta.label}
            </span>
            <span className={`text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABEL[task.status]}</span>
          </div>

          {(task.startDate || task.dueDate) && (
            <div className="rounded-xl bg-white/[0.03] p-3 text-xs text-gray-400 space-y-1">
              {task.startDate && <p>Du {format(new Date(task.startDate), 'dd MMM yyyy � HH:mm', { locale: fr })}</p>}
              {task.dueDate && <p>Au {format(new Date(task.dueDate), 'dd MMM yyyy � HH:mm', { locale: fr })}</p>}
            </div>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Checklist</h4>
              <span className="text-xs text-gray-400">{doneCount}/{checklist.length}</span>
            </div>
            {checklist.length > 0 && (
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden mb-3">
                <div className="h-full bg-primary-500 transition-all" style={{ width: `${checklistPercent}%` }} />
              </div>
            )}
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
                  <input type="checkbox" checked={item.done}
                    onChange={e => onToggleChecklist({ taskId: task.id, itemId: item.id, done: e.target.checked })}
                    className="h-4 w-4 accent-primary-600" />
                  <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-300'}`}>{item.text}</span>
                  <button type="button" onClick={() => onDeleteChecklist({ taskId: task.id, itemId: item.id })}
                    className="p-1 text-gray-300 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input className="input flex-1" value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                placeholder="Nouvelle sous-t�che" />
              <button type="button" onClick={addItem} className="btn-primary px-3">
                <Plus size={16} />
              </button>
            </div>
          </section>
        </div>

        <div className="p-5 border-t border-white/10">
          <button type="button" onClick={() => onDelete(task.id)}
            className="w-full rounded-xl bg-red-900/30 text-red-300 px-4 py-2 text-sm font-semibold hover:bg-red-900/50 transition-colors border border-red-500/20">
            Supprimer la t&#xe2;che
          </button>
        </div>
      </aside>
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
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortAsc, setSortAsc] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null)

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
        startDate: startDate || null,
        dueDate: dueDate || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setNewCategory('PERSONAL')
      setStartDate('')
      setDueDate('')
      setFormExpanded(false)
      toast.success('T�che cr��e')
    },
    onError: () => toast.error('Erreur lors de la cr�ation'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/tasks/${id}/status?status=${status}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setDetailTaskId(null)
      toast.success('T�che supprim�e')
    },
  })

  const checklistAddMutation = useMutation({
    mutationFn: ({ taskId, text }: { taskId: number; text: string }) =>
      api.post(`/tasks/${taskId}/checklist`, { text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const checklistToggleMutation = useMutation({
    mutationFn: ({ taskId, itemId, done }: { taskId: number; itemId: number; done: boolean }) =>
      api.patch(`/tasks/${taskId}/checklist/${itemId}`, { done }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const checklistDeleteMutation = useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: number; itemId: number }) =>
      api.delete(`/tasks/${taskId}/checklist/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
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
  const detailTask = detailTaskId ? tasks.find(task => task.id === detailTaskId) ?? null : null
  const formIsEmpty = !title.trim() && !description.trim() && !startDate && !dueDate && priority === 'MEDIUM' && newCategory === 'PERSONAL'

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
    const checklist = task.checklist ?? []
    const checklistDone = checklist.filter(item => item.done).length
    const checklistPercent = checklist.length > 0 ? (checklistDone / checklist.length) * 100 : 0
    const due = task.dueDate ? new Date(task.dueDate) : null
    const overdue = Boolean(due && isPast(due) && task.status !== 'DONE')
    const nextStatus = STATUS_NEXT[task.status]
    const NextIcon = task.status === 'TODO' ? Play : task.status === 'IN_PROGRESS' ? Check : RotateCcw

    return (
      <div className={`glass-card-hover border-l-4 ${meta.strip} ${overdue ? 'border-red-900/50' : task.status === 'DONE' ? 'opacity-60' : ''}`} style={overdue ? { boxShadow: '0 0 20px rgba(239,68,68,0.15)' } : undefined}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                <Flag size={9} className="inline mr-1" />{meta.label}
              </span>
              <span className={`text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABEL[task.status]}</span>
              {overdue && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  ? En retard
                </span>
              )}
            </div>
            <button type="button" onClick={() => setDetailTaskId(task.id)}
              className={`block text-left font-semibold hover:text-primary-600 dark:hover:text-primary-400 ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </button>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${categoryMeta.color}`}>
              {categoryMeta.emoji && <span>{categoryMeta.emoji}</span>}
              <span>{categoryMeta.label}</span>
            </span>
            {checklist.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                  <span>{checklistDone}/{checklist.length} sous-t�ches</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full bg-primary-500 transition-all" style={{ width: `${checklistPercent}%` }} />
                </div>
              </div>
            )}
            {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
            {due && (
              <div className={`flex items-center gap-1.5 text-xs mt-2 ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-500'}`}>
                <Clock size={12} />
                <span>{format(due, 'dd MMM yyyy � HH:mm', { locale: fr })}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            <button type="button"
              onClick={() => statusMutation.mutate({ id: task.id, status: nextStatus })}
              className="p-1.5 rounded-full text-gray-400 hover:text-primary-400 hover:bg-primary-900/20 transition-colors"
              title={STATUS_LABEL[nextStatus]}>
              <NextIcon size={15} />
            </button>
            <button type="button" onClick={() => setEditingTask(task)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
              title="Modifier">
              <Edit2 size={15} />
            </button>
            <button type="button" onClick={() => deleteMutation.mutate(task.id)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Supprimer">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div>
      <h2 className="font-black text-white text-2xl mb-4 flex items-center gap-2">
        <CheckSquare className="text-primary-600" />
        T�ches
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: tasks.length, icon: <CheckSquare size={16} />, gradient: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.3)' },
          { label: 'À faire', value: tasks.filter(t => t.status === 'TODO').length, icon: <AlertTriangle size={16} />, gradient: 'from-orange-500 to-amber-500', glow: 'rgba(249,115,22,0.3)' },
          { label: 'En cours', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: <Clock size={16} />, gradient: 'from-yellow-500 to-amber-400', glow: 'rgba(234,179,8,0.3)' },
          { label: 'Terminées', value: allDone.length, icon: <Check size={16} />, gradient: 'from-emerald-500 to-green-400', glow: 'rgba(16,185,129,0.3)' },
        ].map(stat => (
          <div key={stat.label} className="glass-card px-4 py-4 text-center" style={{ boxShadow: `0 0 20px ${stat.glow}` }}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 text-white`}>{stat.icon}</div>
            <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} onBlur={handleFormBlur} className="card mb-5">
        {!formExpanded ? (
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-300 placeholder-gray-400"
            placeholder="Ajouter une t�che..."
            onFocus={() => setFormExpanded(true)}
          />
        ) : (
          <div className="space-y-3">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la t�che" autoFocus />
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" />
            <label className="block">
              <span className="block text-xs font-medium text-gray-400 mb-1.5">D�but (optionnel)</span>
              <input type="datetime-local" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </label>
            <DateTimePicker value={dueDate} onChange={setDueDate} placeholder="Choisir une �ch�ance..." />
            <CategoryPicker value={newCategory} onChange={setNewCategory} />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY) as Task['priority'][]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-white/[0.05] text-gray-400'}`}>
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!title.trim() || createMutation.isPending}>
              <Plus size={16} />
              {createMutation.isPending ? 'Cr�ation...' : 'Ajouter'}
            </button>
          </div>
        )}
      </form>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher dans les t�ches..."
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
              !filterCategory ? 'bg-white/10 text-white' : 'bg-white/[0.05] text-gray-400'
            }`}>
            Tout
          </button>
          {CATEGORY_KEYS.map(category => {
            const meta = TASK_CATEGORIES[category]
            const active = filterCategory === category
            return (
              <button key={category} type="button" onClick={() => setFilterCategory(active ? null : category)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1 ${
                  active ? meta.color : 'bg-white/[0.05] text-gray-400'
                }`}>
                {meta.emoji && <span>{meta.emoji}</span>}
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Priorit� :</span>
          {(Object.keys(PRIORITY) as Task['priority'][]).map(p => (
            <button key={p} type="button" onClick={() => setFilterPriority(filterPriority === p ? null : p)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                filterPriority === p ? PRIORITY[p].badge : 'bg-white/[0.05] text-gray-400'
              }`}>
              {p}
            </button>
          ))}
          <span className="h-5 w-px bg-white/10 mx-1" />
          {([
            ['date', 'Date'],
            ['priority', 'Priorit�'],
            ['category', 'Cat�gorie'],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => handleSort(key)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                sortBy === key ? 'bg-white/10 text-white' : 'bg-white/[0.05] text-gray-400'
              }`}>
              {label} {sortBy === key ? (sortAsc ? '?' : '?') : ''}
            </button>
          ))}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1.5">
            <span>{allDone.length} / {tasks.length} termin�e{allDone.length !== 1 ? 's' : ''}</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{Math.round(progress)} %</span>
          </div>
          <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
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
          headline="Pr�t � conqu�rir ta journ�e ?"
          description="Organise tes priorit�s, suis ta progression et coche chaque victoire � grande ou petite."
          preview={
            <div className="card border-l-4 border-l-red-500">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">?? Haute</span>
                    <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">En cours</span>
                  </div>
                  <p className="font-semibold text-white">Finaliser le rapport de stage</p>
                  <div className="flex items-center gap-1.5 text-xs mt-2 text-gray-400"><Clock size={12} /><span>Vendredi 30 mai 2026 � 18:00</span></div>
                </div>
              </div>
            </div>
          }
          primaryLabel="+ Cr�er ma premi�re t�che"
          onPrimary={() => setFormExpanded(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide">À faire</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">{todo.length}</span>
            </div>
            <div className="space-y-3">{todo.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">En cours</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">{inProgress.length}</span>
            </div>
            <div className="space-y-3">{inProgress.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Terminé</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">{done.length}</span>
            </div>
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
      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          onClose={() => setDetailTaskId(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['tasks'] })}
          onDelete={(id) => deleteMutation.mutate(id)}
          onAddChecklist={(payload) => checklistAddMutation.mutate(payload)}
          onToggleChecklist={(payload) => checklistToggleMutation.mutate(payload)}
          onDeleteChecklist={(payload) => checklistDeleteMutation.mutate(payload)}
        />
      )}
    </div>
  )
}
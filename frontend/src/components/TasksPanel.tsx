import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Trash2, Clock, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Task {
  id: number
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
  createdAt: string
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const priorityFr = { LOW: 'Basse', MEDIUM: 'Moyenne', HIGH: 'Haute' }

export default function TasksPanel() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/tasks', {
        title,
        description,
        priority,
        status: 'TODO',
        dueDate: dueDate || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setDueDate('')
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

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  const todo = tasks.filter((t) => t.status === 'TODO')
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const done = tasks.filter((t) => t.status === 'DONE')

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate()
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="card mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {priorityFr[task.priority]}
            </span>
          </div>
          <p className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {task.title}
          </p>
          {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
          {task.dueDate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
              <Clock size={12} />
              {format(new Date(task.dueDate), 'dd MMM yyyy HH:mm', { locale: fr })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => statusMutation.mutate({ id: task.id, status: e.target.value })}
            className="text-xs border border-gray-200 rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="TODO">À faire</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="DONE">Terminé</option>
          </select>
          <button
            onClick={() => deleteMutation.mutate(task.id)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <CheckSquare className="text-primary-600" />
        Tâches ({tasks.length})
      </h2>

      <form onSubmit={handleCreate} className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            className="input lg:col-span-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la tâche"
            required
          />
          <input
            className="input lg:col-span-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)"
          />
          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
          >
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
          </select>
          <input
            className="input md:col-span-2 lg:col-span-2"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary md:col-span-2 lg:col-span-1 flex items-center justify-center gap-2"
            disabled={!title.trim() || createMutation.isPending}
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune tâche. Créez votre première tâche ci-dessus ou via le Prompt IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">À faire ({todo.length})</h3>
            {todo.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-300 mb-3 uppercase tracking-wide">En cours ({inProgress.length})</h3>
            {inProgress.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-300 mb-3 uppercase tracking-wide">Terminé ({done.length})</h3>
            {done.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}

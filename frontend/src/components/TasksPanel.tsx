import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Trash2, Clock } from 'lucide-react'
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
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
}

export default function TasksPanel() {
  const qc = useQueryClient()
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((r) => r.data),
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

  if (isLoading) return <div className="text-center py-12 text-gray-400">Chargement...</div>

  const todo = tasks.filter((t) => t.status === 'TODO')
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const done = tasks.filter((t) => t.status === 'DONE')

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="card mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <p className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </p>
          {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
          {task.dueDate && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={12} />
              {format(new Date(task.dueDate), 'dd MMM yyyy HH:mm', { locale: fr })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => statusMutation.mutate({ id: task.id, status: e.target.value })}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            <option value="TODO">À faire</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="DONE">Terminé</option>
          </select>
          <button
            onClick={() => deleteMutation.mutate(task.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CheckSquare className="text-primary-600" />
        Tâches ({tasks.length})
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune tâche. Utilisez le prompt IA pour en créer !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">À faire ({todo.length})</h3>
            {todo.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-600 mb-3 uppercase tracking-wide">En cours ({inProgress.length})</h3>
            {inProgress.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-600 mb-3 uppercase tracking-wide">Terminé ({done.length})</h3>
            {done.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}

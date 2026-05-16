import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2, Plus } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Reminder {
  id: number
  title: string
  description: string
  remindAt: string
  isDone: boolean
}

export default function RemindersPanel() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/reminders', { title, description, remindAt }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
      setTitle('')
      setDescription('')
      setRemindAt('')
      toast.success('Rappel créé')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const doneMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/reminders/${id}/done`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/reminders/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); toast.success('Rappel supprimé') },
  })

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !remindAt) return
    createMutation.mutate()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Bell className="text-primary-600" />
        Rappels ({reminders.length})
      </h2>

      <form onSubmit={handleCreate} className="card mb-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du rappel"
            required
          />
          <input
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)"
          />
          <input
            className="input"
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2"
            disabled={!title.trim() || !remindAt || createMutation.isPending}
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </form>

      {reminders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p>Créez votre premier rappel ci-dessus ou via le Prompt IA.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {reminders.map((r) => {
            const overdue = isPast(new Date(r.remindAt))
            return (
              <div key={r.id} className={`card flex items-start gap-3 ${overdue ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' : ''}`}>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                  {r.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>}
                  <p className={`text-xs mt-1 ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                    {overdue ? '⚠ ' : ''}
                    {format(new Date(r.remindAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => doneMutation.mutate(r.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-500 transition-colors"
                    title="Marquer comme fait"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(r.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

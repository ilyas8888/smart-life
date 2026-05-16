import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Pin, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Note {
  id: number
  title: string | null
  content: string
  isPinned: boolean
  tags: string[] | null
  createdAt: string
}

export default function NotesPanel() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: () => api.get('/notes').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/notes', { title: title || null, content, isPinned }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setTitle('')
      setContent('')
      setIsPinned(false)
      toast.success('Note créée')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const pinMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notes/${id}/pin`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/notes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Note supprimée') },
  })

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <FileText className="text-primary-600" />
        Notes ({notes.length})
      </h2>

      <form onSubmit={handleCreate} className="card mb-6">
        <div className="space-y-3">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre (optionnel)"
          />
          <textarea
            className="input min-h-[80px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu de la note..."
            required
          />
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Épingler
            </label>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2"
              disabled={!content.trim() || createMutation.isPending}
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Créez votre première note ci-dessus ou via le Prompt IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div key={n.id} className={`card relative ${n.isPinned ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{n.title ?? 'Note'}</h3>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => pinMutation.mutate(n.id)}
                    className={`p-1 transition-colors ${n.isPinned ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-500 hover:text-yellow-400'}`}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(n.id)}
                    className="p-1 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">{n.content}</p>
              {n.tags && n.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {n.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                {format(new Date(n.createdAt), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

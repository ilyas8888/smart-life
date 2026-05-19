import { useMemo, useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2, Plus, AlertTriangle, Clock, Calendar, ChevronDown, Edit2, X, Flag } from 'lucide-react'
import { format, isPast, isToday, isTomorrow, isThisWeek, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DateTimePicker from './DateTimePicker'

interface Reminder {
  id: number
  title: string
  description: string | null
  remindAt: string
  done: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

const PRIORITY = {
  HIGH: { label: 'Haute', strip: 'border-l-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  MEDIUM: { label: 'Moyenne', strip: 'border-l-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  LOW: { label: 'Basse', strip: 'border-l-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
} satisfies Record<Reminder['priority'], { label: string; strip: string; badge: string }>

function toInputDateTime(value: string) {
  return value ? value.slice(0, 16) : ''
}

function priorityOf(reminder: Reminder) {
  return PRIORITY[reminder.priority ?? 'MEDIUM'] ?? PRIORITY.MEDIUM
}

function ReminderEditModal({
  reminder, onClose, onSaved,
}: {
  reminder: Reminder
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(reminder.title)
  const [description, setDescription] = useState(reminder.description ?? '')
  const [remindAt, setRemindAt] = useState(toInputDateTime(reminder.remindAt))
  const [priority, setPriority] = useState<Reminder['priority']>(reminder.priority ?? 'MEDIUM')
  const [saving, setSaving] = useState(false)

  const save = () => {
    if (!title.trim() || !remindAt) return
    setSaving(true)
    api.put(`/reminders/${reminder.id}`, {
      title: title.trim(),
      description: description.trim() || null,
      remindAt,
      priority,
    })
      .then(() => {
        onSaved()
        toast.success('Rappel mis à jour')
        onClose()
      })
      .catch(() => toast.error('Erreur lors de la mise à jour'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Modifier</p>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Rappel</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" />
          <textarea className="input min-h-[90px] resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnel)" />
          <DateTimePicker value={remindAt} onChange={setRemindAt} placeholder="Choisir une date et heure..." />
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PRIORITY) as Reminder['priority'][]).map(p => (
              <button key={p} type="button" onClick={() => setPriority(p)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                {PRIORITY[p].label}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="button" onClick={save} disabled={!title.trim() || !remindAt || saving} className="btn-primary">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RemindersPanel() {
  const qc = useQueryClient()
  const [formExpanded, setFormExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [priority, setPriority] = useState<Reminder['priority']>('MEDIUM')
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders?includeDone=true').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/reminders', { title, description: description || null, remindAt, priority }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
      setTitle('')
      setDescription('')
      setRemindAt('')
      setPriority('MEDIUM')
      setFormExpanded(false)
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

  const normalizedReminders = useMemo(() =>
    reminders.map(r => ({ ...r, priority: r.priority ?? 'MEDIUM' })),
    [reminders]
  )
  const active = normalizedReminders.filter(r => !r.done)
  const done = normalizedReminders.filter(r => r.done)
  const overdue = active.filter(r => isPast(new Date(r.remindAt)))
  const today = active.filter(r => !isPast(new Date(r.remindAt)) && isToday(new Date(r.remindAt)))
  const tomorrow = active.filter(r => !isPast(new Date(r.remindAt)) && isTomorrow(new Date(r.remindAt)))
  const thisWeek = active.filter(r => {
    const d = new Date(r.remindAt)
    return !isPast(d) && isThisWeek(d, { weekStartsOn: 1 }) && !isToday(d) && !isTomorrow(d)
  })
  const later = active.filter(r => {
    const d = new Date(r.remindAt)
    return !isPast(d) && !isThisWeek(d, { weekStartsOn: 1 })
  })

  const stats = {
    total: normalizedReminders.length,
    overdue: overdue.length,
    upcoming: active.length - overdue.length,
    done: done.length,
  }

  const formIsEmpty = !title.trim() && !description.trim() && !remindAt && priority === 'MEDIUM'

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !remindAt) return
    createMutation.mutate()
  }

  const handleFormBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    if (formIsEmpty) setFormExpanded(false)
  }

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const meta = priorityOf(reminder)
    const date = new Date(reminder.remindAt)
    const isOverdue = !reminder.done && isPast(date)
    return (
      <div className={`card border-l-4 ${meta.strip} ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50' : reminder.done ? 'opacity-70' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className={`font-semibold ${reminder.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {reminder.title}
              </p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                <Flag size={9} className="inline mr-1" />{meta.label}
              </span>
              {isOverdue && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  ⚠ En retard
                </span>
              )}
            </div>
            {reminder.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reminder.description}</p>}
            <div className={`flex items-center gap-2 text-xs mt-2 ${isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              <Calendar size={12} />
              <span>{format(date, 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
              <span>·</span>
              <Clock size={12} />
              <span>{formatDistanceToNow(date, { addSuffix: true, locale: fr })}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => setEditingReminder(reminder)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Modifier">
              <Edit2 size={15} />
            </button>
            {!reminder.done && (
              <button type="button" onClick={() => doneMutation.mutate(reminder.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Marquer comme fait">
                <Check size={15} />
              </button>
            )}
            <button type="button" onClick={() => deleteMutation.mutate(reminder.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Supprimer">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const Section = ({
    title, items, icon, tone = 'text-gray-600 dark:text-gray-400',
  }: {
    title: string
    items: Reminder[]
    icon?: React.ReactNode
    tone?: string
  }) => {
    if (items.length === 0) return null
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${tone}`}>
            {title} ({items.length})
          </h3>
        </div>
        <div className="space-y-3">
          {items.map(r => <ReminderCard key={r.id} reminder={r} />)}
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">Chargement...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Bell className="text-primary-600" />
        Rappels
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: <Bell size={15} /> },
          { label: 'En retard', value: stats.overdue, icon: <AlertTriangle size={15} /> },
          { label: 'À venir', value: stats.upcoming, icon: <Clock size={15} /> },
          { label: 'Complétés', value: stats.done, icon: <Check size={15} /> },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-3 text-center">
            <div className="flex justify-center text-primary-600 dark:text-primary-400 mb-1">{stat.icon}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">{stat.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} onBlur={handleFormBlur} className="card mb-6 max-w-2xl">
        {!formExpanded ? (
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
            placeholder="Ajouter un rappel..."
            onFocus={() => setFormExpanded(true)}
          />
        ) : (
          <div className="space-y-3">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du rappel" autoFocus />
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" />
            <DateTimePicker value={remindAt} onChange={setRemindAt} placeholder="Choisir une date et heure..." />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRIORITY) as Reminder['priority'][]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!title.trim() || !remindAt || createMutation.isPending}>
              <Plus size={16} />
              {createMutation.isPending ? 'Création...' : 'Ajouter'}
            </button>
          </div>
        )}
      </form>

      {normalizedReminders.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={56} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun rappel</h3>
          <p className="text-gray-400 text-sm">Ajoute un rappel pour ne rien oublier.</p>
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          <Section title="En retard" items={overdue} icon={<AlertTriangle size={15} className="text-red-500" />} tone="text-red-600 dark:text-red-400" />
          <Section title="Aujourd'hui" items={today} icon={<Calendar size={15} className="text-primary-500" />} />
          <Section title="Demain" items={tomorrow} icon={<Calendar size={15} className="text-blue-500" />} />
          <Section title="Cette semaine" items={thisWeek} icon={<Clock size={15} className="text-yellow-500" />} />
          <Section title="Plus tard" items={later} icon={<Clock size={15} className="text-gray-400" />} />

          {done.length > 0 && (
            <div>
              <button type="button" onClick={() => setShowCompleted(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                <ChevronDown size={15} className={`transition-transform ${showCompleted ? '' : '-rotate-90'}`} />
                Complétés ({done.length})
              </button>
              {showCompleted && (
                <div className="space-y-3">
                  {done.slice(0, 10).map(r => <ReminderCard key={r.id} reminder={r} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {editingReminder && (
        <ReminderEditModal
          reminder={editingReminder}
          onClose={() => setEditingReminder(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['reminders'] })}
        />
      )}
    </div>
  )
}

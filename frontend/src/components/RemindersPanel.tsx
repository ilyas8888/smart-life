import { useMemo, useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2, Plus, AlertTriangle, Clock, Calendar, ChevronDown, Edit2, X, Flag, BellOff, BellRing, Loader2 } from 'lucide-react'
import { EmptyPanel, IllustrationReminders } from './EmptyState'
import { format, isPast, isToday, isTomorrow, isThisWeek, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DateTimePicker from './DateTimePicker'
import { usePushNotifications } from '../hooks/usePushNotifications'

interface Reminder {
  id: number
  title: string
  description: string | null
  remindAt: string
  done: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

const PRIORITY = {
  HIGH: { label: 'Haute', strip: 'border-l-red-500', badge: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  MEDIUM: { label: 'Moyenne', strip: 'border-l-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  LOW: { label: 'Basse', strip: 'border-l-green-500', badge: 'bg-green-500/10 text-green-400 border border-green-500/20' },
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
        toast.success('Rappel mis � jour')
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
            <h3 className="font-black text-white">Rappel</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
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
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-white/[0.05] text-gray-400'}`}>
                {PRIORITY[p].label}
              </button>
            ))}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Annuler</button>
            <button type="button" onClick={save} disabled={!title.trim() || !remindAt || saving} className="btn-primary w-full sm:w-auto">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PushBanner() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe, sendTest } = usePushNotifications()

  if (!isSupported) return null
  if (permission === 'denied') return (
    <div className="flex items-center gap-3 glass-card px-4 py-3 mb-4 border border-red-500/20">
      <BellOff size={16} className="text-red-400 shrink-0" />
      <p className="text-xs text-gray-400">Les notifications sont bloquées dans votre navigateur. Activez-les dans les paramètres du site.</p>
    </div>
  )

  if (isSubscribed) return (
    <div className="flex items-center gap-3 glass-card px-4 py-3 mb-4 border border-emerald-500/20" style={{ boxShadow: '0 0 20px rgba(16,185,129,0.08)' }}>
      <BellRing size={16} className="text-emerald-400 shrink-0" />
      <p className="text-xs text-gray-300 flex-1">Notifications push <span className="text-emerald-400 font-semibold">activées</span> — vous serez alerté à l'heure de chaque rappel.</p>
      <button
        type="button"
        onClick={sendTest}
        className="text-[10px] text-gray-500 hover:text-white transition-colors shrink-0"
        title="Envoyer une notification test"
      >
        Tester
      </button>
      <button
        type="button"
        onClick={() => unsubscribe().then(() => toast.success('Notifications désactivées'))}
        disabled={isLoading}
        className="text-[10px] text-red-400 hover:text-red-300 transition-colors shrink-0"
      >
        Désactiver
      </button>
    </div>
  )

  return (
    <div className="flex items-center gap-3 glass-card px-4 py-3 mb-4 border border-indigo-500/20" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.08)' }}>
      <Bell size={16} className="text-indigo-400 shrink-0" />
      <p className="text-xs text-gray-400 flex-1">Recevez une alerte push à l'heure exacte de chaque rappel.</p>
      <button
        type="button"
        onClick={() => subscribe().then(() => isSubscribed && toast.success('Notifications activées !'))}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
        Activer
      </button>
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
      toast.success('Rappel cr��')
    },
    onError: () => toast.error('Erreur lors de la cr�ation'),
  })

  const doneMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/reminders/${id}/done`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/reminders/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); toast.success('Rappel supprim�') },
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
      <div className={`glass-card-hover border-l-4 ${meta.strip} ${reminder.done ? 'opacity-50' : ''}`} style={isOverdue ? { boxShadow: '0 0 20px rgba(239,68,68,0.15)' } : undefined}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className={`font-semibold ${reminder.done ? 'line-through text-gray-500' : 'text-white'}`}>
                {reminder.title}
              </p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                <Flag size={9} className="inline mr-1" />{meta.label}
              </span>
              {isOverdue && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  ? En retard
                </span>
              )}
            </div>
            {reminder.description && <p className="text-sm text-gray-400 mt-1">{reminder.description}</p>}
            <div className={`flex flex-wrap items-center gap-2 text-xs mt-2 ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
              <Calendar size={12} />
              <span>{format(date, 'dd MMM yyyy � HH:mm', { locale: fr })}</span>
              <span>�</span>
              <Clock size={12} />
              <span>{formatDistanceToNow(date, { addSuffix: true, locale: fr })}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            <button type="button" onClick={() => setEditingReminder(reminder)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
              title="Modifier">
              <Edit2 size={15} />
            </button>
            {!reminder.done && (
              <button type="button" onClick={() => doneMutation.mutate(reminder.id)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-green-400 hover:bg-green-900/20 transition-colors"
                title="Marquer comme fait">
                <Check size={15} />
              </button>
            )}
            <button type="button" onClick={() => deleteMutation.mutate(reminder.id)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Supprimer">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const Section = ({
    title, items, icon, tone = 'text-gray-400',
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

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div>
      <h2 className="font-black text-white text-2xl mb-4 flex items-center gap-2">
        <Bell className="text-primary-600" />
        Rappels
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: <Bell size={16} />, gradient: 'from-indigo-500 to-violet-500', glow: 'rgba(99,102,241,0.3)' },
          { label: 'En retard', value: stats.overdue, icon: <AlertTriangle size={16} />, gradient: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.3)' },
          { label: 'À venir', value: stats.upcoming, icon: <Clock size={16} />, gradient: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.3)' },
          { label: 'Complétés', value: stats.done, icon: <Check size={16} />, gradient: 'from-emerald-500 to-green-400', glow: 'rgba(16,185,129,0.3)' },
        ].map(stat => (
          <div key={stat.label} className="glass-card px-4 py-4 text-center" style={{ boxShadow: `0 0 20px ${stat.glow}` }}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 text-white`}>{stat.icon}</div>
            <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <PushBanner />

      <form onSubmit={handleCreate} onBlur={handleFormBlur} className="card mb-6 max-w-2xl">
        {!formExpanded ? (
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-300 placeholder-gray-400"
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
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${priority === p ? PRIORITY[p].badge : 'bg-white/[0.05] text-gray-400'}`}>
                  {PRIORITY[p].label}
                </button>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!title.trim() || !remindAt || createMutation.isPending}>
              <Plus size={16} />
              {createMutation.isPending ? 'Cr�ation...' : 'Ajouter'}
            </button>
          </div>
        )}
      </form>

      {normalizedReminders.length === 0 ? (
        <EmptyPanel
          illustration={<IllustrationReminders />}
          gradient="from-orange-500 to-amber-400"
          headline="Ne rate plus aucun rendez-vous"
          description="Rappels horodat�s avec priorit� � SmartLife te pr�vient au bon moment, pour que tu n'oublies jamais rien."
          preview={
            <div className="card border-l-4 border-l-orange-500">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-white">Appeler le m�decin</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">?? Haute</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar size={12} /><span>Demain 09:00</span>
                    <span>�</span>
                    <Clock size={12} /><span>dans 18 heures</span>
                  </div>
                </div>
              </div>
            </div>
          }
          primaryLabel="+ Cr�er mon premier rappel"
          onPrimary={() => setFormExpanded(true)}
        />
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
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                <ChevronDown size={15} className={`transition-transform ${showCompleted ? '' : '-rotate-90'}`} />
                Compl�t�s ({done.length})
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
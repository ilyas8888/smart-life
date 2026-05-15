import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronDown, ChevronRight, Pin } from 'lucide-react'
import { fetchTimeline, TimelineItem, TimelineResponse } from '../api/timeline'

type Panel = 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food'

type AgendaPageProps = {
  onNavigate: (panel: Panel) => void
}

type SectionKey = 'today' | 'tomorrow' | 'thisWeek' | 'yesterday' | 'past' | 'noDate'

const typeToPanel: Record<string, Panel> = {
  TASK: 'tasks',
  REMINDER: 'reminders',
  NOTE: 'notes',
  FOOD: 'food',
}

const sections: { key: SectionKey; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'tomorrow', label: 'Demain' },
  { key: 'thisWeek', label: 'Cette semaine' },
  { key: 'yesterday', label: 'Hier' },
  { key: 'past', label: 'Passé' },
  { key: 'noDate', label: 'Sans date' },
]

const dotStyles = {
  TASK: 'bg-blue-500',
  REMINDER: 'bg-orange-500',
  NOTE: 'bg-violet-500',
  FOOD: 'bg-green-500',
}

const badgeStyles = {
  TASK: 'bg-blue-50 text-blue-700',
  REMINDER: 'bg-orange-50 text-orange-700',
  NOTE: 'bg-violet-50 text-violet-700',
  FOOD: 'bg-green-50 text-green-700',
}

const typeLabels = {
  TASK: 'TÂCHE',
  REMINDER: 'RAPPEL',
  NOTE: 'NOTE',
  FOOD: 'REPAS',
}

const statusFr: Record<string, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
}

const priorityFr: Record<string, string> = {
  HIGH: 'Haute',
  MEDIUM: 'Moyenne',
  LOW: 'Basse',
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : undefined
}

function getBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function formatDatePart(part: 'weekday' | 'date') {
  const now = new Date()

  if (part === 'weekday') {
    return now.toLocaleDateString('fr-FR', { weekday: 'long' })
  }

  return now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function allItems(data?: TimelineResponse) {
  if (!data) return []
  return sections.flatMap((section) => data[section.key] ?? [])
}

function metadataText(item: TimelineItem) {
  if (item.type === 'TASK') {
    const priority = getString(item.metadata.priority)
    const status = getString(item.metadata.status)
    return [priorityFr[priority ?? ''] ?? priority, statusFr[status ?? ''] ?? status].filter(Boolean).join(' · ')
  }

  if (item.type === 'FOOD') {
    const calories = getNumber(item.metadata.calories)
    return typeof calories === 'number' ? `${calories} kcal` : ''
  }

  if (item.type === 'REMINDER') {
    return item.metadata.isDone === true ? 'Fait' : ''
  }

  return ''
}

function taskPriorityClass(priority?: string) {
  if (priority === 'HIGH') return 'border-red-400'
  if (priority === 'MEDIUM') return 'border-yellow-400'
  return 'border-gray-300'
}

function statLabel(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`
}

function AgendaRow({ item, onNavigate }: { item: TimelineItem; onNavigate: (panel: Panel) => void }) {
  const panel = typeToPanel[item.type]
  const dotClass = dotStyles[item.type as keyof typeof dotStyles] ?? dotStyles.NOTE
  const badgeClass = badgeStyles[item.type as keyof typeof badgeStyles] ?? badgeStyles.NOTE
  const label = typeLabels[item.type as keyof typeof typeLabels] ?? item.type
  const meta = metadataText(item)

  return (
    <button
      type="button"
      onClick={() => panel && onNavigate(panel)}
      className="w-full flex items-center gap-3 py-2 pl-8 text-left hover:bg-stone-100/60 transition-colors"
    >
      <span className="w-12 text-right text-xs text-stone-400 font-mono shrink-0">{item.time ?? '—'}</span>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${badgeClass}`}>{label}</span>
      <span className="text-sm text-stone-800 truncate flex-1">{item.title}</span>
      {meta && <span className="text-xs text-stone-400 shrink-0">{meta}</span>}
    </button>
  )
}

function JournalSection({
  title,
  children,
  empty,
}: {
  title: string
  children: React.ReactNode
  empty?: string
}) {
  return (
    <div className="mb-6">
      <h2
        style={{ fontFamily: 'Caveat, cursive' }}
        className="text-2xl font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3"
      >
        {title}
      </h2>
      {children || <p className="text-sm text-gray-400 italic pl-2">{empty}</p>}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 bg-white min-h-full animate-pulse">
      <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
      <div className="h-16 w-56 bg-gray-100 rounded mb-3" />
      <div className="h-6 w-32 bg-gray-100 rounded mb-5" />
      <div className="border-b-2 border-gray-200 mb-5" />
      <div className="h-4 w-44 bg-gray-100 rounded mb-8" />
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="mb-6">
          <div className="h-7 w-28 bg-gray-100 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AgendaPage({ onNavigate }: AgendaPageProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['tomorrow', 'thisWeek', 'yesterday', 'past', 'noDate'])
  )
  const { data, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: fetchTimeline,
  })

  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const today = data?.today ?? []
  const tomorrow = data?.tomorrow ?? []
  const tasks = [...today, ...(data?.noDate ?? [])].filter((item) => item.type === 'TASK')
  const reminders = [...today, ...tomorrow].filter((item) => item.type === 'REMINDER')
  const notes = allItems(data)
    .filter((item) => item.type === 'NOTE')
    .sort((a, b) => Number(getBoolean(b.metadata.isPinned) === true) - Number(getBoolean(a.metadata.isPinned) === true))
  const foodItems = today.filter((item) => item.type === 'FOOD')
  const calories = foodItems.reduce((total, item) => total + (getNumber(item.metadata.calories) ?? 0), 0)
  const stats = [
    tasks.length ? statLabel(tasks.length, 'tâche', 'tâches') : '',
    reminders.length ? statLabel(reminders.length, 'rappel', 'rappels') : '',
    notes.length ? statLabel(notes.length, 'note', 'notes') : '',
    foodItems.length ? statLabel(foodItems.length, 'repas', 'repas') : '',
  ].filter(Boolean)

  const visibleSections = sections
    .map((section) => ({ ...section, items: data?.[section.key] ?? [] }))
    .filter((section) => section.items.length > 0)
  const allCollapsed = collapsedSections.size === visibleSections.length

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 bg-white min-h-full">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">SmartLife</p>
        <h1
          style={{ fontFamily: 'Caveat, cursive' }}
          className="text-7xl font-bold text-gray-900 leading-none"
        >
          {capitalize(formatDatePart('weekday'))}
        </h1>
        <p className="text-gray-500 mt-1 text-lg">{formatDatePart('date')}</p>
      </div>
      <div className="border-b-2 border-gray-900 mb-5" />
      {stats.length > 0 && (
        <p className="text-sm text-gray-400 italic mb-6">{stats.join(' · ')}</p>
      )}

      <JournalSection title="Tâches" empty="Aucune tâche">
        {tasks.length > 0 && tasks.slice(0, 5).map((item) => {
          const status = getString(item.metadata.status)
          const priority = getString(item.metadata.priority)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate('tasks')}
              className="w-full flex items-start gap-3 py-1 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className={`mt-1.5 w-3 h-3 border-2 rounded-sm shrink-0 ${taskPriorityClass(priority)}`} />
              <span className={`text-sm flex-1 ${status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {item.title}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{statusFr[status ?? ''] ?? ''}</span>
            </button>
          )
        })}
      </JournalSection>

      <JournalSection title="Rappels" empty="Aucun rappel">
        {reminders.length > 0 && reminders.slice(0, 4).map((item) => {
          const isDone = getBoolean(item.metadata.isDone) === true
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate('reminders')}
              className="w-full flex items-center gap-3 py-1 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="text-gray-400 shrink-0">•</span>
              <span className="text-xs font-mono text-gray-400 w-12 shrink-0">{item.time ?? '—'}</span>
              <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.title}</span>
            </button>
          )
        })}
      </JournalSection>

      <JournalSection title={foodItems.length > 0 ? `Repas — ${calories} kcal` : 'Repas'} empty="Aucun repas enregistré">
        {foodItems.length > 0 && foodItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate('food')}
            className="w-full flex items-center gap-3 py-1 text-left hover:bg-gray-50 rounded transition-colors"
          >
            <span className="text-gray-400 shrink-0">•</span>
            <span className="text-sm text-gray-800 flex-1 truncate">{item.title}</span>
            <span className="text-xs text-gray-400 shrink-0">{getNumber(item.metadata.calories) ?? 0} kcal</span>
          </button>
        ))}
      </JournalSection>

      <JournalSection title="Notes" empty="Aucune note">
        {notes.length > 0 && notes.slice(0, 3).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate('notes')}
            className="w-full flex items-start gap-3 py-1 text-left hover:bg-gray-50 rounded transition-colors"
          >
            {getBoolean(item.metadata.isPinned) && <Pin size={12} className="text-violet-400 mt-1 shrink-0" />}
            {!getBoolean(item.metadata.isPinned) && <span className="text-gray-400 shrink-0">•</span>}
            <span className="text-sm text-gray-800 truncate flex-1">{item.title}</span>
          </button>
        ))}
      </JournalSection>

      <div className="border-t-4 border-double border-gray-900 my-8" />

      <div className="flex items-center justify-between mb-4">
        <h2
          style={{ fontFamily: 'Caveat, cursive' }}
          className="text-4xl font-bold text-gray-700"
        >
          Semaine
        </h2>
        <button
          type="button"
          onClick={() =>
            setCollapsedSections(
              allCollapsed
                ? new Set()
                : new Set(visibleSections.map((s) => s.key))
            )
          }
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {allCollapsed ? 'Tout développer' : 'Tout réduire'}
        </button>
      </div>

      {visibleSections.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun élément planifié.</p>
        </div>
      ) : (
        <div>
          {visibleSections.map(({ key, label, items }, sectionIndex) => (
            <section key={key}>
              <div
                onClick={() => toggleSection(key)}
                className="flex items-center gap-3 py-2 cursor-pointer select-none group"
              >
                <span className="w-5 h-5 rounded-full bg-stone-700 text-amber-50 text-xs flex items-center justify-center font-bold shrink-0">
                  {sectionIndex + 1}
                </span>
                <span className="text-sm font-bold text-stone-700 uppercase tracking-wide">{label}</span>
                {key === 'today' && (
                  <span className="text-xs text-stone-400">
                    {capitalize(formatDatePart('weekday'))} {formatDatePart('date')}
                  </span>
                )}
                <div className="flex-1 border-b border-dashed border-stone-300" />
                <span className="text-xs text-stone-400 font-mono">{items.length}</span>
                {collapsedSections.has(key)
                  ? <ChevronRight size={14} className="text-stone-400" />
                  : <ChevronDown size={14} className="text-stone-400" />}
              </div>

              {!collapsedSections.has(key) && (
                <div>
                  {items.map((item) => (
                    <AgendaRow key={`${item.type}-${item.id}`} item={item} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

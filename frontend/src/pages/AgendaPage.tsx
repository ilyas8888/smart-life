import { useQuery } from '@tanstack/react-query'
import { Bell, CalendarDays, Pin } from 'lucide-react'
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

function taskStatusClass(status?: string) {
  if (status === 'DONE') return 'bg-gray-100 text-gray-400'
  if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-600'
  return 'bg-gray-50 text-gray-500'
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
      className="w-full flex items-start gap-3 px-2 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <span className="w-14 text-right text-xs text-gray-400 font-mono shrink-0">
        {item.time ?? '-'}
      </span>
      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotClass}`} />
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${badgeClass}`}>
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 truncate flex-1">{item.title}</span>
      {meta && <span className="text-xs text-gray-400 shrink-0">{meta}</span>}
    </button>
  )
}

function LoadingRows() {
  const widths = ['w-2/3', 'w-1/2', 'w-3/4', 'w-5/12', 'w-7/12']

  return (
    <div className="space-y-3 animate-pulse">
      {widths.map((width) => (
        <div key={width} className="flex items-center gap-3 px-2 py-2">
          <div className="w-14 h-4 bg-gray-100 rounded" />
          <div className="w-2 h-2 bg-gray-100 rounded-full" />
          <div className="w-14 h-4 bg-gray-100 rounded" />
          <div className={`h-4 bg-gray-100 rounded ${width}`} />
        </div>
      ))}
    </div>
  )
}

function WidgetShell({
  title,
  accentClass,
  panel,
  onNavigate,
  children,
}: {
  title: string
  accentClass: string
  panel: Panel
  onNavigate: (panel: Panel) => void
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 min-h-[190px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-xs font-bold uppercase tracking-widest ${accentClass}`}>{title}</h3>
        <button
          type="button"
          onClick={() => onNavigate(panel)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Voir tout
        </button>
      </div>
      {children}
    </section>
  )
}

export default function AgendaPage({ onNavigate }: AgendaPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: fetchTimeline,
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

  if (isLoading) {
    return (
      <div>
        <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <div className="h-4 w-24 rounded bg-white/10 mb-3 animate-pulse" />
          <div className="h-8 w-56 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4 my-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 min-h-[190px] animate-pulse">
              <div className="h-4 w-24 rounded bg-gray-100 mb-5" />
              <LoadingRows />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm opacity-70">{capitalize(formatDatePart('weekday'))}</p>
            <h2 className="text-2xl font-bold">{formatDatePart('date')}</h2>
          </div>
          {stats.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {stats.map((stat) => (
                <span key={stat} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                  {stat}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 my-6">
        <WidgetShell title="Tâches" accentClass="text-blue-600" panel="tasks" onNavigate={onNavigate}>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune tâche aujourd'hui</p>
          ) : (
            tasks.slice(0, 4).map((item) => {
              const status = getString(item.metadata.status)
              return (
                <div key={`task-${item.id}`} className="flex items-start gap-2 min-w-0">
                  <span className={`w-3 h-3 rounded-sm border-2 shrink-0 mt-1 ${taskPriorityClass(getString(item.metadata.priority))}`} />
                  <span className={`text-sm truncate flex-1 ${status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.title}
                  </span>
                  {status && (
                    <span className={`text-xs px-1 rounded shrink-0 ${taskStatusClass(status)}`}>
                      {statusFr[status] ?? status}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </WidgetShell>

        <WidgetShell title="Rappels" accentClass="text-orange-500" panel="reminders" onNavigate={onNavigate}>
          {reminders.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun rappel à venir</p>
          ) : (
            reminders.slice(0, 4).map((item) => {
              const isDone = getBoolean(item.metadata.isDone) === true
              return (
                <div key={`reminder-${item.id}`} className="flex items-center gap-2 min-w-0">
                  <Bell size={14} className="text-orange-400 shrink-0" />
                  <span className="text-xs text-gray-400 w-10 shrink-0 font-mono">{item.time ?? '-'}</span>
                  <span className={`text-sm truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.title}
                  </span>
                </div>
              )
            })
          )}
        </WidgetShell>

        <WidgetShell title="Notes" accentClass="text-violet-600" panel="notes" onNavigate={onNavigate}>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune note</p>
          ) : (
            notes.slice(0, 3).map((item) => {
              const isPinned = getBoolean(item.metadata.isPinned) === true
              return (
                <div key={`note-${item.id}`} className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isPinned && <Pin size={12} className="text-violet-500 shrink-0" />}
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                  )}
                </div>
              )
            })
          )}
        </WidgetShell>

        <WidgetShell title="Alimentation" accentClass="text-green-600" panel="food" onNavigate={onNavigate}>
          {foodItems.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun repas enregistré</p>
          ) : (
            <>
              <div>
                <p className="text-3xl font-bold text-gray-900">{calories}</p>
                <p className="text-sm text-gray-400">kcal aujourd'hui</p>
              </div>
              <div className="space-y-1">
                {foodItems.slice(0, 3).map((item) => (
                  <div key={`food-${item.id}`} className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-sm text-gray-700 truncate">{item.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{getNumber(item.metadata.calories) ?? 0} kcal</span>
                  </div>
                ))}
                {foodItems.length > 3 && (
                  <p className="text-xs text-gray-400">et {foodItems.length - 3} autres</p>
                )}
              </div>
            </>
          )}
        </WidgetShell>
      </div>

      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2">
          Toute la semaine
        </h3>

        {visibleSections.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun élément planifié.</p>
          </div>
        ) : (
          <div>
            {visibleSections.map(({ key, label, items }) => (
              <section key={key}>
                <div className="flex items-center gap-3 mb-1 mt-6 first:mt-0">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    {label}
                  </span>
                  {key === 'today' && (
                    <span className="text-xs text-gray-400">
                      {capitalize(formatDatePart('weekday'))} {formatDatePart('date')}
                    </span>
                  )}
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">{items.length}</span>
                </div>

                <div>
                  {items.map((item, index) => (
                    <div key={`${item.type}-${item.id}`}>
                      {index > 0 && <div className="border-t border-gray-50" />}
                      <AgendaRow item={item} onNavigate={onNavigate} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

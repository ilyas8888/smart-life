import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Pin } from 'lucide-react'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isToday, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'
import { fetchMonthCalendar, MonthCalendarResponse, fetchTimeline, TimelineItem, TimelineResponse } from '../api/timeline'

type Panel = 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout'

type AgendaPageProps = {
  onNavigate: (panel: Panel) => void
}

type SectionKey = 'today' | 'tomorrow' | 'thisWeek' | 'yesterday' | 'past' | 'noDate'

const typeToPanel: Record<string, Panel> = {
  TASK: 'tasks',
  REMINDER: 'reminders',
  NOTE: 'notes',
  FOOD: 'food',
  DIARY: 'diary',
  WORKOUT: 'workout',
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
  DIARY: 'bg-rose-500',
  WORKOUT: 'bg-amber-500',
}

const badgeStyles = {
  TASK: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  REMINDER: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  NOTE: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  FOOD: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  DIARY: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  WORKOUT: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

const typeLabels = {
  TASK: 'TÂCHE',
  REMINDER: 'RAPPEL',
  NOTE: 'NOTE',
  FOOD: 'REPAS',
  DIARY: 'JOURNAL',
  WORKOUT: 'SPORT',
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

const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

const mealLabels: Record<string, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Snack',
}

const mealEmojis: Record<string, string> = {
  BREAKFAST: '',
  LUNCH: '☀️',
  DINNER: '',
  SNACK: '',
}

const mealBg: Record<string, string> = {
  BREAKFAST: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  LUNCH: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DINNER: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  SNACK: 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
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

function dateKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function monthTitle(date: Date) {
  return capitalize(format(date, 'MMMM yyyy', { locale: fr }))
}

function MonthCalendar({
  selectedDate,
  viewMonth,
  calendarData,
  onSelectDate,
  onChangeMonth,
}: {
  selectedDate: Date
  viewMonth: Date
  calendarData: MonthCalendarResponse
  onSelectDate: (date: Date) => void
  onChangeMonth: (date: Date) => void
}) {
  const monthStart = startOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(viewMonth) })
  const leadingEmptyDays = (getDay(monthStart) + 6) % 7
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="card mb-6 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onChangeMonth(addMonths(viewMonth, -1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">{monthTitle(viewMonth)}</h2>
        <button
          type="button"
          onClick={() => onChangeMonth(addMonths(viewMonth, 1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-[10px] text-gray-400 font-medium text-center py-1">
            {day}
          </div>
        ))}
        {Array.from({ length: leadingEmptyDays }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((day) => {
          const key = dateKey(day)
          const items = calendarData[key] ?? []
          const itemTypes = Array.from(new Set(items.map((item) => item.type))).slice(0, 3)
          const selected = isSameDay(day, selectedDate)
          const currentDay = isToday(day)

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className="relative flex flex-col items-center py-1 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span
                className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                  selected
                    ? 'bg-primary-600 text-white'
                    : currentDay
                      ? 'border border-primary-600 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {format(day, 'd')}
              </span>
              <span className="flex gap-0.5 mt-0.5 h-2">
                {itemTypes.map((type) => (
                  <span key={type} className={`w-1.5 h-1.5 rounded-full ${dotStyles[type as keyof typeof dotStyles] ?? dotStyles.NOTE}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
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
    return item.metadata.done === true ? 'Fait' : ''
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
      className="w-full flex items-center gap-3 py-2 pl-8 text-left hover:bg-stone-100/60 dark:hover:bg-gray-800 transition-colors"
    >
      <span className="w-12 text-right text-xs text-stone-400 dark:text-stone-500 font-mono shrink-0">{item.time ?? '—'}</span>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${badgeClass}`}>{label}</span>
      <span className="text-sm text-stone-800 dark:text-stone-300 truncate flex-1">{item.title}</span>
      {meta && <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{meta}</span>}
    </button>
  )
}

function JournalSection({
  title,
  children,
  empty,
  accent = 'border-gray-300',
}: {
  title: string
  children?: React.ReactNode
  empty?: string
  accent?: string
}) {
  return (
    <div className={`mb-6 pl-3 border-l-2 ${accent}`}>
      <h2
        style={{ fontFamily: 'Caveat, cursive' }}
        className="text-2xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-3"
      >
        {title}
      </h2>
      {children ?? <p className="text-sm text-gray-400 dark:text-gray-500 italic">{empty}</p>}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 bg-white dark:bg-gray-900 min-h-full animate-pulse">
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
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMonth, setViewMonth] = useState<Date>(new Date())
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['tomorrow', 'thisWeek', 'yesterday', 'past', 'noDate'])
  )
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())
  const { data, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: fetchTimeline,
  })
  const { data: calendarData = {} } = useQuery({
    queryKey: ['timeline-month', viewMonth.getFullYear(), viewMonth.getMonth() + 1],
    queryFn: () => fetchMonthCalendar(viewMonth.getFullYear(), viewMonth.getMonth() + 1),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/tasks/${id}/status?status=${status}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      qc.invalidateQueries({ queryKey: ['timeline-month'] })
      setOpenMenu(null)
    },
  })

  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const toggleSelect = (id: number) =>
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectedKey = dateKey(selectedDate)
  const selectedIsToday = isToday(selectedDate)
  const selectedDayItems = selectedIsToday ? (data?.today ?? []) : (calendarData[selectedKey] ?? [])
  const tasks = [...selectedDayItems, ...(selectedIsToday ? (data?.noDate ?? []) : [])].filter((item) => item.type === 'TASK')
  const reminders = (selectedIsToday ? [...selectedDayItems, ...(data?.tomorrow ?? [])] : selectedDayItems).filter((item) => item.type === 'REMINDER')
  const notes = (selectedIsToday ? allItems(data) : selectedDayItems)
    .filter((item) => item.type === 'NOTE')
    .sort((a, b) => Number(getBoolean(b.metadata.isPinned) === true) - Number(getBoolean(a.metadata.isPinned) === true))
  const foodItems = selectedDayItems
    .filter((item) => item.type === 'FOOD')
    .sort((a, b) => {
      const ai = mealOrder.indexOf(getString(a.metadata.mealType) ?? '')
      const bi = mealOrder.indexOf(getString(b.metadata.mealType) ?? '')
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  const diaryItems = selectedDayItems.filter((item) => item.type === 'DIARY')
  const workoutItems = selectedDayItems.filter((item) => item.type === 'WORKOUT')
  const calories = foodItems.reduce((total, item) => total + (getNumber(item.metadata.calories) ?? 0), 0)
  const caloriesBurned = workoutItems.reduce((total, item) => total + (getNumber(item.metadata.caloriesBurned) ?? 0), 0)
  const stats = [
    tasks.length ? statLabel(tasks.length, 'tâche', 'tâches') : '',
    reminders.length ? statLabel(reminders.length, 'rappel', 'rappels') : '',
    notes.length ? statLabel(notes.length, 'note', 'notes') : '',
    foodItems.length ? statLabel(foodItems.length, 'repas', 'repas') : '',
    workoutItems.length ? statLabel(workoutItems.length, 'séance sport', 'séances sport') : '',
    diaryItems.length ? statLabel(diaryItems.length, 'entrée journal', 'entrées journal') : '',
  ].filter(Boolean)

  const visibleSections = sections
    .map((section) => ({ ...section, items: data?.[section.key] ?? [] }))
    .filter((section) => section.items.length > 0)
  const allCollapsed = collapsedSections.size === visibleSections.length

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div
      className="max-w-2xl mx-auto px-6 py-8 bg-white dark:bg-gray-900 min-h-full"
      onClick={() => setOpenMenu(null)}
    >
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">SmartLife</p>
        <h1
          style={{ fontFamily: 'Caveat, cursive' }}
          className="text-7xl font-bold text-gray-900 dark:text-gray-100 leading-none"
        >
          {capitalize(format(selectedDate, 'EEEE', { locale: fr }))}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
          {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
        </p>
      </div>
      <div className="border-b-2 border-gray-900 dark:border-gray-100 mb-5" />
      {stats.length > 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic mb-6">{stats.join(' · ')}</p>
      )}

      <MonthCalendar
        selectedDate={selectedDate}
        viewMonth={viewMonth}
        calendarData={calendarData}
        onSelectDate={setSelectedDate}
        onChangeMonth={setViewMonth}
      />

      <JournalSection title="Tâches" empty="Aucune tâche" accent="border-blue-400">
        {tasks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tasks.slice(0, 6).map((item) => {
              const status = getString(item.metadata.status)
              const priority = getString(item.metadata.priority)
              const isDone = status === 'DONE'

              return (
                <div key={item.id} className="relative flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full pl-2 pr-1 py-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleSelect(item.id)
                    }}
                    className={`w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                      selectedTasks.has(item.id)
                        ? 'bg-gray-700 border-gray-700'
                        : taskPriorityClass(priority)
                    }`}
                  >
                    {selectedTasks.has(item.id) && (
                      <span className="text-white text-[9px] leading-none font-bold">✓</span>
                    )}
                  </button>

                  <span className={`text-xs max-w-[160px] truncate ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-blue-800 dark:text-blue-300'}`}>
                    {item.title}
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setOpenMenu(openMenu === item.id ? null : item.id)
                    }}
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium cursor-pointer ml-1 ${
                      isDone
                        ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        : status === 'IN_PROGRESS'
                          ? 'bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {statusFr[status ?? ''] ?? status} ▾
                  </button>

                  {openMenu === item.id && (
                    <div
                      className="absolute left-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-20 overflow-hidden min-w-[120px]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => statusMutation.mutate({ id: item.id, status: s })}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            s === status ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {statusFr[s]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </JournalSection>

      <JournalSection title="Rappels" empty="Aucun rappel" accent="border-orange-400">
        {reminders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reminders.slice(0, 4).map((item) => {
              const isDone = getBoolean(item.metadata.done) === true
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate('reminders')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${
                    isDone ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400 line-through' : 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}
                >
                  <span className="font-mono opacity-70">{item.time ?? '—'}</span>
                  <span className="truncate max-w-[160px]">{item.title}</span>
                </button>
              )
            })}
          </div>
        )}
      </JournalSection>

      <JournalSection
        title={
          foodItems.length > 0
            ? caloriesBurned > 0
              ? `Repas — ${calories} kcal consommées · ${caloriesBurned} brûlées · net ${calories - caloriesBurned} kcal`
              : `Repas — ${calories} kcal`
            : 'Repas'
        }
        empty="Aucun repas enregistré"
        accent="border-green-400"
      >
        {foodItems.length > 0 && (() => {
          const grouped = mealOrder.reduce<Record<string, typeof foodItems>>((acc, type) => {
            const items = foodItems.filter((food) => (getString(food.metadata.mealType) ?? 'SNACK') === type)
            if (items.length > 0) acc[type] = items
            return acc
          }, {})

          return Object.entries(grouped).map(([type, items]) => {
            const subtotal = items.reduce((sum, food) => sum + (getNumber(food.metadata.calories) ?? 0), 0)
            return (
              <div key={type} className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{mealEmojis[type] ?? '️'}</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {mealLabels[type]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">· {subtotal} kcal</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => onNavigate('food')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${
                        mealBg[type] ?? mealBg.SNACK
                      }`}
                    >
                      <span className="truncate max-w-[160px]">{food.title}</span>
                      <span className="opacity-60 shrink-0">{getNumber(food.metadata.calories) ?? 0} kcal</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })
        })()}
      </JournalSection>

      <JournalSection title="Notes" empty="Aucune note" accent="border-violet-400">
        {notes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {notes.slice(0, 4).map((item) => {
              const isPinned = getBoolean(item.metadata.isPinned) === true
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate('notes')}
                  className="flex items-center gap-1.5 bg-violet-50 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
                >
                  {isPinned && <Pin size={11} className="shrink-0" />}
                  <span className="truncate max-w-[180px]">{item.title}</span>
                </button>
              )
            })}
          </div>
        )}
      </JournalSection>

      <JournalSection title="Journal" empty="Aucune entrée" accent="border-rose-400">
        {diaryItems.length > 0 && (
          <div className="space-y-2">
            {diaryItems.slice(0, 2).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate('diary')}
                className="block w-full text-left bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200 px-3 py-2 rounded-lg text-xs hover:opacity-80 transition-opacity"
              >
                <span className="line-clamp-2">{item.description}</span>
              </button>
            ))}
          </div>
        )}
      </JournalSection>

      <JournalSection title="Sport" empty="Aucune séance" accent="border-amber-400">
        {workoutItems.length > 0 && (
          <div className="space-y-2">
            {workoutItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate('workout')}
                className="block w-full text-left bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 px-3 py-2 rounded-lg text-xs hover:opacity-80 transition-opacity"
              >
                <span className="font-medium">{item.title}</span>
                {(getNumber(item.metadata.durationMinutes) || getNumber(item.metadata.caloriesBurned)) && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">
                    {getNumber(item.metadata.durationMinutes) ? `${item.metadata.durationMinutes}min` : ''}
                    {getNumber(item.metadata.caloriesBurned) ? ` · ${item.metadata.caloriesBurned} kcal` : ''}
                    {caloriesBurned > 0 && workoutItems.indexOf(item) === workoutItems.length - 1 && calories > 0
                      ? ` (net: ${calories - caloriesBurned} kcal)`
                      : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </JournalSection>

      <div className="border-t-4 border-double border-gray-900 dark:border-gray-100 my-8" />

      <div className="flex items-center justify-between mb-4">
        <h2
          style={{ fontFamily: 'Caveat, cursive' }}
          className="text-4xl font-bold text-gray-700 dark:text-gray-300"
        >
          Semaine
        </h2>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setCollapsedSections(
              allCollapsed
                ? new Set()
                : new Set(visibleSections.map((s) => s.key))
            )
          }}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {allCollapsed ? 'Tout développer' : 'Tout réduire'}
        </button>
      </div>

      {visibleSections.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun élément planifié.</p>
        </div>
      ) : (
        <div>
          {visibleSections.map(({ key, label, items }, sectionIndex) => (
            <section key={key}>
              <div
                onClick={(event) => {
                  event.stopPropagation()
                  toggleSection(key)
                }}
                className="flex items-center gap-3 py-2 cursor-pointer select-none group"
              >
                <span className="w-5 h-5 rounded-full bg-stone-700 text-amber-50 text-xs flex items-center justify-center font-bold shrink-0">
                  {sectionIndex + 1}
                </span>
                <span className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">{label}</span>
                {key === 'today' && (
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {capitalize(formatDatePart('weekday'))} {formatDatePart('date')}
                  </span>
                )}
                <div className="flex-1 border-b border-dashed border-stone-300 dark:border-stone-600" />
                <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">{items.length}</span>
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

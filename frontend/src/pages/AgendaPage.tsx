import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Pin, Plus } from 'lucide-react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, getDay, isSameDay, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'
import { fetchMonthCalendar, MonthCalendarResponse, fetchTimeline, TimelineItem, TimelineResponse } from '../api/timeline'

type Panel = 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout'
type View = 'day' | 'week' | 'month'
type MonthFilter = 'ALL' | 'TASK' | 'REMINDER' | 'FOOD' | 'WORKOUT' | 'DIARY'

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

const rowBorderStyles = {
  TASK: 'border-blue-500',
  REMINDER: 'border-orange-500',
  NOTE: 'border-violet-500',
  FOOD: 'border-green-500',
  DIARY: 'border-rose-500',
  WORKOUT: 'border-amber-500',
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
  return now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
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
              className="relative flex min-h-14 flex-col items-center justify-center py-1 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span
                className={`w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${
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

function itemBorderClass(item: TimelineItem) {
  return rowBorderStyles[item.type as keyof typeof rowBorderStyles] ?? rowBorderStyles.NOTE
}

function itemBadgeClass(item: TimelineItem) {
  return badgeStyles[item.type as keyof typeof badgeStyles] ?? badgeStyles.NOTE
}

function itemLabel(item: TimelineItem) {
  return typeLabels[item.type as keyof typeof typeLabels] ?? item.type
}

function sortItems(items: TimelineItem[]) {
  return [...items].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    if (a.type === 'FOOD' && b.type === 'FOOD') {
      return mealOrder.indexOf(getString(a.metadata.mealType) ?? '') - mealOrder.indexOf(getString(b.metadata.mealType) ?? '')
    }
    return a.title.localeCompare(b.title)
  })
}

function TimelineRow({
  item,
  showTime,
  openMenu,
  onOpenMenu,
  onNavigate,
  onTaskStatus,
  onCompleteReminder,
}: {
  item: TimelineItem
  showTime: boolean
  openMenu: number | null
  onOpenMenu: (id: number | null) => void
  onNavigate: (panel: Panel) => void
  onTaskStatus: (id: number, status: string) => void
  onCompleteReminder: (id: number) => void
}) {
  const panel = typeToPanel[item.type]
  const status = getString(item.metadata.status)
  const meta = metadataText(item)
  const mealType = getString(item.metadata.mealType) ?? 'SNACK'

  return (
    <div className="flex items-start gap-3 py-2.5">
      {showTime && <span className="w-14 text-xs font-mono text-gray-400 shrink-0 pt-2">{item.time}</span>}
      <div className={`relative flex-1 border-l-2 pl-3 py-1 flex flex-wrap items-center gap-y-2 ${itemBorderClass(item)}`}>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${itemBadgeClass(item)}`}>{itemLabel(item)}</span>
        {item.type === 'NOTE' && getBoolean(item.metadata.isPinned) && <Pin size={12} className="ml-2 text-violet-400" />}
        {item.type === 'FOOD' && (
          <span className="ml-2 text-xs text-gray-400">
            {mealEmojis[mealType]} {mealLabels[mealType]}
          </span>
        )}
        <span className="ml-2 text-sm text-gray-800 dark:text-gray-200 min-w-0 truncate">{item.title}</span>
        {meta && <span className="text-xs text-gray-400 ml-2">{meta}</span>}
        <div className="ml-auto pl-3 shrink-0">
          {item.type === 'TASK' && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenMenu(openMenu === item.id ? null : item.id)
                }}
                className={`text-xs px-2 py-1 rounded-full border ${taskPriorityClass(getString(item.metadata.priority))} text-gray-600 dark:text-gray-300`}
              >
                {statusFr[status ?? ''] ?? status ?? 'Statut'} <ChevronDown size={12} className="inline" />
              </button>
              {openMenu === item.id && (
                <div className="absolute right-0 top-9 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden min-w-[126px]">
                  {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      onClick={() => onTaskStatus(item.id, nextStatus)}
                      className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        nextStatus === status ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {statusFr[nextStatus]}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {item.type === 'REMINDER' && getBoolean(item.metadata.done) !== true && (
            <button type="button" onClick={() => onCompleteReminder(item.id)} className="text-xs px-2 py-1 rounded-lg text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300">
              Terminé
            </button>
          )}
          {panel && item.type !== 'TASK' && item.type !== 'REMINDER' && (
            <button
              type="button"
              onClick={() => onNavigate(panel)}
              className={`text-xs px-2 py-1 rounded-lg ${item.type === 'FOOD' ? mealBg[mealType] ?? mealBg.SNACK : 'text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'}`}
            >
              Ouvrir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function WeekStrip({ selectedDate, onSelectDate }: { selectedDate: Date; onSelectDate: (date: Date) => void }) {
  const days = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  })
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {days.map((day) => (
        <button
          key={dateKey(day)}
          type="button"
          onClick={() => onSelectDate(day)}
          className={`min-w-[64px] rounded-xl px-3 py-2 text-center ${
            isSameDay(day, selectedDate)
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <span className="block text-xs uppercase">{format(day, 'EEE', { locale: fr })}</span>
          <span className="block text-lg font-semibold">{format(day, 'd')}</span>
        </button>
      ))}
    </div>
  )
}

function MonthOverview({
  viewMonth,
  calendarData,
  filter,
  onFilter,
  onChangeMonth,
  onSelectDate,
}: {
  viewMonth: Date
  calendarData: MonthCalendarResponse
  filter: MonthFilter
  onFilter: (filter: MonthFilter) => void
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
}) {
  const monthStart = startOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(viewMonth) })
  const leadingEmptyDays = (getDay(monthStart) + 6) % 7
  const filters: { value: MonthFilter; label: string }[] = [
    { value: 'ALL', label: 'Tout' },
    { value: 'TASK', label: 'Tâches' },
    { value: 'REMINDER', label: 'Rappels' },
    { value: 'FOOD', label: 'Repas' },
    { value: 'WORKOUT', label: 'Sport' },
    { value: 'DIARY', label: 'Journal' },
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilter(item.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filter === item.value
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => onChangeMonth(addMonths(viewMonth, -1))} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{monthTitle(viewMonth)}</h2>
          <button type="button" onClick={() => onChangeMonth(addMonths(viewMonth, 1))} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold uppercase text-gray-400 py-2">{day}</div>
          ))}
          {Array.from({ length: leadingEmptyDays }).map((_, index) => <div key={`month-empty-${index}`} />)}
          {days.map((day) => {
            const items = (calendarData[dateKey(day)] ?? []).filter((item) => filter === 'ALL' || item.type === filter)
            return (
              <button
                key={dateKey(day)}
                type="button"
                onClick={() => onSelectDate(day)}
                className={`min-h-24 rounded-xl border p-2 text-left transition-colors hover:border-primary-400 ${
                  isToday(day)
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20'
                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <span className={`text-sm font-medium ${isToday(day) ? 'text-primary-600 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-1">
                  {items.slice(0, 2).map((item) => (
                    <div key={`${item.type}-${item.id}`} className={`border-l-2 pl-1.5 text-[11px] text-gray-600 dark:text-gray-300 truncate ${itemBorderClass(item)}`}>
                      {item.title}
                    </div>
                  ))}
                  {items.length > 2 && <p className="text-[11px] text-gray-400">+{items.length - 2} autres</p>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="w-full px-6 py-8 animate-pulse">
      <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl mb-6" />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-[520px] bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  )
}

export default function AgendaPage({ onNavigate }: AgendaPageProps) {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMonth, setViewMonth] = useState<Date>(new Date())
  const [view, setView] = useState<View>('day')
  const [monthFilter, setMonthFilter] = useState<MonthFilter>('ALL')
  const [showMobileCalendar, setShowMobileCalendar] = useState(false)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
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

  const reminderMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/reminders/${id}/done`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
      qc.invalidateQueries({ queryKey: ['timeline'] })
      qc.invalidateQueries({ queryKey: ['timeline-month'] })
    },
  })

  const selectDay = (date: Date) => {
    setSelectedDate(date)
    setViewMonth(date)
  }
  const openDay = (date: Date) => {
    selectDay(date)
    setView('day')
  }
  const goToday = () => {
    const now = new Date()
    selectDay(now)
    setView('day')
  }

  const selectedKey = dateKey(selectedDate)
  const selectedIsToday = isToday(selectedDate)
  const datedItems = selectedIsToday ? (data?.today ?? []) : (calendarData[selectedKey] ?? [])
  const dayItems = [...datedItems, ...(selectedIsToday ? (data?.noDate ?? []) : [])]
  const orderedItems = sortItems(dayItems)
  const timedItems = orderedItems.filter((item) => item.time !== null)
  const untimedItems = orderedItems.filter((item) => item.time === null)
  const tasks = dayItems.filter((item) => item.type === 'TASK')
  const reminders = dayItems.filter((item) => item.type === 'REMINDER')
  const foodItems = dayItems.filter((item) => item.type === 'FOOD')
  const diaryItems = dayItems.filter((item) => item.type === 'DIARY')
  const workoutItems = dayItems.filter((item) => item.type === 'WORKOUT')
  const tasksDone = tasks.filter((item) => getString(item.metadata.status) === 'DONE').length
  const calories = foodItems.reduce((sum, item) => sum + (getNumber(item.metadata.calories) ?? 0), 0)
  const totalSportMinutes = workoutItems.reduce((sum, item) => sum + (getNumber(item.metadata.durationMinutes) ?? 0), 0)
  const mood = getString(diaryItems[0]?.metadata.mood)
  const moodEmoji = ({ GREAT: '😄', GOOD: '🙂', NEUTRAL: '😐', BAD: '😞', TERRIBLE: '😢' } as Record<string, string>)[mood ?? ''] ?? '—'
  const stats = [
    statLabel(tasks.length, 'tâche', 'tâches'),
    statLabel(reminders.length, 'rappel', 'rappels'),
    statLabel(workoutItems.length, 'séance', 'séances'),
  ].join(' · ')
  const upcomingReminders = [...(data?.tomorrow ?? []), ...(data?.thisWeek ?? [])]
    .filter((item) => item.type === 'REMINDER' && getBoolean(item.metadata.done) !== true)
    .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
    .slice(0, 2)
  const timelineTotal = allItems(data).length
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  })

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900" onClick={() => setOpenMenu(null)}>
      <div className="w-full px-6 py-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Agenda</p>
            <h1 style={{ fontFamily: 'Caveat, cursive' }} className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-none">
              {capitalize(format(selectedDate, 'EEEE', { locale: fr }))}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">{format(selectedDate, 'd MMMM yyyy', { locale: fr })}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              title={`${capitalize(formatDatePart('weekday'))} ${formatDatePart('date')}`}
              onClick={goToday}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800"
            >
              Aujourd'hui
            </button>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
              {([['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois']] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className={`px-3 py-1.5 rounded-md text-sm ${view === key ? 'bg-primary-600 text-white' : 'text-gray-500 dark:text-gray-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {view !== 'month' && <WeekStrip selectedDate={selectedDate} onSelectDate={openDay} />}

        {view === 'month' ? (
          <MonthOverview
            viewMonth={viewMonth}
            calendarData={calendarData}
            filter={monthFilter}
            onFilter={setMonthFilter}
            onChangeMonth={setViewMonth}
            onSelectDate={openDay}
          />
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-6 mt-5 lg:mt-0">
            <aside className="lg:sticky lg:top-0 self-start">
              <button
                type="button"
                onClick={() => setShowMobileCalendar((open) => !open)}
                className="lg:hidden w-full card mb-4 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Voir le mois
                <ChevronDown size={16} className={showMobileCalendar ? 'rotate-180' : ''} />
              </button>
              <div className={`${showMobileCalendar ? 'block' : 'hidden'} lg:block`}>
                <MonthCalendar selectedDate={selectedDate} viewMonth={viewMonth} calendarData={calendarData} onSelectDate={openDay} onChangeMonth={setViewMonth} />
              </div>
              <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">À venir</h2>
                  <span className="text-xs text-gray-400">{timelineTotal} planifiés</span>
                </div>
                {upcomingReminders.length === 0 ? (
                  <p className="text-sm text-gray-400">Aucun rappel à venir.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingReminders.map((item) => (
                      <div key={`upcoming-${item.id}`} className="border-l-2 border-orange-500 pl-3">
                        <p className="text-xs font-mono text-gray-400">{item.time ?? '—'}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{item.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => onNavigate('tasks')} className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg px-4 py-2.5">
                + Ajouter un élément
              </button>
            </aside>

            <main className="card p-5 sm:p-6">
              {view === 'day' ? (
                <>
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Journée du {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">{stats}</p>
                  </div>
                  {dayItems.length === 0 ? (
                    <div className="text-center py-16">
                      <CalendarDays size={40} className="mx-auto mb-4 text-gray-400 opacity-30" />
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Votre journée est libre</p>
                      <p className="text-sm text-gray-400 mt-1 mb-6">Aucun élément prévu pour ce jour.</p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button type="button" onClick={() => onNavigate('tasks')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Ajouter une tâche</button>
                        <button type="button" onClick={() => onNavigate('reminders')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">+ Ajouter un rappel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        {timedItems.map((item) => (
                          <TimelineRow
                            key={`timed-${item.type}-${item.id}`}
                            item={item}
                            showTime
                            openMenu={openMenu}
                            onOpenMenu={setOpenMenu}
                            onNavigate={onNavigate}
                            onTaskStatus={(id, status) => statusMutation.mutate({ id, status })}
                            onCompleteReminder={(id) => reminderMutation.mutate(id)}
                          />
                        ))}
                      </div>
                      {untimedItems.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Sans horaire</h3>
                          {untimedItems.map((item) => (
                            <TimelineRow
                              key={`untimed-${item.type}-${item.id}`}
                              item={item}
                              showTime={false}
                              openMenu={openMenu}
                              onOpenMenu={setOpenMenu}
                              onNavigate={onNavigate}
                              onTaskStatus={(id, status) => statusMutation.mutate({ id, status })}
                              onCompleteReminder={(id) => reminderMutation.mutate(id)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center"><p className="text-2xl font-bold text-blue-400">{tasksDone}/{tasks.length}</p><p className="text-xs text-gray-400">Tâches</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-green-400">{calories}</p><p className="text-xs text-gray-400">kcal</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-amber-400">{totalSportMinutes}</p><p className="text-xs text-gray-400">min sport</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-rose-400">{moodEmoji}</p><p className="text-xs text-gray-400">Humeur</p></div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-2 min-w-[720px]">
                    {weekDays.map((day) => {
                      const items = sortItems(calendarData[dateKey(day)] ?? [])
                      return (
                        <div key={`week-${dateKey(day)}`} className={`rounded-xl p-2 min-h-[460px] ${isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-900/60'}`}>
                          <button type="button" onClick={() => openDay(day)} className="w-full text-center pb-3 mb-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="block text-xs uppercase text-gray-400">{format(day, 'EEE', { locale: fr })}</span>
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{format(day, 'd')}</span>
                          </button>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div key={`week-item-${item.type}-${item.id}`} className={`bg-white dark:bg-gray-800 rounded-lg border-l-2 p-2 ${itemBorderClass(item)}`}>
                                <span className={`inline-block text-[10px] px-1 py-0.5 rounded font-medium ${itemBadgeClass(item)}`}>{itemLabel(item)}</span>
                                <p className="text-xs text-gray-700 dark:text-gray-200 mt-1 truncate">{item.title}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onNavigate('tasks')}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Ajouter un élément"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

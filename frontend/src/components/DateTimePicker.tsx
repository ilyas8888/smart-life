import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  parse,
  startOfMonth,
} from 'date-fns'
import { fr } from 'date-fns/locale'

interface DateTimePickerProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function parseValue(value: string): Date | null {
  if (!value) return null
  const parsed = parse(value, "yyyy-MM-dd'T'HH:mm", new Date())
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toValue(date: Date, time: string) {
  return `${format(date, 'yyyy-MM-dd')}T${time}`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function DateTimePicker({ value, onChange, placeholder = 'Choisir une date et heure...' }: DateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const initialDate = parseValue(value)
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(initialDate ?? new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [timeStr, setTimeStr] = useState<string>(initialDate ? format(initialDate, 'HH:mm') : '09:00')

  useEffect(() => {
    const nextDate = parseValue(value)
    setSelectedDate(nextDate)
    setViewMonth(nextDate ?? new Date())
    setTimeStr(nextDate ? format(nextDate, 'HH:mm') : '09:00')
  }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const leadingEmptyDays = (getDay(monthStart) + 6) % 7
  const displayDate = parseValue(value)

  const updateDate = (date: Date) => {
    const next = new Date(date)
    const [h, m] = timeStr.split(':').map(Number)
    next.setHours(h || 0, m || 0, 0, 0)
    setSelectedDate(next)
  }

  const confirm = () => {
    const date = selectedDate ?? new Date()
    onChange(toValue(date, timeStr))
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`input w-full text-left flex items-center gap-2 ${displayDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}
      >
        <Calendar size={15} className="text-gray-400 shrink-0" />
        <span>{displayDate ? format(displayDate, 'dd MMM yyyy à HH:mm', { locale: fr }) : placeholder}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-72">
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
              {capitalize(format(viewMonth, 'MMMM yyyy', { locale: fr }))}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={`${day}-${index}`} className="text-[10px] text-gray-400 font-medium text-center">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingEmptyDays }).map((_, index) => <div key={`empty-${index}`} />)}
            {days.map(day => {
              const selected = selectedDate ? isSameDay(day, selectedDate) : false
              const today = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => updateDate(day)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-primary-600 text-white'
                      : today
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Heure</label>
            <input
              type="time"
              className="input text-sm"
              value={timeStr}
              onChange={event => setTimeStr(event.target.value)}
            />
          </div>

          <button type="button" onClick={confirm} className="btn-primary w-full mt-4">
            Confirmer
          </button>
        </div>
      )}
    </div>
  )
}

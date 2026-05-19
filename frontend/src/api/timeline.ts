import api from './axios'

export type TimelineItem = {
  id: number
  type: string
  title: string
  description: string
  date: string
  time: string | null
  metadata: Record<string, unknown>
}

export type TimelineResponse = {
  today: TimelineItem[]
  tomorrow: TimelineItem[]
  thisWeek: TimelineItem[]
  yesterday: TimelineItem[]
  past: TimelineItem[]
  noDate: TimelineItem[]
}

export type MonthCalendarResponse = Record<string, TimelineItem[]>

export function fetchTimeline() {
  return api.get<TimelineResponse>('/timeline').then((response) => response.data)
}

export function fetchMonthCalendar(year: number, month: number): Promise<MonthCalendarResponse> {
  return api.get<MonthCalendarResponse>(`/timeline/month?year=${year}&month=${month}`).then((response) => response.data)
}

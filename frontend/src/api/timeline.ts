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

export function fetchTimeline() {
  return api.get<TimelineResponse>('/timeline').then((response) => response.data)
}

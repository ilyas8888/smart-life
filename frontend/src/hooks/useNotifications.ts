import { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '../store/authStore'

export interface AppNotification {
  type: 'REACTION' | 'COMMENT' | 'SAVE'
  message: string
  actorName: string
  postId: number
  timestamp: string
}

export function useNotifications() {
  const token = useAuthStore(s => s.token)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!token) return

    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws'

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (msg) => {
          const notif: AppNotification = JSON.parse(msg.body)
          setNotifications(prev => [notif, ...prev].slice(0, 20))
          setUnreadCount(prev => prev + 1)
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [token])

  const markAllRead = useCallback(() => setUnreadCount(0), [])
  const clearAll = useCallback(() => { setNotifications([]); setUnreadCount(0) }, [])

  return { notifications, unreadCount, markAllRead, clearAll }
}

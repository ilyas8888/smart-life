import { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '../store/authStore'
import { refreshAccessToken } from '../api/refreshToken'

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

    let refreshing = false

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
      onStompError: () => {
        // Le serveur a rejeté le CONNECT : quasi toujours un access token
        // expiré/invalide. On rafraîchit une seule fois — un refresh réussi
        // met à jour le store, ce qui relance cet effet avec un token frais
        // et recrée le client. Si le refresh échoue (session morte), on
        // arrête les reconnexions au lieu de boucler toutes les 5s.
        if (refreshing) return
        refreshing = true
        refreshAccessToken()
          .catch(() => { client.deactivate() })
          .finally(() => { refreshing = false })
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

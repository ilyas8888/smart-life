import { useEffect, useState } from 'react'
import api from '../api/axios'

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

interface PushState {
  isSupported: boolean
  permission:  PermissionState
  isSubscribed: boolean
  isLoading:   boolean
  subscribe:   () => Promise<void>
  unsubscribe: () => Promise<void>
  sendTest:    () => Promise<void>
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  const arr     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer
}

export function usePushNotifications(): PushState {
  const isSupported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window

  const [permission,   setPermission]   = useState<PermissionState>(
    isSupported ? (Notification.permission as PermissionState) : 'unsupported'
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)

  // Check current subscription status on mount
  useEffect(() => {
    if (!isSupported) return
    api.get('/push/status').then(r => {
      setIsSubscribed(r.data.subscribed === true)
    }).catch(() => {})
  }, [isSupported])

  const getRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isSupported) return null
    const regs = await navigator.serviceWorker.getRegistrations()
    return regs[0] ?? null
  }

  const subscribe = async (): Promise<void> => {
    if (!isSupported) return
    setIsLoading(true)
    try {
      // Request notification permission
      const result = await Notification.requestPermission()
      setPermission(result as PermissionState)
      if (result !== 'granted') return

      // Get VAPID public key from backend
      const { data } = await api.get<{ publicKey: string }>('/push/vapid-public-key')
      if (!data.publicKey) {
        console.warn('VAPID public key not configured on backend')
        return
      }

      const reg = await getRegistration()
      if (!reg) return

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })

      const json = sub.toJSON()
      await api.post('/push/subscribe', {
        endpoint: json.endpoint,
        keys:     json.keys,
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('Push subscribe failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async (): Promise<void> => {
    if (!isSupported) return
    setIsLoading(true)
    try {
      const reg = await getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } })
        await sub.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('Push unsubscribe failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTest = async (): Promise<void> => {
    await api.post('/push/test')
  }

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe, sendTest }
}

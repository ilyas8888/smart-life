import { useState, useRef, useEffect } from 'react'
import { Bell, Zap, MessageCircle, Bookmark, X } from 'lucide-react'
import { useNotifications, AppNotification } from '../hooks/useNotifications'

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return new Date(ts).toLocaleDateString('fr')
}

const TYPE_CONFIG: Record<AppNotification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  REACTION: { icon: Zap,           color: 'text-amber-400',  bg: 'bg-amber-500/20' },
  COMMENT:  { icon: MessageCircle, color: 'text-sky-400',    bg: 'bg-sky-500/20'   },
  SAVE:     { icon: Bookmark,      color: 'text-violet-400', bg: 'bg-violet-500/20' },
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const handleToggle = () => {
    setOpen(prev => !prev)
    if (!open) markAllRead()
  }

  const goToSocial = () => {
    window.location.hash = 'social'
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                <X size={12} /> Tout effacer
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type]
                const Icon = cfg.icon
                return (
                  <div
                    key={i}
                    onClick={goToSocial}
                    className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <button onClick={goToSocial} className="w-full text-xs text-sky-400 hover:text-sky-300 transition-colors text-center py-1">
                Voir le feed Together →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

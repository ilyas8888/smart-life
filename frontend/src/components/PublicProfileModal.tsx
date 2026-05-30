import { useQuery } from '@tanstack/react-query'
import { X, Award, Globe, Heart, MessageSquare, Bookmark } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'

interface BadgeData {
  type: string; name: string; emoji: string; color: string
  earned: boolean; earnedAt: string | null
}

interface PostSummary {
  id: number; resourceType: string; title: string | null; caption: string | null
  reactionsCount: number; commentsCount: number; savesCount: number; createdAt: string
}

interface PublicProfile {
  id: number; username: string | null; displayName: string; initials: string
  bio: string | null; avatarColor: string; hasAvatar: boolean; createdAt: string
  badges: BadgeData[]; posts: PostSummary[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const RESOURCE_ICONS: Record<string, string> = {
  FOOD_LOG: '🥗', WORKOUT_PLAN: '💪', SLEEP_LOG: '😴',
  STUDY_SESSION: '📚', NOTE: '📝', JOURNAL: '✍️',
}

interface Props {
  userId: number
  onClose: () => void
}

export default function PublicProfileModal({ userId, onClose }: Props) {
  const { data, isLoading } = useQuery<PublicProfile>({
    queryKey: ['public-profile', userId],
    queryFn:  () => api.get(`/profile/by-id/${userId}`).then(r => r.data),
  })

  const earnedBadges = data?.badges.filter(b => b.earned) ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card overflow-hidden max-h-[85dvh] flex flex-col">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          {isLoading ? (
            <div className="animate-pulse flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/10 rounded w-32" />
                <div className="h-3 bg-white/10 rounded w-20" />
              </div>
            </div>
          ) : data ? (
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0 overflow-hidden"
                style={{ background: data.avatarColor }}
              >
                {data.hasAvatar
                  ? <img src={`${API_BASE}/api/profile/avatar/${data.id}`} alt="avatar" className="w-full h-full object-cover" />
                  : data.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-black text-white">{data.displayName}</p>
                {data.username && <p className="text-sm text-gray-500">@{data.username}</p>}
                {data.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{data.bio}</p>}
                <p className="text-xs text-gray-600 mt-1">
                  Membre depuis {format(new Date(data.createdAt), 'MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-xl font-black text-white">{earnedBadges.length}</p>
                <p className="text-[10px] text-gray-600">badges</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {data && (
            <>
              {/* Badges earned */}
              {earnedBadges.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={14} className="text-amber-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Badges</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.map(b => (
                      <span
                        key={b.type}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{ background: `${b.color}15`, color: b.color, borderColor: `${b.color}30` }}
                        title={b.name}
                      >
                        {b.emoji} {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={14} className="text-sky-400" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Publications ({data.posts.length})
                  </p>
                </div>
                {data.posts.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-4">Aucune publication</p>
                ) : (
                  <div className="space-y-2">
                    {data.posts.slice(0, 5).map(post => (
                      <div key={post.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{RESOURCE_ICONS[post.resourceType] ?? '📄'}</span>
                          <p className="text-sm font-semibold text-white truncate">{post.title ?? post.resourceType}</p>
                        </div>
                        {post.caption && <p className="text-xs text-gray-500 line-clamp-1 mb-2">{post.caption}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><Heart size={10} /> {post.reactionsCount}</span>
                          <span className="flex items-center gap-1"><MessageSquare size={10} /> {post.commentsCount}</span>
                          <span className="flex items-center gap-1"><Bookmark size={10} /> {post.savesCount}</span>
                          <span className="ml-auto">{format(new Date(post.createdAt), 'd MMM', { locale: fr })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

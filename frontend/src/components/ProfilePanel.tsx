import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Save, Globe, Zap, Award, MessageSquare, Heart, Bookmark, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../api/axios'

const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F97316',
  '#10B981', '#0EA5E9', '#F59E0B', '#EF4444',
]

const RESOURCE_ICONS: Record<string, string> = {
  FOOD_LOG: '🥗', WORKOUT_PLAN: '💪', SLEEP_LOG: '😴',
  STUDY_SESSION: '📚', NOTE: '📝', JOURNAL: '✍️',
}

interface BadgeData {
  type: string; name: string; description: string
  emoji: string; color: string; earned: boolean; earnedAt: string | null
}

interface ProfileData {
  id: number; username: string | null; displayName: string; initials: string
  firstName: string | null; lastName: string | null; bio: string | null
  avatarColor: string; email: string; createdAt: string
  badges: BadgeData[]
}

interface PostSummary {
  id: number; resourceType: string; title: string | null; caption: string | null
  reactionsCount: number; commentsCount: number; savesCount: number; createdAt: string
}

export default function ProfilePanel() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'posts'>('profile')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<ProfileData>>({})

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['profile-me'],
    queryFn:  () => api.get('/profile/me').then(r => r.data),
  })

  useEffect(() => {
    if (profile && !editing) {
      setForm({
        firstName:   profile.firstName ?? '',
        lastName:    profile.lastName  ?? '',
        username:    profile.username  ?? '',
        bio:         profile.bio       ?? '',
        avatarColor: profile.avatarColor,
      })
    }
  }, [profile, editing])

  const { data: posts = [] } = useQuery<PostSummary[]>({
    queryKey: ['profile-posts'],
    queryFn: () => api.get('/profile/me/posts').then(r => r.data),
    enabled: activeTab === 'posts',
  })

  const saveMutation = useMutation({
    mutationFn: () => api.put('/profile/me', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile-me'] })
      toast.success('Profil mis à jour')
      setEditing(false)
    },
    onError: (err: unknown) => {
      const code = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(code === 'USERNAME_TAKEN' ? 'Ce nom d\'utilisateur est déjà pris' : 'Erreur lors de la sauvegarde')
    },
  })

  if (isLoading || !profile) {
    return <div className="space-y-4 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-16 glass-card" />)}</div>
  }

  const displayColor = form.avatarColor ?? profile.avatarColor ?? '#6366F1'
  const earnedCount  = profile.badges.filter(b => b.earned).length

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Avatar + header ─────────────────────────────────── */}
      <div className="glass-card p-6 flex items-center gap-5"
        style={{ boxShadow: `0 0 40px ${displayColor}18, 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)` }}>
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0 shadow-lg"
          style={{ background: displayColor }}
        >
          {profile.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-black text-white truncate">{profile.displayName}</p>
          {profile.username && <p className="text-sm text-gray-500">@{profile.username}</p>}
          {profile.bio && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{profile.bio}</p>}
          <p className="text-xs text-gray-600 mt-2">
            Membre depuis {format(new Date(profile.createdAt), 'MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center">
            <p className="text-xl font-black text-white">{earnedCount}</p>
            <p className="text-[10px] text-gray-600">badges</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-black text-white">{posts.length || '—'}</p>
            <p className="text-[10px] text-gray-600">posts</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06] gap-1">
        {([
          { id: 'profile', label: 'Mon profil',  icon: User  },
          { id: 'badges',  label: `Badges (${earnedCount}/${profile.badges.length})`, icon: Award },
          { id: 'posts',   label: 'Publications', icon: Globe },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Mon Profil ─────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">Informations</h3>
            {!editing
              ? <button onClick={() => setEditing(true)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Modifier</button>
              : <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-300">Annuler</button>
                  <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                    <Save size={12} /> Sauvegarder
                  </button>
                </div>
            }
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Prénom</label>
                  <input className="input" value={form.firstName ?? ''} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Prénom" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nom</label>
                  <input className="input" value={form.lastName ?? ''} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nom d'utilisateur</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                  <input className="input pl-7" value={form.username ?? ''} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))} placeholder="mon_username" maxLength={30} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bio</label>
                <textarea className="input resize-none min-h-[80px]" value={form.bio ?? ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Quelques mots sur vous..." maxLength={300} />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{(form.bio?.length ?? 0)}/300</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Couleur d'avatar</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, avatarColor: color }))}
                      className="w-8 h-8 rounded-xl transition-transform hover:scale-110"
                      style={{
                        background: color,
                        outline: form.avatarColor === color ? `2px solid ${color}` : '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Email',    value: profile.email },
                { label: 'Prénom',   value: profile.firstName || '—' },
                { label: 'Nom',      value: profile.lastName  || '—' },
                { label: 'Username', value: profile.username ? `@${profile.username}` : '—' },
                { label: 'Bio',      value: profile.bio || '—' },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-xs text-gray-600 w-20 shrink-0 mt-0.5">{row.label}</span>
                  <span className="text-sm text-gray-200">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Badges ─────────────────────────────────────── */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.badges.map(badge => (
            <div
              key={badge.type}
              className={`glass-card p-4 text-center transition-all ${badge.earned ? 'glass-card-hover' : 'opacity-40'}`}
              style={badge.earned ? { boxShadow: `0 0 24px ${badge.color}25` } : undefined}
            >
              <div className="text-3xl mb-2">{badge.emoji}</div>
              <p className="text-xs font-bold text-white leading-tight">{badge.name}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <p className="text-[9px] mt-2 font-semibold" style={{ color: badge.color }}>
                  Gagné {format(new Date(badge.earnedAt), 'd MMM yy', { locale: fr })}
                </p>
              )}
              {!badge.earned && (
                <p className="text-[9px] mt-2 text-gray-600">Verrouillé</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Publications ───────────────────────────────── */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-4xl mb-3">🌐</p>
              <p className="text-white font-bold mb-1">Aucune publication</p>
              <p className="text-sm text-gray-500">Partagez vos activités dans Together</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="glass-card-hover p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{RESOURCE_ICONS[post.resourceType] ?? '📄'}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{post.title ?? post.resourceType}</p>
                      {post.caption && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.caption}</p>}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Heart size={11} /> {post.reactionsCount}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} /> {post.commentsCount}</span>
                  <span className="flex items-center gap-1"><Bookmark size={11} /> {post.savesCount}</span>
                  <span className="ml-auto">{format(new Date(post.createdAt), 'd MMM', { locale: fr })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Quick stats ─────────────────────────────────────── */}
      <div className="glass-card p-4 flex items-center gap-3">
        <Zap size={14} className="text-amber-400 shrink-0" />
        <p className="text-xs text-gray-500">
          {earnedCount === 0
            ? 'Commencez à utiliser SmartLife pour débloquer vos premiers badges !'
            : earnedCount === profile.badges.length
              ? '🎉 Félicitations — tous les badges débloqués !'
              : `${profile.badges.length - earnedCount} badge${profile.badges.length - earnedCount > 1 ? 's' : ''} à débloquer — continuez !`}
        </p>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Globe, Plus, Copy, EyeOff, Trash2, Check, X,
  Link2, Eye, Clock, Users2, Bookmark, Trophy, ChevronRight, ExternalLink, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import SocialPostCard from './SocialPostCard'

interface SharedLink {
  id: number
  resourceType: string
  resourceId: number
  title: string | null
  token: string
  url: string
  expiresAt: string | null
  revoked: boolean
  viewCount: number
  clonesCount: number
  recipientEmail: string | null
  createdAt: string
  isExpired: boolean
}

interface Post {
  id: number
  author: { name: string; initials: string }
  resourceType: string
  resourceId: number
  title: string | null
  caption: string | null
  preview: Record<string, unknown>
  reactions: Record<string, number>
  myReaction: string | null
  commentsCount: number
  savesCount: number
  reactionsCount: number
  isSaved: boolean
  createdAt: string
  timeAgo: string
}

interface ReceivedLink {
  id: number
  resourceType: string
  resourceId: number
  title: string | null
  token: string
  viewCount: number
  clonesCount: number
  owner: { username: string }
  isCloneable: boolean
  expiresAt: string | null
  createdAt: string
}

const RESOURCE_TYPES = [
  { value: 'FOOD_LOG',       label: 'Food Diary',       icon: '??', bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400' },
  { value: 'WORKOUT_PLAN',   label: 'Programme Sport',  icon: '??', bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-400' },
  { value: 'SLEEP_LOG',      label: 'Sommeil',          icon: '??', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  { value: 'STUDY_SESSION',  label: 'Session Étude',    icon: '??', bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-700 dark:text-cyan-400' },
  { value: 'NOTE',           label: 'Note',             icon: '??', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400' },
  { value: 'JOURNAL',        label: 'Journal',          icon: '??', bg: 'bg-rose-100 dark:bg-rose-900/30',    text: 'text-rose-700 dark:text-rose-400' },
]

const EXPIRY_OPTIONS = [
  { value: '24H',   label: '24h' },
  { value: '7D',    label: '7 jours' },
  { value: '30D',   label: '30 jours' },
  { value: 'NEVER', label: 'Jamais' },
]

const TABS = [
  { id: 'shares',     label: 'Mes Partages',     icon: Link2,     active: true  },
  { id: 'received',   label: 'Partagé avec moi', icon: Users2,    active: true  },
  { id: 'community',  label: 'Communauté',        icon: Globe,     active: true  },
  { id: 'saved',      label: 'Inspirations',      icon: Bookmark,  active: true  },
  { id: 'challenges', label: 'Défis',             icon: Trophy,    active: false },
]

const RESOURCE_ENDPOINTS: Record<string, string> = {
  NOTE: '/notes',
  JOURNAL: '/diary',
  FOOD_LOG: '/food-logs',
  WORKOUT_PLAN: '/workout-plans',
  SLEEP_LOG: '/sleep-logs',
  STUDY_SESSION: '/study/sessions',
}

interface CreateForm {
  resourceType: string
  resourceId: string
  title: string
  expiresIn: string
  allowComments: boolean
  allowReactions: boolean
  maskCalories: boolean
  recipientEmail: string
}

interface PostForm {
  resourceType: string
  resourceId: string
  title: string
  caption: string
  filterType: string
}

interface ShareResourceOption {
  id: number
  label: string
}

function defaultForm(): CreateForm {
  return {
    resourceType: 'FOOD_LOG',
    resourceId: '',
    title: '',
    expiresIn: '7D',
    allowComments: false,
    allowReactions: true,
    maskCalories: false,
    recipientEmail: '',
  }
}

function rtConfig(type: string) {
  return RESOURCE_TYPES.find(r => r.value === type) ?? RESOURCE_TYPES[0]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function linkUrl(token: string) {
  return `${window.location.origin}${import.meta.env.BASE_URL}share/${token}`
}

function compactDate(value: unknown) {
  return typeof value === 'string' && value
    ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
}

function toResourceOption(type: string, item: Record<string, unknown>): ShareResourceOption | null {
  const id = typeof item.id === 'number' ? item.id : Number(item.id)
  if (!Number.isFinite(id)) return null

  const date = compactDate(item.logDate ?? item.date ?? item.sleepDate ?? item.entryDate ?? item.startedAt ?? item.createdAt)
  const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : null
  const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : null
  const foodItem = typeof item.foodItem === 'string' && item.foodItem.trim() ? item.foodItem.trim() : null

  let label: string
  switch (type) {
    case 'NOTE':
      label = title ?? `Note #${id}`
      break
    case 'JOURNAL':
      label = title ?? (date ? `Journal du ${date}` : `Journal #${id}`)
      break
    case 'FOOD_LOG':
      label = [date, foodItem].filter(Boolean).join(' - ') || `Food log #${id}`
      break
    case 'WORKOUT_PLAN':
      label = name ?? title ?? `Programme #${id}`
      break
    case 'SLEEP_LOG':
      label = date ? `Sommeil du ${date}` : `Sommeil #${id}`
      break
    case 'STUDY_SESSION':
      label = title ?? (date ? `Session du ${date}` : `Session #${id}`)
      break
    default:
      label = title ?? name ?? `Ressource #${id}`
  }

  return { id, label: `#${id} - ${label}` }
}

function defaultPostForm(): PostForm {
  return { resourceType: 'WORKOUT_PLAN', resourceId: '', title: '', caption: '', filterType: '' }
}

export default function SocialPanel() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab]     = useState('shares')
  const [showModal, setShowModal]     = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [form, setForm]               = useState<CreateForm>(defaultForm())
  const [postForm, setPostForm]       = useState<PostForm>(defaultPostForm())
  const [copiedId, setCopiedId]       = useState<number | null>(null)

  const { data: links = [], isLoading } = useQuery<SharedLink[]>({
    queryKey: ['shared-links'],
    queryFn: () => api.get('/shares').then(r => r.data),
  })

  const { data: received = [], isLoading: receivedLoading } = useQuery<ReceivedLink[]>({
    queryKey: ['shared-links-received'],
    queryFn: () => api.get('/shares/received').then(r => r.data),
    enabled: activeTab === 'received',
  })

  const { data: feed = [], isLoading: feedLoading } = useQuery<Post[]>({
    queryKey: ['social-feed', postForm.filterType],
    queryFn: () => api.get('/social/posts', {
      params: postForm.filterType ? { type: postForm.filterType } : {},
    }).then(r => r.data),
    enabled: activeTab === 'community',
  })

  const { data: saved = [], isLoading: savedLoading } = useQuery<Post[]>({
    queryKey: ['social-saved'],
    queryFn: () => api.get('/social/saved').then(r => r.data),
    enabled: activeTab === 'saved',
  })

  const { data: postResources = [], isLoading: postResourcesLoading } = useQuery<ShareResourceOption[]>({
    queryKey: ['share-resources', postForm.resourceType],
    queryFn: () => api.get(RESOURCE_ENDPOINTS[postForm.resourceType]).then(r => {
      const items = Array.isArray(r.data) ? r.data : []
      return items
        .map((item: Record<string, unknown>) => toResourceOption(postForm.resourceType, item))
        .filter((item: ShareResourceOption | null): item is ShareResourceOption => item !== null)
    }),
    enabled: showPostModal && Boolean(RESOURCE_ENDPOINTS[postForm.resourceType]),
  })

  const publishMutation = useMutation({
    mutationFn: (payload: object) => api.post('/social/posts', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-feed'] })
      toast.success('Publié dans la Communauté !')
      setShowPostModal(false)
      setPostForm(defaultPostForm())
      setActiveTab('community')
    },
    onError: () => toast.error('Erreur lors de la publication'),
  })

  function handlePublish() {
    if (!postForm.resourceId) { toast.error('Ressource requise'); return }
    publishMutation.mutate({
      resourceType: postForm.resourceType,
      resourceId: Number(postForm.resourceId),
      title: postForm.title.trim() || undefined,
      caption: postForm.caption.trim() || undefined,
    })
  }

  const cloneMutation = useMutation({
    mutationFn: (token: string) => api.post(`/shares/${token}/clone`).then(r => r.data),
    onSuccess: () => {
      toast.success('Ressource clonée dans ton compte !')
      qc.invalidateQueries({ queryKey: ['shared-links-received'] })
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error
      if (code === 'NOT_CLONEABLE') toast.error("Ce type n'est pas clonable")
      else toast.error('Erreur lors du clonage')
    },
  })

  const { data: resources = [], isLoading: resourcesLoading } = useQuery<ShareResourceOption[]>({
    queryKey: ['share-resources', form.resourceType],
    queryFn: () => api.get(RESOURCE_ENDPOINTS[form.resourceType]).then(r => {
      const items = Array.isArray(r.data) ? r.data : []
      return items
        .map((item: Record<string, unknown>) => toResourceOption(form.resourceType, item))
        .filter((item: ShareResourceOption | null): item is ShareResourceOption => item !== null)
    }),
    enabled: showModal && Boolean(RESOURCE_ENDPOINTS[form.resourceType]),
  })

  useEffect(() => {
    setForm(f => ({ ...f, resourceId: '' }))
  }, [form.resourceType])

  const createMutation = useMutation({
    mutationFn: (payload: object) => api.post('/shares', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shared-links'] })
      toast.success('Lien de partage créé !')
      setShowModal(false)
      setForm(defaultForm())
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/shares/${id}/revoke`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shared-links'] })
      toast.success('Lien révoqué')
    },
    onError: () => toast.error('Erreur lors de la révocation'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/shares/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shared-links'] })
      toast.success('Lien supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  function handleCopy(link: SharedLink) {
    navigator.clipboard.writeText(linkUrl(link.token))
    setCopiedId(link.id)
    toast.success('Lien copié !')
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleCreate() {
    if (!form.resourceId.trim()) {
      toast.error('Ressource requise')
      return
    }
    createMutation.mutate({
      resourceType: form.resourceType,
      resourceId: Number(form.resourceId),
      title: form.title.trim() || undefined,
      expiresIn: form.expiresIn,
      allowComments: form.allowComments,
      allowReactions: form.allowReactions,
      maskCalories: form.maskCalories,
      recipientEmail: form.recipientEmail.trim() || undefined,
    })
  }

  const activeLinks   = links.filter(l => !l.revoked && !l.isExpired)
  const inactiveLinks = links.filter(l =>  l.revoked ||  l.isExpired)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Globe size={22} className="text-sky-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Together</h1>
            <p className="text-sm text-gray-400">Partage contrôlé, social utile</p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === 'community' && (
            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 text-sm font-medium transition-colors"
            >
              <Sparkles size={16} />
              Publier
            </button>
          )}
          {activeTab === 'shares' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Nouveau partage
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => tab.active && setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white '
                  : tab.active
                    ? 'bg-white/[0.05] text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'bg-white/[0.03]/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {!tab.active && (
                <span className="text-[10px] bg-white/10 text-gray-400 rounded-full px-1.5 py-0.5 ml-0.5">
                  S2+
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Mes Partages */}
      {activeTab === 'shares' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mx-auto mb-4">
                <Link2 size={28} className="text-sky-400" />
              </div>
              <p className="font-semibold text-gray-300">Aucun lien partagé</p>
              <p className="text-sm text-gray-400 mt-1 mb-5 max-w-xs mx-auto">
                Partagez un programme sport, une journée food ou un journal avec n'importe qui — sans qu'ils aient un compte.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                <Plus size={16} />
                Créer mon premier lien
              </button>
            </div>
          ) : (
            <>
              {activeLinks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actifs ({activeLinks.length})
                  </p>
                  {activeLinks.map(link => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      onRevoke={id => revokeMutation.mutate(id)}
                      onDelete={id => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
              {inactiveLinks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Expirés / Révoqués ({inactiveLinks.length})
                  </p>
                  {inactiveLinks.map(link => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      onRevoke={id => revokeMutation.mutate(id)}
                      onDelete={id => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Partagé avec moi */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : received.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mx-auto mb-4">
                <Users2 size={28} className="text-sky-400" />
              </div>
              <p className="font-semibold text-gray-300">Aucun contenu reçu</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                Les ressources partagées avec ton email SmartLife apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Reçus ({received.length})
              </p>
              {received.map(link => {
                const rt = rtConfig(link.resourceType)
                return (
                  <div key={link.id} className="glass-card p-4 border-white/10">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${rt.bg}`}>
                        {rt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">
                          {link.title ?? rt.label}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          <span>De : {link.owner?.username ?? '?'}</span>
                          <span className="flex items-center gap-1"><Eye size={11} />{link.viewCount}</span>
                          <span className={rt.text}>{rt.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`${import.meta.env.BASE_URL}share/${link.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-sky-500 transition-colors"
                          title="Voir"
                        >
                          <ExternalLink size={15} />
                        </a>
                        {link.isCloneable && (
                          <button
                            onClick={() => cloneMutation.mutate(link.token)}
                            disabled={cloneMutation.isPending}
                            className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50"
                            title="Cloner dans mon compte"
                          >
                            <Copy size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Communauté */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { value: '', label: 'Tout' },
              { value: 'WORKOUT_PLAN', label: '?? Sport' },
              { value: 'FOOD_LOG', label: '?? Food' },
              { value: 'NOTE', label: '?? Notes' },
              { value: 'JOURNAL', label: '?? Journal' },
              { value: 'SLEEP_LOG', label: '?? Sommeil' },
              { value: 'STUDY_SESSION', label: '?? Étude' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => { setPostForm(pf => ({ ...pf, filterType: f.value })); qc.invalidateQueries({ queryKey: ['social-feed'] }) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  postForm.filterType === f.value
                    ? 'bg-sky-600 text-white'
                    : 'bg-white/[0.05] text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {feedLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feed.length === 0 ? (
            <div className="text-center py-16">
              <Globe size={36} className="mx-auto mb-3 text-gray-500" />
              <p className="font-semibold text-gray-400">Aucun post dans la communauté</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Soyez le premier à partager quelque chose !</p>
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                <Sparkles size={16} /> Publier maintenant
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {feed.map(post => (
                <SocialPostCard key={post.id} post={post} onDeleted={() => qc.invalidateQueries({ queryKey: ['social-feed'] })} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspirations */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark size={36} className="mx-auto mb-3 text-gray-500" />
              <p className="font-semibold text-gray-400">Aucune inspiration sauvegardée</p>
              <p className="text-sm text-gray-400 mt-1">Sauvegardez des posts depuis la Communauté.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {saved.map(post => (
                <SocialPostCard key={post.id} post={post} onDeleted={() => qc.invalidateQueries({ queryKey: ['social-saved'] })} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coming soon tabs */}
      {activeTab !== 'shares' && activeTab !== 'received' && activeTab !== 'community' && activeTab !== 'saved' && (
        <div className="text-center py-20">
          {(() => {
            const tab = TABS.find(t => t.id === activeTab)!
            const Icon = tab.icon
            return (
              <>
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-300">{tab.label}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Disponible prochainement dans SmartLife Together.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium">
                  Roadmap S4 <ChevronRight size={12} />
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Publish to community modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white/5 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Publier dans la Communauté</h2>
              <button onClick={() => setShowPostModal(false)} className="p-1 rounded-xl hover:bg-white/[0.05]">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Resource type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type de ressource</label>
              <div className="grid grid-cols-3 gap-2">
                {RESOURCE_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    onClick={() => setPostForm(f => ({ ...f, resourceType: rt.value, resourceId: '' }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${
                      postForm.resourceType === rt.value
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                        : 'border-white/10 hover:border-sky-300 dark:hover:border-sky-700'
                    }`}
                  >
                    <span className="text-xl">{rt.icon}</span>
                    <span className={`text-xs font-medium leading-tight ${postForm.resourceType === rt.value ? 'text-sky-700 dark:text-sky-400' : 'text-gray-400'}`}>
                      {rt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resource selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ressource</label>
              <select
                value={postForm.resourceId}
                onChange={e => setPostForm(f => ({ ...f, resourceId: e.target.value }))}
                disabled={postResourcesLoading || postResources.length === 0}
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {postResourcesLoading ? (
                  <option>Chargement...</option>
                ) : postResources.length === 0 ? (
                  <option disabled>Aucune ressource disponible</option>
                ) : (
                  <>
                    <option value="">Choisir une ressource</option>
                    {postResources.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </>
                )}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Titre <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={postForm.title}
                onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Mon programme été 2026"
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Légende <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={postForm.caption}
                onChange={e => setPostForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Quelques mots sur ce que tu partages..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowPostModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/[0.05] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={15} />
                {publishMutation.isPending ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white/5 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Nouveau lien de partage</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl hover:bg-white/[0.05]">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Resource type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de ressource
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RESOURCE_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    onClick={() => setForm(f => ({
                      ...f,
                      resourceType: rt.value,
                      resourceId: '',
                      maskCalories: rt.value !== 'FOOD_LOG' ? false : f.maskCalories,
                    }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${
                      form.resourceType === rt.value
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                        : 'border-white/10 hover:border-sky-300 dark:hover:border-sky-700'
                    }`}
                  >
                    <span className="text-xl">{rt.icon}</span>
                    <span className={`text-xs font-medium leading-tight ${
                      form.resourceType === rt.value ? 'text-sky-700 dark:text-sky-400' : 'text-gray-400'
                    }`}>
                      {rt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resource selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ressource
              </label>
              <select
                value={form.resourceId}
                onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}
                disabled={resourcesLoading || resources.length === 0}
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {resourcesLoading ? (
                  <option value="">Chargement...</option>
                ) : resources.length === 0 ? (
                  <option value="" disabled>Aucune ressource disponible</option>
                ) : (
                  <>
                    <option value="">Choisir une ressource</option>
                    {resources.map(resource => (
                      <option key={resource.id} value={resource.id}>
                        {resource.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Titre <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Mon programme été 2026"
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Recipient email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Envoyer à <span className="text-gray-400 font-normal">(email SmartLife, optionnel)</span>
              </label>
              <input
                type="email"
                value={form.recipientEmail}
                onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
                placeholder="ami@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <p className="text-xs text-gray-400 mt-1">Apparaîtra dans "Partagé avec moi" de ce compte.</p>
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiration du lien
              </label>
              <div className="flex gap-2">
                {EXPIRY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(f => ({ ...f, expiresIn: opt.value }))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.expiresIn === opt.value
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'border-white/10 text-gray-400 hover:border-sky-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Permissions</label>
              {([
                { key: 'allowReactions' as const, label: 'Réactions', desc: 'Inspiré, Je teste, Bravo...' },
                { key: 'allowComments' as const, label: 'Commentaires', desc: 'Questions et retours' },
                ...(form.resourceType === 'FOOD_LOG'
                  ? [{ key: 'maskCalories' as const, label: 'Masquer calories & macros', desc: 'Partage sans données sensibles' }]
                  : []),
              ] as { key: keyof CreateForm; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between gap-3 cursor-pointer select-none">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                      form[key] ? 'bg-sky-600' : 'bg-white/10'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white  transition-transform ${
                      form[key] ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/[0.05] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Création...' : 'Créer le lien'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface LinkCardProps {
  link: SharedLink
  copiedId: number | null
  onCopy: (link: SharedLink) => void
  onRevoke: (id: number) => void
  onDelete: (id: number) => void
}

function LinkCard({ link, copiedId, onCopy, onRevoke, onDelete }: LinkCardProps) {
  const rt = rtConfig(link.resourceType)
  const isInactive = link.revoked || link.isExpired

  return (
    <div className={`glass-card p-4 border-white/10 transition-opacity ${
      isInactive ? 'opacity-55' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${rt.bg}`}>
          {rt.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white truncate">
              {link.title ?? rt.label}
            </span>
            {link.revoked && (
              <span className="text-[10px] font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full px-2 py-0.5 shrink-0">
                Révoqué
              </span>
            )}
            {!link.revoked && link.isExpired && (
              <span className="text-[10px] font-medium bg-white/[0.05] text-gray-500 border border-white/10 rounded-full px-2 py-0.5 shrink-0">
                Expiré
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {link.viewCount} vue{link.viewCount !== 1 ? 's' : ''}
            </span>
            {(link.clonesCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-green-500">
                <Copy size={11} />
                {link.clonesCount} cloné{link.clonesCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {link.expiresAt ? formatDate(link.expiresAt) : 'Jamais'}
            </span>
            <span className={rtConfig(link.resourceType).text}>
              {rt.label} #{link.resourceId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {!isInactive && (
            <button
              onClick={() => onCopy(link)}
              className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-sky-500 transition-colors"
              title="Copier le lien"
            >
              {copiedId === link.id
                ? <Check size={15} className="text-green-500" />
                : <Copy size={15} />
              }
            </button>
          )}
          {!link.revoked && !link.isExpired && (
            <button
              onClick={() => onRevoke(link.id)}
              className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-orange-500 transition-colors"
              title="Révoquer le lien"
            >
              <EyeOff size={15} />
            </button>
          )}
          <button
            onClick={() => onDelete(link.id)}
            className="p-2 rounded-xl hover:bg-white/[0.05] text-gray-400 hover:text-red-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
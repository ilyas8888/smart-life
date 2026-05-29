import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  AlertCircle,
  BarChart2,
  Ban,
  ChevronRight,
  CheckCircle,
  Command,
  CornerDownLeft,
  Database,
  Inbox,
  LayoutDashboard,
  Mail,
  MinusCircle,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import api from '../api/axios'

type AdminTab = 'overview' | 'access' | 'users' | 'prompts' | 'systeme' | 'emails'

type AiAccessStatus = {
  status: 'FREE' | 'APPROVED' | 'PREMIUM' | 'ADMIN' | 'BLOCKED'
}

type AdminOverview = {
  statsByStatus?: Partial<Record<'FREE' | 'APPROVED' | 'PREMIUM' | 'BLOCKED' | 'ADMIN', number>>
  pendingCount: number
  urgentPendingCount: number
  totalUsersCount: number
}

type AdminAiRequest = {
  id: number
  userId: number
  email: string
  message: string
  status: string
  requestedAt: string
  reviewedAt?: string | null
}

type AdminUser = {
  userId: number
  email: string
  firstName?: string | null
  lastName?: string | null
  provider?: string | null
  emailVerified: boolean
  createdAt: string
  aiStatus: string
  planName: string
  monthlyUsed: number
  monthlyQuota: number
  trialUsed: number
  trialQuota: number
  approvedAt?: string | null
  resetAt?: string | null
}

type PromptStats = {
  totalPrompts: number
  todayCount: number
  avgPerDay: number
  last30Days: { date: string; count: number }[]
  topUsers: { userId: number; email: string; count: number }[]
  modulesBreakdown: Record<string, number>
}

type ServiceHealth = {
  status: 'OK' | 'DOWN' | 'NOT_CONFIGURED' | 'UNKNOWN'
  latencyMs?: number
  configured?: boolean
  error?: string
}

type SystemHealth = {
  backend: ServiceHealth
  database: ServiceHealth
  aiService: ServiceHealth
  mail: ServiceHealth
}

type EmailLogEntry = {
  id: number
  type: string
  recipient: string
  status: 'SENT' | 'FAILED' | 'SKIPPED'
  errorMsg: string | null
  createdAt: string
}

type EmailLogsData = {
  counts: { SENT: number; FAILED: number; SKIPPED: number }
  logs: EmailLogEntry[]
}

const navItems = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'access' as const, label: 'Accès IA', icon: ShieldCheck },
  { id: 'users' as const, label: 'Utilisateurs', icon: Users },
  { id: 'prompts' as const, label: 'Prompts IA', icon: Sparkles },
  { id: 'systeme' as const, label: 'Système', icon: Server },
  { id: 'emails' as const, label: 'Emails', icon: Mail },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [paletteOpen, setPaletteOpen] = useState(false)

  const { data: aiStatus, isLoading: isStatusLoading } = useQuery<AiAccessStatus>({
    queryKey: ['ai-access-status'],
    queryFn: () => api.get('/ai-access/status').then((r) => r.data),
  })

  useEffect(() => {
    if (aiStatus && aiStatus.status !== 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [aiStatus, navigate])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  if (isStatusLoading || !aiStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Chargement...
      </div>
    )
  }

  if (aiStatus.status !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-slate-800 bg-slate-900 text-white">
        <div className="border-b border-slate-800 p-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-4 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
              <ShieldCheck size={19} />
            </div>
            <h1 className="text-lg font-bold">Admin</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          >
            <div className="flex items-center gap-2">
              <Command size={13} />
              <span>Commandes</span>
            </div>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-400">⌃K</span>
          </button>
        </div>
      </aside>

      <main className="ml-56 min-h-screen overflow-y-auto bg-slate-950 p-6">
        <div key={activeTab} className="animate-panel">
          {activeTab === 'overview' && <AdminOverviewTab setActiveTab={setActiveTab} />}
          {activeTab === 'access' && <AdminAiAccessTab />}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'prompts' && <AdminPromptsTab />}
          {activeTab === 'systeme' && <AdminSystemTab />}
          {activeTab === 'emails' && <AdminEmailsTab />}
        </div>
      </main>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onNavigate={(tab) => {
            setActiveTab(tab)
            setPaletteOpen(false)
          }}
        />
      )}
    </div>
  )
}

function AdminAiAccessTab() {
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING')
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [approveForm, setApproveForm] = useState<{ status: string; quota: number }>({
    status: 'APPROVED',
    quota: 100,
  })

  const { data: requests = [], isLoading, refetch } = useQuery<AdminAiRequest[]>({
    queryKey: ['admin-requests', filterStatus],
    queryFn: () => api.get(`/admin/ai/requests?status=${filterStatus}`).then((r) => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/ai/requests/${id}/approve`, {
      status: approveForm.status,
      monthlyQuota: approveForm.status === 'ADMIN' ? null : approveForm.quota,
    }),
    onSuccess: () => {
      refetch()
      setApprovingId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/ai/requests/${id}/reject`),
    onSuccess: () => {
      refetch()
    },
  })

  const pendingCount = requests.filter((request) => request.status === 'PENDING').length
  const filters = [
    { id: 'PENDING' as const, label: 'En attente' },
    { id: 'APPROVED' as const, label: 'Approuvées' },
    { id: 'REJECTED' as const, label: 'Rejetées' },
    { id: 'ALL' as const, label: 'Toutes' },
  ]

  const openApproveForm = (requestId: number) => {
    setApprovingId(requestId)
    setApproveForm({ status: 'APPROVED', quota: 100 })
  }

  const handlePlanChange = (status: string) => {
    setApproveForm({
      status,
      quota: status === 'PREMIUM' ? 300 : status === 'ADMIN' ? 0 : 100,
    })
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Demandes d'accès IA</h2>
        <p className="mt-1 text-sm text-slate-400">Traitez les demandes et attribuez le bon niveau d'accès.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              setFilterStatus(filter.id)
              setApprovingId(null)
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filterStatus === filter.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{filter.label}</span>
            {filter.id === 'PENDING' && filterStatus === 'PENDING' && pendingCount > 0 && (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          Chargement des demandes...
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <Inbox size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Aucune demande {filterStatus.toLowerCase()}</h3>
          <p className="mt-1 text-sm text-slate-400">Changez de filtre pour consulter un autre statut.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-slate-800 bg-slate-800 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-white">
                    {(request.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-bold text-slate-100">{request.email}</p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Utilisateur #{request.userId}</p>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Rejeter
                    </button>
                    <button
                      type="button"
                      onClick={() => openApproveForm(request.id)}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approuver
                    </button>
                  </div>
                )}
              </div>

              {request.message && (
                <blockquote className="mt-4 rounded border-l-2 border-slate-600 bg-slate-900 p-2 text-sm italic text-slate-300">
                  {request.message}
                </blockquote>
              )}

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                <span>Demandée le {formatFullDate(request.requestedAt)}</span>
                {request.reviewedAt && <span>Traitée le {formatFullDate(request.reviewedAt)}</span>}
              </div>

              {approvingId === request.id && (
                <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase text-slate-400">Plan</span>
                      <select
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        value={approveForm.status}
                        onChange={(event) => handlePlanChange(event.target.value)}
                      >
                        <option value="APPROVED">APPROVED (100/mois)</option>
                        <option value="PREMIUM">PREMIUM (300/mois)</option>
                        <option value="ADMIN">ADMIN (illimité)</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase text-slate-400">Quota</span>
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                        value={approveForm.quota}
                        disabled={approveForm.status === 'ADMIN'}
                        onChange={(event) => setApproveForm((current) => ({
                          ...current,
                          quota: Number(event.target.value),
                        }))}
                      />
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setApprovingId(null)}
                        className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-600"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approveMutation.isPending ? 'Approbation...' : "Confirmer l'approbation"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AdminUsersTab() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [editingStatus, setEditingStatus] = useState<{ userId: number; status: string; quota: number } | null>(null)

  const { data: users = [], refetch } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  })

  const { data: drawerUser, refetch: refetchDrawerUser } = useQuery<AdminUser>({
    queryKey: ['admin-user-detail', selectedUserId],
    queryFn: () => api.get(`/admin/users/${selectedUserId}`).then((r) => r.data),
    enabled: selectedUserId !== null,
  })

  const updateEntitlementMutation = useMutation({
    mutationFn: (payload: { userId: number; status: string; quota: number }) =>
      api.put(`/admin/ai/entitlements/${payload.userId}`, {
        status: payload.status,
        monthlyQuota: payload.status === 'ADMIN' || payload.status === 'BLOCKED' ? undefined : payload.quota,
      }),
    onSuccess: () => {
      refetch()
      refetchDrawerUser()
      setEditingStatus(null)
    },
  })

  const filtered = users
    .filter((user) => search === '' || user.email.toLowerCase().includes(search.toLowerCase()))
    .filter((user) => statusFilter === 'ALL' || user.aiStatus === statusFilter)

  const openDrawer = (user: AdminUser) => {
    setSelectedUserId(user.userId)
    setEditingStatus({
      userId: user.userId,
      status: user.aiStatus,
      quota: normalizeQuota(user),
    })
  }

  const closeDrawer = () => {
    setSelectedUserId(null)
    setEditingStatus(null)
  }

  const drawerInitials = drawerUser ? getInitials(drawerUser) : '?'

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Utilisateurs
            <span className="ml-3 rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
              {users.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">Comptes, statuts IA et consommation mensuelle.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 sm:w-80">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par email..."
            />
          </label>

          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Tous</option>
            <option value="FREE">FREE</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[840px] text-left">
          <thead className="bg-slate-800">
            <tr className="text-xs font-bold uppercase text-slate-400">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Statut IA</th>
              <th className="px-4 py-3">Utilisation</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 bg-slate-900">
            {filtered.map((user) => (
              <tr key={user.userId} className="transition-colors hover:bg-slate-800/70">
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <p className="truncate font-semibold text-slate-200">{user.email}</p>
                    <span className="mt-1 inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-400">
                      {user.provider ?? 'LOCAL'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={user.aiStatus} />
                </td>
                <td className="px-4 py-4">
                  <UserUsage user={user} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-400">
                  {formatDateOnly(user.createdAt)}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => openDrawer(user)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                    aria-label={`Ouvrir ${user.email}`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="bg-slate-900 p-8 text-center text-sm text-slate-400">
            Aucun utilisateur ne correspond aux filtres.
          </div>
        )}
      </div>

      {selectedUserId !== null && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeDrawer}
            aria-label="Fermer le panneau utilisateur"
          />
          <aside
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-96 transform overflow-y-auto bg-slate-900 shadow-2xl transition-transform duration-300 ${
              selectedUserId !== null ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {drawerUser ? (
              <div className="p-5">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-base font-bold text-white">
                      {drawerInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-white">{drawerUser.email}</p>
                      <p className="mt-1 text-sm text-slate-400">{drawerUser.provider ?? 'LOCAL'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    aria-label="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <DrawerSection title="Profil">
                  <InfoRow label="Email" value={drawerUser.email} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-400">Email vérifié</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                      drawerUser.emailVerified
                        ? 'bg-emerald-900/30 text-emerald-300'
                        : 'bg-red-900/30 text-red-300'
                    }`}>
                      {drawerUser.emailVerified ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <InfoRow label="Provider" value={drawerUser.provider ?? 'LOCAL'} />
                  <InfoRow label="Inscrit le" value={formatDateOnly(drawerUser.createdAt)} />
                </DrawerSection>

                <DrawerSection title="Accès IA">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-400">Statut</span>
                    <StatusBadge status={drawerUser.aiStatus} />
                  </div>
                  <InfoRow label="Plan" value={drawerUser.planName} />
                  <InfoRow
                    label="Utilisation"
                    value={`${drawerUser.monthlyUsed} / ${drawerUser.monthlyQuota === -1 ? '∞' : drawerUser.monthlyQuota} ce mois`}
                  />
                  <InfoRow label="Prochain reset" value={drawerUser.resetAt ? formatFullDate(drawerUser.resetAt) : '—'} />
                  <InfoRow label="Approuvé le" value={drawerUser.approvedAt ? formatFullDate(drawerUser.approvedAt) : '—'} />
                </DrawerSection>

                <DrawerSection title="Actions rapides">
                  <p className="text-sm font-semibold text-slate-200">Modifier le statut</p>
                  {editingStatus && (
                    <div className="mt-3 space-y-3">
                      <select
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        value={editingStatus.status}
                        onChange={(event) => {
                          const status = event.target.value
                          setEditingStatus({
                            userId: drawerUser.userId,
                            status,
                            quota: defaultQuotaForStatus(status),
                          })
                        }}
                      >
                        <option value="FREE">FREE</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="PREMIUM">PREMIUM</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      {editingStatus.status !== 'ADMIN' && editingStatus.status !== 'BLOCKED' && (
                        <label className="block">
                          <span className="mb-1 block text-xs font-semibold uppercase text-slate-400">Quota mensuel</span>
                          <input
                            type="number"
                            min={0}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                            value={editingStatus.quota}
                            onChange={(event) => setEditingStatus((current) => current
                              ? { ...current, quota: Number(event.target.value) }
                              : current)}
                          />
                        </label>
                      )}

                      <button
                        type="button"
                        onClick={() => updateEntitlementMutation.mutate(editingStatus)}
                        disabled={updateEntitlementMutation.isPending}
                        className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updateEntitlementMutation.isPending ? 'Application...' : 'Appliquer'}
                      </button>
                    </div>
                  )}
                </DrawerSection>
              </div>
            ) : (
              <div className="p-5 text-slate-400">Chargement utilisateur...</div>
            )}
          </aside>
        </>
      )}
    </section>
  )
}

function AdminOverviewTab({ setActiveTab }: { setActiveTab: (tab: AdminTab) => void }) {
  const { data: overview, isLoading } = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: () => api.get('/admin/overview').then((r) => r.data),
  })

  const { data: pendingRequests = [] } = useQuery<AdminAiRequest[]>({
    queryKey: ['admin-requests-pending'],
    queryFn: () => api.get('/admin/ai/requests?status=PENDING').then((r) => r.data),
    enabled: !!overview && overview.pendingCount > 0,
  })

  const stats = overview?.statsByStatus ?? {}

  if (isLoading) {
    return <div className="text-slate-400">Chargement du tableau de bord...</div>
  }

  if (!overview) {
    return <div className="text-slate-400">Vue d'administration indisponible.</div>
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Vue d'ensemble</h2>
        <p className="mt-1 text-sm text-slate-400">Tableau de bord administration</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Free" value={stats.FREE ?? 0} icon={Users} iconClassName="text-gray-400" />
        <StatCard label="Approved" value={stats.APPROVED ?? 0} icon={CheckCircle} iconClassName="text-emerald-400" />
        <StatCard label="Premium" value={stats.PREMIUM ?? 0} icon={Star} iconClassName="text-blue-400" />
        <StatCard label="Blocked" value={stats.BLOCKED ?? 0} icon={Ban} iconClassName="text-red-400" />
        <StatCard label="Admin" value={stats.ADMIN ?? 0} icon={ShieldCheck} iconClassName="text-purple-400" />
        <StatCard label="Total inscrits" value={overview.totalUsersCount} icon={UserCheck} iconClassName="text-cyan-400" />
      </div>

      {overview.urgentPendingCount > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            ⚠ {overview.urgentPendingCount} demande(s) en attente depuis plus de 24h
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300"
          >
            Traiter →
          </button>
        </div>
      )}

      {overview.pendingCount > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Demandes en attente</h3>
              <p className="text-sm text-slate-400">Les dernières demandes d'accès au Prompt IA.</p>
            </div>
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-bold text-amber-300">
              {overview.pendingCount}
            </span>
          </div>

          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-200">{request.email}</p>
                  <p className="text-sm text-slate-400">{formatRelativeDate(request.requestedAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('access')}
                  className="text-left text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200 sm:text-right"
                >
                  Voir tout →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  iconClassName: string
}) {
  return (
    <div className="flex min-h-32 flex-col justify-between rounded-xl border border-slate-800 bg-slate-800 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
        <Icon size={17} className={iconClassName} />
        <span>{label}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    FREE: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    PREMIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${classes[status] ?? 'bg-slate-700 text-slate-200'}`}>
      {status}
    </span>
  )
}

function UserUsage({ user }: { user: AdminUser }) {
  if (user.aiStatus === 'ADMIN') {
    return <span className="text-sm font-semibold text-purple-300">∞ illimité</span>
  }

  if (user.aiStatus === 'BLOCKED') {
    return <span className="text-sm font-semibold text-red-300">—</span>
  }

  if (user.aiStatus === 'FREE') {
    return <span className="text-sm text-slate-400">{user.trialUsed}/{user.trialQuota} essais</span>
  }

  const quota = user.monthlyQuota > 0 ? user.monthlyQuota : 0
  const percent = quota > 0 ? Math.min(100, Math.round((user.monthlyUsed / quota) * 100)) : 0
  const barColor = percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="w-40">
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{user.monthlyUsed}/{user.monthlyQuota}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700">
        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase text-slate-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-48 text-right text-sm font-medium text-slate-200">{value}</span>
    </div>
  )
}

function getInitials(user: AdminUser) {
  const first = user.firstName?.trim()?.charAt(0)
  const last = user.lastName?.trim()?.charAt(0)
  if (first || last) {
    return `${first ?? ''}${last ?? ''}`.toUpperCase()
  }
  return (user.email || '?').charAt(0).toUpperCase()
}

function normalizeQuota(user: AdminUser) {
  if (user.aiStatus === 'PREMIUM') {
    return user.monthlyQuota > 0 ? user.monthlyQuota : 300
  }
  if (user.aiStatus === 'APPROVED') {
    return user.monthlyQuota > 0 ? user.monthlyQuota : 100
  }
  return user.monthlyQuota > 0 ? user.monthlyQuota : defaultQuotaForStatus(user.aiStatus)
}

function defaultQuotaForStatus(status: string) {
  if (status === 'PREMIUM') {
    return 300
  }
  if (status === 'ADMIN' || status === 'BLOCKED') {
    return 0
  }
  return 100
}

function formatDateOnly(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatFullDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
  const minutes = Math.round(diffMs / 60000)
  const hours = Math.round(diffMs / 3600000)
  const days = Math.round(diffMs / 86400000)

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute')
  }
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour')
  }
  return formatter.format(days, 'day')
}

function AdminPromptsTab() {
  const { data: stats, isLoading } = useQuery<PromptStats>({
    queryKey: ['admin-prompt-stats'],
    queryFn: () => api.get('/admin/stats/prompts').then((r) => r.data),
  })

  const moduleLabels: Record<string, string> = {
    tasks: 'Tâches',
    reminders: 'Rappels',
    notes: 'Notes',
    contacts: 'Contacts',
    food_logs: 'Repas',
    diary: 'Journal',
    workouts: 'Entraînements',
  }

  if (isLoading) {
    return <div className="text-slate-400">Chargement des statistiques...</div>
  }

  if (!stats) {
    return <div className="text-slate-400">Statistiques indisponibles.</div>
  }

  if (stats.totalPrompts === 0) {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Prompts IA</h2>
          <p className="mt-1 text-sm text-slate-400">Statistiques d'utilisation du Prompt IA</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <Inbox size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Aucun prompt enregistré pour le moment.</h3>
        </div>
      </section>
    )
  }

  const maxCount = Math.max(...stats.last30Days.map((day) => day.count), 1)
  const firstDay = stats.last30Days[0]?.date ?? ''
  const lastDay = stats.last30Days[stats.last30Days.length - 1]?.date ?? ''
  const moduleEntries = Object.entries(stats.modulesBreakdown ?? {})
    .sort(([, a], [, b]) => b - a)
  const totalModules = Math.max(...moduleEntries.map(([, count]) => count), 1)

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Prompts IA</h2>
        <p className="mt-1 text-sm text-slate-400">Statistiques d'utilisation du Prompt IA</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total" value={stats.totalPrompts} icon={Zap} iconClassName="text-violet-400" />
        <StatCard label="Aujourd'hui" value={stats.todayCount} icon={TrendingUp} iconClassName="text-cyan-400" />
        <StatCard label="Moy/jour" value={stats.avgPerDay.toFixed(1)} icon={BarChart2} iconClassName="text-emerald-400" />
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-800 p-5">
        <h3 className="mb-4 text-lg font-bold text-white">Activité — 30 derniers jours</h3>
        <div className="flex h-28 items-end gap-0.5">
          {stats.last30Days.map((day) => {
            const height = Math.max(4, (day.count / maxCount) * 100)
            return (
              <div
                key={day.date}
                className={`flex-1 rounded-t-sm ${day.count > 0 ? 'bg-violet-500' : 'bg-slate-700'}`}
                style={{ height: `${height}%` }}
                title={`${day.date} : ${day.count} prompt(s)`}
              />
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{firstDay}</span>
          <span>{lastDay}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
          <h3 className="mb-4 text-lg font-bold text-white">Top utilisateurs</h3>
          {stats.topUsers.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun prompt enregistré</p>
          ) : (
            <div className="space-y-3">
              {stats.topUsers.map((user) => (
                <div key={user.userId} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                      {(user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <p className="ml-2 truncate text-sm text-slate-200">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-violet-900/40 px-2 py-0.5 text-xs font-bold text-violet-300">
                    {user.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
          <h3 className="mb-4 text-lg font-bold text-white">Modules créés</h3>
          {moduleEntries.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun module créé.</p>
          ) : (
            <div className="space-y-3">
              {moduleEntries.map(([module, count]) => (
                <div key={module}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">{moduleLabels[module] ?? module}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-violet-500"
                      style={{ width: `${(count / totalModules) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AdminSystemTab() {
  const { data, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery<SystemHealth>({
    queryKey: ['admin-system-health'],
    queryFn: () => api.get('/admin/system/health').then((r) => r.data),
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return <div className="text-slate-400">Vérification des services...</div>
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Santé du système</h2>
          <p className="mt-1 text-sm text-slate-400">Mis à jour automatiquement toutes les 30s</p>
          {dataUpdatedAt > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Dernière vérification : {new Date(dataUpdatedAt).toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ServiceCard name="Backend" icon={Server} iconClass="text-cyan-400" health={data?.backend} />
        <ServiceCard name="Database" icon={Database} iconClass="text-blue-400" health={data?.database} />
        <ServiceCard name="AI Service" icon={Sparkles} iconClass="text-violet-400" health={data?.aiService} />
        <ServiceCard name="Mail" icon={Mail} iconClass="text-amber-400" health={data?.mail} />
      </div>
    </section>
  )
}

function ServiceCard({
  name,
  icon: Icon,
  iconClass,
  health,
}: {
  name: string
  icon: LucideIcon
  iconClass: string
  health: ServiceHealth | undefined
}) {
  const status = health?.status ?? 'UNKNOWN'
  const borderClass = {
    OK: 'border-emerald-500/30',
    DOWN: 'border-red-500/30',
    NOT_CONFIGURED: 'border-slate-600',
    UNKNOWN: 'border-slate-700',
  }[status]
  const badgeClass = {
    OK: 'bg-emerald-900/40 text-emerald-300',
    DOWN: 'bg-red-900/40 text-red-300',
    NOT_CONFIGURED: 'bg-slate-700 text-slate-400',
    UNKNOWN: 'bg-amber-900/40 text-amber-300',
  }[status]
  const label = {
    OK: 'Opérationnel',
    DOWN: 'Indisponible',
    NOT_CONFIGURED: 'Non configuré',
    UNKNOWN: 'Inconnu',
  }[status]

  return (
    <div className={`rounded-xl border bg-slate-800 p-5 ${borderClass}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={20} className={iconClass} />
          <h3 className="text-base font-bold text-white">{name}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}>
          {label}
        </span>
      </div>
      {health?.latencyMs !== undefined && health.latencyMs >= 0 && (
        <p className="text-xs text-slate-400">Latence : {health.latencyMs} ms</p>
      )}
      {health?.error && (
        <p className="mt-2 max-w-full truncate text-xs text-red-400" title={health.error}>
          {health.error}
        </p>
      )}
    </div>
  )
}

function AdminEmailsTab() {
  const { data, isLoading, refetch, isFetching } = useQuery<EmailLogsData>({
    queryKey: ['admin-email-logs'],
    queryFn: () => api.get('/admin/emails').then((r) => r.data),
  })

  const typeLabels: Record<string, string> = {
    AI_REQUEST_ADMIN: 'Demande IA → Admin',
    AI_APPROVED: 'Accès IA approuvé',
    AI_REJECTED: 'Accès IA rejeté',
    OTP: 'Code OTP',
    GENERAL: 'Général',
  }

  if (isLoading) {
    return <div className="text-slate-400">Chargement des logs...</div>
  }

  const counts = data?.counts ?? { SENT: 0, FAILED: 0, SKIPPED: 0 }
  const logs = data?.logs ?? []

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Emails</h2>
          <p className="mt-1 text-sm text-slate-400">50 derniers envois</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <EmailCountCard
          label="Sent"
          count={counts.SENT}
          icon={CheckCircle}
          iconClass="text-emerald-400"
          className="border-emerald-700/30 bg-emerald-900/20"
        />
        <EmailCountCard
          label="Failed"
          count={counts.FAILED}
          icon={AlertCircle}
          iconClass="text-red-400"
          className="border-red-700/30 bg-red-900/20"
        />
        <EmailCountCard
          label="Skipped"
          count={counts.SKIPPED}
          icon={MinusCircle}
          iconClass="text-slate-400"
          className="border-slate-700 bg-slate-800"
        />
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <Inbox size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Aucun email enregistré pour le moment.</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-800">
              <tr className="text-xs font-bold uppercase text-slate-400">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Destinataire</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-slate-900">
              {logs.map((entry) => (
                <tr key={entry.id} className="transition-colors hover:bg-slate-800/70">
                  <td className="px-4 py-4">
                    <EmailTypeBadge type={entry.type} label={typeLabels[entry.type] ?? entry.type} />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-mono text-sm text-slate-300">{entry.recipient}</p>
                    {entry.errorMsg && (
                      <p className="mt-1 max-w-xs truncate text-xs text-red-400" title={entry.errorMsg}>
                        {entry.errorMsg}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <EmailStatusBadge status={entry.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {formatFullDate(entry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function EmailCountCard({
  label,
  count,
  icon: Icon,
  iconClass,
  className,
}: {
  label: string
  count: number
  icon: LucideIcon
  iconClass: string
  className: string
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${className}`}>
      <Icon size={18} className={iconClass} />
      <div>
        <p className="text-xl font-bold text-white">{count}</p>
        <p className="text-xs uppercase text-slate-400">{label}</p>
      </div>
    </div>
  )
}

function EmailTypeBadge({ type, label }: { type: string; label: string }) {
  const classes: Record<string, string> = {
    AI_REQUEST_ADMIN: 'bg-amber-900/30 text-amber-300',
    AI_APPROVED: 'bg-emerald-900/30 text-emerald-300',
    AI_REJECTED: 'bg-red-900/30 text-red-300',
    OTP: 'bg-blue-900/30 text-blue-300',
    GENERAL: 'bg-slate-700 text-slate-300',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[type] ?? classes.GENERAL}`}>
      {label}
    </span>
  )
}

function EmailStatusBadge({ status }: { status: EmailLogEntry['status'] }) {
  const config = {
    SENT: { label: 'Envoyé', className: 'bg-emerald-900/30 text-emerald-300' },
    FAILED: { label: 'Échoué', className: 'bg-red-900/30 text-red-300' },
    SKIPPED: { label: 'Ignoré', className: 'bg-slate-700 text-slate-400' },
  }[status]

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${config.className}`}>
      {config.label}
    </span>
  )
}

function CommandPalette({
  onClose,
  onNavigate,
}: {
  onClose: () => void
  onNavigate: (tab: AdminTab) => void
}) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: pendingRequests = [] } = useQuery<AdminAiRequest[]>({
    queryKey: ['admin-requests', 'PENDING'],
    queryFn: () => api.get('/admin/ai/requests?status=PENDING').then((r) => r.data),
  })

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  })

  type PaletteAction = {
    id: string
    label: string
    description?: string
    icon: LucideIcon
    iconClass: string
    category: string
    onSelect: () => void
  }

  const staticActions: PaletteAction[] = [
    {
      id: 'nav-overview',
      label: 'Overview',
      description: 'Vue d\'ensemble et statistiques',
      icon: LayoutDashboard,
      iconClass: 'text-cyan-400',
      category: 'Navigation',
      onSelect: () => onNavigate('overview'),
    },
    {
      id: 'nav-access',
      label: 'Accès IA',
      description: 'Gérer les demandes d\'accès',
      icon: ShieldCheck,
      iconClass: 'text-emerald-400',
      category: 'Navigation',
      onSelect: () => onNavigate('access'),
    },
    {
      id: 'nav-users',
      label: 'Utilisateurs',
      description: 'Tableau des comptes et statuts',
      icon: Users,
      iconClass: 'text-blue-400',
      category: 'Navigation',
      onSelect: () => onNavigate('users'),
    },
  ]

  const requestActions: PaletteAction[] = pendingRequests.slice(0, 3).map((req) => ({
    id: `request-${req.id}`,
    label: req.email,
    description: 'Demande en attente · Accès IA',
    icon: ShieldCheck,
    iconClass: 'text-amber-400',
    category: 'Demandes en attente',
    onSelect: () => onNavigate('access'),
  }))

  const userActions: PaletteAction[] = query.length >= 2
    ? users
        .filter((u) => u.email.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 4)
        .map((u) => ({
          id: `user-${u.userId}`,
          label: u.email,
          description: `${u.aiStatus} · ${u.provider ?? 'LOCAL'}`,
          icon: Users,
          iconClass: 'text-slate-400',
          category: 'Utilisateurs',
          onSelect: () => onNavigate('users'),
        }))
    : []

  const allActions = [...staticActions, ...requestActions, ...userActions]
  const normalizedQuery = query.toLowerCase()
  const filtered = query.trim() === ''
    ? allActions
    : allActions.filter((action) =>
        action.label.toLowerCase().includes(normalizedQuery)
        || (action.description ?? '').toLowerCase().includes(normalizedQuery)
      )

  useEffect(() => {
    setCursor(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((current) => Math.min(current + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((current) => Math.max(current - 1, 0))
    }
    if (e.key === 'Enter' && filtered[cursor]) {
      filtered[cursor].onSelect()
    }
  }

  const groups = filtered.reduce<Record<string, PaletteAction[]>>((acc, action) => {
    acc[action.category] = [...(acc[action.category] ?? []), action]
    return acc
  }, {})

  let globalIndex = 0

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="fixed left-1/2 top-[20%] z-[70] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une action..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-500 transition-colors hover:text-white"
              aria-label="Effacer la recherche"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Aucune action trouvée.</p>
          ) : (
            Object.entries(groups).map(([category, actions]) => (
              <div key={category}>
                <p className="px-4 pb-1 pt-3 text-xs font-bold uppercase text-slate-500">{category}</p>
                {actions.map((action) => {
                  const actionIndex = globalIndex
                  globalIndex += 1
                  const Icon = action.icon
                  const isActive = actionIndex === cursor

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={action.onSelect}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-800 ${
                        isActive ? 'bg-slate-700' : ''
                      }`}
                    >
                      <Icon size={16} className={action.iconClass} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">{action.label}</p>
                        {action.description && (
                          <p className="truncate text-xs text-slate-500">{action.description}</p>
                        )}
                      </div>
                      {isActive && <CornerDownLeft size={13} className="text-slate-500" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-4 border-t border-slate-800 px-4 py-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ArrowUp size={12} />
            <ArrowDown size={12} />
            naviguer
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft size={12} />
            sélectionner
          </span>
          <span>Esc fermer</span>
        </div>
      </div>
    </div>
  )
}

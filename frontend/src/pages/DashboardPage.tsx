import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Brain, CheckSquare, Bell, FileText, Users, LogOut,
  Send, Sparkles, ChevronLeft, ChevronRight, Loader2, UtensilsCrossed, CalendarDays, Sun, Moon, BookOpen, Dumbbell, Menu, X, Lock, ShieldCheck, ExternalLink, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import api from '../api/axios'
import NotificationBell from '../components/NotificationBell'
const HomePanel      = lazy(() => import('../components/HomePanel'))
const AgendaPage     = lazy(() => import('./AgendaPage'))
const TasksPanel     = lazy(() => import('../components/TasksPanel'))
const RemindersPanel = lazy(() => import('../components/RemindersPanel'))
const NotesPanel     = lazy(() => import('../components/NotesPanel'))
const ContactsPanel  = lazy(() => import('../components/ContactsPanel'))
const FoodLogsPanel  = lazy(() => import('../components/FoodLogsPanel'))
const DiaryPanel     = lazy(() => import('../components/DiaryPanel'))
const WorkoutPanel   = lazy(() => import('../components/WorkoutPanel'))
const SleepPanel     = lazy(() => import('../components/SleepPanel'))
const StudyPanel     = lazy(() => import('../components/StudyPanel'))
const SocialPanel    = lazy(() => import('../components/SocialPanel'))
const ProfilePanel   = lazy(() => import('../components/ProfilePanel'))

type Panel = 'home' | 'agenda' | 'prompt' | 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout' | 'sleep' | 'study' | 'social' | 'profile' | 'admin'

const VALID_PANELS: Panel[] = ['home', 'agenda', 'prompt', 'tasks', 'reminders', 'notes', 'contacts', 'food', 'diary', 'workout', 'sleep', 'study', 'social', 'profile', 'admin']

type AiAccessStatus = {
  status: 'FREE' | 'APPROVED' | 'PREMIUM' | 'ADMIN' | 'BLOCKED'
  planName: string
  trialUsed: number
  trialQuota: number
  monthlyUsed: number
  monthlyQuota: number
  lastRequestStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
}

type AdminAiRequest = {
  id: number
  userId: number
  email: string
  message: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

function panelFromHash(): Panel {
  const h = window.location.hash.slice(1) as Panel
  return VALID_PANELS.includes(h) ? h : 'home'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { firstName, lastName, email, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const [activePanel, setActivePanel] = useState<Panel>(panelFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [accessMessage, setAccessMessage] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const onHash = () => setActivePanel(panelFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const [prompt, setPrompt] = useState('')
  const queryClient = useQueryClient()

  const { data: aiStatus, refetch: refetchAiStatus } = useQuery<AiAccessStatus>({
    queryKey: ['ai-access-status'],
    queryFn: () => api.get('/ai-access/status').then((r) => r.data),
  })

  const trialRemaining = aiStatus
    ? Math.max(0, aiStatus.trialQuota - aiStatus.trialUsed)
    : 0
  const isPromptAccessActive = !aiStatus
    || aiStatus.status === 'ADMIN'
    || aiStatus.status === 'APPROVED'
    || aiStatus.status === 'PREMIUM'
    || (aiStatus.status === 'FREE' && trialRemaining > 0)
  const aiPlanLabel = aiStatus?.status === 'ADMIN'
    ? 'Admin'
    : aiStatus?.status === 'PREMIUM'
      ? 'Premium'
      : aiStatus?.status === 'APPROVED'
        ? 'Pro'
        : aiStatus?.status === 'FREE'
          ? `${trialRemaining} essais restants`
          : 'Acces bloque'
  const isAiBlocked = aiStatus?.status === 'BLOCKED'
  const isAiFreeTrialExhausted = aiStatus?.status === 'FREE' && trialRemaining <= 0
  const isAiRequestPending = aiStatus?.lastRequestStatus === 'PENDING'
  const hasAiMonthlyPlan = aiStatus?.status === 'APPROVED' || aiStatus?.status === 'PREMIUM'
  const monthlyCreditLabel = hasAiMonthlyPlan
    ? `${aiStatus.monthlyUsed} / ${aiStatus.monthlyQuota} credits ce mois`
    : null

  const promptMutation = useMutation({
    mutationFn: (text: string) => api.post('/prompt', { prompt: text }).then((r) => r.data),
    onSuccess: (data) => {
      toast.success(data.summary || 'Éléments créés avec succès !')
      setPrompt('')
      queryClient.invalidateQueries()
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number; data?: { error?: string } } })?.response?.status
      const errorCode = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      if (status === 403 && errorCode === 'AI_ACCESS_DENIED') {
        refetchAiStatus()
        toast.error('Acces IA insuffisant.')
        return
      }
      toast.error('Erreur lors du traitement du prompt.')
    },
  })

  const requestAccessMutation = useMutation({
    mutationFn: (message: string) =>
      api.post('/ai-access/request', { message: message.trim() || undefined }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Demande envoyee ! Vous serez notifie apres approbation.')
      setShowAccessModal(false)
      setAccessMessage('')
      refetchAiStatus()
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
      toast.error(data?.message ?? data?.error ?? 'Erreur lors de l\'envoi de la demande.')
    },
  })

  const { data: pendingAiRequests = [], refetch: refetchAiRequests } = useQuery<AdminAiRequest[]>({
    queryKey: ['admin-ai-requests'],
    queryFn: () => api.get('/admin/ai/requests').then((r) => r.data),
    enabled: aiStatus?.status === 'ADMIN',
  })

  const approveAiRequestMutation = useMutation({
    mutationFn: (id: number) =>
      api.put(`/admin/ai/requests/${id}/approve`, { status: 'APPROVED', monthlyQuota: 100 }),
    onSuccess: () => {
      toast.success('Acces approuve.')
      refetchAiRequests()
    },
    onError: () => toast.error('Erreur lors de l\'approbation.'),
  })

  const rejectAiRequestMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/ai/requests/${id}/reject`),
    onSuccess: () => {
      toast.success('Demande rejetee.')
      refetchAiRequests()
    },
    onError: () => toast.error('Erreur lors du rejet.'),
  })

  const pendingAiRequestCount = pendingAiRequests.length
  const isAdminAiActionPending = approveAiRequestMutation.isPending || rejectAiRequestMutation.isPending

  const displayName = firstName ? `${firstName} ${lastName ?? ''}`.trim() : (email ?? 'Utilisateur')

  const { data: myProfile } = useQuery<{ id: number; hasAvatar: boolean }>({
    queryKey: ['profile-me'],
    queryFn: () => api.get('/profile/me').then(r => r.data),
    staleTime: 120_000,
  })

  const MODULE_ACCENT: Record<string, string> = {
    home: 'text-blue-400',
    agenda: 'text-indigo-400',
    prompt: 'text-purple-400',
    tasks: 'text-blue-400',
    reminders: 'text-orange-400',
    notes: 'text-violet-400',
    contacts: 'text-teal-400',
    food: 'text-green-400',
    diary: 'text-rose-400',
    workout: 'text-amber-400',
    sleep: 'text-indigo-400',
    study: 'text-cyan-400',
    social:  'text-sky-400',
    profile: 'text-violet-400',
    admin:   'text-emerald-400',
  }

  const MODULE_GRADIENT: Record<Panel, string> = {
    home:      'from-blue-500 via-indigo-500 to-violet-600',
    agenda:    'from-indigo-500 via-blue-500 to-cyan-400',
    prompt:    'from-purple-500 via-violet-500 to-fuchsia-500',
    tasks:     'from-blue-600 via-sky-500 to-cyan-400',
    reminders: 'from-orange-500 via-amber-400 to-yellow-400',
    notes:     'from-violet-600 via-purple-500 to-fuchsia-400',
    contacts:  'from-teal-500 via-cyan-500 to-sky-400',
    food:      'from-green-600 via-emerald-400 to-teal-400',
    diary:     'from-rose-500 via-pink-400 to-fuchsia-400',
    workout:   'from-amber-500 via-orange-400 to-red-400',
    sleep:     'from-indigo-500 via-sky-500 to-cyan-400',
    study:     'from-cyan-500 via-blue-500 to-violet-500',
    social:    'from-sky-500 via-blue-500 to-indigo-500',
    profile:   'from-violet-500 via-purple-500 to-fuchsia-500',
    admin:     'from-emerald-500 via-teal-500 to-cyan-500',
  }

  const navItems = [
    { id: 'home' as Panel, label: 'Accueil', icon: Sparkles },
    { id: 'agenda' as Panel, label: 'Agenda', icon: CalendarDays },
    { id: 'prompt' as Panel, label: 'Prompt IA', icon: Brain },
    { id: 'tasks' as Panel, label: 'Tâches', icon: CheckSquare },
    { id: 'reminders' as Panel, label: 'Rappels', icon: Bell },
    { id: 'notes' as Panel, label: 'Notes', icon: FileText },
    { id: 'contacts' as Panel, label: 'Contacts', icon: Users },
    { id: 'food' as Panel, label: 'Alimentation', icon: UtensilsCrossed },
    { id: 'diary' as Panel, label: 'Journal', icon: BookOpen },
    { id: 'workout' as Panel, label: 'Sport', icon: Dumbbell },
    { id: 'sleep' as Panel, label: 'Sommeil', icon: Moon },
    { id: 'study' as Panel, label: 'Apprentissage', icon: BookOpen },
    { id: 'social'   as Panel, label: 'Together', icon: Globe },
    { id: 'profile'  as Panel, label: 'Mon Profil', icon: Users },
    ...(aiStatus?.status === 'ADMIN' ? [{
      id: 'admin' as Panel,
      label: pendingAiRequestCount > 0 ? `Admin IA (${pendingAiRequestCount})` : 'Admin IA',
      icon: ShieldCheck,
      disabled: isAdminAiActionPending,
    }] : []),
  ]

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    promptMutation.mutate(prompt)
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore API error — logout locally regardless
    } finally {
      logout()
    }
  }

  const handleNavClick = (id: Panel) => {
    if (id === 'admin') {
      navigate('/admin')
      setSidebarOpen(false)
      return
    }
    window.location.hash = id
    setActivePanel(id)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen min-h-dvh flex bg-[#070B14] text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30 w-72 ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-72'} text-white flex flex-col border-r border-white/[0.10]
          transform transition-[transform,width] duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)' }}
      >
        <div className={`${sidebarCollapsed ? 'md:px-3' : 'md:px-5'} p-5 border-b border-white/[0.10]`} style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Brain size={22} />
            </div>
            <span className={`font-black text-lg tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent ${sidebarCollapsed ? 'md:hidden' : ''}`}>SmartLife</span>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              className="hidden md:flex absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-[#0D1117] border border-white/10 text-gray-500 hover:text-white transition-colors"
              aria-label={sidebarCollapsed ? 'Afficher la navigation' : 'Masquer la navigation'}
              title={sidebarCollapsed ? 'Afficher la navigation' : 'Masquer la navigation'}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1 text-gray-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className={`flex-1 p-3 space-y-0.5 overflow-y-auto ${sidebarCollapsed ? 'md:px-2' : ''}`}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              title={sidebarCollapsed ? label : undefined}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''} ${
                activePanel === id
                  ? `bg-white/[0.08] ${MODULE_ACCENT[id]}`
                  : 'text-gray-500 hover:text-gray-100 hover:bg-white/[0.05]'
              }`}
            >
              {activePanel === id && !sidebarCollapsed && (
                <span className="absolute left-0 inset-y-2 w-0.5 rounded-r-full bg-current" />
              )}
              <Icon size={19} className={activePanel === id ? MODULE_ACCENT[id] : ''} />
              <span className={sidebarCollapsed ? 'md:hidden' : ''}>{label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-white/[0.06] ${sidebarCollapsed ? 'md:px-2' : ''}`}>
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            title="Mon Profil"
            className={`w-full flex items-center gap-3 mb-3 rounded-xl px-2 py-1.5 hover:bg-white/[0.05] transition-colors ${sidebarCollapsed ? 'md:justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-base font-bold shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.4)] overflow-hidden">
              {myProfile?.hasAvatar && myProfile.id
                ? <img src={`${import.meta.env.VITE_API_URL ?? ''}/api/profile/avatar/${myProfile.id}`} alt="avatar" className="w-full h-full object-cover" />
                : (firstName ?? email ?? '?')[0].toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 text-left ${sidebarCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Déconnexion' : undefined}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/[0.05] transition-all ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}`}
          >
            <LogOut size={18} />
            <span className={sidebarCollapsed ? 'md:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0 pb-20 md:pb-0">
        <header className="border-b border-white/[0.06] bg-[#0D1117]/80 backdrop-blur-xl px-4 md:px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 -ml-1 text-gray-500 hover:text-white md:hidden"
              >
                <Menu size={20} />
              </button>
              <span className="text-gray-600">SmartLife</span>
              <ChevronRight size={14} className="text-gray-700" />
              <span className="text-white font-semibold">
                {navItems.find((n) => n.id === activePanel)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                <span className="hidden sm:inline">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div key={activePanel} className="w-full min-h-full animate-panel">
            <div className={`h-px mb-8 bg-gradient-to-r ${MODULE_GRADIENT[activePanel]} opacity-60`} />

          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>}>
          {activePanel === 'home' && <HomePanel onNavigate={handleNavClick} displayName={displayName} />}
          {activePanel === 'agenda' && <AgendaPage onNavigate={handleNavClick} />}

          {activePanel === 'prompt' && (
            <div className="w-full">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles size={16} />
                  Powered by Claude Sonnet 4.6
                  {aiPlanLabel && (
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                      isPromptAccessActive
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {aiPlanLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Qu'est-ce que vous avez aujourd'hui ?
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Décrivez votre journée, vos tâches, vos contacts, vos repas... l'IA structure tout automatiquement.
                </p>
              </div>

              {isAiBlocked ? (
                <div className="card max-w-xl mx-auto text-center py-10">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Acces desactive</h3>
                  <p className="text-gray-500 dark:text-gray-400">Votre acces au Prompt IA a ete desactive.</p>
                </div>
              ) : isAiFreeTrialExhausted && isAiRequestPending ? (
                <div className="card max-w-xl mx-auto text-center py-10">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                    <Bell size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Demande en cours de revision</h3>
                  <p className="text-gray-500 dark:text-gray-400">Votre demande d'acces est en attente d'approbation.</p>
                </div>
              ) : isAiFreeTrialExhausted ? (
                <div className="card max-w-xl mx-auto text-center py-10">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Essai gratuit epuise</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-5">
                    Vous avez utilise vos {aiStatus?.trialQuota ?? 0} essais gratuits.
                  </p>
                  {aiStatus?.lastRequestStatus === 'REJECTED' && (
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                      Votre precedente demande a ete refusee. Vous pouvez en soumettre une nouvelle.
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowAccessModal(true)}
                    disabled={requestAccessMutation.isPending}
                  >
                    {requestAccessMutation.isPending ? 'Envoi...' : 'Demander l\'acces complet'}
                  </button>
                </div>
              ) : (
              <form onSubmit={handleSend} className="card">
                {(aiPlanLabel || monthlyCreditLabel) && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    {aiPlanLabel && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {aiPlanLabel}
                      </span>
                    )}
                    {monthlyCreditLabel && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{monthlyCreditLabel}</span>
                    )}
                  </div>
                )}
                <textarea
                  className="w-full resize-none border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-base leading-relaxed min-h-[180px]"
                  placeholder={`Exemples:\n- "Réunion avec Ahmed demain 14h, tel: 0555123456"\n- "Rappelle-moi d'appeler le médecin jeudi matin"\n- "Pizza à midi, puis 45min de muscu (squat 80kg × 4 séries, développé couché 60kg × 3 séries)"\n- "Je me sens bien aujourd'hui, j'ai terminé le rapport — priorité haute pour vendredi"\n- "Couru 8km ce soir en 42 minutes"`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={promptMutation.isPending}
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">{prompt.length} caractères</span>
                    {aiStatus?.status === 'FREE' && trialRemaining > 0 && (
                      <button
                        type="button"
                        className="text-left text-xs font-medium text-primary-600 hover:underline dark:text-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => setShowAccessModal(true)}
                        disabled={requestAccessMutation.isPending || aiStatus.lastRequestStatus === 'PENDING'}
                      >
                        {aiStatus.lastRequestStatus === 'PENDING'
                          ? 'Demande en cours de revision'
                          : requestAccessMutation.isPending
                            ? 'Envoi de la demande...'
                            : 'Demander l\'acces complet'}
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    disabled={!prompt.trim() || promptMutation.isPending || !isPromptAccessActive}
                  >
                    {promptMutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Analyse en cours...</>
                    ) : (
                      <><Send size={16} /> Envoyer</>
                    )}
                  </button>
                </div>
              </form>
              )}

              {promptMutation.isSuccess && promptMutation.data && (
                <div className="card mt-4 bg-green-50 border-green-100">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Sparkles size={16} />
                    Résultat
                  </h3>
                  <p className="text-green-700 mb-3">{promptMutation.data.summary}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Tâches', items: promptMutation.data.tasksCreated },
                      { label: 'Rappels', items: promptMutation.data.remindersCreated },
                      { label: 'Notes', items: promptMutation.data.notesCreated },
                      { label: 'Contacts', items: promptMutation.data.contactsCreated },
                      { label: 'Repas', items: promptMutation.data.foodLogsCreated },
                      { label: 'Journal', items: promptMutation.data.diaryEntriesCreated },
                      { label: 'Sport', items: promptMutation.data.workoutsCreated },
                    ].map(({ label, items }) =>
                      items?.length ? (
                        <div key={label} className="bg-white rounded-lg p-2 border border-green-100">
                          <p className="font-medium text-gray-700">{label} ({items.length})</p>
                          {items.map((item: Record<string, unknown>, i: number) => (
                            <p key={i} className="text-gray-500 text-xs truncate">
                              - {String(item.title ?? item.name ?? '')}
                            </p>
                          ))}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activePanel === 'tasks' && <TasksPanel />}
          {activePanel === 'reminders' && <RemindersPanel />}
          {activePanel === 'notes' && <NotesPanel />}
          {activePanel === 'contacts' && <ContactsPanel />}
          {activePanel === 'food' && <FoodLogsPanel />}
          {activePanel === 'diary' && <DiaryPanel />}
          {activePanel === 'workout' && <WorkoutPanel />}
          {activePanel === 'sleep' && <SleepPanel />}
          {activePanel === 'study' && <StudyPanel />}
          {activePanel === 'social' && <SocialPanel />}
          {activePanel === 'profile' && <ProfilePanel />}
          </Suspense>
          {activePanel === 'admin' && aiStatus?.status === 'ADMIN' && (
            <div className="w-full flex flex-col items-center justify-center py-20 animate-panel">
              <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h2 className="text-xl font-bold text-slate-100">Panneau d'administration</h2>
                <p className="text-slate-400 text-sm">
                  Le panneau admin a été déplacé vers une interface dédiée.
                </p>
                {pendingAiRequestCount > 0 && (
                  <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-2 text-amber-300 text-sm">
                    {pendingAiRequestCount} demande(s) en attente
                  </div>
                )}
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ouvrir l'admin panel
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-[#0D1117]/90 backdrop-blur-xl px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 md:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleNavClick(id)}
              className={`flex min-w-[4.75rem] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all ${
                activePanel === id
                  ? `bg-white/10 ${MODULE_ACCENT[id]}`
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.05]'
              }`}
            >
              <Icon size={19} className={activePanel === id ? MODULE_ACCENT[id] : ''} />
              <span className="max-w-16 truncate">{label.replace(/\s*\(.+\)$/, '')}</span>
            </button>
          ))}
        </div>
      </nav>

      {showAccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/55 p-0 sm:items-center sm:px-4 sm:py-6"
          onMouseDown={() => setShowAccessModal(false)}
        >
          <div
            className="h-dvh w-full overflow-y-auto border border-white/10 bg-[#0D1117] p-6 shadow-2xl sm:h-auto sm:max-w-lg sm:rounded-2xl"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-access-title"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                <Sparkles size={21} />
              </div>
              <div>
                <h3 id="ai-access-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Demander l'acces au Prompt IA
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  L'assistant IA transforme vos phrases en taches, repas, sport et journal.
                </p>
              </div>
            </div>

            <div className="mb-5 grid gap-2 text-sm text-gray-700 dark:text-gray-300">
              {[
                'Creer des taches et rappels',
                'Logger repas et nutrition',
                'Enregistrer seances sport',
                'Ecrire dans le journal',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Pourquoi souhaitez-vous l'acces ? <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <textarea
              className="input min-h-[110px] w-full resize-none"
              value={accessMessage}
              onChange={(event) => setAccessMessage(event.target.value)}
              placeholder="Ex: Je veux utiliser SmartLife pour organiser mes repas et mes taches avec l'IA."
              disabled={requestAccessMutation.isPending}
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAccessModal(false)}
                disabled={requestAccessMutation.isPending}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => requestAccessMutation.mutate(accessMessage)}
                disabled={requestAccessMutation.isPending}
              >
                {requestAccessMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

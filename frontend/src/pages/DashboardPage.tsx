import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Brain, CheckSquare, Bell, FileText, Users, LogOut,
  Send, Sparkles, ChevronLeft, ChevronRight, Loader2, UtensilsCrossed, CalendarDays, Sun, Moon, BookOpen, Dumbbell, Menu, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import api from '../api/axios'
import TasksPanel from '../components/TasksPanel'
import RemindersPanel from '../components/RemindersPanel'
import NotesPanel from '../components/NotesPanel'
import ContactsPanel from '../components/ContactsPanel'
import FoodLogsPanel from '../components/FoodLogsPanel'
import AgendaPage from './AgendaPage'
import DiaryPanel from '../components/DiaryPanel'
import WorkoutPanel from '../components/WorkoutPanel'
import HomePanel from '../components/HomePanel'

type Panel = 'home' | 'agenda' | 'prompt' | 'tasks' | 'reminders' | 'notes' | 'contacts' | 'food' | 'diary' | 'workout'

const VALID_PANELS: Panel[] = ['home', 'agenda', 'prompt', 'tasks', 'reminders', 'notes', 'contacts', 'food', 'diary', 'workout']

function panelFromHash(): Panel {
  const h = window.location.hash.slice(1) as Panel
  return VALID_PANELS.includes(h) ? h : 'home'
}

export default function DashboardPage() {
  const { firstName, lastName, email, logout } = useAuthStore()
  const isDark = useThemeStore((s) => s.isDark)
  const toggle = useThemeStore((s) => s.toggle)
  const [activePanel, setActivePanel] = useState<Panel>(panelFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const onHash = () => setActivePanel(panelFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const [prompt, setPrompt] = useState('')
  const queryClient = useQueryClient()

  const promptMutation = useMutation({
    mutationFn: (text: string) => api.post('/prompt', { prompt: text }).then((r) => r.data),
    onSuccess: (data) => {
      toast.success(data.summary || 'Éléments créés avec succès !')
      setPrompt('')
      queryClient.invalidateQueries()
    },
    onError: () => toast.error('Erreur lors du traitement du prompt'),
  })

  const displayName = firstName ? `${firstName} ${lastName ?? ''}`.trim() : (email ?? 'Utilisateur')

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
    window.location.hash = id
    setActivePanel(id)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 w-72 ${sidebarCollapsed ? 'md:w-20' : 'md:w-72'} bg-slate-900 text-white flex flex-col border-r border-slate-700
        transform transition-[transform,width] duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`${sidebarCollapsed ? 'md:px-3' : 'md:px-5'} p-5 border-b border-gray-700`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl">
              <Brain size={22} />
            </div>
            <span className={`font-bold text-xl ${sidebarCollapsed ? 'md:hidden' : ''}`}>SmartLife</span>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              className="hidden md:flex absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
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

        <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'md:px-3' : ''}`}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              title={sidebarCollapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''} ${
                activePanel === id
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={activePanel === id ? MODULE_ACCENT[id] : ''} />
              <span className={sidebarCollapsed ? 'md:hidden' : ''}>{label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-gray-700 ${sidebarCollapsed ? 'md:px-3' : ''}`}>
          <div className={`flex items-center gap-3 mb-3 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-base font-bold shrink-0">
              {(firstName ?? email ?? '?')[0].toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Déconnexion' : undefined}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}`}
          >
            <LogOut size={18} />
            <span className={sidebarCollapsed ? 'md:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shadow-none border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 md:px-6 py-4 dark:bg-gray-900/80 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 -ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 md:hidden"
              >
                <Menu size={20} />
              </button>
              <span>SmartLife</span>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium dark:text-gray-100">
                {navItems.find((n) => n.id === activePanel)?.label}
              </span>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 dark:bg-gray-900">
          <div key={activePanel} className="w-full min-h-full animate-panel">
            <div className={`h-1.5 rounded-full mb-6 bg-gradient-to-r ${MODULE_GRADIENT[activePanel]}`} />

          {activePanel === 'home' && <HomePanel onNavigate={handleNavClick} displayName={displayName} />}
          {activePanel === 'agenda' && <AgendaPage onNavigate={handleNavClick} />}

          {activePanel === 'prompt' && (
            <div className="w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles size={16} />
                  Powered by Claude Sonnet 4.6
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Qu'est-ce que vous avez aujourd'hui ?
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Décrivez votre journée, vos tâches, vos contacts, vos repas... l'IA structure tout automatiquement.
                </p>
              </div>

              <form onSubmit={handleSend} className="card">
                <textarea
                  className="w-full resize-none border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-base leading-relaxed min-h-[180px]"
                  placeholder={`Exemples:\n- "Réunion avec Ahmed demain 14h, tel: 0555123456"\n- "Rappelle-moi d'appeler le médecin jeudi matin"\n- "Pizza à midi, puis 45min de muscu (squat 80kg × 4 séries, développé couché 60kg × 3 séries)"\n- "Je me sens bien aujourd'hui, j'ai terminé le rapport — priorité haute pour vendredi"\n- "Couru 8km ce soir en 42 minutes"`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={promptMutation.isPending}
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{prompt.length} caractères</span>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                    disabled={!prompt.trim() || promptMutation.isPending}
                  >
                    {promptMutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Analyse en cours...</>
                    ) : (
                      <><Send size={16} /> Envoyer</>
                    )}
                  </button>
                </div>
              </form>

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
          </div>
        </div>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Brain, CheckSquare, Bell, FileText, Users, LogOut,
  Send, Sparkles, ChevronRight, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import TasksPanel from '../components/TasksPanel'
import RemindersPanel from '../components/RemindersPanel'
import NotesPanel from '../components/NotesPanel'
import ContactsPanel from '../components/ContactsPanel'

type Panel = 'prompt' | 'tasks' | 'reminders' | 'notes' | 'contacts'

export default function DashboardPage() {
  const { firstName, lastName, email, logout } = useAuthStore()
  const [activePanel, setActivePanel] = useState<Panel>('prompt')
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

  const displayName = firstName ? `${firstName} ${lastName ?? ''}`.trim() : email

  const navItems = [
    { id: 'prompt' as Panel, label: 'Prompt IA', icon: Brain },
    { id: 'tasks' as Panel, label: 'Tâches', icon: CheckSquare },
    { id: 'reminders' as Panel, label: 'Rappels', icon: Bell },
    { id: 'notes' as Panel, label: 'Notes', icon: FileText },
    { id: 'contacts' as Panel, label: 'Contacts', icon: Users },
  ]

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    promptMutation.mutate(prompt)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Brain size={20} />
            </div>
            <span className="font-bold text-lg">SmartLife</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePanel === id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
              {(firstName ?? email ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>SmartLife</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              {navItems.find((n) => n.id === activePanel)?.label}
            </span>
          </div>
        </header>

        {/* Panel content */}
        <div className="flex-1 overflow-auto p-6">
          {activePanel === 'prompt' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles size={16} />
                  Powered by Claude Sonnet 4.6
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Qu'est-ce que vous avez aujourd'hui ?
                </h2>
                <p className="text-gray-500">
                  Décrivez votre journée, vos tâches, vos contacts, vos repas... l'IA structure tout automatiquement.
                </p>
              </div>

              <form onSubmit={handleSend} className="card">
                <textarea
                  className="w-full resize-none border-0 outline-none text-gray-900 placeholder-gray-400 text-base leading-relaxed min-h-[180px]"
                  placeholder={`Exemples:\n• "J'ai une réunion avec Ahmed demain à 14h, son numéro c'est le 0555123456"\n• "Rappelle-moi d'appeler le médecin jeudi matin"\n• "J'ai mangé une pizza à midi, j'ai couru 5km ce soir"\n• "Je dois finir le rapport avant vendredi, priorité haute"`}
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
                    ].map(({ label, items }) =>
                      items?.length ? (
                        <div key={label} className="bg-white rounded-lg p-2 border border-green-100">
                          <p className="font-medium text-gray-700">{label} ({items.length})</p>
                          {items.map((item: Record<string, unknown>, i: number) => (
                            <p key={i} className="text-gray-500 text-xs truncate">
                              • {String(item.title ?? item.name ?? '')}
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
        </div>
      </main>
    </div>
  )
}

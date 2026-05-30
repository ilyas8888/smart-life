import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpenCheck, Check, Clock, GraduationCap, Plus, RotateCcw, Target, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

type StudyTopic = {
  id: number
  name: string
  color: string
  goal: string | null
  targetHours: number | null
  deadline: string | null
}

type StudySession = {
  id: number
  topic: StudyTopic | null
  title: string
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  focusScore: number | null
  difficultyScore: number | null
  learned: string | null
  nextStep: string | null
}

type StudyReview = {
  id: number
  topic: StudyTopic | null
  sessionTitle: string | null
  reviewDate: string
  status: string
}

type StudySummary = {
  weekMinutes: number
  weekSessions: number
  focusAverage: number
  dueReviews: number
  activeSession: StudySession | null
}

const TOPIC_COLORS = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  green: 'bg-green-500/10 text-green-400 border border-green-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
} as const

function minutesLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function topicColor(topic?: StudyTopic | null) {
  const key = (topic?.color ?? 'blue') as keyof typeof TOPIC_COLORS
  return TOPIC_COLORS[key] ?? TOPIC_COLORS.blue
}

function ScoreButtons({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map(score => (
          <button key={score} type="button" onClick={() => onChange(score)}
            className={`rounded-xl py-2 text-xs font-semibold transition-colors ${
              value === score ? 'bg-primary-600 text-white' : 'bg-white/[0.05] text-gray-400'
            }`}>
            {score}
          </button>
        ))}
      </div>
    </div>
  )
}

function TopicModal({ onClose, onSave }: { onClose: () => void; onSave: (body: Record<string, unknown>) => void }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [targetHours, setTargetHours] = useState('')
  const [deadline, setDeadline] = useState('')
  const [color, setColor] = useState<keyof typeof TOPIC_COLORS>('blue')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/5 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 border-white/10">
          <h3 className="font-black text-white">Nouveau sujet</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Sujet, ex: Spring Security" />
          <textarea className="input min-h-[80px] resize-none" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Objectif global" />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" min="0" value={targetHours} onChange={e => setTargetHours(e.target.value)} placeholder="Heures cible" />
            <input className="input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TOPIC_COLORS) as Array<keyof typeof TOPIC_COLORS>).map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${color === c ? TOPIC_COLORS[c] : 'bg-white/[0.05] text-gray-500'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="button" className="btn-primary" disabled={!name.trim()}
              onClick={() => onSave({ name: name.trim(), goal: goal.trim() || null, targetHours: targetHours || null, deadline: deadline || null, color })}>
              Cr�er
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinishSessionModal({ session, onClose, onFinish }: {
  session: StudySession
  onClose: () => void
  onFinish: (body: Record<string, unknown>) => void
}) {
  const [focusScore, setFocusScore] = useState(4)
  const [difficultyScore, setDifficultyScore] = useState(3)
  const [learned, setLearned] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [notes, setNotes] = useState('')
  const [createReview, setCreateReview] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/5 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1rem)] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 border-white/10">
          <div>
            <p className="text-xs text-gray-400">Cl�ture de session</p>
            <h3 className="font-black text-white">{session.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <ScoreButtons label="Concentration" value={focusScore} onChange={setFocusScore} />
          <ScoreButtons label="Difficult�" value={difficultyScore} onChange={setDifficultyScore} />
          <textarea className="input min-h-[80px] resize-none" value={learned} onChange={e => setLearned(e.target.value)} placeholder="Qu'as-tu appris ?" />
          <textarea className="input min-h-[70px] resize-none" value={nextStep} onChange={e => setNextStep(e.target.value)} placeholder="Prochaine action claire" />
          <textarea className="input min-h-[70px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes rapides" />
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={createReview} onChange={e => setCreateReview(e.target.checked)} className="accent-primary-600" />
            Cr�er des r�visions J+1, J+3, J+7, J+14
          </label>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="button" className="btn-primary"
              onClick={() => onFinish({ focusScore, difficultyScore, learned, nextStep, notes, createReview })}>
              Terminer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudyPanel() {
  const qc = useQueryClient()
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [sessionDraft, setSessionDraft] = useState({ topicId: '', title: '' })
  const [finishingSession, setFinishingSession] = useState<StudySession | null>(null)

  const { data: topics = [] } = useQuery<StudyTopic[]>({
    queryKey: ['study-topics'],
    queryFn: () => api.get('/study/topics').then(r => r.data),
  })
  const { data: sessions = [] } = useQuery<StudySession[]>({
    queryKey: ['study-sessions'],
    queryFn: () => api.get('/study/sessions').then(r => r.data),
  })
  const { data: reviews = [] } = useQuery<StudyReview[]>({
    queryKey: ['study-reviews'],
    queryFn: () => api.get('/study/reviews?dueOnly=true').then(r => r.data),
  })
  const { data: summary } = useQuery<StudySummary>({
    queryKey: ['study-summary'],
    queryFn: () => api.get('/study/summary').then(r => r.data),
  })

  const invalidateStudy = () => {
    qc.invalidateQueries({ queryKey: ['study-topics'] })
    qc.invalidateQueries({ queryKey: ['study-sessions'] })
    qc.invalidateQueries({ queryKey: ['study-reviews'] })
    qc.invalidateQueries({ queryKey: ['study-summary'] })
  }

  const createTopic = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/study/topics', body),
    onSuccess: () => { invalidateStudy(); setShowTopicModal(false); toast.success('Sujet cr��') },
  })
  const startSession = useMutation({
    mutationFn: () => api.post('/study/sessions/start', {
      title: sessionDraft.title.trim(),
      topicId: sessionDraft.topicId || null,
    }),
    onSuccess: () => { invalidateStudy(); setSessionDraft({ topicId: '', title: '' }); toast.success('Session d�marr�e') },
  })
  const finishSession = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => api.put(`/study/sessions/${id}/finish`, body),
    onSuccess: () => { invalidateStudy(); setFinishingSession(null); toast.success('Session termin�e') },
  })
  const completeReview = useMutation({
    mutationFn: (id: number) => api.patch(`/study/reviews/${id}`, { status: 'DONE', masteryScore: 4 }),
    onSuccess: () => { invalidateStudy(); toast.success('R�vision valid�e') },
  })
  const deleteSession = useMutation({
    mutationFn: (id: number) => api.delete(`/study/sessions/${id}`),
    onSuccess: () => { invalidateStudy(); toast.success('Session supprim�e') },
  })

  const activeSession = summary?.activeSession ?? sessions.find(s => !s.endedAt) ?? null
  const completedSessions = useMemo(() => sessions.filter(s => s.endedAt).slice(0, 8), [sessions])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-black text-white text-2xl flex items-center gap-2">
            <GraduationCap className="text-primary-600" />
            Apprentissage
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sessions focus, r�visions et prochaines actions.
          </p>
        </div>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => setShowTopicModal(true)}>
          <Plus size={16} /> Sujet
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Cette semaine', value: minutesLabel(summary?.weekMinutes ?? 0), icon: <Clock size={15} /> },
          { label: 'Sessions', value: summary?.weekSessions ?? 0, icon: <BookOpenCheck size={15} /> },
          { label: 'Focus moyen', value: summary?.focusAverage ? `${summary.focusAverage}/5` : '�', icon: <Target size={15} /> },
          { label: '� r�viser', value: summary?.dueReviews ?? reviews.length, icon: <RotateCcw size={15} /> },
        ].map(stat => (
          <div key={stat.label} className="glass-card px-4 py-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-2 text-white">{stat.icon}</div>
            <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card mb-5">
        {activeSession ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">Session en cours</p>
              <h3 className="font-black text-white">{activeSession.title}</h3>
              <p className="text-xs text-gray-400 mt-1">D�marr�e � {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setFinishingSession(activeSession)}>Cl�turer</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <select className="input" value={sessionDraft.topicId} onChange={e => setSessionDraft(v => ({ ...v, topicId: e.target.value }))}>
              <option value="">Sujet libre</option>
              {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </select>
            <input className="input" value={sessionDraft.title} onChange={e => setSessionDraft(v => ({ ...v, title: e.target.value }))}
              placeholder="Objectif de session" />
            <button type="button" className="btn-primary" disabled={!sessionDraft.title.trim() || startSession.isPending}
              onClick={() => startSession.mutate()}>
              D�marrer
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Historique</h3>
          </div>
          {completedSessions.length === 0 ? (
            <div className="card text-sm text-gray-400">Aucune session termin�e pour le moment.</div>
          ) : completedSessions.map(session => (
            <div key={session.id} className="glass-card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {session.topic && (
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${topicColor(session.topic)}`}>
                      {session.topic.name}
                    </span>
                  )}
                  <h4 className="font-black text-white mt-1">{session.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {minutesLabel(session.durationMinutes ?? 0)} � Focus {session.focusScore ?? '�'}/5 � Difficult� {session.difficultyScore ?? '�'}/5
                  </p>
                  {session.nextStep && <p className="text-sm text-primary-300 mt-2">Prochaine action: {session.nextStep}</p>}
                </div>
                <button type="button" onClick={() => deleteSession.mutate(session.id)} className="p-1.5 text-gray-300 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-5">
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Sujets</h3>
            <div className="space-y-2">
              {topics.length === 0 ? (
                <div className="card text-sm text-gray-400">Cr�ez un premier sujet pour organiser vos sessions.</div>
              ) : topics.map(topic => (
                <div key={topic.id} className="rounded-xl border border-white/10 border-white/10 bg-white/5 p-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${topicColor(topic)}`}>{topic.name}</span>
                  {topic.goal && <p className="text-xs text-gray-400 mt-2">{topic.goal}</p>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">R�visions dues</h3>
            <div className="space-y-2">
              {reviews.length === 0 ? (
                <div className="card text-sm text-gray-400">Aucune r�vision due aujourd'hui.</div>
              ) : reviews.map(review => (
                <div key={review.id} className="rounded-xl border border-amber-900/40 bg-amber-900/20 p-3" style={{ boxShadow: '0 0 12px rgba(245,158,11,0.15)' }}>
                  <p className="text-sm font-semibold text-white">{review.sessionTitle ?? 'R�vision'}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.topic?.name ?? 'Sujet libre'} � {review.reviewDate}</p>
                  <button type="button" onClick={() => completeReview.mutate(review.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors">
                    <Check size={13} /> Marquer revue
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {showTopicModal && <TopicModal onClose={() => setShowTopicModal(false)} onSave={body => createTopic.mutate(body)} />}
      {finishingSession && (
        <FinishSessionModal
          session={finishingSession}
          onClose={() => setFinishingSession(null)}
          onFinish={body => finishSession.mutate({ id: finishingSession.id, body })}
        />
      )}
    </div>
  )
}
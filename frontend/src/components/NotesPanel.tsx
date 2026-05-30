import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookMarked, Edit2, FileText, Palette, Pin, Plus,
  Search, Tag, Trash2, X,
} from 'lucide-react'
import { EmptyPanel, IllustrationNotes } from './EmptyState'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Note {
  id: number
  title: string | null
  content: string
  isPinned: boolean
  color: string
  tags: string[] | null
  createdAt: string
}

const NOTE_COLORS: { value: string; label: string; bg: string; dark: string }[] = [
  { value: 'default', label: 'D�faut', bg: '', dark: '' },
  { value: 'yellow', label: 'Jaune', bg: 'bg-yellow-100 border-yellow-300', dark: 'dark:bg-yellow-800/40 dark:border-yellow-600' },
  { value: 'pink', label: 'Rose', bg: 'bg-pink-100 border-pink-300', dark: 'dark:bg-pink-800/40 dark:border-pink-600' },
  { value: 'green', label: 'Vert', bg: 'bg-green-100 border-green-300', dark: 'dark:bg-green-800/40 dark:border-green-600' },
  { value: 'blue', label: 'Bleu', bg: 'bg-blue-100 border-blue-300', dark: 'dark:bg-blue-800/40 dark:border-blue-600' },
  { value: 'purple', label: 'Violet', bg: 'bg-purple-100 border-purple-300', dark: 'dark:bg-purple-800/40 dark:border-purple-600' },
]

const COLOR_DOT: Record<string, string> = {
  default: 'bg-white/10',
  yellow: 'bg-yellow-400',
  pink: 'bg-pink-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
}

function noteCardClass(color: string, isPinned: boolean) {
  if (isPinned && color === 'default') return 'border-yellow-300 bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-800/40'
  const c = NOTE_COLORS.find((nc) => nc.value === color)
  if (c && c.bg) return `${c.bg} ${c.dark}`
  return ''
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function ColorPickerPopover({
  currentColor, onSelect,
}: { currentColor: string; onSelect: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="p-1.5 rounded-xl text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
        title="Couleur"
      >
        <Palette size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white/5 rounded-xl shadow-lg border border-white/10 dark:border-gray-600 p-2 flex gap-1.5">
          {NOTE_COLORS.map((nc) => (
            <button
              key={nc.value}
              type="button"
              title={nc.label}
              onClick={(e) => { e.stopPropagation(); onSelect(nc.value); setOpen(false) }}
              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${COLOR_DOT[nc.value]} ${
                currentColor === nc.value ? 'border-primary-500 scale-125' : 'border-transparent'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteModal({
  note, onClose, onUpdate, onDelete, onPin, onColorChange,
}: {
  note: Note
  onClose: () => void
  onUpdate: () => void
  onDelete: (id: number) => void
  onPin: (id: number) => void
  onColorChange: (id: number, color: string) => void
}) {
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title ?? '')
  const [editContent, setEditContent] = useState(note.content)

  useEffect(() => {
    setEditMode(false)
    setEditTitle(note.title ?? '')
    setEditContent(note.content)
  }, [note])

  const saveEdit = () => {
    api.put(`/notes/${note.id}`, { title: editTitle || null, content: editContent })
      .then(() => { onUpdate(); setEditMode(false); toast.success('Note mise � jour') })
      .catch(() => toast.error('Erreur'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-xl max-h-[calc(100dvh-1rem)] sm:max-h-[85vh] flex flex-col overflow-hidden ${noteCardClass(note.color, note.isPinned) || 'bg-white/5'}`}>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-black/5 border-white/10">
          <ColorPickerPopover currentColor={note.color ?? 'default'} onSelect={c => onColorChange(note.id, c)} />
          <button type="button" onClick={() => onPin(note.id)}
            className={`p-1.5 rounded-xl transition-colors ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}>
            <Pin size={16} />
          </button>
          <div className="flex-1" />
          {!editMode ? (
            <button type="button" onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors">
              <Edit2 size={13} /> Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditMode(false); setEditTitle(note.title ?? ''); setEditContent(note.content) }}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.05]">Annuler</button>
              <button type="button" onClick={saveEdit}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/5 text-white dark:bg-white dark:text-gray-900 font-semibold">Sauvegarder</button>
            </div>
          )}
          <button type="button" onClick={() => { onDelete(note.id); onClose() }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {editMode ? (
            <>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="w-full text-xl font-bold bg-transparent border-none outline-none mb-3 placeholder-gray-300"
                placeholder="Titre" />
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed min-h-[250px] placeholder-gray-400"
                placeholder="Contenu de la note..." />
            </>
          ) : (
            <>
              {note.title && <h2 className="text-xl font-bold mb-3 text-white">{note.title}</h2>}
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {note.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-gray-400">
                      # {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-black/5 border-white/10 text-xs text-gray-400">
          Cr��e le {format(new Date(note.createdAt), 'dd MMMM yyyy � HH:mm', { locale: fr })}
        </div>
      </div>
    </div>
  )
}

export default function NotesPanel() {
  const qc = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [formExpanded, setFormExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [color, setColor] = useState('default')
  const [newTag, setNewTag] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterColor, setFilterColor] = useState<string | null>(null)
  const [openNote, setOpenNote] = useState<Note | null>(null)

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: () => api.get('/notes').then((r) => r.data),
  })

  useEffect(() => {
    if (!formExpanded) return
    const handler = (e: MouseEvent) => {
      if (!formRef.current?.contains(e.target as Node)) return
      // handled inside form
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [formExpanded])

  const createMutation = useMutation({
    mutationFn: () => api.post('/notes', { title: title || null, content, isPinned, color, tags: formTags }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setTitle('')
      setContent('')
      setIsPinned(false)
      setColor('default')
      setFormTags([])
      setNewTag('')
      setFormExpanded(false)
      toast.success('Note cr��e')
    },
    onError: () => toast.error('Erreur lors de la cr�ation'),
  })

  const pinMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notes/${id}/pin`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const colorMutation = useMutation({
    mutationFn: ({ id, color }: { id: number; color: string }) =>
      api.patch(`/notes/${id}/color?color=${color}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/notes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Note supprim�e') },
  })

  const stats = useMemo(() => ({
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    colored: notes.filter(n => (n.color ?? 'default') !== 'default').length,
    tagged: notes.filter(n => n.tags && n.tags.length > 0).length,
  }), [notes])

  const filteredNotes = useMemo(() => notes.filter(note => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || (note.title ?? '').toLowerCase().includes(q) || note.content.toLowerCase().includes(q)
    const matchesColor = !filterColor || note.color === filterColor
    return matchesSearch && matchesColor
  }), [notes, searchQuery, filterColor])

  const pinnedNotes = filteredNotes.filter(n => n.isPinned)
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned)

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, '')
    if (!tag || formTags.includes(tag)) return
    setFormTags(prev => [...prev, tag])
    setNewTag('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(newTag)
    }
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate()
  }

  const renderNotes = (items: Note[]) => (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {items.map((n) => (
        <div key={n.id}
          onClick={() => setOpenNote(n)}
          className={`glass-card-hover break-inside-avoid mb-4 relative cursor-pointer group ${noteCardClass(n.color, n.isPinned)}`}>
          {n.isPinned && (
            <Pin size={14} className="absolute top-3 right-3 text-yellow-500" />
          )}
          <div className="flex items-start justify-between gap-2 mb-2 pr-5">
            {n.title && <h3 className="font-semibold text-white text-sm">{n.title}</h3>}
            <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto">
              <ColorPickerPopover
                currentColor={n.color ?? 'default'}
                onSelect={(c) => colorMutation.mutate({ id: n.id, color: c })}
              />
              <button type="button"
                onClick={(e) => { e.stopPropagation(); pinMutation.mutate(n.id) }}
                className={`p-1.5 rounded-xl transition-colors ${n.isPinned ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-400'}`}
              >
                <Pin size={14} />
              </button>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id) }}
                className="p-1.5 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap line-clamp-4">{n.content}</p>
          {n.tags && n.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {n.tags.map((tag) => (
                <span key={tag} className="text-[11px] bg-white/[0.05] text-gray-400 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                  <Tag size={9} /> # {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3">
            {format(new Date(n.createdAt), 'dd MMM yyyy', { locale: fr })} � {wordCount(n.content)} mots
          </p>
        </div>
      ))}
    </div>
  )

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div>
      <h2 className="font-black text-white text-2xl mb-4 flex items-center gap-2">
        <FileText className="text-primary-600" />
        Notes
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: <FileText size={16} />, gradient: 'from-violet-500 to-fuchsia-500', glow: 'rgba(139,92,246,0.3)' },
          { label: 'Épinglées', value: stats.pinned, icon: <Pin size={16} />, gradient: 'from-yellow-500 to-amber-400', glow: 'rgba(234,179,8,0.3)' },
          { label: 'Colorées', value: stats.colored, icon: <Palette size={16} />, gradient: 'from-pink-500 to-rose-400', glow: 'rgba(236,72,153,0.3)' },
          { label: 'Tags', value: stats.tagged, icon: <BookMarked size={16} />, gradient: 'from-teal-500 to-cyan-400', glow: 'rgba(20,184,166,0.3)' },
        ].map(stat => (
          <div key={stat.label} className="glass-card px-4 py-4 text-center" style={{ boxShadow: `0 0 20px ${stat.glow}` }}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 text-white`}>{stat.icon}</div>
            <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleCreate}
        onBlur={(e: React.FocusEvent) => {
          if (formRef.current?.contains(e.relatedTarget as Node)) return
          if (title || content || formTags.length > 0) return
          setFormExpanded(false)
        }}
        className="card mb-5">
        {!formExpanded ? (
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-300 placeholder-gray-400"
            placeholder="Prendre une note..."
            onFocus={() => setFormExpanded(true)}
          />
        ) : (
          <div className="space-y-3">
            <input
              className="w-full bg-transparent outline-none text-base font-semibold text-white placeholder-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre"
            />
            <textarea
              className="w-full bg-transparent outline-none min-h-[100px] resize-none text-sm text-gray-300 placeholder-gray-400"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contenu de la note..."
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {formTags.map(tag => (
                <button key={tag} type="button" onClick={() => setFormTags(prev => prev.filter(t => t !== tag))}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 flex items-center gap-1">
                  <Tag size={9} /> {tag} <X size={10} />
                </button>
              ))}
              <input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(newTag)}
                className="bg-transparent outline-none text-xs text-gray-500 placeholder-gray-400 min-w-24"
                placeholder="#tag"
              />
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsPinned(v => !v)}
                  className={`p-1.5 rounded-xl transition-colors ${isPinned ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-400'}`}>
                  <Pin size={16} />
                </button>
                <div className="flex items-center gap-1.5">
                  {NOTE_COLORS.map((nc) => (
                    <button
                      key={nc.value}
                      type="button"
                      title={nc.label}
                      onClick={() => setColor(nc.value)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${COLOR_DOT[nc.value]} ${
                        color === nc.value ? 'border-primary-500 scale-125' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2"
                disabled={!content.trim() || createMutation.isPending}
              >
                <Plus size={16} />
                Ajouter
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher dans les notes..."
            className="input pl-9 py-2 text-sm w-full" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Couleur :</span>
          <button type="button" onClick={() => setFilterColor(null)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${!filterColor ? 'bg-white/10 text-white' : 'bg-white/[0.05] text-gray-500'}`}>
            Toutes
          </button>
          {NOTE_COLORS.map(nc => (
            <button key={nc.value} type="button" onClick={() => setFilterColor(filterColor === nc.value ? null : nc.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${COLOR_DOT[nc.value]} ${filterColor === nc.value ? 'border-white scale-125' : 'border-transparent'}`}
              title={nc.label} />
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyPanel
          illustration={<IllustrationNotes />}
          gradient="from-violet-600 to-fuchsia-400"
          headline="Tes id�es m�ritent d'�tre captur�es"
          description="Notes color�es, �pingl�es, �tiquet�es. Retrouve n'importe quelle id�e en quelques secondes."
          preview={
            <div className="card border border-yellow-300 bg-yellow-50 dark:bg-yellow-800/40 dark:border-yellow-600">
              <div className="flex items-center gap-2 mb-2">
                <Pin size={13} className="text-yellow-600 dark:text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">�pingl�e</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">#PFE</span>
              </div>
              <p className="font-semibold text-white mb-1">Architecture SmartLife</p>
              <p className="text-sm text-gray-400 line-clamp-2">Spring Boot + React + Keycloak + Neon PostgreSQL. D�ploiement HF Spaces avec supervisord...</p>
            </div>
          }
          primaryLabel="+ Prendre une note"
          onPrimary={() => setFormExpanded(true)}
        />
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">�pingl�es</p>
              {renderNotes(pinnedNotes)}
              {unpinnedNotes.length > 0 && (
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 mt-6">Autres</p>
              )}
            </>
          )}
          {renderNotes(unpinnedNotes)}
        </>
      )}

      {openNote && (
        <NoteModal
          note={notes.find(n => n.id === openNote.id) ?? openNote}
          onClose={() => setOpenNote(null)}
          onUpdate={() => qc.invalidateQueries({ queryKey: ['notes'] })}
          onDelete={(id) => deleteMutation.mutate(id)}
          onPin={(id) => pinMutation.mutate(id)}
          onColorChange={(id, c) => colorMutation.mutate({ id, color: c })}
        />
      )}
    </div>
  )
}
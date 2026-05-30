import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare, Bookmark, BookmarkCheck, Trash2, ChevronDown, ChevronUp, Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const RESOURCE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  FOOD_LOG:      { label: 'Food Diary',      icon: '??', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  WORKOUT_PLAN:  { label: 'Programme Sport', icon: '??', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  SLEEP_LOG:     { label: 'Sommeil',         icon: '??', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
  STUDY_SESSION: { label: '�tude',           icon: '??', color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
  NOTE:          { label: 'Note',            icon: '??', color: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
  JOURNAL:       { label: 'Journal',         icon: '??', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
}

const REACTIONS = [
  { type: 'INSPIRED', emoji: '??', label: 'Inspir�' },
  { type: 'TRYING',   emoji: '??', label: 'Je teste' },
  { type: 'BRAVO',    emoji: '??', label: 'Bravo' },
  { type: 'HOW',      emoji: '?', label: 'Comment ?' },
]

interface Post {
  id: number
  author: { userId: number; name: string; initials: string; username: string; avatarColor: string; hasAvatar: boolean }
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

interface Comment {
  id: number
  author: { name: string; initials: string }
  content: string
  timeAgo: string
  replies?: Comment[]
}

interface Props {
  post: Post
  currentUserId?: number
  onDeleted?: (id: number) => void
  onAuthorClick?: (userId: number) => void
}

export default function SocialPostCard({ post, onDeleted, onAuthorClick }: Props) {
  const qc = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)

  const rt = RESOURCE_LABELS[post.resourceType] ?? { label: post.resourceType, icon: '??', color: 'bg-white/[0.05] text-gray-400 border border-white/10' }

  const reactMutation = useMutation({
    mutationFn: (type: string) => api.post(`/social/posts/${post.id}/react`, { type }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-feed'] }),
  })

  const saveMutation = useMutation({
    mutationFn: () => api.post(`/social/posts/${post.id}/save`).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['social-feed'] })
      qc.invalidateQueries({ queryKey: ['social-saved'] })
      toast.success(data.saved ? 'Ajout� aux inspirations' : 'Retir� des inspirations')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/social/posts/${post.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-feed'] })
      onDeleted?.(post.id)
      toast.success('Post supprim�')
    },
  })

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['social-comments', post.id],
    queryFn: () => api.get(`/social/posts/${post.id}/comments`).then(r => r.data),
    enabled: showComments,
  })

  const commentMutation = useMutation({
    mutationFn: (payload: { content: string; parentId?: number }) =>
      api.post(`/social/posts/${post.id}/comments`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-comments', post.id] })
      qc.invalidateQueries({ queryKey: ['social-feed'] })
      setCommentText('')
      setReplyTo(null)
    },
    onError: () => toast.error('Erreur lors de l\'envoi'),
  })

  function submitComment() {
    if (!commentText.trim()) return
    commentMutation.mutate({ content: commentText, parentId: replyTo?.id })
  }

  return (
    <div className="glass-card border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onAuthorClick?.(post.author.userId)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 hover:scale-110 transition-transform overflow-hidden"
          style={{ background: post.author.avatarColor ?? '#6366F1' }}
          title={`Voir le profil de ${post.author.name}`}
        >
          {post.author.hasAvatar
            ? <img src={`${API_BASE}/api/profile/avatar/${post.author.userId}`} alt={post.author.initials} className="w-full h-full object-cover" />
            : post.author.initials}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{post.author.name}</p>
          <p className="text-xs text-gray-400">{post.timeAgo}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rt.color}`}>
          {rt.icon} {rt.label}
        </span>
        <button
          onClick={() => deleteMutation.mutate()}
          className="p-1.5 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.title && (
          <h3 className="font-black text-white mb-1">{post.title}</h3>
        )}
        {post.caption && (
          <p className="text-sm text-gray-400 mb-3">{post.caption}</p>
        )}
        <ResourcePreview type={post.resourceType} preview={post.preview} />
      </div>

      {/* Reactions bar */}
      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
        {REACTIONS.map(r => {
          const count = post.reactions[r.type] ?? 0
          const isActive = post.myReaction === r.type
          return (
            <button
              key={r.type}
              onClick={() => reactMutation.mutate(r.type)}
              disabled={reactMutation.isPending}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 ring-1 ring-sky-400'
                  : 'bg-white/[0.03] text-gray-400 hover:bg-sky-50 dark:hover:bg-sky-900/20'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
              {count > 0 && <span className="font-bold ml-0.5">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Actions bar */}
      <div className="px-4 pb-4 flex items-center gap-3 border-t border-gray-50 border-white/10 pt-3">
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <MessageSquare size={15} />
          {post.commentsCount} commentaire{post.commentsCount !== 1 ? 's' : ''}
          {showComments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`ml-auto flex items-center gap-1.5 text-xs font-medium transition-colors ${
            post.isSaved
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-400 hover:text-amber-500'
          }`}
        >
          {post.isSaved
            ? <><BookmarkCheck size={15} /> Sauvegard�</>
            : <><Bookmark size={15} /> Sauvegarder</>
          }
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-white/10 bg-white/[0.03] p-4 space-y-3">
          {comments.length === 0 && !commentMutation.isPending && (
            <p className="text-xs text-gray-400 text-center">Aucun commentaire. Soyez le premier !</p>
          )}
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} onReply={r => setReplyTo(r)} />
          ))}

          {/* Input */}
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400">
              <span>? R�ponse � {replyTo.name}</span>
              <button onClick={() => setReplyTo(null)} className="underline">Annuler</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder={replyTo ? `R�pondre � ${replyTo.name}...` : 'Ajouter un commentaire...'}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 text-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="px-3 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (r: { id: number; name: string }) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {comment.author.initials}
        </div>
        <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{comment.author.name}</span>
            <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
          </div>
          <p className="text-sm text-gray-300">{comment.content}</p>
          <button
            onClick={() => onReply({ id: comment.id, name: comment.author.name })}
            className="text-[11px] text-sky-500 hover:underline mt-1"
          >
            R�pondre
          </button>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-9 space-y-2">
          {comment.replies.map(r => (
            <div key={r.id} className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {r.author.initials}
              </div>
              <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{r.author.name}</span>
                  <span className="text-[10px] text-gray-400">{r.timeAgo}</span>
                </div>
                <p className="text-sm text-gray-300">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResourcePreview({ preview }: { type: string; preview: Record<string, unknown> }) {
  if (!preview || Object.keys(preview).length === 0) return null

  const label = (k: string, v: unknown) => {
    if (v === null || v === undefined) return null
    const humanKey = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase()
    return (
      <span key={k} className="text-xs bg-white/[0.05] text-gray-400 rounded-xl px-2 py-1">
        <span className="text-gray-400">{humanKey}: </span>
        {String(v)}
      </span>
    )
  }

  const entries = Object.entries(preview).filter(([, v]) => v !== null && v !== undefined)

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {entries.slice(0, 5).map(([k, v]) => label(k, v))}
    </div>
  )
}
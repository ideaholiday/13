import React, { useState } from 'react'
import { MessageCircle, ThumbsUp, User as UserIcon, CornerDownRight, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import Image from 'next/image'
import { ForumPost, ForumReply } from '@/types/enhancements'
import { useAddForumReply } from '@/hooks/use-enhancements'

export interface ForumReplyListProps {
  replies: ForumReply[]
  className?: string
}

export const ForumReplyList: React.FC<ForumReplyListProps> = ({ replies, className }) => (
  <ul className={clsx('space-y-4', className)}>
    {replies.map(reply => (
      <li key={reply.id} className="flex gap-3 items-start">
        {reply.userAvatar ? (
          <Image src={reply.userAvatar} alt={reply.userName} width={32} height={32} className="rounded-full object-cover" />
        ) : (
          <span className="rounded-full bg-slate-200 p-1"><UserIcon size={18} className="text-slate-400" /></span>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-sm">{reply.userName}</span>
            <span className="text-xs text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="text-slate-700 text-sm mt-0.5">{reply.content}</div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <ThumbsUp size={14} /> {reply.likes}
        </div>
      </li>
    ))}
  </ul>
)

export interface ForumReplyFormProps {
  postId: string
  onSuccess?: () => void
}

export const ForumReplyForm: React.FC<ForumReplyFormProps> = ({ postId, onSuccess }) => {
  const [content, setContent] = useState('')
  const addReply = useAddForumReply()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    await addReply.mutateAsync({ postId, content })
    setContent('')
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="flex-1 border rounded px-2 py-1 text-sm"
        placeholder="Write a reply..."
        maxLength={300}
        disabled={addReply.isPending}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1 disabled:opacity-60"
        disabled={addReply.isPending || !content.trim()}
      >
        {addReply.isPending ? <Loader2 className="animate-spin" size={16} /> : <CornerDownRight size={16} />}
        Reply
      </button>
    </form>
  )
}

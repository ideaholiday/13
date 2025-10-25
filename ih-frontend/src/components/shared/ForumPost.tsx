import React, { useState } from 'react'
import { MessageCircle, ThumbsUp, User as UserIcon, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import Image from 'next/image'
import { ForumPost } from '@/types/enhancements'
import { ForumReplyList, ForumReplyForm } from './ForumReply'

export interface ForumPostCardProps {
  post: ForumPost
  onReply?: () => void
  className?: string
}

export const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, onReply, className }) => {
  const [showReplies, setShowReplies] = useState(false)
  return (
    <article className={clsx('rounded-xl border bg-white p-6 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-2">
        {post.userAvatar ? (
          <Image src={post.userAvatar} alt={post.userName} width={40} height={40} className="rounded-full object-cover" />
        ) : (
          <span className="rounded-full bg-slate-200 p-2"><UserIcon size={24} className="text-slate-400" /></span>
        )}
        <div>
          <div className="font-semibold text-slate-800">{post.userName}</div>
          <div className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <MessageCircle size={16} /> {post.replies.length}
          <ThumbsUp size={16} /> {post.likes}
        </div>
      </div>
      <div className="mb-2">
        <span className="inline-block text-xs bg-slate-100 text-slate-500 rounded px-2 py-0.5 mr-2">{post.category}</span>
        <span className="inline-block text-xs bg-blue-100 text-blue-600 rounded px-2 py-0.5">{post.destination}</span>
      </div>
      <div className="font-medium text-lg mb-1">{post.title}</div>
      <div className="text-slate-700 mb-3 whitespace-pre-line">{post.content}</div>
      <button
        className="text-blue-600 text-xs font-medium hover:underline mb-2"
        onClick={() => setShowReplies(v => !v)}
        aria-expanded={showReplies}
      >
        {showReplies ? 'Hide Replies' : `Show Replies (${post.replies.length})`}
      </button>
      {showReplies && (
        <div className="mt-2">
          <ForumReplyList replies={post.replies} />
          <ForumReplyForm postId={post.id} onSuccess={onReply} />
        </div>
      )}
    </article>
  )
}

export default ForumPostCard

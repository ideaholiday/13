"use client"
import React, { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, CheckCircle, User as UserIcon, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'
import Image from 'next/image'
import { Review } from '@/types/enhancements'

export interface ReviewCardProps {
  review: Review
  onHelpful?: (id: string, value: boolean) => void
  showActions?: boolean
  className?: string
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={18} className={clsx('inline', i <= rating ? 'text-yellow-400 fill-yellow-300' : 'text-slate-300')} fill={i <= rating ? '#facc15' : 'none'} />
      ))}
    </div>
  )
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful, showActions = true, className }) => {
  const [expanded, setExpanded] = useState(false)
  const [helpful, setHelpful] = useState<null | boolean>(null)
  const maxLength = 220
  const isLong = review.content.length > maxLength
  const displayContent = expanded || !isLong ? review.content : review.content.slice(0, maxLength) + '...'

  return (
    <article className={clsx('rounded-xl border bg-white p-5 shadow-sm flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3">
        {review.userAvatar ? (
          <Image src={review.userAvatar} alt={review.userName} width={40} height={40} className="rounded-full object-cover" />
        ) : (
          <span className="rounded-full bg-slate-200 p-2"><UserIcon size={24} className="text-slate-400" /></span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{review.userName}</span>
            {review.verified && <CheckCircle size={16} className="text-green-500" />}
            {review.tripType && <span className="ml-1 text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{review.tripType}</span>}
          </div>
          <div className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString()}</div>
        </div>
        <div className="ml-auto">{renderStars(review.rating)}</div>
      </div>
      <div>
        <div className="font-medium text-base mb-1">{review.title}</div>
        <div className="text-slate-700 whitespace-pre-line">
          {displayContent}
          {isLong && !expanded && (
            <button className="ml-2 text-xs text-blue-600 hover:underline" onClick={() => setExpanded(true)} aria-label="Read more">Read more</button>
          )}
        </div>
      </div>
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-2">
          {review.images.slice(0, 4).map((img, i) => (
            <Image key={i} src={img} alt={`Review photo ${i+1}`} width={72} height={72} className="rounded-md object-cover border" />
          ))}
          {review.images.length > 4 && (
            <span className="flex items-center justify-center w-16 h-16 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
              +{review.images.length - 4} more
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-4 mt-2">
        {showActions && (
          <>
            <button
              className={clsx('flex items-center gap-1 text-xs px-2 py-1 rounded transition', helpful === true ? 'bg-green-50 text-green-600' : 'hover:bg-slate-100 text-slate-500')}
              aria-pressed={helpful === true}
              onClick={() => { setHelpful(true); onHelpful?.(review.id, true) }}
              disabled={helpful !== null}
            >
              <ThumbsUp size={16} /> Helpful ({review.helpful})
            </button>
            <button
              className={clsx('flex items-center gap-1 text-xs px-2 py-1 rounded transition', helpful === false ? 'bg-red-50 text-red-600' : 'hover:bg-slate-100 text-slate-500')}
              aria-pressed={helpful === false}
              onClick={() => { setHelpful(false); onHelpful?.(review.id, false) }}
              disabled={helpful !== null}
            >
              <ThumbsDown size={16} /> Not Helpful
            </button>
          </>
        )}
      </div>
      {review.response && (
        <div className="mt-3 border-l-4 border-blue-200 pl-3 bg-blue-50/50 rounded">
          <div className="text-xs text-blue-700 font-semibold mb-1">Response from {review.response.from}</div>
          <div className="text-slate-700 text-sm">{review.response.content}</div>
          <div className="text-xs text-slate-400 mt-1">{new Date(review.response.date).toLocaleDateString()}</div>
        </div>
      )}
    </article>
  )
}

export default ReviewCard

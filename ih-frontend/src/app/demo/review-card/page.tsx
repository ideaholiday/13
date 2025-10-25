import React from 'react'
import { ReviewCard } from '@/components/shared/ReviewCard'
import { useReviews } from '@/hooks/use-enhancements'

// Demo: hardcoded itemId/type for now
export default function ReviewCardDemo() {
  const { data: reviews, isLoading } = useReviews('hotel_123', 'hotel')

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">ReviewCard Demo</h1>
      {isLoading && <div>Loading reviews...</div>}
      {reviews && reviews.length === 0 && <div>No reviews yet.</div>}
      {reviews && reviews.map((review: any) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}

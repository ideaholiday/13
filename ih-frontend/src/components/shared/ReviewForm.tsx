import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Star, Image as ImageIcon, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useSubmitReview } from '@/hooks/use-enhancements'

export interface ReviewFormValues {
  rating: number
  title: string
  content: string
  images?: File[]
}

export interface ReviewFormProps {
  onSuccess?: () => void
  className?: string
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSuccess, className }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ReviewFormValues>({
    defaultValues: { rating: 5, title: '', content: '', images: [] }
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const submitReview = useSubmitReview()
  const rating = watch('rating')
  const images = watch('images') || []

  function handleRating(r: number) {
    setValue('rating', r)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setValue('images', files)
    setImagePreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function onSubmit(data: ReviewFormValues) {
    await submitReview.mutateAsync({
      ...data,
      images: imagePreviews // For mock/demo only; real API would upload
    })
    setImagePreviews([])
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('rounded-xl border bg-white p-6 shadow-sm space-y-5', className)}>
      <div>
        <label className="block font-medium mb-1">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <button
              type="button"
              key={i}
              className={clsx('p-1', i <= rating ? 'text-yellow-400' : 'text-slate-300')}
              onClick={() => handleRating(i)}
              aria-label={`Set rating to ${i}`}
            >
              <Star size={28} fill={i <= rating ? '#facc15' : 'none'} />
            </button>
          ))}
        </div>
        {errors.rating && <div className="text-xs text-red-500 mt-1">Rating is required</div>}
      </div>
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          {...register('title', { required: true, maxLength: 80 })}
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Summarize your experience"
        />
        {errors.title && <div className="text-xs text-red-500 mt-1">Title is required (max 80 chars)</div>}
      </div>
      <div>
        <label className="block font-medium mb-1">Your Review</label>
        <textarea
          {...register('content', { required: true, minLength: 20, maxLength: 1000 })}
          className="w-full border rounded px-3 py-2 text-base min-h-[90px]"
          placeholder="Share details of your stay, tips, or highlights"
          maxLength={1000}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{errors.content && 'Review must be 20-1000 characters'}</span>
          <span>{watch('content')?.length || 0}/1000</span>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Photos (optional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block"
        />
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 mt-2">
            {imagePreviews.map((src, i) => (
              <img key={i} src={src} alt={`Preview ${i+1}`} className="w-16 h-16 object-cover rounded border" />
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-60"
        disabled={isSubmitting || submitReview.isPending}
      >
        {isSubmitting || submitReview.isPending ? <Loader2 className="animate-spin" size={20} /> : null}
        Submit Review
      </button>
      {submitReview.isError && <div className="text-xs text-red-500 mt-2">Failed to submit review. Please try again.</div>}
      {submitReview.isSuccess && <div className="text-xs text-green-600 mt-2">Review submitted! Thank you.</div>}
    </form>
  )
}

export default ReviewForm

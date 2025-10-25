"use client"
import React, { useState } from 'react'
import { ReviewForm } from '@/components/shared/ReviewForm'

export default function ReviewFormDemo() {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">ReviewForm Demo</h1>
      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded p-4 mb-6">Thank you for your review!</div>
      ) : null}
      <ReviewForm onSuccess={() => setSubmitted(true)} />
    </div>
  )
}

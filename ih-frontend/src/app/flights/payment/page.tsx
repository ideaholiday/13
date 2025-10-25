import { Metadata } from 'next'
import { Suspense } from 'react'
import { EnhancedFlightPaymentPage } from '@/components/flights/EnhancedFlightPaymentPage'

export const metadata: Metadata = {
  title: 'Payment - Idea Holiday',
  description: 'Secure payment processing for your flight booking with multiple payment options.',
  keywords: ['payment', 'flight booking', 'razorpay', 'secure payment', 'travel booking'],
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 rounded"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <EnhancedFlightPaymentPage />
    </Suspense>
  )
}
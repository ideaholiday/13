'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, AlertCircle, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFlightBookingStore } from '@/lib/stores/unified-flight-store'
import OrderReview from '@/components/flights/OrderReview'
import PaymentForm from '@/components/flights/PaymentForm'
import PromoCodeInput from '@/components/flights/PromoCodeInput'
import type { PaymentInfo } from '@/lib/stores/unified-flight-store'
import { trackBooking } from '@/lib/track'

export default function BookFlightPage() {
  const router = useRouter()
  const store = useFlightBookingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'review' | 'payment'>('review')

  // Validate that we have required data
  const isDataValid = useMemo(() => {
    return (
      store.selectedOutbound &&
      store.passengers.length > 0 &&
      store.seatSelections.size > 0
    )
  }, [store.selectedOutbound, store.passengers, store.seatSelections])

  // Calculate pricing
  const pricing = useMemo(() => {
    const baseFare = (store.selectedOutbound?.fareAmount || 5000) * store.passengers.length
    const taxes = baseFare * 0.15 // 15% tax
    const addOnsCost = store.addOns.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
    const discount = appliedPromo?.discount || 0
    const subtotal = baseFare + taxes
    const total = subtotal - discount + addOnsCost

    return {
      baseFare,
      taxes,
      addOnsCost,
      discount,
      subtotal,
      total,
      pricePerPerson: store.passengers.length > 0 ? total / store.passengers.length : 0,
    }
  }, [store.selectedOutbound, store.passengers, store.addOns, appliedPromo])

  if (!isDataValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Incomplete Booking</h1>
          <p className="text-gray-600 mb-6">
            Please complete all required steps (passengers and seats) before proceeding to checkout.
          </p>
          <Link
            href="/flights/select"
            className="inline-block px-6 py-2 bg-sapphire-600 text-white rounded-lg font-medium hover:bg-sapphire-700 transition-colors"
          >
            Go Back to Selection
          </Link>
        </div>
      </div>
    )
  }

  // Handle payment
  const handlePayment = async (paymentInfo: Partial<PaymentInfo>) => {
    setIsSubmitting(true)
    try {
      // Save payment info to store
      store.setPaymentInfo(paymentInfo)

      // Simulate API call to process payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mark booking as confirmed in store
      const confirmationData = {
        bookingId: `BK${Date.now()}`,
        passengers: store.passengers,
        flights: {
          outbound: store.selectedOutbound,
          return: store.selectedReturn,
        },
        seats: Object.fromEntries(store.seatSelections),
        addOns: store.addOns,
        paymentMethod: paymentInfo.method,
        totalAmount: pricing.total,
        timestamp: new Date().toISOString(),
      }

      store.setBookingConfirmation(confirmationData)

      // Track payment success event
      trackBooking.paymentSuccess('flight', confirmationData.bookingId, pricing.total, paymentInfo.method || 'unknown')

      toast.success('Payment successful! Booking confirmed.')
      
      // Navigate to confirmation page
      setTimeout(() => {
        router.push('/flights/confirmation')
      }, 1000)
    } catch (error) {
      toast.error('Payment failed. Please try again.')
      console.error('Payment error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle promo code application
  const handleApplyPromo = async (code: string, discount: number): Promise<boolean> => {
    try {
      // Simulate backend validation
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      setAppliedPromo({ code, discount })
      store.applyPromoCode(code)
      return true
    } catch (error) {
      return false
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    store.setPaymentInfo({ promoCode: undefined, discountAmount: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/flights/select"
              className="flex items-center gap-2 text-sapphire-600 hover:text-sapphire-700 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Selection
            </Link>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Order Review & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* PAGE TITLE */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
              <p className="text-gray-600">Review your flight details and complete the payment</p>
            </div>

            {/* TABS */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('review')}
                className={`pb-3 px-2 font-medium transition-colors relative ${
                  activeTab === 'review'
                    ? 'text-sapphire-600 border-b-2 border-sapphire-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Order Review
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`pb-3 px-2 font-medium transition-colors ${
                  activeTab === 'payment'
                    ? 'text-sapphire-600 border-b-2 border-sapphire-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Payment
                </div>
              </button>
            </div>

            {/* REVIEW TAB */}
            {activeTab === 'review' && (
              <div className="space-y-6">
                <OrderReview
                  outboundFlight={store.selectedOutbound}
                  returnFlight={store.selectedReturn}
                  passengers={store.passengers}
                  addOns={store.addOns}
                  baseFare={pricing.baseFare}
                  taxes={pricing.taxes}
                  discount={pricing.discount}
                />

                <button
                  onClick={() => setActiveTab('payment')}
                  className="w-full py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 hover:from-sapphire-700 hover:to-sapphire-800 text-white font-semibold rounded-lg transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* PAYMENT TAB */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                {/* Promo Code */}
                <PromoCodeInput
                  onApply={handleApplyPromo}
                  appliedCode={appliedPromo?.code}
                  discount={appliedPromo?.discount}
                  onRemove={handleRemovePromo}
                  isLoading={isSubmitting}
                />

                {/* Payment Form */}
                <PaymentForm
                  onPaymentInfoChange={(info) => store.setPaymentInfo(info)}
                  totalAmount={pricing.total}
                  isProcessing={isSubmitting}
                  onSubmit={handlePayment}
                />

                {/* Terms */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    By proceeding, you agree to our{' '}
                    <Link href="/terms" className="font-semibold underline hover:no-underline">
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="font-semibold underline hover:no-underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="lg:col-span-1">
            {/* PRICING SUMMARY */}
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-sapphire-50 to-sapphire-25 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Price Summary</h3>
                </div>

                <div className="px-6 py-4 space-y-3">
                  {/* Base Fare */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      Base Fare
                      <span className="text-xs text-gray-600 ml-1">
                        ({store.passengers.length} × ₹{Math.round(pricing.baseFare / store.passengers.length)})
                      </span>
                    </span>
                    <span className="font-medium text-gray-900">₹{pricing.baseFare.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Taxes & Fees (15%)</span>
                    <span className="font-medium text-gray-900">₹{pricing.taxes.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Add-ons */}
                  {pricing.addOnsCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Services & Add-ons</span>
                      <span className="font-medium text-gray-900">₹{pricing.addOnsCost.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Discount */}
                  {pricing.discount > 0 && (
                    <div className="flex justify-between items-center text-sm bg-emerald-50 p-2 rounded-lg">
                      <span className="text-emerald-700 font-medium">Discount</span>
                      <span className="font-semibold text-emerald-700">-₹{pricing.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-3"></div>

                  {/* Total */}
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-sapphire-700">₹{pricing.total.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        ₹{pricing.pricePerPerson.toLocaleString('en-IN', { maximumFractionDigits: 0 })} per person
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRAVELERS INFO */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-ruby-50 to-ruby-25 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Travelers</h3>
                </div>

                <div className="px-6 py-4 space-y-2">
                  {store.passengers.map((passenger, index) => (
                    <div key={passenger.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">
                        {passenger.firstName} {passenger.lastName}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          passenger.type === 'ADT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : passenger.type === 'CHD'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {passenger.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FLIGHT INFO CARD */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-25 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Flight Details</h3>
                </div>

                <div className="px-6 py-4 space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Outbound</p>
                    <p className="font-semibold text-gray-900">
                      {store.selectedOutbound?.legs?.[0]?.origin?.code || 'N/A'} →{' '}
                      {store.selectedOutbound?.legs?.[0]?.destination?.code || 'N/A'}
                    </p>
                  </div>
                  {store.selectedReturn && (
                    <div>
                      <p className="text-gray-600">Return</p>
                      <p className="font-semibold text-gray-900">
                        {store.selectedReturn?.legs?.[0]?.origin?.code || 'N/A'} →{' '}
                        {store.selectedReturn?.legs?.[0]?.destination?.code || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SUCCESS NOTE */}
              {activeTab === 'payment' && !isSubmitting && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    All information verified. You're ready to complete payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
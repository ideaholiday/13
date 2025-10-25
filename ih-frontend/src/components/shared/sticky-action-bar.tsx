'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CreditCard, Shield } from 'lucide-react'

interface StickyActionBarProps {
  currentStep: number
  totalSteps: number
  onBack?: () => void
  onNext?: () => void
  onSubmit?: () => void
  isLoading?: boolean
  showSecurityBadge?: boolean
  totalAmount?: number
  currency?: string
  disabled?: boolean
}

export function StickyActionBar({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isLoading = false,
  showSecurityBadge = true,
  totalAmount,
  currency = 'INR',
  disabled = false
}: StickyActionBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when user scrolls down beyond the form actions
      const scrollY = window.scrollY
      setIsVisible(scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const formatPrice = (amount: number) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString()}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and security */}
          <div className="flex items-center space-x-4">
            {!isFirstStep && onBack && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {showSecurityBadge && (
              <div className="flex items-center text-sm text-slate-500">
                <Shield className="w-4 h-4 mr-1" />
                <span>Secure Booking</span>
              </div>
            )}
          </div>

          {/* Center - Step indicator */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-sapphire-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Price and action button */}
          <div className="flex items-center space-x-4">
            {totalAmount && (
              <div className="text-right">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-lg font-bold text-sapphire-900">
                  {formatPrice(totalAmount)}
                </p>
              </div>
            )}

            {isLastStep ? (
              <Button 
                onClick={onSubmit}
                disabled={isLoading || disabled}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Complete Booking
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={onNext}
                disabled={isLoading || disabled}
                className="bg-sapphire-600 hover:bg-sapphire-700"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized version
export function MobileStickyActionBar({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isLoading = false,
  totalAmount,
  currency = 'INR',
  disabled = false
}: StickyActionBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const formatPrice = (amount: number) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString()}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 md:hidden">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-600">
            Step {currentStep + 1} of {totalSteps}
          </div>
          {totalAmount && (
            <div className="text-lg font-bold text-sapphire-900">
              {formatPrice(totalAmount)}
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          {!isFirstStep && onBack && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          <Button 
            onClick={isLastStep ? onSubmit : onNext}
            disabled={isLoading || disabled}
            className={`flex-1 ${
              isLastStep 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-sapphire-600 hover:bg-sapphire-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : isLastStep ? (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Booking
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
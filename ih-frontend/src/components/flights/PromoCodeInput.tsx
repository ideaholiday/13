'use client'

import React, { useState } from 'react'
import { Tag, X, Check, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface PromoCodeInputProps {
  onApply?: (code: string, discount: number) => Promise<boolean>
  appliedCode?: string
  discount?: number
  onRemove?: () => void
  isLoading?: boolean
}

export default function PromoCodeInput({
  onApply,
  appliedCode,
  discount = 0,
  onRemove,
  isLoading = false,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  // Mock promo codes for demo (in real app, backend validates)
  const validPromos: Record<string, number> = {
    SAVE100: 100,
    SAVE500: 500,
    WELCOME20: 20, // 20% discount (handled separately)
    EARLY50: 50,
    LOYAL100: 100,
    FLASH200: 200,
  }

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a promo code')
      return
    }

    if (appliedCode) {
      toast.error('A promo code is already applied. Remove it first.')
      return
    }

    setIsApplying(true)

    try {
      const upperCode = code.toUpperCase().trim()
      
      if (!validPromos[upperCode]) {
        toast.error('Invalid promo code')
        setIsApplying(false)
        return
      }

      const discountAmount = validPromos[upperCode]

      // Call backend validation
      if (onApply) {
        const success = await onApply(upperCode, discountAmount)
        if (success) {
          toast.success(`Discount of ₹${discountAmount} applied!`)
          setCode('')
        } else {
          toast.error('Failed to apply promo code')
        }
      } else {
        toast.success(`Discount of ₹${discountAmount} applied!`)
        setCode('')
      }
    } catch (error) {
      toast.error('Error applying promo code')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    onRemove?.()
    toast.success('Promo code removed')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  if (appliedCode) {
    return (
      <div className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">Promo Code Applied</p>
              <p className="text-xs text-emerald-700">
                Code: <span className="font-semibold">{appliedCode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-emerald-700">You Save</p>
              <p className="text-lg font-bold text-emerald-600">₹{discount.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-emerald-200 rounded-lg transition-colors text-emerald-600"
              title="Remove promo code"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Tag className="w-5 h-5 text-gold-600" />
          <h3 className="font-semibold text-gray-900">Have a Promo Code?</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={isApplying || isLoading}
            maxLength={20}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
          <button
            onClick={handleApply}
            disabled={isApplying || isLoading || !code.trim()}
            className="px-4 py-2 bg-gold-600 hover:bg-gold-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Apply
              </>
            )}
          </button>
        </div>

        {/* Demo Codes */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Demo codes: SAVE100, SAVE500, WELCOME20, EARLY50</p>
          <div className="flex flex-wrap gap-2">
            {['SAVE100', 'SAVE500', 'EARLY50'].map((promoCode) => (
              <button
                key={promoCode}
                onClick={() => {
                  setCode(promoCode)
                  // Simulate applying the code
                  setTimeout(() => {
                    const discountAmount = validPromos[promoCode]
                    onApply?.(promoCode, discountAmount)
                  }, 100)
                }}
                disabled={isApplying || isLoading}
                className="text-xs px-3 py-1 border border-gray-300 rounded hover:border-gold-400 hover:bg-gold-50 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {promoCode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

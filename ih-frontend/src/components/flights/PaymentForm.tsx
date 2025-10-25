'use client'

import React, { useState } from 'react'
import { CreditCard, Smartphone, Building2, Wallet, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import type { PaymentInfo } from '@/lib/stores/unified-flight-store'

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet'

interface PaymentFormProps {
  onPaymentInfoChange?: (info: Partial<PaymentInfo>) => void
  totalAmount: number
  isProcessing?: boolean
  onSubmit?: (info: Partial<PaymentInfo>) => Promise<void>
}

export default function PaymentForm({
  onPaymentInfoChange,
  totalAmount,
  isProcessing = false,
  onSubmit,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    upiId: '',
    saveCard: false,
  })
  const [showCVV, setShowCVV] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleFieldChange = (field: string, value: string | boolean) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)

    // Clear error when user starts typing
    if (touched[field] && errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Format card number
    if (field === 'cardNumber') {
      const formatted = (value as string).replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      newData.cardNumber = formatted
      setFormData(newData)
    }

    // Format expiry date
    if (field === 'expiryDate') {
      let formatted = (value as string).replace(/\D/g, '')
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4)
      }
      newData.expiryDate = formatted
      setFormData(newData)
    }

    // Only allow digits for CVV
    if (field === 'cvv') {
      newData.cvv = (value as string).replace(/\D/g, '').slice(0, 4)
      setFormData(newData)
    }

    onPaymentInfoChange?.(newData)
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const validateField = (field: string) => {
    const newErrors = { ...errors }

    if (selectedMethod === 'card') {
      if (field === 'cardNumber' || !field) {
        const cleaned = formData.cardNumber.replace(/\s/g, '')
        if (cleaned.length !== 16) {
          newErrors.cardNumber = 'Card number must be 16 digits'
        } else if (!isValidCardNumber(cleaned)) {
          newErrors.cardNumber = 'Invalid card number'
        } else {
          delete newErrors.cardNumber
        }
      }

      if (field === 'expiryDate' || !field) {
        if (!formData.expiryDate) {
          newErrors.expiryDate = 'Expiry date is required'
        } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          newErrors.expiryDate = 'Format must be MM/YY'
        } else {
          const [month, year] = formData.expiryDate.split('/')
          const expDate = new Date(2000 + parseInt(year), parseInt(month))
          if (expDate < new Date()) {
            newErrors.expiryDate = 'Card has expired'
          } else {
            delete newErrors.expiryDate
          }
        }
      }

      if (field === 'cvv' || !field) {
        if (!formData.cvv || formData.cvv.length < 3) {
          newErrors.cvv = 'CVV must be 3-4 digits'
        } else {
          delete newErrors.cvv
        }
      }

      if (field === 'holderName' || !field) {
        if (!formData.holderName.trim()) {
          newErrors.holderName = 'Cardholder name is required'
        } else if (formData.holderName.trim().length < 3) {
          newErrors.holderName = 'Name must be at least 3 characters'
        } else if (!/^[a-zA-Z\s'-]+$/.test(formData.holderName)) {
          newErrors.holderName = 'Name contains invalid characters'
        } else {
          delete newErrors.holderName
        }
      }
    } else if (selectedMethod === 'upi') {
      if (field === 'upiId' || !field) {
        if (!formData.upiId.trim()) {
          newErrors.upiId = 'UPI ID is required'
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(formData.upiId)) {
          newErrors.upiId = 'Enter a valid UPI ID (e.g., yourname@okhdfcbank)'
        } else {
          delete newErrors.upiId
        }
      }
    }

    setErrors(newErrors)
  }

  const isValidCardNumber = (num: string): boolean => {
    // Luhn algorithm
    let sum = 0
    let isEven = false
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }

  const isFormValid = (): boolean => {
    if (selectedMethod === 'card') {
      return !!(
        formData.cardNumber &&
        formData.expiryDate &&
        formData.cvv &&
        formData.holderName &&
        Object.keys(errors).length === 0
      )
    } else if (selectedMethod === 'upi') {
      return !!(formData.upiId && Object.keys(errors).length === 0)
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    validateField('')

    if (!isFormValid()) {
      return
    }

    const paymentData: Partial<PaymentInfo> = {
      method: selectedMethod,
      saveCard: formData.saveCard,
    }

    if (selectedMethod === 'card') {
      paymentData.cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        holderName: formData.holderName,
      }
    } else if (selectedMethod === 'upi') {
      paymentData.upiId = formData.upiId
    }

    try {
      await onSubmit?.(paymentData)
    } catch (error) {
      console.error('Payment submission failed:', error)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* PAYMENT METHOD SELECTION */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-sapphire-600" />
          Select Payment Method
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card */}
          <button
            onClick={() => {
              setSelectedMethod('card')
              setErrors({})
            }}
            className={`p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
              selectedMethod === 'card'
                ? 'border-sapphire-600 bg-sapphire-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${selectedMethod === 'card' ? 'text-sapphire-600' : 'text-gray-600'}`} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Credit/Debit Card</p>
              <p className="text-xs text-gray-600">Visa, Mastercard, RuPay</p>
            </div>
            {selectedMethod === 'card' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
          </button>

          {/* UPI */}
          <button
            onClick={() => {
              setSelectedMethod('upi')
              setErrors({})
            }}
            className={`p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
              selectedMethod === 'upi'
                ? 'border-sapphire-600 bg-sapphire-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Smartphone className={`w-5 h-5 ${selectedMethod === 'upi' ? 'text-sapphire-600' : 'text-gray-600'}`} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">UPI</p>
              <p className="text-xs text-gray-600">Google Pay, PhonePe, etc</p>
            </div>
            {selectedMethod === 'upi' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
          </button>

          {/* Net Banking */}
          <button
            onClick={() => {
              setSelectedMethod('netbanking')
              setErrors({})
            }}
            className={`p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
              selectedMethod === 'netbanking'
                ? 'border-sapphire-600 bg-sapphire-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Building2 className={`w-5 h-5 ${selectedMethod === 'netbanking' ? 'text-sapphire-600' : 'text-gray-600'}`} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Net Banking</p>
              <p className="text-xs text-gray-600">HDFC, ICICI, Axis, etc</p>
            </div>
            {selectedMethod === 'netbanking' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
          </button>

          {/* Wallet */}
          <button
            onClick={() => {
              setSelectedMethod('wallet')
              setErrors({})
            }}
            className={`p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
              selectedMethod === 'wallet'
                ? 'border-sapphire-600 bg-sapphire-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Wallet className={`w-5 h-5 ${selectedMethod === 'wallet' ? 'text-sapphire-600' : 'text-gray-600'}`} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Digital Wallet</p>
              <p className="text-xs text-gray-600">PayPal, Amazon Pay</p>
            </div>
            {selectedMethod === 'wallet' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
          </button>
        </div>
      </div>

      {/* PAYMENT FORM */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleFieldChange('cardNumber', e.target.value)}
                onBlur={() => handleBlur('cardNumber')}
                maxLength={19}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  touched.cardNumber && errors.cardNumber
                    ? 'border-ruby-300 bg-ruby-50 focus:ring-ruby-500'
                    : 'border-gray-300 focus:ring-sapphire-500'
                }`}
              />
              {touched.cardNumber && errors.cardNumber && (
                <p className="text-sm text-ruby-600 mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-900 mb-2">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                  onBlur={() => handleBlur('expiryDate')}
                  maxLength={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    touched.expiryDate && errors.expiryDate
                      ? 'border-ruby-300 bg-ruby-50 focus:ring-ruby-500'
                      : 'border-gray-300 focus:ring-sapphire-500'
                  }`}
                />
                {touched.expiryDate && errors.expiryDate && (
                  <p className="text-sm text-ruby-600 mt-1">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-900 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    id="cvv"
                    type={showCVV ? 'text' : 'password'}
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleFieldChange('cvv', e.target.value)}
                    onBlur={() => handleBlur('cvv')}
                    maxLength={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      touched.cvv && errors.cvv
                        ? 'border-ruby-300 bg-ruby-50 focus:ring-ruby-500'
                        : 'border-gray-300 focus:ring-sapphire-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCVV(!showCVV)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.cvv && errors.cvv && <p className="text-sm text-ruby-600 mt-1">{errors.cvv}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="holderName" className="block text-sm font-medium text-gray-900 mb-2">
                Cardholder Name
              </label>
              <input
                id="holderName"
                type="text"
                placeholder="John Doe"
                value={formData.holderName}
                onChange={(e) => handleFieldChange('holderName', e.target.value)}
                onBlur={() => handleBlur('holderName')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  touched.holderName && errors.holderName
                    ? 'border-ruby-300 bg-ruby-50 focus:ring-ruby-500'
                    : 'border-gray-300 focus:ring-sapphire-500'
                }`}
              />
              {touched.holderName && errors.holderName && (
                <p className="text-sm text-ruby-600 mt-1">{errors.holderName}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="saveCard"
                type="checkbox"
                checked={formData.saveCard}
                onChange={(e) => handleFieldChange('saveCard', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sapphire-600 focus:ring-sapphire-500"
              />
              <label htmlFor="saveCard" className="text-sm text-gray-700">
                Save this card for future payments
              </label>
            </div>
          </div>
        )}

        {selectedMethod === 'upi' && (
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium text-gray-900 mb-2">
              UPI ID
            </label>
            <input
              id="upiId"
              type="text"
              placeholder="yourname@okhdfcbank"
              value={formData.upiId}
              onChange={(e) => handleFieldChange('upiId', e.target.value)}
              onBlur={() => handleBlur('upiId')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                touched.upiId && errors.upiId
                  ? 'border-ruby-300 bg-ruby-50 focus:ring-ruby-500'
                  : 'border-gray-300 focus:ring-sapphire-500'
              }`}
            />
            {touched.upiId && errors.upiId && <p className="text-sm text-ruby-600 mt-1">{errors.upiId}</p>}
            <p className="text-xs text-gray-600 mt-2">You will be redirected to your UPI app to confirm payment</p>
          </div>
        )}

        {selectedMethod === 'netbanking' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Select Your Bank</p>
                <p className="text-sm text-amber-800 mt-1">
                  You will be redirected to your bank's portal to complete the payment securely.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'wallet' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Digital Wallet Payment</p>
                <p className="text-sm text-blue-800 mt-1">
                  You will be redirected to your wallet provider to authorize the payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Amount Display */}
        <div className="bg-gradient-to-r from-sapphire-50 to-sapphire-25 border border-sapphire-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">Total Amount to Pay</p>
          <p className="text-3xl font-bold text-sapphire-700">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 py-3 border-y border-gray-200">
          <Lock className="w-3 h-3" />
          <span>Your payment information is encrypted and secure (SSL 256-bit)</span>
        </div>

        {/* Payment Security Features */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Fraud Protection</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Secure Processing</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Money Back Guarantee</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !isFormValid()}
          className="w-full py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 hover:from-sapphire-700 hover:to-sapphire-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ₹{totalAmount.toLocaleString('en-IN')}
            </>
          )}
        </button>

        {/* Footer Note */}
        <p className="text-xs text-center text-gray-600">
          By clicking "Pay", you agree to our Terms & Conditions. Your booking is not confirmed until payment is successful.
        </p>
      </form>
    </div>
  )
}

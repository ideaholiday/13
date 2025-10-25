'use client'

import React, { useState } from 'react'
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Shield, 
  CheckCircle, 
  Clock,
  Star,
  Award,
  Lock,
  Zap,
  TrendingUp,
  Users,
  CreditCard as CardIcon,
  Smartphone as PhoneIcon,
  Wallet as WalletIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  trustBadges: TrustBadge[]
  processingFee?: number
  instant?: boolean
  popular?: boolean
}

interface TrustBadge {
  icon: React.ReactNode
  text: string
  color: string
}

interface PaymentOptionsProps {
  selectedMethod: string
  onMethodSelect: (methodId: string) => void
  onProceed: (method: PaymentMethod, details?: any) => void
  totalAmount: number
  className?: string
}

export function PaymentOptions({ 
  selectedMethod, 
  onMethodSelect, 
  onProceed, 
  totalAmount,
  className = '' 
}: PaymentOptionsProps) {
  const [upiId, setUpiId] = useState('')
  const [emiTenure, setEmiTenure] = useState('3')
  const [walletBalance, setWalletBalance] = useState(5000) // Mock wallet balance

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const trustBadges: TrustBadge[] = [
    {
      icon: <Shield className="h-4 w-4" />,
      text: 'SSL Secured',
      color: 'text-green-600'
    },
    {
      icon: <Lock className="h-4 w-4" />,
      text: 'PCI DSS',
      color: 'text-blue-600'
    },
    {
      icon: <Award className="h-4 w-4" />,
      text: 'Bank Grade',
      color: 'text-purple-600'
    }
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay instantly with UPI apps like PhonePe, Google Pay, Paytm',
      icon: <PhoneIcon className="h-6 w-6 text-blue-600" />,
      features: ['Instant payment', 'No charges', '24/7 available', 'Secure'],
      trustBadges: trustBadges,
      instant: true,
      popular: true
    },
    {
      id: 'emi',
      name: 'EMI Options',
      description: 'Convert your payment into easy monthly installments',
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      features: ['3-24 months tenure', 'Low interest rates', 'Instant approval', 'No hidden fees'],
      trustBadges: trustBadges,
      processingFee: 0
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay with your wallet balance or add money instantly',
      icon: <WalletIcon className="h-6 w-6 text-orange-600" />,
      features: ['Instant payment', 'Cashback rewards', 'Quick checkout', 'Secure'],
      trustBadges: trustBadges,
      instant: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with your Visa, Mastercard, or RuPay card',
      icon: <CardIcon className="h-6 w-6 text-indigo-600" />,
      features: ['All major cards', 'Secure processing', 'Instant confirmation', 'Reward points'],
      trustBadges: trustBadges,
      instant: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay directly from your bank account',
      icon: <Users className="h-6 w-6 text-teal-600" />,
      features: ['All major banks', 'Secure login', 'Instant transfer', 'No charges'],
      trustBadges: trustBadges,
      instant: true
    }
  ]

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod)

  const handleProceed = () => {
    if (!selectedPaymentMethod) return

    let details = {}
    
    if (selectedMethod === 'upi') {
      details = { upiId }
    } else if (selectedMethod === 'emi') {
      details = { tenure: emiTenure }
    } else if (selectedMethod === 'wallet') {
      details = { balance: walletBalance }
    }

    onProceed(selectedPaymentMethod, details)
  }

  const calculateEmiAmount = (tenure: string) => {
    const months = parseInt(tenure)
    const interestRate = 0.12 // 12% annual interest
    const monthlyRate = interestRate / 12
    const emiAmount = (totalAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                     (Math.pow(1 + monthlyRate, months) - 1)
    return Math.round(emiAmount)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trust Badges Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-6">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={badge.color}>{badge.icon}</div>
              <span className="text-gray-600">{badge.text}</span>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Your payment is protected by bank-grade security
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => onMethodSelect(method.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    checked={selectedMethod === method.id}
                    onChange={() => onMethodSelect(method.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    {method.icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {method.popular && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {method.instant && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Instant
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {method.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {method.trustBadges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className={badge.color}>{badge.icon}</div>
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Method Specific Details */}
      {selectedMethod === 'upi' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">UPI Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@paytm or 9876543210@ybl"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your UPI ID or mobile number linked to UPI
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">UPI Benefits</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Instant payment confirmation</li>
                <li>• No additional charges</li>
                <li>• Works with all UPI apps</li>
                <li>• Secure and encrypted</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'emi' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">EMI Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="emiTenure">Select EMI Tenure</Label>
              <select
                id="emiTenure"
                value={emiTenure}
                onChange={(e) => setEmiTenure(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="9">9 months</option>
                <option value="12">12 months</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
              </select>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-900">EMI Calculation</span>
                <Badge variant="secondary">12% p.a.</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Total Amount:</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">EMI Amount:</span>
                  <span className="font-medium">{formatPrice(calculateEmiAmount(emiTenure))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Tenure:</span>
                  <span className="font-medium">{emiTenure} months</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'wallet' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wallet Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-900">Wallet Balance</span>
                <span className="font-bold text-orange-900">{formatPrice(walletBalance)}</span>
              </div>
              <div className="text-sm text-orange-800">
                {walletBalance >= totalAmount ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Sufficient balance available</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Insufficient balance</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Money to Wallet
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Wallet Benefits</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Instant payment processing</li>
                <li>• Earn cashback on every transaction</li>
                <li>• Quick checkout for future bookings</li>
                <li>• Secure and encrypted</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proceed Button */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total Amount</span>
              <span className="text-blue-900">
                {selectedMethod === 'emi' ? formatPrice(calculateEmiAmount(emiTenure)) : formatPrice(totalAmount)}
                {selectedMethod === 'emi' && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    /month for {emiTenure} months
                  </span>
                )}
              </span>
            </div>
            
            <Button
              onClick={handleProceed}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              size="lg"
            >
              {selectedMethod === 'emi' ? 'Proceed with EMI' : 
               selectedMethod === 'upi' ? 'Pay with UPI' :
               selectedMethod === 'wallet' ? 'Pay with Wallet' :
               'Proceed to Payment'}
            </Button>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="h-4 w-4" />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Instant Processing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

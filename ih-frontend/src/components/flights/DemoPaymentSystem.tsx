'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Gift, 
  Percent, 
  Star,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Download,
  Mail,
  Phone,
  Clock,
  Calendar,
  Zap,
  TrendingUp,
  Award,
  Coins,
  Receipt,
  FileText,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'wallet' | 'netbanking' | 'emi'
  name: string
  icon: React.ReactNode
  description: string
  isAvailable: boolean
  processingFee?: number
  cashback?: number
  trustBadges: string[]
}

interface Voucher {
  id: string
  code: string
  name: string
  type: 'discount' | 'cashback' | 'points'
  value: number
  currency?: string
  minAmount?: number
  maxDiscount?: number
  expiryDate?: string
  isActive: boolean
  description: string
  terms: string[]
}

interface PromoCode {
  id: string
  code: string
  name: string
  discount: number
  type: 'percentage' | 'fixed'
  minAmount: number
  maxDiscount?: number
  expiryDate: string
  isActive: boolean
}

interface PaymentData {
  method: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardHolderName?: string
  upiId?: string
  walletType?: string
  bankName?: string
  emiTenure?: number
  voucherCode?: string
  promoCode?: string
}

interface DemoPaymentSystemProps {
  totalAmount: number
  onPaymentSuccess: (paymentData: PaymentData) => void
  onPaymentFailure: (error: string) => void
  onBack: () => void
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Visa, Mastercard, RuPay accepted',
    isAvailable: true,
    processingFee: 0,
    cashback: 2,
    trustBadges: ['PCI DSS', 'SSL', 'Fraud Protection']
  },
  {
    id: 'upi',
    type: 'upi',
    name: 'UPI Payment',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
    isAvailable: true,
    processingFee: 0,
    cashback: 5,
    trustBadges: ['NPCI Certified', 'Instant', 'Secure']
  },
  {
    id: 'wallet',
    type: 'wallet',
    name: 'Digital Wallet',
    icon: <Wallet className="h-6 w-6" />,
    description: 'Paytm, PhonePe, Mobikwik wallets',
    isAvailable: true,
    processingFee: 0,
    cashback: 3,
    trustBadges: ['Instant', 'Secure', 'Rewards']
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    name: 'Net Banking',
    icon: <Shield className="h-6 w-6" />,
    description: 'Direct bank transfer',
    isAvailable: true,
    processingFee: 0,
    cashback: 1,
    trustBadges: ['Bank Grade Security', 'RBI Approved']
  },
  {
    id: 'emi',
    type: 'emi',
    name: 'EMI Payment',
    icon: <Calendar className="h-6 w-6" />,
    description: 'Convert to easy EMIs',
    isAvailable: true,
    processingFee: 2,
    cashback: 0,
    trustBadges: ['No Cost EMI', 'Flexible Tenure']
  }
]

const DEMO_VOUCHERS: Voucher[] = [
  {
    id: '1',
    code: 'WELCOME50',
    name: 'Welcome Offer',
    type: 'discount',
    value: 50,
    currency: 'INR',
    minAmount: 5000,
    maxDiscount: 1000,
    expiryDate: '2025-12-31',
    isActive: true,
    description: 'Get ₹50 off on your first booking',
    terms: ['Valid for new users only', 'Minimum booking amount ₹5000', 'Cannot be combined with other offers']
  },
  {
    id: '2',
    code: 'FLY100',
    name: 'Flight Discount',
    type: 'discount',
    value: 100,
    currency: 'INR',
    minAmount: 10000,
    maxDiscount: 500,
    expiryDate: '2025-11-30',
    isActive: true,
    description: 'Get ₹100 off on flight bookings',
    terms: ['Valid on domestic flights', 'Minimum booking amount ₹10000', 'One time use only']
  },
  {
    id: '3',
    code: 'CASHBACK20',
    name: 'Cashback Voucher',
    type: 'cashback',
    value: 20,
    currency: 'INR',
    minAmount: 2000,
    expiryDate: '2025-12-15',
    isActive: true,
    description: 'Get ₹20 cashback in your wallet',
    terms: ['Cashback credited within 24 hours', 'Minimum booking amount ₹2000', 'Valid for all bookings']
  }
]

const DEMO_PROMO_CODES: PromoCode[] = [
  {
    id: '1',
    code: 'SAVE10',
    name: 'Save 10%',
    discount: 10,
    type: 'percentage',
    minAmount: 5000,
    maxDiscount: 2000,
    expiryDate: '2025-12-31',
    isActive: true
  },
  {
    id: '2',
    code: 'FLAT500',
    name: 'Flat ₹500 Off',
    discount: 500,
    type: 'fixed',
    minAmount: 10000,
    expiryDate: '2025-11-30',
    isActive: true
  }
]

export function DemoPaymentSystem({ 
  totalAmount, 
  onPaymentSuccess, 
  onPaymentFailure, 
  onBack 
}: DemoPaymentSystemProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [paymentData, setPaymentData] = useState<PaymentData>({ method: '' })
  const [voucherCode, setVoucherCode] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null)
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [walletBalance, setWalletBalance] = useState(2500)
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateDiscounts = () => {
    let voucherDiscount = 0
    let promoDiscount = 0

    if (appliedVoucher) {
      if (appliedVoucher.type === 'discount') {
        voucherDiscount = Math.min(appliedVoucher.value, appliedVoucher.maxDiscount || appliedVoucher.value)
      }
    }

    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        promoDiscount = Math.min(
          (totalAmount * appliedPromo.discount) / 100,
          appliedPromo.maxDiscount || Infinity
        )
      } else {
        promoDiscount = appliedPromo.discount
      }
    }

    return { voucherDiscount, promoDiscount }
  }

  const getFinalAmount = () => {
    const { voucherDiscount, promoDiscount } = calculateDiscounts()
    const totalDiscount = voucherDiscount + promoDiscount
    return Math.max(0, totalAmount - totalDiscount)
  }

  const applyVoucher = () => {
    const voucher = DEMO_VOUCHERS.find(v => v.code.toUpperCase() === voucherCode.toUpperCase())
    if (voucher && voucher.isActive) {
      if (totalAmount >= (voucher.minAmount || 0)) {
        setAppliedVoucher(voucher)
        setVoucherCode('')
        setShowVoucherModal(false)
      } else {
        alert(`Minimum amount required: ${formatPrice(voucher.minAmount || 0)}`)
      }
    } else {
      alert('Invalid voucher code')
    }
  }

  const applyPromoCode = () => {
    const promo = DEMO_PROMO_CODES.find(p => p.code.toUpperCase() === promoCode.toUpperCase())
    if (promo && promo.isActive) {
      if (totalAmount >= promo.minAmount) {
        setAppliedPromo(promo)
        setPromoCode('')
        setShowPromoModal(false)
      } else {
        alert(`Minimum amount required: ${formatPrice(promo.minAmount)}`)
      }
    } else {
      alert('Invalid promo code')
    }
  }

  const removeVoucher = () => {
    setAppliedVoucher(null)
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
  }

  const processPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method')
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      onPaymentSuccess({
        ...paymentData,
        method: selectedMethod,
        voucherCode: appliedVoucher?.code,
        promoCode: appliedPromo?.code
      })
    } else {
      onPaymentFailure('Payment failed. Please try again.')
    }

    setIsProcessing(false)
  }

  const { voucherDiscount, promoDiscount } = calculateDiscounts()
  const finalAmount = getFinalAmount()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600">Secure payment with multiple options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                Select Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMethod === method.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(method.cashback ?? 0) > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              {(method.cashback ?? 0)}% Cashback
                            </Badge>
                          )}
                          {(method.processingFee ?? 0) > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {(method.processingFee ?? 0)}% Fee
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.trustBadges.map((badge, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Details Form */}
          {selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber || ''}
                        onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate || ''}
                          onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv || ''}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardHolderName">Card Holder Name</Label>
                      <Input
                        id="cardHolderName"
                        placeholder="John Doe"
                        value={paymentData.cardHolderName || ''}
                        onChange={(e) => setPaymentData({...paymentData, cardHolderName: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@paytm"
                        value={paymentData.upiId || ''}
                        onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
                      />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        You will be redirected to your UPI app to complete the payment
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="walletType">Select Wallet</Label>
                      <select
                        id="walletType"
                        value={paymentData.walletType || ''}
                        onChange={(e) => setPaymentData({...paymentData, walletType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Wallet</option>
                        <option value="paytm">Paytm (Balance: ₹{walletBalance})</option>
                        <option value="phonepe">PhonePe</option>
                        <option value="mobikwik">MobiKwik</option>
                      </select>
                    </div>
                    {paymentData.walletType === 'paytm' && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                          Available Balance: {formatPrice(walletBalance)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedMethod === 'emi' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emiTenure">EMI Tenure</Label>
                      <select
                        id="emiTenure"
                        value={paymentData.emiTenure || ''}
                        onChange={(e) => setPaymentData({...paymentData, emiTenure: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Tenure</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                    </div>
                    {paymentData.emiTenure && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-orange-800">
                          EMI Amount: {formatPrice(finalAmount / paymentData.emiTenure)} per month
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Summary & Offers */}
        <div className="space-y-6">
          {/* Offers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-green-600" />
                Offers & Discounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voucher */}
              <div className="space-y-2">
                <Label>Voucher Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <Button onClick={() => setShowVoucherModal(true)} variant="outline">
                    Browse
                  </Button>
                </div>
                {appliedVoucher && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800">{appliedVoucher.name}</p>
                        <p className="text-sm text-green-600">{appliedVoucher.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeVoucher}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button onClick={() => setShowPromoModal(true)} variant="outline">
                    Browse
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-800">{appliedPromo.name}</p>
                        <p className="text-sm text-blue-600">
                          {appliedPromo.type === 'percentage' 
                            ? `${appliedPromo.discount}% off` 
                            : `${formatPrice(appliedPromo.discount)} off`
                          }
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removePromoCode}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Loyalty Points */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Loyalty Points</h4>
                </div>
                <p className="text-sm text-purple-800 mb-2">
                  Available Points: {loyaltyPoints}
                </p>
                <Button variant="outline" size="sm" className="text-purple-600">
                  Use Points
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-gray-600" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Voucher Discount</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
              
              {promoDiscount > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Promo Discount</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-green-600">{formatPrice(finalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Secure Payment</h4>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Fraud protection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={processPayment}
              disabled={!selectedMethod || isProcessing}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Pay {formatPrice(finalAmount)}
                </div>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Review
            </Button>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      <AnimatePresence>
        {showVoucherModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Available Vouchers</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoucherModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {DEMO_VOUCHERS.map((voucher) => (
                  <div key={voucher.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{voucher.name}</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {voucher.code}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>Min Amount: {formatPrice(voucher.minAmount || 0)}</p>
                      <p>Expires: {voucher.expiryDate}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setVoucherCode(voucher.code)
                        setShowVoucherModal(false)
                      }}
                      className="mt-2 w-full"
                    >
                      Use Voucher
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Code Modal */}
      <AnimatePresence>
        {showPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Available Promo Codes</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPromoModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {DEMO_PROMO_CODES.map((promo) => (
                  <div key={promo.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{promo.name}</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {promo.code}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {promo.type === 'percentage' 
                        ? `${promo.discount}% off` 
                        : `${formatPrice(promo.discount)} off`
                      }
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>Min Amount: {formatPrice(promo.minAmount)}</p>
                      <p>Expires: {promo.expiryDate}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setPromoCode(promo.code)
                        setShowPromoModal(false)
                      }}
                      className="mt-2 w-full"
                    >
                      Use Promo Code
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { Shield, CheckCircle2, RefreshCw, Headphones, BadgeCheck, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  variant?: 'default' | 'compact' | 'footer'
  className?: string
  showPaymentLogos?: boolean
}

const trustBadges = [
  {
    id: 'ssl',
    name: '100% Secure',
    icon: Shield,
    description: 'SSL encrypted payments',
    type: 'secure_payment' as const,
    color: 'text-green-600'
  },
  {
    id: 'verified',
    name: 'Verified Company',
    icon: BadgeCheck,
    description: 'Government registered',
    type: 'verified' as const,
    color: 'text-blue-600'
  },
  {
    id: 'refund',
    name: '100% Refund',
    icon: RefreshCw,
    description: 'Money back guarantee',
    type: 'refund_policy' as const,
    color: 'text-purple-600'
  },
  {
    id: 'support',
    name: '24/7 Support',
    icon: Headphones,
    description: 'Always here to help',
    type: 'customer_support' as const,
    color: 'text-orange-600'
  },
  {
    id: 'best-price',
    name: 'Best Price',
    icon: CheckCircle2,
    description: 'Guaranteed lowest rates',
    type: 'best_price' as const,
    color: 'text-red-600'
  }
]

const paymentLogos = [
  { name: 'Visa', logo: '💳' },
  { name: 'Mastercard', logo: '💳' },
  { name: 'UPI', logo: '📱' },
  { name: 'Paytm', logo: '💰' },
  { name: 'PhonePe', logo: '📲' },
  { name: 'GPay', logo: '🔷' }
]

export function TrustBadges({ 
  variant = 'default', 
  className,
  showPaymentLogos = false 
}: TrustBadgesProps) {
  
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4 flex-wrap justify-center', className)}>
        {trustBadges.slice(0, 3).map((badge) => {
          const Icon = badge.icon
          return (
            <motion.div
              key={badge.id}
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className={cn('h-4 w-4', badge.color)} />
              <span className="font-medium text-slate-700">{badge.name}</span>
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={badge.id}
                className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon className={cn('h-6 w-6 mb-2', badge.color)} />
                <div className="text-xs font-semibold text-slate-700">{badge.name}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Payment Logos */}
        {showPaymentLogos && (
          <div className="flex items-center justify-center gap-4 flex-wrap pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600 font-medium">We Accept:</span>
            {paymentLogos.map((payment) => (
              <div
                key={payment.name}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-md border border-slate-200"
                title={payment.name}
              >
                <span className="text-lg">{payment.logo}</span>
                <span className="text-xs font-medium text-slate-700">{payment.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Trust Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon
          return (
            <motion.div
              key={badge.id}
              className="group relative bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Icon */}
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full mb-3 mx-auto',
                'bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-slate-100 group-hover:to-slate-200'
              )}>
                <Icon className={cn('h-6 w-6', badge.color)} />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-600">
                  {badge.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          )
        })}
      </div>

      {/* Payment Methods */}
      {showPaymentLogos && (
        <motion.div
          className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Label */}
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-600" />
              <span className="font-semibold text-slate-700">Secure Payment Methods:</span>
            </div>

            {/* Logos */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {paymentLogos.map((payment) => (
                <motion.div
                  key={payment.name}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl">{payment.logo}</span>
                  <span className="text-sm font-medium text-slate-700">{payment.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Statement */}
      <motion.div
        className="text-center text-sm text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p>
          🔒 Your payment information is processed securely. We do not store credit card details.
        </p>
      </motion.div>
    </div>
  )
}

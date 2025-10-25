'use client'

import { Check, Circle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: Array<{
    id: number
    name: string
    description?: string
  }>
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
  onStepClick?: (stepId: number) => void
  allowStepNavigation?: boolean
}

export function ProgressBar({
  currentStep,
  totalSteps,
  steps,
  variant = 'default',
  className,
  onStepClick,
  allowStepNavigation = false,
}: ProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed'
    if (stepId === currentStep) return 'active'
    return 'pending'
  }

  const isStepClickable = (stepId: number) => {
    if (!allowStepNavigation || !onStepClick) return false
    return stepId < currentStep // Only allow clicking on completed steps
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('w-full', className)}>
        {/* Progress Bar */}
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-ruby-600 to-ruby-700 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Step Counter */}
        <div className="mt-2 text-center text-sm text-slate-600">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const isLast = index === steps.length - 1
            const isClickable = isStepClickable(step.id)

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <motion.button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    status === 'completed' && 'bg-green-600 border-green-600 text-white',
                    status === 'active' && 'bg-ruby-600 border-ruby-600 text-white',
                    status === 'pending' && 'bg-white border-slate-300 text-slate-400',
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-default'
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id}</span>
                  )}
                </motion.button>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-1 bg-slate-200 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: status === 'completed' ? '100%' : '0%' }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Current Step Name */}
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-900">
            {steps.find((s) => s.id === currentStep)?.name}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Steps Container */}
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const isLast = index === steps.length - 1
            const isClickable = isStepClickable(step.id)

            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center relative',
                  !isLast && 'flex-1'
                )}
              >
                {/* Step Circle and Connector */}
                <div className="flex items-center w-full">
                  {/* Step Circle */}
                  <motion.button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-md transition-all',
                      status === 'completed' &&
                        'bg-green-600 border-green-600 text-white',
                      status === 'active' &&
                        'bg-ruby-600 border-ruby-600 text-white ring-4 ring-ruby-100',
                      status === 'pending' &&
                        'bg-white border-slate-300 text-slate-400',
                      isClickable && 'cursor-pointer hover:scale-110 hover:shadow-lg',
                      !isClickable && 'cursor-default'
                    )}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      delay: index * 0.1,
                    }}
                    whileHover={isClickable ? { scale: 1.1 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                  >
                    {status === 'completed' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <Check className="h-6 w-6" />
                      </motion.div>
                    ) : status === 'active' ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Circle className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </motion.button>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 h-1 mx-2 bg-slate-200 rounded-full relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: status === 'completed' ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-3 text-center max-w-[120px]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                  >
                    <div
                      className={cn(
                        'text-sm font-semibold mb-1',
                        status === 'active' && 'text-ruby-600',
                        status === 'completed' && 'text-green-600',
                        status === 'pending' && 'text-slate-400'
                      )}
                    >
                      {step.name}
                    </div>
                    {step.description && (
                      <div className="text-xs text-slate-500">
                        {step.description}
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Overall Progress Bar (Below Steps) */}
        <div className="mt-6 relative">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-ruby-600 via-ruby-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>
          <motion.div
            className="absolute -top-1 bg-white border-2 border-ruby-600 rounded-full w-4 h-4 shadow-md"
            initial={{ left: 0 }}
            animate={{ left: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="mt-2 text-center">
          <motion.span
            className="text-sm font-medium text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(progressPercentage)}% Complete
          </motion.span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  label?: string
  href?: string
  variant?: 'button' | 'link'
  className?: string
  showIcon?: boolean
}

export function BackButton({ 
  label = 'Back', 
  href, 
  variant = 'link',
  className = '',
  showIcon = true 
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  if (variant === 'button') {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleClick}
        className={`${className}`}
      >
        {showIcon && <ArrowLeft className="w-4 h-4 mr-2" />}
        {label}
      </Button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-sapphire-600 hover:text-sapphire-800 transition-colors text-sm font-medium ${className}`}
    >
      {showIcon && <ChevronLeft className="w-4 h-4 mr-1" />}
      {label}
    </button>
  )
}

interface NavigationHeaderProps {
  title: string
  subtitle?: React.ReactNode
  backLabel?: string
  backHref?: string
  showBack?: boolean
  children?: React.ReactNode
}

export function NavigationHeader({
  title,
  subtitle,
  backLabel = 'Back',
  backHref,
  showBack = true,
  children
}: NavigationHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 py-4">
      <div className="container mx-auto px-4">
        {showBack && (
          <div className="flex items-center mb-4">
            <BackButton label={backLabel} href={backHref} />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sapphire-900">{title}</h1>
            {subtitle && (
              <div className="text-slate-600 mt-1">{subtitle}</div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2
              ${index < currentStep 
                ? 'bg-sapphire-600 border-sapphire-600 text-white' 
                : index === currentStep
                ? 'bg-sapphire-100 border-sapphire-600 text-sapphire-600'
                : 'bg-slate-100 border-slate-300 text-slate-500'
              }
            `}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          <span 
            className={`ml-2 text-sm font-medium ${
              index <= currentStep ? 'text-sapphire-900' : 'text-slate-500'
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <div 
              className={`w-8 h-0.5 mx-4 ${
                index < currentStep ? 'bg-sapphire-600' : 'bg-slate-300'
              }`} 
            />
          )}
        </div>
      ))}
    </div>
  )
}
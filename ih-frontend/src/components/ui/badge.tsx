'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          {
            'bg-sapphire-100 text-sapphire-800 hover:bg-sapphire-200': variant === 'default',
            'bg-slate-100 text-slate-800 hover:bg-slate-200': variant === 'secondary',
            'bg-ruby-100 text-ruby-800 hover:bg-ruby-200': variant === 'destructive',
            'border border-slate-200 text-slate-600 hover:bg-slate-50': variant === 'outline',
            'bg-emerald-100 text-emerald-800 hover:bg-emerald-200': variant === 'success',
            'bg-gold-100 text-gold-800 hover:bg-gold-200': variant === 'warning',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
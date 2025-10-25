'use client'

import { useState } from 'react'
import { Shield, ExternalLink } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DelayProtectionProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function DelayProtection({
  enabled,
  onToggle,
  className,
}: DelayProtectionProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
        <Checkbox
          id="delay-protection"
          checked={enabled}
          onCheckedChange={(checked) => onToggle(checked as boolean)}
          className="h-4 w-4"
        />
        <div className="flex-1">
          <Label htmlFor="delay-protection" className="text-sm font-semibold text-slate-800 cursor-pointer">
            Add Flight Delay Protection
          </Label>
          <p className="text-xs text-slate-600 mt-1">Get compensation for delays of 1 hour or more</p>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="h-auto p-0 text-blue-600 hover:text-blue-700 text-xs whitespace-nowrap"
        >
          View Details
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
      
      {showDetails && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <h4 className="font-semibold text-slate-900 text-sm">Flight Delay Protection Coverage</h4>
          
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-2">What's Covered:</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Compensation for delays over 1 hour or more</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Meal vouchers during extended delays</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Hotel accommodation for overnight delays</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-xs font-semibold text-slate-700 mb-2">Terms & Conditions:</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="text-slate-400">•</span>
                <span>Coverage applies to delays due to airline operational issues</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-slate-400">•</span>
                <span>Weather-related delays are not covered</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-slate-400">•</span>
                <span>Maximum compensation limit applies per booking</span>
              </li>
            </ul>
          </div>
          
          <p className="text-xs text-slate-500 italic">
            By selecting this option, you agree to the terms and conditions of the Flight Delay Protection policy.
          </p>
        </div>
      )}
    </div>
  )
}

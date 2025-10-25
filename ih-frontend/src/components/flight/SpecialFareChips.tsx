'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SpecialFare, getSpecialFareDisplayName, getSpecialFareTooltip } from '@/lib/stores/flightSearch'

interface SpecialFareChipsProps {
  selectedFare: SpecialFare
  onFareChange: (fare: SpecialFare) => void
  className?: string
}

const fareOptions: SpecialFare[] = ['REG', 'STU', 'ARM', 'SEN', 'DOC']

export function SpecialFareChips({
  selectedFare,
  onFareChange,
  className,
}: SpecialFareChipsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-slate-700">Special Fare</label>
      
      <div className="flex flex-wrap gap-2">
        {fareOptions.map((fare) => {
          const isSelected = selectedFare === fare
          const displayName = getSpecialFareDisplayName(fare)
          const tooltip = getSpecialFareTooltip(fare)
          
          return (
            <Badge
              key={fare}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105',
                isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
              )}
              onClick={() => onFareChange(fare)}
              title={tooltip}
            >
              {displayName}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

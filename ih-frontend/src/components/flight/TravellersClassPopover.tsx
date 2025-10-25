'use client'

import { useState } from 'react'
import { Users, Plus, Minus, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CabinClass, getCabinDisplayName } from '@/lib/stores/flightSearch'

interface TravellersClassPopoverProps {
  passengers: {
    adults: number
    children: number
    infants: number
  }
  cabin: CabinClass
  onPassengersChange: (passengers: { adults: number; children: number; infants: number }) => void
  onCabinChange: (cabin: CabinClass) => void
  className?: string
}

const cabinOptions: { value: CabinClass; label: string; description: string }[] = [
  { value: 'E', label: 'Economy', description: 'Standard seating' },
  { value: 'PE', label: 'Premium Economy', description: 'Extra legroom' },
  { value: 'B', label: 'Business', description: 'Premium service' },
  { value: 'F', label: 'First', description: 'Luxury experience' },
]

export function TravellersClassPopover({
  passengers,
  cabin,
  onPassengersChange,
  onCabinChange,
  className,
}: TravellersClassPopoverProps) {
  const [open, setOpen] = useState(false)
  const [tempPassengers, setTempPassengers] = useState(passengers)
  const [tempCabin, setTempCabin] = useState(cabin)

  const totalPassengers = tempPassengers.adults + tempPassengers.children + tempPassengers.infants

  const updatePassengerCount = (type: 'adults' | 'children' | 'infants', delta: number) => {
    const newPassengers = { ...tempPassengers }
    newPassengers[type] = Math.max(0, Math.min(9, newPassengers[type] + delta))
    
    // Validation rules
    if (newPassengers.infants > newPassengers.adults) {
      newPassengers.infants = newPassengers.adults
    }
    
    const total = newPassengers.adults + newPassengers.children + newPassengers.infants
    if (total > 9) {
      return // Don't allow more than 9 passengers
    }
    
    if (newPassengers.adults < 1) {
      return // At least 1 adult required
    }
    
    setTempPassengers(newPassengers)
  }

  const handleApply = () => {
    onPassengersChange(tempPassengers)
    onCabinChange(tempCabin)
    setOpen(false)
  }

  const getPassengerSummary = () => {
    const parts: string[] = []
    if (passengers.adults > 0) parts.push(`${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`)
    if (passengers.children > 0) parts.push(`${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`)
    if (passengers.infants > 0) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`)
    return parts.join(', ')
  }

  const getValidationError = () => {
    if (tempPassengers.infants > tempPassengers.adults) {
      return 'Number of infants cannot exceed number of adults'
    }
    if (totalPassengers > 9) {
      return 'Maximum 9 passengers allowed'
    }
    if (tempPassengers.adults < 1) {
      return 'At least 1 adult passenger required'
    }
    return null
  }

  const validationError = getValidationError()

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-slate-700">Travellers & Class</label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-12 px-4"
          >
            <Users className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {getPassengerSummary()} • {getCabinDisplayName(cabin)}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Passengers Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Passengers</h4>
              
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Adults</div>
                  <div className="text-sm text-slate-500">12+ years</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePassengerCount('adults', -1)}
                    disabled={tempPassengers.adults <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{tempPassengers.adults}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePassengerCount('adults', 1)}
                    disabled={totalPassengers >= 9}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Children</div>
                  <div className="text-sm text-slate-500">2-11 years</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePassengerCount('children', -1)}
                    disabled={tempPassengers.children <= 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{tempPassengers.children}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePassengerCount('children', 1)}
                    disabled={totalPassengers >= 9}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Infants</div>
                  <div className="text-sm text-slate-500">Under 2 years</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePassengerCount('infants', -1)}
                    disabled={tempPassengers.infants <= 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{tempPassengers.infants}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePassengerCount('infants', 1)}
                    disabled={tempPassengers.infants >= tempPassengers.adults || totalPassengers >= 9}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {validationError && (
              <p className="text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
            
            <Separator />
            
            {/* Cabin Class Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Cabin Class</h4>
              <div className="space-y-2">
                {cabinOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={option.value}
                      name="cabin-class"
                      value={option.value}
                      checked={tempCabin === option.value}
                      onChange={(e) => setTempCabin(e.target.value as CabinClass)}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="font-medium text-slate-900">{option.label}</div>
                      <div className="text-sm text-slate-500">{option.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Apply Button */}
            <Button onClick={handleApply} className="w-full" disabled={!!validationError}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

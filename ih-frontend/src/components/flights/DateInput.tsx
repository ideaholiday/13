'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  minDate?: Date
}

export function DateInput({ value, onChange, label, placeholder = 'Select date', minDate }: DateInputProps) {
  const [open, setOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'))
      setOpen(false)
    }
  }

  const displayValue = value ? format(new Date(value), 'dd MMM yyyy') : placeholder

  return (
    <div className="w-full">
      {label && <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between px-3 py-2 h-auto border-gray-300 hover:border-gray-400"
          >
            <span className="text-sm text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-gray-600" />
              {displayValue}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <CalendarComponent
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate) return date < minDate
              return date < new Date()
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

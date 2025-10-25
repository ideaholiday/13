'use client'

import React from 'react'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RoundTripProgressProps {
  outboundSelected: boolean
  returnSelected: boolean
  tripType: 'O' | 'R' | 'M'
}

export function RoundTripProgress({ outboundSelected, returnSelected, tripType }: RoundTripProgressProps) {
  if (tripType !== 'R') return null

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {outboundSelected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${outboundSelected ? 'text-green-700' : 'text-gray-600'}`}>
                Outbound Flight
              </span>
              {outboundSelected && <Badge variant="secondary" className="text-xs">Selected</Badge>}
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400" />
            
            <div className="flex items-center gap-2">
              {returnSelected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${returnSelected ? 'text-green-700' : 'text-gray-600'}`}>
                Return Flight
              </span>
              {returnSelected && <Badge variant="secondary" className="text-xs">Selected</Badge>}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Round Trip</div>
            <div className="text-xs text-gray-500">
              {outboundSelected && returnSelected ? 'Complete' : 'In Progress'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

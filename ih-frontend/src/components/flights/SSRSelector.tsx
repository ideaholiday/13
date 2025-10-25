'use client'

import React, { useState } from 'react'
import { Utensils, User, Heart, Baby, Accessibility, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface SSRItem {
  id: string
  type: 'meal' | 'seat' | 'medical' | 'special'
  name: string
  description: string
  icon: React.ReactNode
  category: string
  isFree: boolean
  requiresDocumentation?: boolean
}

interface SSRSelectorProps {
  passengers: Array<{
    id: string
    firstName: string
    lastName: string
    type: 'ADT' | 'CHD' | 'INF'
  }>
  onSSRChange: (passengerId: string, ssrId: string, value: string) => void
  selectedSSRs: Record<string, Record<string, string>>
}

export const SSR_OPTIONS: SSRItem[] = [
  // Meal Preferences
  {
    id: 'meal-veg',
    type: 'meal',
    name: 'Vegetarian Meal',
    description: 'Standard vegetarian meal',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },
  {
    id: 'meal-nonveg',
    type: 'meal',
    name: 'Non-Vegetarian Meal',
    description: 'Chicken or meat meal',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },
  {
    id: 'meal-vegan',
    type: 'meal',
    name: 'Vegan Meal',
    description: 'Plant-based meal without animal products',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },
  {
    id: 'meal-gluten-free',
    type: 'meal',
    name: 'Gluten-Free Meal',
    description: 'Meal without gluten-containing ingredients',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },
  {
    id: 'meal-diabetic',
    type: 'meal',
    name: 'Diabetic Meal',
    description: 'Low-sugar meal for diabetic passengers',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },
  {
    id: 'meal-kosher',
    type: 'meal',
    name: 'Kosher Meal',
    description: 'Meal prepared according to Jewish dietary laws',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },
  {
    id: 'meal-halal',
    type: 'meal',
    name: 'Halal Meal',
    description: 'Meal prepared according to Islamic dietary laws',
    icon: <Utensils className="w-5 h-5" />,
    category: 'Meals',
    isFree: true,
  },

  // Seat Preferences
  {
    id: 'seat-window',
    type: 'seat',
    name: 'Window Seat Preference',
    description: 'Preference for window seat',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Preferences',
    isFree: true,
  },
  {
    id: 'seat-aisle',
    type: 'seat',
    name: 'Aisle Seat Preference',
    description: 'Preference for aisle seat',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Preferences',
    isFree: true,
  },
  {
    id: 'seat-middle',
    type: 'seat',
    name: 'Middle Seat Preference',
    description: 'Preference for middle seat',
    icon: <User className="w-5 h-5" />,
    category: 'Seat Preferences',
    isFree: true,
  },

  // Medical/Special Needs
  {
    id: 'wheelchair-assistance',
    type: 'medical',
    name: 'Wheelchair Assistance',
    description: 'Wheelchair assistance at airport and aircraft',
    icon: <Accessibility className="w-5 h-5" />,
    category: 'Special Assistance',
    isFree: true,
    requiresDocumentation: true,
  },
  {
    id: 'mobility-assistance',
    type: 'medical',
    name: 'Mobility Assistance',
    description: 'Assistance for passengers with mobility issues',
    icon: <Accessibility className="w-5 h-5" />,
    category: 'Special Assistance',
    isFree: true,
    requiresDocumentation: true,
  },
  {
    id: 'infant-bassinet',
    type: 'special',
    name: 'Infant Bassinet',
    description: 'Bassinet for infant passengers',
    icon: <Baby className="w-5 h-5" />,
    category: 'Special Services',
    isFree: true,
  },
  {
    id: 'unaccompanied-minor',
    type: 'special',
    name: 'Unaccompanied Minor',
    description: 'Special service for children traveling alone',
    icon: <Baby className="w-5 h-5" />,
    category: 'Special Services',
    isFree: false,
    requiresDocumentation: true,
  },
  {
    id: 'pet-in-cabin',
    type: 'special',
    name: 'Pet in Cabin',
    description: 'Small pet allowed in cabin',
    icon: <Heart className="w-5 h-5" />,
    category: 'Special Services',
    isFree: false,
    requiresDocumentation: true,
  },
]

const CATEGORIES = ['All', 'Meals', 'Seat Preferences', 'Special Assistance', 'Special Services']

export function SSRSelector({ passengers, onSSRChange, selectedSSRs }: SSRSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(null)

  const filteredSSRs = selectedCategory === 'All' 
    ? SSR_OPTIONS 
    : SSR_OPTIONS.filter(ssr => ssr.category === selectedCategory)

  const getPassengerSSRs = (passengerId: string) => {
    return selectedSSRs[passengerId] || {}
  }

  const handleSSRChange = (passengerId: string, ssrId: string, value: string) => {
    onSSRChange(passengerId, ssrId, value)
  }

  const getTotalSSRs = (): number => {
    return Object.values(selectedSSRs).reduce((total, passengerSSRs) => {
      return total + Object.keys(passengerSSRs).length
    }, 0)
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Service Requests (SSR)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Request special meals, seat preferences, or assistance • {getTotalSSRs()} requests made
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-sapphire-100 text-sapphire-700 border border-sapphire-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-sapphire-600">{getTotalSSRs()}</p>
            <p className="text-xs text-gray-600">Total Requests</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-emerald-600">{passengers.length}</p>
            <p className="text-xs text-gray-600">Passengers</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-ruby-600">
              {SSR_OPTIONS.filter(ssr => !ssr.isFree).length}
            </p>
            <p className="text-xs text-gray-600">Paid Services</p>
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div className="space-y-4">
        {passengers.map((passenger) => {
          const passengerSSRs = getPassengerSSRs(passenger.id)
          const isExpanded = expandedPassenger === passenger.id

          return (
            <div key={passenger.id} className="border rounded-lg overflow-hidden">
              {/* Passenger Header */}
              <button
                onClick={() => setExpandedPassenger(isExpanded ? null : passenger.id)}
                className="w-full px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 flex items-center justify-between font-medium text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sapphire-100 text-sapphire-700 font-semibold">
                    {passenger.firstName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{passenger.firstName} {passenger.lastName}</p>
                    <p className="text-sm text-gray-600">{passenger.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-sapphire-600">
                    {Object.keys(passengerSSRs).length} request{Object.keys(passengerSSRs).length !== 1 ? 's' : ''}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-sapphire-600' : 'bg-gray-400'}`}></div>
                </div>
              </button>

              {/* Passenger SSR Options */}
              {isExpanded && (
                <div className="p-4 bg-white border-t">
                  <div className="space-y-3">
                    {filteredSSRs.map((ssr) => {
                      const currentValue = passengerSSRs[ssr.id] || ''

                      return (
                        <div key={ssr.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${ssr.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {ssr.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{ssr.name}</h4>
                                {ssr.isFree ? (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                    Free
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                    Paid
                                  </span>
                                )}
                                {ssr.requiresDocumentation && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    Documentation Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{ssr.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={currentValue}
                              onChange={(e) => handleSSRChange(passenger.id, ssr.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                            >
                              <option value="">Not Requested</option>
                              <option value="requested">Request</option>
                              <option value="confirmed">Confirmed</option>
                            </select>
                            {currentValue && (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold">Set</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {Object.keys(passengerSSRs).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Current Requests</h4>
                      <div className="space-y-2">
                        {Object.entries(passengerSSRs).map(([ssrId, status]) => {
                          const ssr = SSR_OPTIONS.find(s => s.id === ssrId)
                          if (!ssr) return null
                          return (
                            <div key={ssrId} className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <span className="text-sm font-semibold text-emerald-800">{ssr.name}</span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                status === 'confirmed' ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
                              }`}>
                                {status === 'confirmed' ? 'Confirmed' : 'Requested'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Information</p>
            <ul className="space-y-1 text-xs">
              <li>• SSR requests must be made at least 24 hours before departure</li>
              <li>• Some services may have limited availability</li>
              <li>• Documentation may be required for medical/special assistance</li>
              <li>• Paid services will be charged separately</li>
              <li>• Confirmation of requests will be sent via email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

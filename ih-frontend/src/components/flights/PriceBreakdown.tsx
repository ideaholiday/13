'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface PriceBreakdownProps {
  baseFare: number
  taxes: number
  seatCost: number
  addOnsCost: number
  discount?: number
  numberOfPassengers: number
  numberOfFlights: number
}

export function PriceBreakdown({
  baseFare,
  taxes,
  seatCost,
  addOnsCost,
  discount = 0,
  numberOfPassengers,
  numberOfFlights,
}: PriceBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false)

  const subtotal = baseFare + taxes
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const totalCost = discountedSubtotal + seatCost + addOnsCost
  const pricePerPerson = Math.round(totalCost / numberOfPassengers)

  const getTaxPercentage = (): number => {
    if (baseFare === 0) return 0
    return Math.round((taxes / baseFare) * 100)
  }

  return (
    <div className="border rounded-lg p-6 bg-white sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>

      {/* Main Summary */}
      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            Base Fare <span className="text-xs text-gray-500">({numberOfPassengers} × {numberOfFlights})</span>
          </span>
          <span className="font-medium text-gray-900">₹{baseFare.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            Taxes & Fees <span className="text-xs text-gray-500">({getTaxPercentage()}%)</span>
          </span>
          <span className="font-medium text-gray-900">₹{taxes.toLocaleString('en-IN')}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-gray-700">Discount Applied</span>
            <span className="font-medium">-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {seatCost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Seat Selection</span>
            <span className="font-medium text-gray-900">₹{seatCost.toLocaleString('en-IN')}</span>
          </div>
        )}

        {addOnsCost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Add-ons & Services</span>
            <span className="font-medium text-gray-900">₹{addOnsCost.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-sapphire-50 to-sapphire-100 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">Total Cost</span>
          <span className="text-2xl font-bold text-sapphire-600">
            ₹{totalCost.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          ₹{pricePerPerson.toLocaleString('en-IN')} per person
        </p>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 px-3 text-sm font-medium text-sapphire-600 hover:bg-sapphire-50 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <HelpCircle className="w-4 h-4" />
        {showDetails ? 'Hide' : 'Show'} Breakdown Details
      </button>

      {/* Detailed Information */}
      {showDetails && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-600">Passengers:</span>
            <span className="font-medium text-gray-900">{numberOfPassengers}</span>

            <span className="text-gray-600">Segments:</span>
            <span className="font-medium text-gray-900">{numberOfFlights}</span>

            <span className="text-gray-600">Base per segment:</span>
            <span className="font-medium text-gray-900">
              ₹{Math.round(baseFare / (numberOfPassengers * numberOfFlights)).toLocaleString('en-IN')}
            </span>

            <span className="text-gray-600">Tax %:</span>
            <span className="font-medium text-gray-900">{getTaxPercentage()}%</span>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="mt-4 pt-4 border-t">
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            ✓ <strong>Final price may vary</strong> based on selected seats and add-ons
          </p>
          <p>
            ✓ <strong>Taxes included</strong> in the displayed price
          </p>
          <p>
            ✓ <strong>Non-refundable</strong> unless specifically marked as refundable
          </p>
        </div>
      </div>

      {/* Save Alert */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          💡 Complete your booking to lock in this price. Prices may change if you leave this page.
        </p>
      </div>
    </div>
  )
}

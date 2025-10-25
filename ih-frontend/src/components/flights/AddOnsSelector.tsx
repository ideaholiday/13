'use client'

import React, { useState } from 'react'
import { ChevronDown, Plus, Minus } from 'lucide-react'

interface AddOnItem {
  id: string
  name: string
  description: string
  pricePerUnit: number
  quantity: number
  maxQuantity: number
  icon: string
}

interface AddOnCategory {
  id: string
  name: string
  items: AddOnItem[]
  isExpanded: boolean
}

interface AddOnsSelectorProps {
  numberOfPassengers: number
  selectedAddOns: Record<string, number> // id -> quantity
  onAddOnChange: (addOnId: string, quantity: number) => void
}

const DEFAULT_ADDONS: AddOnCategory[] = [
  {
    id: 'baggage',
    name: '🎒 Baggage',
    isExpanded: false,
    items: [
      {
        id: 'baggage-checked-20',
        name: 'Checked Baggage (20 kg)',
        description: 'One standard checked bag per person',
        pricePerUnit: 1200,
        quantity: 0,
        maxQuantity: 3,
        icon: '📦',
      },
      {
        id: 'baggage-checked-32',
        name: 'Checked Baggage (32 kg)',
        description: 'Premium checked baggage allowance',
        pricePerUnit: 1800,
        quantity: 0,
        maxQuantity: 3,
        icon: '📦',
      },
      {
        id: 'baggage-extra',
        name: 'Extra Baggage',
        description: 'Additional baggage for oversized items',
        pricePerUnit: 2500,
        quantity: 0,
        maxQuantity: 2,
        icon: '🧳',
      },
    ],
  },
  {
    id: 'meals',
    name: '🍽️ Meals & Beverages',
    isExpanded: false,
    items: [
      {
        id: 'meal-veg',
        name: 'Vegetarian Meal',
        description: 'Fresh vegetarian meal service',
        pricePerUnit: 300,
        quantity: 0,
        maxQuantity: 2,
        icon: '🥗',
      },
      {
        id: 'meal-nonveg',
        name: 'Non-Vegetarian Meal',
        description: 'Chicken or meat meal service',
        pricePerUnit: 300,
        quantity: 0,
        maxQuantity: 2,
        icon: '🍗',
      },
      {
        id: 'meal-vegan',
        name: 'Vegan Meal',
        description: 'Specially prepared vegan meal',
        pricePerUnit: 400,
        quantity: 0,
        maxQuantity: 2,
        icon: '🥕',
      },
      {
        id: 'beverage-premium',
        name: 'Premium Beverage Pack',
        description: 'Assorted premium beverages',
        pricePerUnit: 200,
        quantity: 0,
        maxQuantity: 2,
        icon: '🍷',
      },
    ],
  },
  {
    id: 'seats',
    name: '💺 Premium Seats',
    isExpanded: false,
    items: [
      {
        id: 'seat-extra-legroom',
        name: 'Extra Legroom Seat',
        description: 'Additional legroom and comfort',
        pricePerUnit: 2000,
        quantity: 0,
        maxQuantity: 1,
        icon: '🪑',
      },
      {
        id: 'seat-exit-row',
        name: 'Exit Row Seat',
        description: 'Extra space with emergency exit proximity',
        pricePerUnit: 1500,
        quantity: 0,
        maxQuantity: 1,
        icon: '🚪',
      },
      {
        id: 'seat-window',
        name: 'Window Seat Preference',
        description: 'Preferred window seat allocation',
        pricePerUnit: 500,
        quantity: 0,
        maxQuantity: 1,
        icon: '🪟',
      },
    ],
  },
  {
    id: 'insurance',
    name: '🛡️ Travel Protection',
    isExpanded: false,
    items: [
      {
        id: 'insurance-trip',
        name: 'Trip Insurance',
        description: 'Full trip protection and cancellation coverage',
        pricePerUnit: 500,
        quantity: 0,
        maxQuantity: 1,
        icon: '🛡️',
      },
      {
        id: 'insurance-baggage',
        name: 'Baggage Protection',
        description: 'Coverage for lost or damaged baggage',
        pricePerUnit: 300,
        quantity: 0,
        maxQuantity: 1,
        icon: '🎒',
      },
    ],
  },
]

export function AddOnsSelector({
  numberOfPassengers,
  selectedAddOns,
  onAddOnChange,
}: AddOnsSelectorProps) {
  const [categories, setCategories] = useState<AddOnCategory[]>(DEFAULT_ADDONS)

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    )
  }

  const handleQuantityChange = (addOnId: string, newQuantity: number) => {
    onAddOnChange(addOnId, newQuantity)
  }

  const calculateCategoryTotal = (categoryId: string): number => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return 0

    return category.items.reduce((total, item) => {
      const quantity = selectedAddOns[item.id] || 0
      return total + item.pricePerUnit * quantity
    }, 0)
  }

  const calculateGrandTotal = (): number => {
    return categories.reduce((total, cat) => total + calculateCategoryTotal(cat.id), 0)
  }

  const getSelectedCount = (): number => {
    return Object.values(selectedAddOns).reduce((sum, qty) => sum + qty, 0)
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add-ons & Services</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enhance your journey with our exclusive services • {getSelectedCount()} add-on
          {getSelectedCount() !== 1 ? 's' : ''} selected
        </p>

        {numberOfPassengers > 1 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Prices shown are per person. Multiply by {numberOfPassengers} passenger
              {numberOfPassengers !== 1 ? 's' : ''} if adding for all.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-sapphire-600">{getSelectedCount()}</p>
            <p className="text-xs text-gray-600">Add-ons Selected</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-emerald-600">{numberOfPassengers}</p>
            <p className="text-xs text-gray-600">Passengers</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-ruby-600">₹{calculateGrandTotal().toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-600">Total Cost</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 flex items-center justify-between font-medium text-gray-900 transition-colors"
            >
              <div className="flex items-center justify-between flex-1">
                <span>{category.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-sapphire-600">
                    ₹{calculateCategoryTotal(category.id).toLocaleString('en-IN')}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      category.isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Category Items */}
            {category.isExpanded && (
              <div className="divide-y bg-white">
                {category.items.map((item) => {
                  const quantity = selectedAddOns[item.id] || 0
                  const itemTotal = item.pricePerUnit * quantity

                  return (
                    <div key={item.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{item.icon}</span>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-sapphire-600">
                              ₹{item.pricePerUnit.toLocaleString('en-IN')}/person
                            </p>
                            {quantity > 0 && (
                              <p className="text-sm text-gray-600">
                                Subtotal: ₹{itemTotal.toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, Math.max(0, quantity - 1))
                            }
                            disabled={quantity === 0}
                            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            type="button"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-gray-700" />
                          </button>

                          <span className="w-8 text-center font-semibold text-gray-900">
                            {quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, Math.min(item.maxQuantity, quantity + 1))
                            }
                            disabled={quantity >= item.maxQuantity}
                            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            type="button"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between p-4 bg-sapphire-50 border border-sapphire-200 rounded-lg">
          <span className="font-semibold text-gray-900">Total Add-ons Cost:</span>
          <span className="text-2xl font-bold text-sapphire-600">
            ₹{calculateGrandTotal().toLocaleString('en-IN')}
          </span>
        </div>

        {calculateGrandTotal() > 0 && (
          <p className="text-xs text-gray-600 mt-2 text-center">
            * Prices are per person and will be multiplied for {numberOfPassengers} passenger
            {numberOfPassengers !== 1 ? 's' : ''} if applicable
          </p>
        )}
      </div>
    </div>
  )
}

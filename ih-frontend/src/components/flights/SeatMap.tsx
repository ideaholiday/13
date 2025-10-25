'use client'

import React, { useState } from 'react'
import { AlertCircle, Info } from 'lucide-react'

interface Seat {
  number: string
  row: number
  column: string
  isAvailable: boolean
  isSelected: boolean
  isOccupied: boolean
  price: number
}

interface SeatMapProps {
  flightKey: string
  totalSeats?: number
  selectedSeats: Set<string>
  onSeatSelect: (seatNumber: string, price: number) => void
  onSeatDeselect: (seatNumber: string, price: number) => void
  maxSelectableSeats: number
}

const SEAT_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F']
const ROWS = 30

// Seat pricing tiers
const SEAT_PRICES = {
  window: 500,    // Window seats
  aisle: 300,     // Aisle seats  
  middle: 0,      // Middle seats (free)
  exit: 800,      // Exit row seats
  front: 400,     // Front rows
}

export function SeatMap({
  flightKey,
  selectedSeats,
  onSeatSelect,
  onSeatDeselect,
  maxSelectableSeats,
}: SeatMapProps) {

  // Calculate seat price based on position
  const calculateSeatPrice = (row: number, column: string): number => {
    const colIndex = SEAT_COLUMNS.indexOf(column)
    
    // Exit row seats (rows 12-14)
    if (row >= 12 && row <= 14) {
      return SEAT_PRICES.exit
    }
    
    // Front rows (1-5)
    if (row <= 5) {
      return SEAT_PRICES.front
    }
    
    // Window seats (A, F)
    if (column === 'A' || column === 'F') {
      return SEAT_PRICES.window
    }
    
    // Aisle seats (C, D)
    if (column === 'C' || column === 'D') {
      return SEAT_PRICES.aisle
    }
    
    // Middle seats (B, E) - free
    return SEAT_PRICES.middle
  }

  // Generate seats - randomly mark some as occupied
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = []
    const occupiedSeats = new Set<string>()

    // Generate some random occupied seats
    for (let i = 0; i < ROWS * SEAT_COLUMNS.length * 0.3; i++) {
      const randomRow = Math.floor(Math.random() * ROWS) + 1
      const randomCol = SEAT_COLUMNS[Math.floor(Math.random() * SEAT_COLUMNS.length)]
      occupiedSeats.add(`${randomRow}${randomCol}`)
    }

    for (let row = 1; row <= ROWS; row++) {
      for (const col of SEAT_COLUMNS) {
        const seatNumber = `${row}${col}`
        const isOccupied = occupiedSeats.has(seatNumber)
        const isSelected = selectedSeats.has(seatNumber)

        seats.push({
          number: seatNumber,
          row,
          column: col,
          isAvailable: !isOccupied,
          isSelected,
          isOccupied,
          price: calculateSeatPrice(row, col),
        })
      }
    }

    return seats
  }

  const seats = generateSeats()

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return

    if (seat.isSelected) {
      onSeatDeselect(seat.number, seat.price)
    } else {
      if (selectedSeats.size < maxSelectableSeats) {
        onSeatSelect(seat.number, seat.price)
      }
    }
  }

  const getSeatClassName = (seat: Seat): string => {
    const baseClass =
      'w-10 h-10 rounded text-xs font-semibold flex items-center justify-center cursor-pointer transition-all'

    if (!seat.isAvailable) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`
    }

    if (seat.isSelected) {
      return `${baseClass} bg-emerald-500 text-white shadow-lg scale-110`
    }

    return `${baseClass} bg-white border-2 border-gray-300 text-gray-700 hover:border-sapphire-500 hover:bg-sapphire-50`
  }

  const availableSeats = seats.filter((s) => s.isAvailable).length
  const selectedCount = selectedSeats.size
  const selectedSeatsData = seats.filter((s) => s.isSelected)
  const totalSeatCost = selectedSeatsData.reduce((sum, seat) => sum + seat.price, 0)

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Seats</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select {maxSelectableSeats} seat{maxSelectableSeats !== 1 ? 's' : ''} • {selectedCount} selected
        </p>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
            <span className="text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded"></div>
            <span className="text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-gray-700">Occupied</span>
          </div>
        </div>

        {selectedCount === maxSelectableSeats && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Info className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-700">
              All seats selected. Modify selection to change seats.
            </p>
          </div>
        )}

        {selectedCount === 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              Select {maxSelectableSeats} seat{maxSelectableSeats !== 1 ? 's' : ''} for your booking
            </p>
          </div>
        )}
      </div>

      {/* Selected Seats Summary */}
      {selectedCount > 0 && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h4 className="font-semibold text-emerald-900 mb-2">Selected Seats</h4>
          <div className="space-y-2">
            {selectedSeatsData.map((seat) => (
              <div key={seat.number} className="flex justify-between items-center text-sm">
                <span className="text-emerald-800">Seat {seat.number}</span>
                <span className="font-semibold text-emerald-900">
                  {seat.price > 0 ? `₹${seat.price}` : 'Free'}
                </span>
              </div>
            ))}
            <div className="border-t border-emerald-300 pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-emerald-900">Total Seat Cost:</span>
                <span className="text-emerald-900">₹{totalSeatCost}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seat Map */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          {/* Header */}
          <div className="flex gap-3 mb-4">
            <div className="w-10"></div>
            {SEAT_COLUMNS.map((col) => (
              <div key={col} className="w-10 h-10 flex items-center justify-center font-semibold text-gray-700">
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {Array.from({ length: ROWS }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex gap-3 items-center">
                <div className="w-10 text-center font-semibold text-gray-700 text-sm">{row}</div>
                {SEAT_COLUMNS.map((col) => {
                  const seatNumber = `${row}${col}`
                  const seat = seats.find((s) => s.number === seatNumber)

                  if (!seat) return null

                  return (
                    <div key={seatNumber} className="flex flex-col items-center">
                      <button
                        onClick={() => handleSeatClick(seat)}
                        disabled={!seat.isAvailable}
                        className={getSeatClassName(seat)}
                        title={seat.isAvailable ? `Seat ${seatNumber} - ₹${seat.price}` : 'Occupied'}
                        type="button"
                      >
                        {seatNumber}
                      </button>
                      {seat.isAvailable && seat.price > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          ₹{seat.price}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-sapphire-600">{availableSeats}</p>
          <p className="text-sm text-gray-600">Available Seats</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{selectedCount}</p>
          <p className="text-sm text-gray-600">Selected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">{ROWS * SEAT_COLUMNS.length - availableSeats}</p>
          <p className="text-sm text-gray-600">Occupied</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          💡 <strong>Tip:</strong> Premium seats (extra legroom, exit rows) typically available at checkout. Current
          display shows economy cabin seats.
        </p>
      </div>

      {/* Seat Selection Tips */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Seat Selection Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Window seats offer great views and a place to lean</li>
          <li>• Aisle seats provide easy access to restrooms</li>
          <li>• Exit row seats have extra legroom but require physical capability</li>
          <li>• Front seats typically board and deplane first</li>
        </ul>
      </div>
    </div>
  )
}

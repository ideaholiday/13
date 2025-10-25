'use client'

import { ArrowUpDown } from 'lucide-react'

type SortOption = 'price-asc' | 'price-desc' | 'duration' | 'departure' | 'arrival'

interface SortingToolbarProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  resultCount: number
  totalCount: number
}

export function SortingToolbar({
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
}: SortingToolbarProps) {
  const sortOptions: Array<{
    value: SortOption
    label: string
    icon?: string
  }> = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' },
    { value: 'departure', label: 'Departure' },
    { value: 'arrival', label: 'Arrival' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{resultCount}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalCount}</span> flights
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                flex items-center gap-2
                ${
                  sortBy === option.value
                    ? 'bg-sapphire-50 text-sapphire-700 border-2 border-sapphire-500'
                    : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                }
              `}
            >
              <ArrowUpDown size={16} />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

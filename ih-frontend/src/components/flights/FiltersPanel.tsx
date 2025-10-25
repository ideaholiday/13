'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  stops: 'all' | 'nonstop' | 'onestop'
  refundableOnly: boolean
  departureTimeRange: [number, number]
  arrivalTimeRange: [number, number]
}

interface FiltersPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
  priceRange: { min: number; max: number }
  availableAirlines: Array<{ code: string; name: string }>
  resultCount: number
}

export function FiltersPanel({
  filters,
  onFiltersChange,
  onReset,
  priceRange,
  availableAirlines,
  resultCount,
}: FiltersPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['price', 'stops', 'airlines'])
  )

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections)
    if (newSections.has(section)) {
      newSections.delete(section)
    } else {
      newSections.add(section)
    }
    setExpandedSections(newSections)
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const [min, max] = filters.priceRange
    const newRange: [number, number] = 
      type === 'min' 
        ? [Math.min(value, max), max]
        : [min, Math.max(value, min)]
    onFiltersChange({ ...filters, priceRange: newRange })
  }

  const handleAirlineToggle = (airlineCode: string) => {
    const newAirlines = filters.airlines.includes(airlineCode)
      ? filters.airlines.filter(a => a !== airlineCode)
      : [...filters.airlines, airlineCode]
    onFiltersChange({ ...filters, airlines: newAirlines })
  }

  const handleStopsChange = (stops: 'all' | 'nonstop' | 'onestop') => {
    onFiltersChange({ ...filters, stops })
  }

  const handleRefundableChange = (checked: boolean) => {
    onFiltersChange({ ...filters, refundableOnly: checked })
  }

  const handleTimeChange = (
    type: 'departure' | 'arrival',
    timeType: 'min' | 'max',
    value: number
  ) => {
    if (type === 'departure') {
      const [min, max] = filters.departureTimeRange
      const newRange: [number, number] =
        timeType === 'min'
          ? [Math.min(value, max), max]
          : [min, Math.max(value, min)]
      onFiltersChange({ ...filters, departureTimeRange: newRange })
    } else {
      const [min, max] = filters.arrivalTimeRange
      const newRange: [number, number] =
        timeType === 'min'
          ? [Math.min(value, max), max]
          : [min, Math.max(value, min)]
      onFiltersChange({ ...filters, arrivalTimeRange: newRange })
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const activeFilterCount =
    (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max ? 1 : 0) +
    (filters.airlines.length > 0 ? 1 : 0) +
    (filters.stops !== 'all' ? 1 : 0) +
    (filters.refundableOnly ? 1 : 0) +
    (filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 24 ? 1 : 0) +
    (filters.arrivalTimeRange[0] > 0 || filters.arrivalTimeRange[1] < 24 ? 1 : 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-sapphire-500 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-sm text-sapphire-600 hover:text-sapphire-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
        {resultCount} flights match your filters
      </div>

      {/* Price Range Filter */}
      <FilterSection
        title="Price"
        isExpanded={expandedSections.has('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Minimum Price</label>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs font-medium text-gray-900 mt-1">
              {formatPrice(filters.priceRange[0])}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Maximum Price</label>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs font-medium text-gray-900 mt-1">
              {formatPrice(filters.priceRange[1])}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Stops Filter */}
      <FilterSection
        title="Stops"
        isExpanded={expandedSections.has('stops')}
        onToggle={() => toggleSection('stops')}
      >
        <div className="space-y-2">
          {[
            { value: 'nonstop' as const, label: 'Non-stop' },
            { value: 'onestop' as const, label: '1 Stop' },
            { value: 'all' as const, label: 'All flights' },
          ].map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="stops"
                value={option.value}
                checked={filters.stops === option.value}
                onChange={() => handleStopsChange(option.value)}
                className="w-4 h-4 text-sapphire-600"
              />
              <span className="ml-3 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Airlines Filter */}
      {availableAirlines.length > 0 && (
        <FilterSection
          title="Airlines"
          isExpanded={expandedSections.has('airlines')}
          onToggle={() => toggleSection('airlines')}
        >
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableAirlines.map((airline) => (
              <label key={airline.code} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline.code)}
                  onChange={() => handleAirlineToggle(airline.code)}
                  className="w-4 h-4 text-sapphire-600 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {airline.code} • {airline.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Departure Time Filter */}
      <FilterSection
        title="Departure Time"
        isExpanded={expandedSections.has('departure')}
        onToggle={() => toggleSection('departure')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">From</label>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={filters.departureTimeRange[0]}
              onChange={(e) => handleTimeChange('departure', 'min', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs font-medium text-gray-900 mt-1">
              {formatTime(filters.departureTimeRange[0])}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">To</label>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={filters.departureTimeRange[1]}
              onChange={(e) => handleTimeChange('departure', 'max', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs font-medium text-gray-900 mt-1">
              {formatTime(filters.departureTimeRange[1])}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Arrival Time Filter */}
      <FilterSection
        title="Arrival Time"
        isExpanded={expandedSections.has('arrival')}
        onToggle={() => toggleSection('arrival')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">From</label>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={filters.arrivalTimeRange[0]}
              onChange={(e) => handleTimeChange('arrival', 'min', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs font-medium text-gray-900 mt-1">
              {formatTime(filters.arrivalTimeRange[0])}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">To</label>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={filters.arrivalTimeRange[1]}
              onChange={(e) => handleTimeChange('arrival', 'max', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs font-medium text-gray-900 mt-1">
              {formatTime(filters.arrivalTimeRange[1])}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Refundable Filter */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.refundableOnly}
            onChange={(e) => handleRefundableChange(e.target.checked)}
            className="w-4 h-4 text-sapphire-600 rounded"
          />
          <span className="ml-3 text-sm font-medium text-gray-900">Refundable Only</span>
        </label>
      </div>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-sapphire-600">
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  )
}

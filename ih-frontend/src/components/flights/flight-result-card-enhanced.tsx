'use client'

/**
 * Enhanced Flight Result Card Component
 * Displays complete TBO flight information:
 * - Airline details with logo
 * - Complete segment information with baggage
 * - Detailed pricing breakdown with taxes
 * - Fare rules (cancellation/reissue charges)
 * - SSR availability
 * - Meal and refund information
 * - Real-time seat availability
 */

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  Plane,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Utensils,
  Luggage,
  IndianRupee,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import type {
  FlightResult,
  Segment,
  MiniFareRule,
  FareDetails,
  PassengerFareBreakdown,
} from '@/types/tbo-flight-data'

interface FlightResultCardProps {
  flight: FlightResult
  onSelect?: (flight: FlightResult) => void
  isSelected?: boolean
}

export const FlightResultCard: React.FC<FlightResultCardProps> = ({
  flight,
  onSelect,
  isSelected = false,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showFareBreakdown, setShowFareBreakdown] = useState(false)
  const [showRules, setShowRules] = useState(false)

  // Extract first and last segments for route display
  const allSegments = flight.Segments?.flat() || []
  const firstSegment = allSegments[0]
  const lastSegment = allSegments[allSegments.length - 1]

  if (!firstSegment) {
    return null
  }

  // Calculate total duration
  const totalDuration = allSegments.reduce(
    (sum, seg) => sum + (seg.Duration || 0),
    0
  )

  const durationStr = formatDuration(totalDuration)
  const stops = allSegments.length - 1
  const airline = firstSegment.Airline

  return (
    <Card
      className={`mb-4 overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
    >
      <CardHeader className="pb-3">
        {/* Main Flight Info - Summary Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Airline Logo & Name */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* Flight Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">
                  {airline?.AirlineCode || 'XX'}
                </span>
                <span className="text-gray-600">
                  {airline?.FlightNumber || 'XX000'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {airline?.AirlineName || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-semibold">
                  {formatTime(firstSegment.Origin?.DepTime)}
                </span>
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="text-xs font-medium">
                    {firstSegment.Origin?.Airport?.AirportCode}
                  </span>
                  <div className="flex-1 border-b border-dashed border-gray-300"></div>
                  <span className="text-xs font-medium">
                    {lastSegment?.Destination?.Airport?.AirportCode}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatTime(lastSegment?.Destination?.ArrTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Duration - Right Side */}
          <div className="flex items-center gap-6 ml-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ₹ {Math.round(flight.Fare?.OfferedFare || flight.Fare?.TotalFare || 0)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                {durationStr}
              </div>
              {stops > 0 && (
                <div className="text-xs text-gray-500">
                  {stops} stop{stops > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Select Button */}
            <Button
              onClick={() => onSelect?.(flight)}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex gap-4 mt-4 pt-3 border-t flex-wrap">
          {/* Baggage */}
          <div className="flex items-center gap-2 text-sm">
            <Luggage className="w-4 h-4 text-orange-500" />
            <span className="text-gray-700">{firstSegment.Baggage}</span>
          </div>

          {/* Meal */}
          {flight.IsFreeMealAvailable && (
            <div className="flex items-center gap-2 text-sm">
              <Utensils className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Free Meal</span>
            </div>
          )}

          {/* Refundable */}
          {flight.IsRefundable && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Refundable</span>
            </div>
          )}

          {/* Seats Available */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700">
              {firstSegment.NoOfSeatAvailable} seats
            </span>
          </div>

          {/* Cabin Class */}
          <Badge variant="secondary" className="text-xs">
            {getCabinClassName(firstSegment.CabinClass)}
          </Badge>

          {/* Ranking */}
          {flight.SmartChoiceRanking && (
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              🏆 Smart Choice #{flight.SmartChoiceRanking}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Expandable Details */}
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Segments Breakdown */}
          <SegmentsBreakdown segments={allSegments} />

          {/* Fare Breakdown */}
          <FareBreakdownSection
            fare={flight.Fare}
            fareBreakdown={flight.FareBreakdown}
            isOpen={showFareBreakdown}
            onToggle={() => setShowFareBreakdown(!showFareBreakdown)}
          />

          {/* Fare Rules */}
          <FareRulesSection
            miniFareRules={flight.MiniFareRules}
            isOpen={showRules}
            onToggle={() => setShowRules(!showRules)}
          />

          {/* Additional Info */}
          <AdditionalInfo flight={flight} />

          {/* Policy Flags */}
          <PolicyFlags flight={flight} />
        </CardContent>
      )}

      {/* Footer - Expand/Collapse Toggle */}
      <div className="border-t px-4 py-2 flex items-center justify-between bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}>
        <span className="text-sm font-medium text-gray-600">
          {expanded ? 'Hide' : 'Show'} Details
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </Card>
  )
}

// ============================================================================
// Component: Segments Breakdown
// ============================================================================

interface SegmentsBreakdownProps {
  segments: Segment[]
}

const SegmentsBreakdown: React.FC<SegmentsBreakdownProps> = ({ segments }) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-sm mb-3">Flight Segments</h4>
      <div className="space-y-3">
        {segments.map((seg, idx) => (
          <div key={idx} className="bg-white p-3 rounded border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-sm">
                  {seg.Airline?.AirlineCode} {seg.Airline?.FlightNumber}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({getCabinClassName(seg.CabinClass)})
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {seg.Craft && `Aircraft: ${seg.Craft}`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="font-semibold min-w-fit">
                {seg.Origin?.Airport?.AirportCode}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(seg.Origin?.DepTime)}
              </span>
              <div className="flex-1 border-b border-dashed border-gray-300"></div>
              <span className="font-semibold min-w-fit">
                {seg.Destination?.Airport?.AirportCode}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(seg.Destination?.ArrTime)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Duration: {formatDuration(seg.Duration)}</div>
              <div>Baggage: {seg.Baggage}</div>
              <div>Seats: {seg.NoOfSeatAvailable}</div>
              <div>Terminal: {seg.Origin?.Airport?.Terminal || 'N/A'}</div>
            </div>

            {seg.FlightStatus && (
              <div className="text-xs text-green-600 font-medium mt-2">
                ✓ {seg.FlightStatus}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Component: Fare Breakdown
// ============================================================================

interface FareBreakdownSectionProps {
  fare: FareDetails
  fareBreakdown: PassengerFareBreakdown[]
  isOpen: boolean
  onToggle: () => void
}

const FareBreakdownSection: React.FC<FareBreakdownSectionProps> = ({
  fare,
  fareBreakdown,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 flex items-center justify-between text-sm font-semibold text-blue-900"
      >
        <span>Fare Breakdown</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3">
          {/* Total Breakdown */}
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Fare:</span>
              <span className="font-semibold">
                ₹ {fare?.BaseFare || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes:</span>
              <span className="font-semibold">
                ₹ {fare?.Tax || 0}
              </span>
            </div>
            {fare?.TaxBreakup && fare.TaxBreakup.length > 0 && (
              <div className="pl-4 space-y-1 text-xs text-gray-500 border-l border-gray-300">
                {fare.TaxBreakup.map((tax) => (
                  <div key={tax.key} className="flex justify-between">
                    <span>{tax.key}:</span>
                    <span>₹ {tax.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold text-sm">
              <span>Total Fare:</span>
              <span className="text-blue-600">
                ₹ {fare?.OfferedFare || fare?.TotalFare || 0}
              </span>
            </div>
          </div>

          {/* Per Passenger Breakdown */}
          {fareBreakdown && fareBreakdown.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Per Passenger:</div>
              {fareBreakdown.map((pax, idx) => (
                <div key={idx} className="bg-gray-50 p-2 rounded text-xs space-y-1">
                  <div className="font-semibold">
                    {getPassengerType(pax.PassengerType)} x {pax.PassengerCount}
                  </div>
                  <div className="flex justify-between">
                    <span>Base:</span>
                    <span>₹ {pax.BaseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹ {pax.Tax}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Component: Fare Rules
// ============================================================================

interface FareRulesSectionProps {
  miniFareRules: MiniFareRule[][]
  isOpen: boolean
  onToggle: () => void
}

const FareRulesSection: React.FC<FareRulesSectionProps> = ({
  miniFareRules,
  isOpen,
  onToggle,
}) => {
  // Flatten and categorize rules
  const allRules = miniFareRules?.flat() || []
  const cancellationRules = allRules.filter(r => r.Type === 'Cancellation')
  const reissueRules = allRules.filter(r => r.Type === 'Reissue')

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-amber-50 hover:bg-amber-100 flex items-center justify-between text-sm font-semibold text-amber-900"
      >
        <span>Cancellation & Reissue Rules</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3">
          {/* Cancellation */}
          {cancellationRules.length > 0 && (
            <div>
              <h5 className="font-semibold text-sm mb-2 text-red-700">
                Cancellation Charges
              </h5>
              <div className="space-y-2">
                {cancellationRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 p-2 rounded text-xs border border-red-200"
                  >
                    <div className="font-semibold text-red-900">
                      {rule.Details}
                    </div>
                    <div className="text-red-700 mt-1">
                      {rule.OnlineRefundAllowed ? (
                        <span className="text-green-600">
                          ✓ Online refund allowed
                        </span>
                      ) : (
                        <span>Manual refund only</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reissue */}
          {reissueRules.length > 0 && (
            <div>
              <h5 className="font-semibold text-sm mb-2 text-blue-700">
                Reissue Charges
              </h5>
              <div className="space-y-2">
                {reissueRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 p-2 rounded text-xs border border-blue-200"
                  >
                    <div className="font-semibold text-blue-900">
                      {rule.Details}
                    </div>
                    <div className="text-blue-700 mt-1">
                      {rule.OnlineReissueAllowed ? (
                        <span className="text-green-600">
                          ✓ Online reissue allowed
                        </span>
                      ) : (
                        <span>Manual reissue only</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allRules.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No specific rules provided
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Component: Additional Info
// ============================================================================

interface AdditionalInfoProps {
  flight: FlightResult
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ flight }) => {
  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h4 className="font-semibold text-sm mb-3">Additional Information</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Source:</span>
          <div className="font-semibold">
            {flight.Source === 5 ? 'GDS' : flight.Source === 6 ? 'LCC' : 'Other'}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Fare Type:</span>
          <div className="font-semibold">{flight.ResultFareType}</div>
        </div>
        <div>
          <span className="text-gray-600">Validating Airline:</span>
          <div className="font-semibold">{flight.ValidatingAirline}</div>
        </div>
        <div>
          <span className="text-gray-600">Last Ticket Date:</span>
          <div className="font-semibold">
            {flight.LastTicketDate && formatDate(flight.LastTicketDate)}
          </div>
        </div>
      </div>
      {flight.AirlineRemark && (
        <div className="mt-3 p-2 bg-white rounded border border-gray-200 text-xs text-gray-700">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          {flight.AirlineRemark}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Component: Policy Flags
// ============================================================================

interface PolicyFlagsProps {
  flight: FlightResult
}

const PolicyFlags: React.FC<PolicyFlagsProps> = ({ flight }) => {
  const flags = [
    {
      label: 'Free Meal',
      value: flight.IsFreeMealAvailable,
      icon: Utensils,
      color: 'green',
    },
    { label: 'Refundable', value: flight.IsRefundable, icon: CheckCircle, color: 'green' },
    {
      label: 'Upsell Allowed',
      value: flight.IsUpsellAllowed,
      icon: Zap,
      color: 'blue',
    },
    { label: 'Low-Cost Carrier', value: flight.IsLCC, icon: UtensilsCrossed, color: 'orange' },
  ]

  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-3">Policies</h4>
      <div className="grid grid-cols-2 gap-2">
        {flags.map(
          (flag) =>
            flag.value && (
              <div
                key={flag.label}
                className={`flex items-center gap-2 text-xs p-2 rounded bg-${flag.color}-50 text-${flag.color}-800`}
              >
                <flag.icon className={`w-4 h-4 text-${flag.color}-600`} />
                <span>{flag.label}</span>
              </div>
            )
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatTime(isoDate?: string): string {
  if (!isoDate) return '--:--'
  const date = new Date(isoDate)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(isoDate?: string): string {
  if (!isoDate) return 'N/A'
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-IN')
}

function formatDuration(minutes: number): string {
  if (!minutes) return '0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function getCabinClassName(cabinClass: number): string {
  const mapping: Record<number, string> = {
    1: 'Economy',
    2: 'Premium Economy',
    3: 'Business',
    4: 'First',
  }
  return mapping[cabinClass] || 'Economy'
}

function getPassengerType(type: number): string {
  const mapping: Record<number, string> = {
    1: 'Adult',
    2: 'Child',
    3: 'Infant',
  }
  return mapping[type] || 'Passenger'
}

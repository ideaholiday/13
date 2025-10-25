'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Plane, 
  CreditCard, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Plus, 
  FileText, 
  Bell, 
  Luggage, 
  Users, 
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Mail,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useFlightStore, type NormalizedFlight } from '@/lib/stores/consolidated-flight-store'

interface Passenger {
  id: string
  firstName: string
  lastName: string
  type: 'ADT' | 'CHD' | 'INF'
  age?: number
  email: string
  phone: string
  passportNumber?: string
  passportExpiry?: string
  nationality?: string
  dateOfBirth?: string
  gender?: 'M' | 'F' | 'O'
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

interface EnhancedFlightReviewProps {
  outboundFlight: NormalizedFlight
  returnFlight?: NormalizedFlight
  passengers: Passenger[]
  onContinue: () => void
  onBack: () => void
  onPassengerUpdate: (passengerId: string, updates: Partial<Passenger>) => void
  onPassengerAdd: (passenger: Passenger) => void
  onPassengerRemove: (passengerId: string) => void
}

export function EnhancedFlightReview({ 
  outboundFlight, 
  returnFlight, 
  passengers, 
  onContinue, 
  onBack,
  onPassengerUpdate,
  onPassengerAdd,
  onPassengerRemove
}: EnhancedFlightReviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingPassenger, setEditingPassenger] = useState<string | null>(null)
  const [showAddPassenger, setShowAddPassenger] = useState(false)
  const [showPassportDetails, setShowPassportDetails] = useState(false)
  const [newPassenger, setNewPassenger] = useState<Partial<Passenger>>({})

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getPassengerTypeLabel = (type: string) => {
    switch (type) {
      case 'ADT': return 'Adult'
      case 'CHD': return 'Child'
      case 'INF': return 'Infant'
      default: return type
    }
  }

  const getTotalPrice = () => {
    const basePrice = outboundFlight.fare.totalFare
    const returnPrice = returnFlight?.fare.totalFare || 0
    return (basePrice + returnPrice) * passengers.length
  }

  const getCheckInDeadline = () => {
    const departureTime = new Date(outboundFlight.segments[0]?.departureTime || '')
    const checkInTime = new Date(departureTime.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
    return checkInTime
  }

  const isCheckInOpen = () => {
    const now = new Date()
    const checkInTime = getCheckInDeadline()
    return now >= checkInTime
  }

  const getBaggageAllowance = (passengerType: string) => {
    switch (passengerType) {
      case 'ADT': return '7kg cabin + 15kg checked'
      case 'CHD': return '7kg cabin + 15kg checked'
      case 'INF': return '7kg cabin + 10kg checked'
      default: return '7kg cabin + 15kg checked'
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handlePassengerEdit = (passengerId: string) => {
    setEditingPassenger(editingPassenger === passengerId ? null : passengerId)
  }

  const handleAddPassenger = () => {
    if (newPassenger.firstName && newPassenger.lastName && newPassenger.email) {
      const passenger: Passenger = {
        id: Date.now().toString(),
        firstName: newPassenger.firstName,
        lastName: newPassenger.lastName,
        type: newPassenger.type || 'ADT',
        age: newPassenger.age,
        email: newPassenger.email,
        phone: newPassenger.phone || '',
        passportNumber: newPassenger.passportNumber,
        passportExpiry: newPassenger.passportExpiry,
        nationality: newPassenger.nationality,
        dateOfBirth: newPassenger.dateOfBirth,
        gender: newPassenger.gender,
        emergencyContact: newPassenger.emergencyContact,
      }
      onPassengerAdd(passenger)
      setNewPassenger({})
      setShowAddPassenger(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Booking</h1>
        <p className="text-gray-600">Please review all details before proceeding to payment</p>
      </div>

      {/* Flight Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-blue-600" />
            Flight Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Outbound Flight */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Outbound Flight</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {formatPrice(outboundFlight.fare.totalFare)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(outboundFlight.segments[0]?.departureTime || '')}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {outboundFlight.segments[0]?.origin.code}
                </div>
                <div className="text-xs text-gray-500">
                  {outboundFlight.segments[0]?.origin.city}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDuration(outboundFlight.segments.reduce((sum, seg) => sum + seg.duration, 0))}
                </div>
                <div className="text-xs text-gray-400">
                  {outboundFlight.segments.length === 1 ? 'Non-stop' : `${outboundFlight.segments.length - 1} stop`}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(outboundFlight.segments[outboundFlight.segments.length - 1]?.arrivalTime || '')}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {outboundFlight.segments[outboundFlight.segments.length - 1]?.destination.code}
                </div>
                <div className="text-xs text-gray-500">
                  {outboundFlight.segments[outboundFlight.segments.length - 1]?.destination.city}
                </div>
              </div>
            </div>
          </div>

          {/* Return Flight */}
          {returnFlight && (
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-900">Return Flight</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {formatPrice(returnFlight.fare.totalFare)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(returnFlight.segments[0]?.departureTime || '')}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {returnFlight.segments[0]?.origin.code}
                  </div>
                  <div className="text-xs text-gray-500">
                    {returnFlight.segments[0]?.origin.city}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">
                    {formatDuration(returnFlight.segments.reduce((sum, seg) => sum + seg.duration, 0))}
                  </div>
                  <div className="text-xs text-gray-400">
                    {returnFlight.segments.length === 1 ? 'Non-stop' : `${returnFlight.segments.length - 1} stop`}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(returnFlight.segments[returnFlight.segments.length - 1]?.arrivalTime || '')}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {returnFlight.segments[returnFlight.segments.length - 1]?.destination.code}
                  </div>
                  <div className="text-xs text-gray-500">
                    {returnFlight.segments[returnFlight.segments.length - 1]?.destination.city}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passenger Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              Passenger Details
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPassenger(!showAddPassenger)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Passenger
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Passenger Form */}
          {showAddPassenger && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h4 className="font-semibold text-gray-900 mb-4">Add New Passenger</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newPassenger.firstName || ''}
                    onChange={(e) => setNewPassenger({...newPassenger, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newPassenger.lastName || ''}
                    onChange={(e) => setNewPassenger({...newPassenger, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPassenger.email || ''}
                    onChange={(e) => setNewPassenger({...newPassenger, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newPassenger.phone || ''}
                    onChange={(e) => setNewPassenger({...newPassenger, phone: e.target.value})}
                    placeholder="Enter phone"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Passenger Type</Label>
                  <select
                    id="type"
                    value={newPassenger.type || 'ADT'}
                    onChange={(e) => setNewPassenger({...newPassenger, type: e.target.value as 'ADT' | 'CHD' | 'INF'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="ADT">Adult</option>
                    <option value="CHD">Child</option>
                    <option value="INF">Infant</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPassenger.age || ''}
                    onChange={(e) => setNewPassenger({...newPassenger, age: parseInt(e.target.value)})}
                    placeholder="Enter age"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleAddPassenger} className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Passenger
                </Button>
                <Button variant="outline" onClick={() => setShowAddPassenger(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Passenger List */}
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    {passenger.firstName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {passenger.firstName} {passenger.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getPassengerTypeLabel(passenger.type)} {passenger.age && `(${passenger.age} years)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">
                    Passenger {index + 1}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePassengerEdit(passenger.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPassengerRemove(passenger.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{passenger.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{passenger.phone}</span>
                </div>
                {passenger.passportNumber && (
                  <div>
                    <span className="text-gray-600">Passport:</span>
                    <span className="ml-2 font-medium">{passenger.passportNumber}</span>
                  </div>
                )}
                {passenger.nationality && (
                  <div>
                    <span className="text-gray-600">Nationality:</span>
                    <span className="ml-2 font-medium">{passenger.nationality}</span>
                  </div>
                )}
              </div>

              {/* Baggage Information */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Luggage className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Baggage Allowance</span>
                </div>
                <p className="text-sm text-gray-600">{getBaggageAllowance(passenger.type)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Check-in Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Check-in Information</h4>
            </div>
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                <strong>Check-in opens:</strong> {formatDate(getCheckInDeadline().toISOString())}
              </p>
              <p className="mb-2">
                <strong>Status:</strong> {isCheckInOpen() ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Open</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Not Yet Open</Badge>
                )}
              </p>
              <p className="text-xs text-blue-600">
                • Check-in closes 2 hours before departure for domestic flights
                • Check-in closes 3 hours before departure for international flights
                • Online check-in available 24 hours before departure
              </p>
            </div>
          </div>

          {/* Travel Documents */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Required Documents</h4>
            </div>
            <div className="text-sm text-green-800">
              <ul className="space-y-1">
                <li>• Valid government-issued photo ID (Aadhaar, Driving License, etc.)</li>
                <li>• For international flights: Valid passport with minimum 6 months validity</li>
                <li>• Visa (if required for destination country)</li>
                <li>• COVID-19 vaccination certificate (if required)</li>
                <li>• Travel insurance documents (recommended)</li>
              </ul>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">Cancellation & Changes</h4>
            </div>
            <div className="text-sm text-orange-800">
              <ul className="space-y-1">
                <li>• Cancellation allowed up to 24 hours before departure</li>
                <li>• Refund processing time: 7-10 business days</li>
                <li>• Changes subject to fare difference and airline policies</li>
                <li>• No-show charges may apply</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            Price Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Fare ({passengers.length} passengers)</span>
              <span className="font-medium">
                {formatPrice((outboundFlight.fare.baseFare + (returnFlight?.fare.baseFare || 0)) * passengers.length)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-medium">
                {formatPrice((outboundFlight.fare.taxes + (returnFlight?.fare.taxes || 0)) * passengers.length)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-green-600">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-8"
        >
          Back to Search
        </Button>
        <Button
          onClick={onContinue}
          className="px-8 bg-blue-600 hover:bg-blue-700"
        >
          <ArrowRight className="h-5 w-5 mr-2" />
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useFlightSelection } from '@/store/flightSelection'
import { formatINR, formatTime, formatDuration } from '@/lib/time'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plane, User, Phone, Mail, MapPin, CreditCard, Lock, CheckCircle, ArrowLeft } from 'lucide-react'

export default function BookingPage() {
  const { selected, clear } = useFlightSelection()
  const router = useRouter()
  const [step, setStep] = useState<'passengers' | 'seats' | 'payment' | 'confirmation'>('passengers')
  const [passengers, setPassengers] = useState([
    { id: 1, title: 'Mr', firstName: '', lastName: '', email: '', phone: '', dob: '' }
  ])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  if (!selected?.item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Flight Selected</h2>
          <p className="text-slate-600 mb-6">Please select a flight from the search results.</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const item = selected.item

  const handlePassengerChange = (id: number, field: string, value: string) => {
    setPassengers(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    )
  }

  const handleAddPassenger = () => {
    const newId = Math.max(...passengers.map(p => p.id), 0) + 1
    setPassengers([...passengers, { id: newId, title: 'Mr', firstName: '', lastName: '', email: '', phone: '', dob: '' }])
  }

  const handleRemovePassenger = (id: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id))
    }
  }

  const isPassengerStepValid = passengers.every(p => p.firstName && p.lastName && p.email && p.phone)
  const isPaymentValid = paymentInfo.cardName && paymentInfo.cardNumber.length === 16 && paymentInfo.expiry && paymentInfo.cvv

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Complete Your Booking</h1>
          </div>
          <div className="text-sm font-semibold text-blue-600">
            {formatINR(item.total, item.currency)}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Steps */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {(['passengers', 'seats', 'payment', 'confirmation'] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                disabled={step === 'confirmation'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : step === 'confirmation' || ['passengers', 'seats', 'payment'].slice(0, i).every(x => x === step)
                    ? 'bg-green-100 text-green-800 cursor-pointer'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Passenger Details */}
          {step === 'passengers' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Passenger Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {passengers.map((passenger, idx) => (
                  <div key={passenger.id} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-slate-900">Passenger {idx + 1}</h4>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => handleRemovePassenger(passenger.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${passenger.id}`} className="text-sm">
                          Title
                        </Label>
                        <select
                          id={`title-${passenger.id}`}
                          value={passenger.title}
                          onChange={(e) => handlePassengerChange(passenger.id, 'title', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Dr">Dr</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`dob-${passenger.id}`} className="text-sm">
                          Date of Birth
                        </Label>
                        <Input
                          id={`dob-${passenger.id}`}
                          type="date"
                          value={passenger.dob}
                          onChange={(e) => handlePassengerChange(passenger.id, 'dob', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`firstName-${passenger.id}`} className="text-sm">
                          First Name *
                        </Label>
                        <Input
                          id={`firstName-${passenger.id}`}
                          placeholder="John"
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(passenger.id, 'firstName', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`lastName-${passenger.id}`} className="text-sm">
                          Last Name *
                        </Label>
                        <Input
                          id={`lastName-${passenger.id}`}
                          placeholder="Doe"
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(passenger.id, 'lastName', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-${passenger.id}`} className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id={`email-${passenger.id}`}
                          type="email"
                          placeholder="john@example.com"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(passenger.id, 'email', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`phone-${passenger.id}`} className="text-sm">
                          Phone *
                        </Label>
                        <Input
                          id={`phone-${passenger.id}`}
                          placeholder="+91 9876543210"
                          value={passenger.phone}
                          onChange={(e) => handlePassengerChange(passenger.id, 'phone', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={handleAddPassenger}
                  className="w-full"
                >
                  + Add Passenger
                </Button>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('seats')}
                    disabled={!isPassengerStepValid}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Seat Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seat Selection */}
          {step === 'seats' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Select Your Seats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700 mb-4">
                    Select {passengers.length} seat{passengers.length > 1 ? 's' : ''} for your flight
                  </p>

                  {/* Seat Map */}
                  <div className="bg-white p-6 rounded-lg border overflow-x-auto">
                    <div className="space-y-2 inline-block">
                      {/* Rows 1-15 */}
                      {Array.from({ length: 15 }).map((_, rowIdx) => (
                        <div key={rowIdx} className="flex gap-4 items-center">
                          <div className="w-8 text-center font-semibold text-xs text-slate-600">
                            {rowIdx + 1}
                          </div>
                          <div className="flex gap-2">
                            {/* A, B, C, D */}
                            {['A', 'B', 'C', 'D'].map((col) => {
                              const seatId = `${rowIdx + 1}${col}`
                              const isSelected = selectedSeats.includes(seatId)
                              const isOccupied = Math.random() > 0.7 // 30% occupied

                              return (
                                <button
                                  key={seatId}
                                  onClick={() => {
                                    if (isOccupied) return
                                    setSelectedSeats(prev =>
                                      isSelected
                                        ? prev.filter(s => s !== seatId)
                                        : prev.length < passengers.length
                                        ? [...prev, seatId]
                                        : prev
                                    )
                                  }}
                                  disabled={isOccupied}
                                  className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                                    isOccupied
                                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-green-600 text-white'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                                  }`}
                                >
                                  {col}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                      <span className="text-xs text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded border border-green-700"></div>
                      <span className="text-xs text-slate-600">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-300 rounded border border-slate-400"></div>
                      <span className="text-xs text-slate-600">Occupied</span>
                    </div>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Selected Seats: <span className="font-semibold">{selectedSeats.join(', ')}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('passengers')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('payment')}
                    disabled={selectedSeats.length !== passengers.length}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-sm">
                      Cardholder Name *
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-sm">
                      Card Number *
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, '')
                        setPaymentInfo({ ...paymentInfo, cardNumber: val })
                      }}
                      maxLength={16}
                      className="mt-1 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-sm">
                        Expiry Date *
                      </Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={paymentInfo.expiry}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        maxLength={4}
                        type="password"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('seats')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('confirmation')}
                    disabled={!isPaymentValid}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Complete Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-slate-600">Your flight has been successfully booked.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="font-semibold">Booking Reference:</span> {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="font-semibold">Confirmation sent to:</span> {passengers[0]?.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Total Amount Paid:</span> {formatINR(item.total * passengers.length, item.currency)}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    clear()
                    router.push('/flights/results?origin=DEL&destination=BOM&departDate=2025-11-20&tripType=O&adults=1&children=0&infants=0&cabinClass=E')
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Summary Sidebar */}
        <div className="h-fit sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flight Info */}
              <div className="pb-4 border-b space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Airline</span>
                  <span className="font-semibold">{item.segments[0]?.airlineName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Departure</span>
                  <span className="font-semibold">{formatTime(item.departTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Arrival</span>
                  <span className="font-semibold">{formatTime(item.arriveTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold">{formatDuration(item.durationTotalMins)}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Base Fare × {passengers.length}</span>
                  <span className="font-medium">{formatINR(item.baseFare * passengers.length, item.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Taxes & Fees × {passengers.length}</span>
                  <span className="font-medium">{formatINR(item.tax * passengers.length, item.currency)}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Seats ({selectedSeats.length})</span>
                    <span className="font-medium">{formatINR(selectedSeats.length * 500, item.currency)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatINR(
                      (item.total * passengers.length) + (selectedSeats.length * 500),
                      item.currency
                    )}
                  </span>
                </div>
              </div>

              {/* Badges */}
              {item.isRefundable && (
                <div className="pt-4 border-t">
                  <Badge className="bg-green-100 text-green-800 w-full justify-center hover:bg-green-100">
                    ✓ Refundable
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

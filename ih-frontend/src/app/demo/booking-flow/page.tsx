'use client'

import { useState } from 'react'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { TrustBadges } from '@/components/shared/TrustBadges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plane, User, CreditCard, CheckCircle2 } from 'lucide-react'

const bookingSteps = [
  {
    id: 1,
    name: 'Flight Selection',
    description: 'Choose your flight',
  },
  {
    id: 2,
    name: 'Passenger Details',
    description: 'Enter traveler info',
  },
  {
    id: 3,
    name: 'Payment',
    description: 'Secure checkout',
  },
  {
    id: 4,
    name: 'Confirmation',
    description: 'Booking complete',
  },
]

export default function BookingFlowExample() {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < bookingSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-ruby-600" />
                Select Your Flight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-6 border-2 border-ruby-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="font-semibold text-lg">Air India</div>
                    <div className="text-sm text-slate-600">AI-101 • Non-stop</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ruby-600">₹12,500</div>
                    <div className="text-sm text-slate-600">per person</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">Delhi (DEL)</div>
                    <div className="text-slate-600">10:00 AM</div>
                  </div>
                  <div className="text-center text-slate-400">
                    <div>→ 2h 30m →</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Dubai (DXB)</div>
                    <div className="text-slate-600">12:30 PM</div>
                  </div>
                </div>
              </div>
              <TrustBadges variant="compact" />
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-ruby-600" />
                Passenger Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" />
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-ruby-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TrustBadges showPaymentLogos />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" type="password" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Flight Cost</span>
                  <span className="font-medium">₹12,500</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Taxes & Fees</span>
                  <span className="font-medium">₹1,500</span>
                </div>
                <div className="border-t border-slate-300 my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-ruby-600">₹14,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-6 w-6" />
                Booking Confirmed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    Success!
                  </div>
                  <div className="text-slate-600">
                    Your flight has been booked successfully
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Booking ID</span>
                    <span className="font-mono font-semibold">IH-2025-10-15-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Flight</span>
                    <span className="font-medium">Air India AI-101</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Route</span>
                    <span className="font-medium">Delhi → Dubai</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Passenger</span>
                    <span className="font-medium">John Doe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Paid</span>
                    <span className="font-bold text-green-600">₹14,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-800">
                  📧 A confirmation email has been sent to your email address
                </div>
              </div>

              <TrustBadges variant="compact" />
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Flight Booking Example
          </h1>
          <p className="text-slate-600">
            Real-world integration of ProgressBar component
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={bookingSteps.length}
            steps={bookingSteps}
            allowStepNavigation={currentStep > 1}
            onStepClick={setCurrentStep}
          />
        </div>

        {/* Step Content */}
        <div className="animate-in fade-in duration-300">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
          >
            Previous
          </Button>

          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Step</div>
            <div className="text-2xl font-bold text-ruby-600">
              {currentStep} / {bookingSteps.length}
            </div>
          </div>

          {currentStep < bookingSteps.length ? (
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-ruby-600 hover:bg-ruby-700"
            >
              {currentStep === 3 ? 'Pay Now' : 'Next'}
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Integration Example
          </h3>
          <p className="text-sm text-blue-800">
            This is a complete booking flow showing how the ProgressBar component
            integrates with a real booking process. Notice how it:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Shows clear visual progress through steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Allows navigation back to previous steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Integrates with TrustBadges for confidence</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Provides clear completion feedback</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

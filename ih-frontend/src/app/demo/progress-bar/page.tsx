'use client'

import { useState } from 'react'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const bookingSteps = [
  {
    id: 1,
    name: 'Search',
    description: 'Find your travel',
  },
  {
    id: 2,
    name: 'Details',
    description: 'Enter information',
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

export default function ProgressBarDemo() {
  const [currentStep, setCurrentStep] = useState(2)

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

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            ProgressBar Component
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Guide users through multi-step booking flows with visual progress indicators
          </p>
        </div>

        {/* Interactive Demo */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Interactive Demo
          </h2>
          
          <div className="space-y-8">
            {/* Progress Bar */}
            <ProgressBar
              currentStep={currentStep}
              totalSteps={bookingSteps.length}
              steps={bookingSteps}
              allowStepNavigation
              onStepClick={handleStepClick}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                size="lg"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>
              
              <div className="text-center px-6">
                <div className="text-sm text-slate-600">Current Step</div>
                <div className="text-2xl font-bold text-ruby-600">{currentStep}</div>
              </div>
              
              <Button
                onClick={handleNext}
                disabled={currentStep === bookingSteps.length}
                size="lg"
                className="bg-ruby-600 hover:bg-ruby-700"
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Default Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Default Variant (Full Display)
          </h2>
          <div className="space-y-6">
            <ProgressBar
              currentStep={1}
              totalSteps={4}
              steps={bookingSteps}
            />
            <div className="pt-6 border-t">
              <ProgressBar
                currentStep={2}
                totalSteps={4}
                steps={bookingSteps}
              />
            </div>
            <div className="pt-6 border-t">
              <ProgressBar
                currentStep={4}
                totalSteps={4}
                steps={bookingSteps}
              />
            </div>
          </div>
        </section>

        {/* Compact Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Compact Variant (Mobile Friendly)
          </h2>
          <div className="max-w-md mx-auto space-y-6">
            <ProgressBar
              currentStep={2}
              totalSteps={4}
              steps={bookingSteps}
              variant="compact"
            />
          </div>
        </section>

        {/* Minimal Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Minimal Variant (Simple Bar)
          </h2>
          <div className="max-w-md mx-auto space-y-6">
            <ProgressBar
              currentStep={1}
              totalSteps={4}
              steps={bookingSteps}
              variant="minimal"
            />
            <ProgressBar
              currentStep={2}
              totalSteps={4}
              steps={bookingSteps}
              variant="minimal"
            />
            <ProgressBar
              currentStep={3}
              totalSteps={4}
              steps={bookingSteps}
              variant="minimal"
            />
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Usage Examples
          </h2>
          <div className="space-y-4 text-slate-700">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">1. Flight Booking (Default)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded block overflow-x-auto">
                &lt;ProgressBar currentStep={'{2}'} totalSteps={'{4}'} steps={'{bookingSteps}'} /&gt;
              </code>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">2. Mobile Checkout (Compact)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded block overflow-x-auto">
                &lt;ProgressBar variant="compact" currentStep={'{2}'} totalSteps={'{4}'} steps={'{bookingSteps}'} /&gt;
              </code>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">3. Simple Progress (Minimal)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded block overflow-x-auto">
                &lt;ProgressBar variant="minimal" currentStep={'{2}'} totalSteps={'{4}'} steps={'{bookingSteps}'} /&gt;
              </code>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">4. With Navigation (Clickable)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded block overflow-x-auto">
                &lt;ProgressBar allowStepNavigation onStepClick={'{handleStepClick}'} currentStep={'{2}'} /&gt;
              </code>
            </div>
          </div>
        </section>

        {/* Integration Points */}
        <section className="bg-gradient-to-br from-ruby-50 to-orange-50 rounded-2xl p-8 border border-ruby-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            🎯 Recommended Integration Points
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Flight Booking Flow:</strong> Show Search → Details → Payment → Confirmation
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Hotel Checkout:</strong> Display booking progress at top of page
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Package Booking:</strong> Guide users through multi-step customization
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Mobile Views:</strong> Use compact variant to save space
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Registration Forms:</strong> Multi-step user onboarding
              </div>
            </li>
          </ul>
        </section>

        {/* Features */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            ✨ Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-slate-700">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <strong>3 Variants:</strong> Default, compact, and minimal styles
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <span className="text-2xl">✅</span>
              <div>
                <strong>Visual States:</strong> Completed, active, and pending
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <span className="text-2xl">🖱️</span>
              <div>
                <strong>Interactive:</strong> Optional clickable steps
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <strong>Responsive:</strong> Mobile-optimized layouts
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <strong>Animated:</strong> Smooth transitions with Framer Motion
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>Percentage:</strong> Shows completion progress
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

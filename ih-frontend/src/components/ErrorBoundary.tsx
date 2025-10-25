'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log error to analytics service
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Error Boundary Triggered', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-slate-600 mb-6">
            We're sorry, but something unexpected happened. Our team has been notified and we're working to fix it.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                <pre className="text-xs text-red-700 whitespace-pre-wrap break-words mt-1">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={resetError}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={handleReload}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="ghost"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-slate-500">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </Card>
    </div>
  )
}

// Specialized error fallbacks for different contexts
export function FlightSearchErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Flight Search Error
          </h2>
          <p className="text-slate-600 mb-6">
            We couldn't load the flight search results. Please try again.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button onClick={resetError} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Search
          </Button>
          <Button onClick={() => window.location.href = '/flights'} variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            New Search
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function HotelSearchErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Hotel Search Error
          </h2>
          <p className="text-slate-600 mb-6">
            We couldn't load the hotel search results. Please try again.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button onClick={resetError} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Search
          </Button>
          <Button onClick={() => window.location.href = '/hotels'} variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            New Search
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ErrorBoundary

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Plane, 
  Hotel, 
  Package,
  Smartphone,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Check initial online status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    if (navigator.onLine) {
      router.push('/')
    } else {
      // Show retry animation
      setTimeout(() => {
        if (navigator.onLine) {
          router.push('/')
        }
      }, 1000)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const offlineFeatures = [
    {
      icon: Plane,
      title: 'Flight Search',
      description: 'Search flights offline',
      available: true
    },
    {
      icon: Hotel,
      title: 'Hotel Search',
      description: 'Browse hotels offline',
      available: true
    },
    {
      icon: Package,
      title: 'Packages',
      description: 'View holiday packages',
      available: true
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Install our PWA',
      available: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-sapphire-100 to-emerald-100 rounded-full flex items-center justify-center"
            >
              <WifiOff className="w-10 h-10 text-sapphire-600" />
            </motion.div>
            
            <CardTitle className="text-3xl font-bold text-slate-900 mb-4">
              You're Offline
            </CardTitle>
            
            <p className="text-lg text-slate-600 mb-2">
              Don't worry! You can still explore Idea Holiday
            </p>
            
            <p className="text-sm text-slate-500">
              Some features may be limited without an internet connection
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-2 p-4 bg-slate-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-slate-700">
                {isOnline ? 'Connection Restored!' : 'No Internet Connection'}
              </span>
            </div>

            {/* Available Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 text-center">
                Available Offline Features
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {offlineFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 bg-white rounded-lg border border-slate-200 hover:border-sapphire-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-sapphire-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-sapphire-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleRetry}
                className="flex-1 bg-sapphire-600 hover:bg-sapphire-700 text-white"
                disabled={retryCount > 3}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${retryCount > 0 ? 'animate-spin' : ''}`} />
                {retryCount > 3 ? 'Retry Limit Reached' : 'Retry Connection'}
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="flex-1 border-sapphire-200 text-sapphire-700 hover:bg-sapphire-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            {/* PWA Install Prompt */}
            <div className="p-4 bg-gradient-to-r from-sapphire-50 to-emerald-50 rounded-lg border border-sapphire-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sapphire-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">
                    Install Idea Holiday App
                  </h4>
                  <p className="text-sm text-slate-600">
                    Get the full experience with our Progressive Web App
                  </p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-slate-500">
              <p>
                Having trouble? Check your internet connection or try again later.
              </p>
              <p className="mt-1">
                Need help? Contact us at{' '}
                <a 
                  href="mailto:support@ideaholiday.com" 
                  className="text-sapphire-600 hover:text-sapphire-700 underline"
                >
                  support@ideaholiday.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

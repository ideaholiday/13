'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackPWA } from '@/lib/track'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      trackPWA.offlineMode('exited')
      // Hide banner after a short delay when coming back online
      setTimeout(() => setShowBanner(false), 2000)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      trackPWA.offlineMode('entered')
      setShowBanner(true)
    }

    // Check initial online status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    
    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (navigator.onLine) {
      setIsOnline(true)
      setShowBanner(false)
    }
    
    setIsRetrying(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-200" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-200" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {isOnline ? (
                    <>
                      <span className="text-green-200">Connection restored!</span>
                      <span className="ml-2 text-white/90">
                        You're back online
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-200">You're offline</span>
                      <span className="ml-2 text-white/90">
                        Some features may be limited
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isOnline && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

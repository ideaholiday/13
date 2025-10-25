'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function OfflineRouteHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleOffline = () => {
      // Only redirect to offline page if not already there
      if (window.location.pathname !== '/offline') {
        router.push('/offline')
      }
    }

    const handleOnline = () => {
      // Redirect back to home when coming back online
      if (window.location.pathname === '/offline') {
        router.push('/')
      }
    }

    // Check initial state
    if (!navigator.onLine && window.location.pathname !== '/offline') {
      router.push('/offline')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [router])

  return null
}

/**
 * Analytics tracking helper for Idea Holiday
 * Provides a unified interface for tracking user events across the application
 */

// Extend Window interface for analytics
declare global {
  interface Window {
    analytics?: {
      track: (name: string, props?: Record<string, any>) => void
    }
  }
}

/**
 * Track a custom event with optional properties
 * @param name - Event name (e.g., 'search_performed', 'result_viewed')
 * @param props - Optional event properties
 */
export const track = (name: string, props?: Record<string, any>) => {
  // Use Vercel Analytics if available
  if (typeof window !== 'undefined' && window.analytics?.track) {
    window.analytics.track(name, props)
  } else {
    // Fallback to console for development
    console.debug('[Analytics]', name, props)
  }
}

/**
 * Track search events
 */
export const trackSearch = {
  performed: (searchType: 'flight' | 'hotel' | 'package', searchParams: Record<string, any>) => {
    track('search_performed', {
      search_type: searchType,
      ...searchParams,
      timestamp: new Date().toISOString()
    })
  },

  resultsViewed: (searchType: 'flight' | 'hotel' | 'package', resultCount: number, filters?: Record<string, any>) => {
    track('search_results_viewed', {
      search_type: searchType,
      result_count: resultCount,
      filters: filters || {},
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Track booking events
 */
export const trackBooking = {
  resultViewed: (type: 'flight' | 'hotel', resultId: string, price?: number, metadata?: Record<string, any>) => {
    track('result_viewed', {
      type,
      result_id: resultId,
      price,
      ...metadata,
      timestamp: new Date().toISOString()
    })
  },

  checkoutStarted: (type: 'flight' | 'hotel', bookingId: string, totalAmount: number, passengerCount?: number) => {
    track('checkout_started', {
      type,
      booking_id: bookingId,
      total_amount: totalAmount,
      passenger_count: passengerCount,
      timestamp: new Date().toISOString()
    })
  },

  paymentSuccess: (type: 'flight' | 'hotel', bookingId: string, totalAmount: number, paymentMethod: string) => {
    track('payment_success', {
      type,
      booking_id: bookingId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    })
  },

  paymentFailed: (type: 'flight' | 'hotel', bookingId: string, error: string) => {
    track('payment_failed', {
      type,
      booking_id: bookingId,
      error,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Track user engagement events
 */
export const trackEngagement = {
  pageView: (page: string, metadata?: Record<string, any>) => {
    track('page_view', {
      page,
      ...metadata,
      timestamp: new Date().toISOString()
    })
  },

  buttonClick: (buttonName: string, location: string, metadata?: Record<string, any>) => {
    track('button_click', {
      button_name: buttonName,
      location,
      ...metadata,
      timestamp: new Date().toISOString()
    })
  },

  formSubmit: (formName: string, success: boolean, metadata?: Record<string, any>) => {
    track('form_submit', {
      form_name: formName,
      success,
      ...metadata,
      timestamp: new Date().toISOString()
    })
  },

  filterApplied: (filterType: string, filterValue: any, context: string) => {
    track('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      context,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Track PWA events
 */
export const trackPWA = {
  installPromptShown: () => {
    track('pwa_install_prompt_shown', {
      timestamp: new Date().toISOString()
    })
  },

  installPromptAccepted: () => {
    track('pwa_install_prompt_accepted', {
      timestamp: new Date().toISOString()
    })
  },

  installPromptDismissed: () => {
    track('pwa_install_prompt_dismissed', {
      timestamp: new Date().toISOString()
    })
  },

  offlineMode: (action: 'entered' | 'exited') => {
    track('offline_mode', {
      action,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Track error events
 */
export const trackError = {
  apiError: (endpoint: string, error: string, statusCode?: number) => {
    track('api_error', {
      endpoint,
      error,
      status_code: statusCode,
      timestamp: new Date().toISOString()
    })
  },

  validationError: (formName: string, field: string, error: string) => {
    track('validation_error', {
      form_name: formName,
      field,
      error,
      timestamp: new Date().toISOString()
    })
  },

  generalError: (error: string, context?: string) => {
    track('general_error', {
      error,
      context,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Track performance events
 */
export const trackPerformance = {
  pageLoad: (page: string, loadTime: number, metadata?: Record<string, any>) => {
    track('page_load', {
      page,
      load_time: loadTime,
      ...metadata,
      timestamp: new Date().toISOString()
    })
  },

  apiResponse: (endpoint: string, responseTime: number, success: boolean) => {
    track('api_response', {
      endpoint,
      response_time: responseTime,
      success,
      timestamp: new Date().toISOString()
    })
  }
}

// Export default track function for convenience
export default track

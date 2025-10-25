import toast from 'react-hot-toast'

export interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

export const useNotifications = () => {
  const showSuccess = (message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      duration: options?.duration || 4000,
      style: {
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        color: '#0c4a6e',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    })
  }

  const showError = (message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      duration: options?.duration || 5000,
      style: {
        background: '#fef2f2',
        border: '1px solid #f87171',
        color: '#7f1d1d',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    })
  }

  const showWarning = (message: string, options?: NotificationOptions) => {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: '⚠️',
      style: {
        background: '#fffbeb',
        border: '1px solid #f59e0b',
        color: '#78350f',
      },
    })
  }

  const showInfo = (message: string, options?: NotificationOptions) => {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: 'ℹ️',
      style: {
        background: '#f0f9ff',
        border: '1px solid #3b82f6',
        color: '#1e3a8a',
      },
    })
  }

  const showLoading = (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      style: {
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        color: '#475569',
      },
    })
  }

  const showBookingSuccess = (bookingId: string, type: 'flight' | 'hotel' | 'package') => {
    return toast.success(
      `🎉 ${type.charAt(0).toUpperCase() + type.slice(1)} booking confirmed!\nBooking ID: ${bookingId}`,
      {
        duration: 6000,
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      }
    )
  }

  const showPaymentProcessing = () => {
    return toast.loading('Processing payment securely...', {
      style: {
        background: '#1e293b',
        color: 'white',
        border: '1px solid #3b82f6',
      },
      iconTheme: {
        primary: '#3b82f6',
        secondary: '#fff',
      },
    })
  }

  const showValidationError = (field: string) => {
    return toast.error(`Please check ${field} and try again`, {
      duration: 3000,
      style: {
        background: '#fef2f2',
        border: '1px solid #f87171',
        color: '#7f1d1d',
      },
    })
  }

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showBookingSuccess,
    showPaymentProcessing,
    showValidationError,
    dismiss,
  }
}
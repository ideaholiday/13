import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Booking, Traveller, PaymentMethod, SupportTicket } from '@/types/account'
import {
  authApi,
  userApi,
  bookingsApi,
  travellersApi,
  paymentsApi,
  supportApi
} from '@/lib/account-api'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

// Auth hooks
export function useLogin() {
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.login(data.email, data.password),
    onSuccess: (data) => {
      login(data.user, data.token)
      toast.success('Welcome back!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    }
  })
}

export function useLoginWithMobile() {
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: (data: { mobile: string; otp: string }) =>
      authApi.loginWithMobile(data.mobile, data.otp),
    onSuccess: (data) => {
      login(data.user, data.token)
      toast.success('Welcome back!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    }
  })
}

export function useRegister() {
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: (data: Partial<User>) => authApi.register(data),
    onSuccess: (data) => {
      login(data.user, data.token)
      toast.success('Account created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed')
    }
  })
}

export function useSendOTP() {
  return useMutation({
    mutationFn: (mobile: string) => authApi.sendOTP(mobile),
    onSuccess: () => {
      toast.success('OTP sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP')
    }
  })
}

// User hooks
export function useUser(userId?: string) {
  const { user } = useAuthStore()
  const id = userId || user?.id
  
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getProfile(id!),
    enabled: !!id
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()
  
  return useMutation({
    mutationFn: (updates: Partial<User>) =>
      userApi.updateProfile(user!.id, updates),
    onSuccess: (data) => {
      updateUser(data)
      queryClient.invalidateQueries({ queryKey: ['user', user!.id] })
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    }
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) => {
      const { user } = useAuthStore.getState()
      return userApi.changePassword(user!.id, data.oldPassword, data.newPassword)
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password')
    }
  })
}

// Bookings hooks
export function useBookings() {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingsApi.getBookings(user!.id),
    enabled: !!user?.id
  })
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.getBookingById(bookingId),
    enabled: !!bookingId
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] })
      toast.success('Booking cancelled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel booking')
    }
  })
}

// Travellers hooks
export function useTravellers() {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['travellers', user?.id],
    queryFn: () => travellersApi.getTravellers(user!.id),
    enabled: !!user?.id
  })
}

export function useAddTraveller() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (traveller: Omit<Traveller, 'id' | 'userId'>) =>
      travellersApi.addTraveller(user!.id, traveller),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travellers', user?.id] })
      toast.success('Traveller added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add traveller')
    }
  })
}

export function useUpdateTraveller() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Traveller> }) =>
      travellersApi.updateTraveller(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travellers', user?.id] })
      toast.success('Traveller updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update traveller')
    }
  })
}

export function useDeleteTraveller() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (travellerId: string) => travellersApi.deleteTraveller(travellerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travellers', user?.id] })
      toast.success('Traveller removed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove traveller')
    }
  })
}

// Payment methods hooks
export function usePaymentMethods() {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['payments', user?.id],
    queryFn: () => paymentsApi.getPaymentMethods(user!.id),
    enabled: !!user?.id
  })
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (payment: Omit<PaymentMethod, 'id' | 'userId'>) =>
      paymentsApi.addPaymentMethod(user!.id, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', user?.id] })
      toast.success('Payment method added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add payment method')
    }
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PaymentMethod> }) =>
      paymentsApi.updatePaymentMethod(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', user?.id] })
      toast.success('Payment method updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment method')
    }
  })
}

export function useSetDefaultPayment() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.setDefaultPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', user?.id] })
      toast.success('Default payment method updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update default payment')
    }
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.deletePaymentMethod(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', user?.id] })
      toast.success('Payment method removed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove payment method')
    }
  })
}

// Support hooks
export function useSupportTickets() {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['tickets', user?.id],
    queryFn: () => supportApi.getTickets(user!.id),
    enabled: !!user?.id
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (ticket: Omit<SupportTicket, 'id' | 'userId' | 'createdAt' | 'replies'>) =>
      supportApi.createTicket(user!.id, ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', user?.id] })
      toast.success('Support ticket created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket')
    }
  })
}

export function useSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => supportApi.getTicketById(ticketId),
    enabled: !!ticketId
  })
}

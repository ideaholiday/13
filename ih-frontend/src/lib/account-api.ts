import { User, Booking, Traveller, PaymentMethod, SupportTicket } from '@/types/account'
import { mockUsers, mockBookings, mockTravellers, mockPaymentMethods, mockTickets } from '@/data/account'

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(800)
    const user = mockUsers.find(u => u.email === email)
    if (!user) throw new Error('Invalid credentials')
    return { user, token: 'mock-jwt-token-' + Date.now() }
  },

  async loginWithMobile(mobile: string, otp: string): Promise<{ user: User; token: string }> {
    await delay(800)
    const user = mockUsers.find(u => u.mobile === mobile)
    if (!user) throw new Error('Invalid credentials')
    return { user, token: 'mock-jwt-token-' + Date.now() }
  },

  async register(data: Partial<User>): Promise<{ user: User; token: string }> {
    await delay(1000)
    const newUser: User = {
      id: 'user_' + Date.now(),
      email: data.email || '',
      mobile: data.mobile || '',
      name: data.name || '',
      createdAt: new Date().toISOString(),
      preferences: {
        newsletter: true,
        currency: 'INR',
        language: 'en',
        notifications: { email: true, sms: true, whatsapp: false }
      }
    }
    return { user: newUser, token: 'mock-jwt-token-' + Date.now() }
  },

  async sendOTP(mobile: string): Promise<{ success: boolean }> {
    await delay(500)
    return { success: true }
  },

  async verifyOTP(mobile: string, otp: string): Promise<{ valid: boolean }> {
    await delay(500)
    return { valid: otp === '123456' } // Mock OTP validation
  }
}

// Mock User API
export const userApi = {
  async getProfile(userId: string): Promise<User> {
    await delay()
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    return user
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(600)
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    return { ...user, ...updates }
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    await delay(700)
    return true
  }
}

// Mock Bookings API
export const bookingsApi = {
  async getBookings(userId: string): Promise<Booking[]> {
    await delay()
    return mockBookings.filter(b => b.userId === userId)
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    await delay()
    const booking = mockBookings.find(b => b.id === bookingId)
    if (!booking) throw new Error('Booking not found')
    return booking
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    await delay(800)
    const booking = mockBookings.find(b => b.id === bookingId)
    if (!booking) throw new Error('Booking not found')
    return { ...booking, status: 'cancelled' }
  }
}

// Mock Travellers API
export const travellersApi = {
  async getTravellers(userId: string): Promise<Traveller[]> {
    await delay()
    return mockTravellers.filter(t => t.userId === userId)
  },

  async addTraveller(userId: string, traveller: Omit<Traveller, 'id' | 'userId'>): Promise<Traveller> {
    await delay(600)
    const newTraveller: Traveller = {
      id: 'TRV' + Date.now(),
      userId,
      ...traveller
    }
    return newTraveller
  },

  async updateTraveller(travellerId: string, updates: Partial<Traveller>): Promise<Traveller> {
    await delay(600)
    const traveller = mockTravellers.find(t => t.id === travellerId)
    if (!traveller) throw new Error('Traveller not found')
    return { ...traveller, ...updates }
  },

  async deleteTraveller(travellerId: string): Promise<boolean> {
    await delay(500)
    return true
  }
}

// Mock Payments API
export const paymentsApi = {
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    await delay()
    return mockPaymentMethods.filter(p => p.userId === userId)
  },

  async addPaymentMethod(userId: string, payment: Omit<PaymentMethod, 'id' | 'userId'>): Promise<PaymentMethod> {
    await delay(700)
    const newPayment: PaymentMethod = {
      id: 'PM' + Date.now(),
      userId,
      ...payment
    }
    return newPayment
  },

  async updatePaymentMethod(paymentId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    await delay(500)
    const payment = mockPaymentMethods.find(p => p.id === paymentId)
    if (!payment) throw new Error('Payment method not found')
    return { ...payment, ...updates }
  },

  async setDefaultPayment(paymentId: string): Promise<boolean> {
    await delay(500)
    return true
  },

  async deletePaymentMethod(paymentId: string): Promise<boolean> {
    await delay(500)
    return true
  }
}

// Mock Support API
export const supportApi = {
  async getTickets(userId: string): Promise<SupportTicket[]> {
    await delay()
    return mockTickets.filter(t => t.userId === userId)
  },

  async createTicket(userId: string, ticket: Omit<SupportTicket, 'id' | 'userId' | 'createdAt' | 'replies'>): Promise<SupportTicket> {
    await delay(700)
    const newTicket: SupportTicket = {
      id: 'TKT' + Date.now(),
      userId,
      createdAt: new Date().toISOString(),
      replies: [],
      ...ticket
    }
    return newTicket
  },

  async getTicketById(ticketId: string): Promise<SupportTicket> {
    await delay()
    const ticket = mockTickets.find(t => t.id === ticketId)
    if (!ticket) throw new Error('Ticket not found')
    return ticket
  }
}

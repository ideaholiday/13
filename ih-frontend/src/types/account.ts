export interface User {
  id: string
  email: string
  mobile: string
  name: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  preferences?: {
    newsletter?: boolean
    currency?: string
    language?: string
    notifications?: {
      email: boolean
      sms: boolean
      whatsapp: boolean
    }
  }
  createdAt: string
}

export interface Booking {
  id: string
  userId: string
  type: 'flight' | 'hotel' | 'package'
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
  bookingDate: string
  tripDate: string
  primaryTraveller: string
  destination: string
  origin?: string
  price: number
  currency: string
  details: any
}

export interface Traveller {
  id: string
  userId: string
  name: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  type: 'adult' | 'child' | 'infant'
  isPrimary: boolean
  passport?: {
    number?: string
    expiryDate?: string
    nationality?: string
  }
}

export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'upi'
  cardNumber?: string
  cardType?: string
  expiryDate?: string
  cardholderName?: string
  upiId?: string
  isDefault: boolean
  billingAddress?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
}

export interface SupportTicket {
  id: string
  userId: string
  bookingId?: string
  subject: string
  message: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: string
  replies: Array<{
    message: string
    from: 'user' | 'support'
    timestamp: string
  }>
}

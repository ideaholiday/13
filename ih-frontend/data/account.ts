// Mock user data
export const mockUsers = [
  {
    id: 'user_001',
    email: 'john.doe@example.com',
    mobile: '+919876543210',
    name: 'John Doe',
    dateOfBirth: '1990-05-15',
    gender: 'male' as const,
    address: {
      street: '123 MG Road',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India'
    },
    preferences: {
      newsletter: true,
      currency: 'INR',
      language: 'en',
      notifications: {
        email: true,
        sms: true,
        whatsapp: false
      }
    },
    createdAt: '2024-01-15T10:00:00Z'
  }
]

// Mock bookings
export const mockBookings = [
  {
    id: 'BKG001',
    userId: 'user_001',
    type: 'flight' as const,
    status: 'confirmed' as const,
    bookingDate: '2025-10-10T14:30:00Z',
    tripDate: '2025-11-20T06:00:00Z',
    primaryTraveller: 'John Doe',
    destination: 'Dubai',
    origin: 'Delhi',
    price: 45000,
    currency: 'INR',
    details: {
      flights: [
        {
          flightNumber: 'EK512',
          airline: 'Emirates',
          from: 'DEL',
          to: 'DXB',
          departure: '2025-11-20T06:00:00Z',
          arrival: '2025-11-20T09:30:00Z',
          class: 'Economy',
          duration: '3h 30m'
        }
      ],
      travellers: [
        {
          name: 'John Doe',
          type: 'adult',
          seatNumber: '12A'
        }
      ],
      fare: {
        baseFare: 38000,
        taxes: 5000,
        fees: 2000,
        total: 45000
      }
    }
  },
  {
    id: 'BKG002',
    userId: 'user_001',
    type: 'hotel' as const,
    status: 'confirmed' as const,
    bookingDate: '2025-10-12T16:00:00Z',
    tripDate: '2025-12-05T14:00:00Z',
    primaryTraveller: 'John Doe',
    destination: 'Goa',
    price: 15000,
    currency: 'INR',
    details: {
      hotel: {
        name: 'Taj Exotica Resort & Spa',
        address: 'Calwaddo, Benaulim, Goa',
        checkIn: '2025-12-05T14:00:00Z',
        checkOut: '2025-12-08T11:00:00Z',
        nights: 3,
        roomType: 'Deluxe Room',
        guests: 2
      },
      fare: {
        roomRate: 13000,
        taxes: 1500,
        fees: 500,
        total: 15000
      }
    }
  },
  {
    id: 'BKG003',
    userId: 'user_001',
    type: 'package' as const,
    status: 'completed' as const,
    bookingDate: '2025-08-01T10:00:00Z',
    tripDate: '2025-09-10T00:00:00Z',
    primaryTraveller: 'John Doe',
    destination: 'Thailand',
    price: 85000,
    currency: 'INR',
    details: {
      package: {
        name: 'Amazing Thailand - 5N/6D',
        destinations: ['Bangkok', 'Pattaya', 'Phuket'],
        inclusions: [
          'Round-trip flights',
          '5 nights accommodation',
          'Daily breakfast',
          'City tours',
          'Airport transfers'
        ],
        exclusions: [
          'Lunch and dinner',
          'Personal expenses',
          'Travel insurance'
        ]
      },
      fare: {
        packageCost: 75000,
        taxes: 8000,
        fees: 2000,
        total: 85000
      }
    }
  }
]

// Mock travellers
export const mockTravellers = [
  {
    id: 'TRV001',
    userId: 'user_001',
    name: 'John Doe',
    dateOfBirth: '1990-05-15',
    gender: 'male' as const,
    type: 'adult' as const,
    isPrimary: true,
    passport: {
      number: 'P1234567',
      expiryDate: '2030-05-15',
      nationality: 'Indian'
    }
  },
  {
    id: 'TRV002',
    userId: 'user_001',
    name: 'Jane Doe',
    dateOfBirth: '1992-08-20',
    gender: 'female' as const,
    type: 'adult' as const,
    isPrimary: false,
    passport: {
      number: 'P7654321',
      expiryDate: '2029-08-20',
      nationality: 'Indian'
    }
  },
  {
    id: 'TRV003',
    userId: 'user_001',
    name: 'Jimmy Doe',
    dateOfBirth: '2018-03-10',
    gender: 'male' as const,
    type: 'child' as const,
    isPrimary: false
  }
]

// Mock payment methods
export const mockPaymentMethods = [
  {
    id: 'PAY001',
    userId: 'user_001',
    type: 'card' as const,
    cardNumber: '************4532',
    cardType: 'Visa',
    expiryDate: '12/2027',
    cardholderName: 'JOHN DOE',
    isDefault: true,
    billingAddress: {
      street: '123 MG Road',
      city: 'New Delhi',
      postalCode: '110001',
      country: 'India'
    }
  },
  {
    id: 'PAY002',
    userId: 'user_001',
    type: 'upi' as const,
    upiId: 'john.doe@paytm',
    isDefault: false
  }
]

// Mock support tickets
export const mockTickets = [
  {
    id: 'TKT001',
    userId: 'user_001',
    bookingId: 'BKG001',
    subject: 'Seat selection issue',
    message: 'Unable to select preferred seat',
    status: 'open' as const,
    createdAt: '2025-10-14T10:00:00Z',
    replies: []
  }
]

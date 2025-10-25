import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  FlightSearchParams,
  HotelSearchParams,
  Airport,
  TripType,
  TravelClass,
  FareType,
  PassengerCount,
  RoomConfiguration,
  FlightLeg
} from '@/types'
import { User } from '@/types/account'
import { LocalePreferences } from '@/types/enhancements'

// Flight search store
interface FlightSearchStore {
  // Search parameters
  tripType: TripType
  origin: Airport | null
  destination: Airport | null
  departureDate: Date | null
  returnDate: Date | null
  passengers: PassengerCount
  travelClass: TravelClass
  fareType: FareType
  zeroCancellation: boolean
  legs: FlightLeg[]

  // UI state
  isSearching: boolean
  showTravelersPopover: boolean
  
  // Actions
  setTripType: (type: TripType) => void
  setOrigin: (airport: Airport | null) => void
  setDestination: (airport: Airport | null) => void
  swapOriginDestination: () => void
  setDepartureDate: (date: Date | null) => void
  setReturnDate: (date: Date | null) => void
  setPassengers: (passengers: PassengerCount) => void
  setTravelClass: (travelClass: TravelClass) => void
  setFareType: (fareType: FareType) => void
  setZeroCancellation: (enabled: boolean) => void
  setLegs: (legs: FlightLeg[]) => void
  addLeg: () => void
  removeLeg: (index: number) => void
  updateLeg: (index: number, leg: Partial<FlightLeg>) => void
  
  setIsSearching: (searching: boolean) => void
  setShowTravelersPopover: (show: boolean) => void
  
  // Utility actions
  getSearchParams: () => FlightSearchParams | null
  resetSearch: () => void
}

export const useFlightSearchStore = create<FlightSearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tripType: 'oneway',
      origin: null,
      destination: null,
      departureDate: null,
      returnDate: null,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
      travelClass: 'economy',
      fareType: 'regular',
      zeroCancellation: false,
      legs: [],
      
      isSearching: false,
      showTravelersPopover: false,

      // Actions
      setTripType: (type) => {
        set({ tripType: type })
        // Reset legs when changing trip type
        if (type !== 'multicity') {
          set({ legs: [] })
        }
        // Reset return date for one-way
        if (type === 'oneway') {
          set({ returnDate: null })
        }
      },

      setOrigin: (airport) => set({ origin: airport }),
      setDestination: (airport) => set({ destination: airport }),

      swapOriginDestination: () => {
        const { origin, destination } = get()
        set({ origin: destination, destination: origin })
      },

      setDepartureDate: (date) => set({ departureDate: date }),
      setReturnDate: (date) => set({ returnDate: date }),
      setPassengers: (passengers) => set({ passengers }),
      setTravelClass: (travelClass) => set({ travelClass }),
      setFareType: (fareType) => set({ fareType }),
      setZeroCancellation: (enabled) => set({ zeroCancellation: enabled }),
      
      setLegs: (legs) => set({ legs }),
      addLeg: () => {
        const { legs } = get()
        if (legs.length < 6) {
          const newLeg: FlightLeg = {
            id: `leg-${Date.now()}`,
            origin: null as any,
            destination: null as any,
            departureDate: new Date()
          }
          set({ legs: [...legs, newLeg] })
        }
      },

      removeLeg: (index) => {
        const { legs } = get()
        const newLegs = legs.filter((_, i) => i !== index)
        set({ legs: newLegs })
      },

      updateLeg: (index, legUpdate) => {
        const { legs } = get()
        const newLegs = legs.map((leg, i) => 
          i === index ? { ...leg, ...legUpdate } : leg
        )
        set({ legs: newLegs })
      },

      setIsSearching: (searching) => set({ isSearching: searching }),
      setShowTravelersPopover: (show) => set({ showTravelersPopover: show }),

      getSearchParams: () => {
        const state = get()
        const { origin, destination, departureDate, passengers } = state

        // Validate required fields
        if (!origin || !destination || !departureDate) {
          return null
        }

        // For roundtrip searches, ensure a return date is provided
        if (state.tripType === 'roundtrip' && !state.returnDate) {
          return null
        }

        // Validate passenger count
        const totalPassengers = passengers.adults + passengers.children + passengers.infants
        if (totalPassengers === 0 || totalPassengers > 9) {
          return null
        }

        // Validate infants <= adults
        if (passengers.infants > passengers.adults) {
          return null
        }

        return {
          tripType: state.tripType,
          origin,
          destination,
          departureDate,
          returnDate: state.returnDate || undefined,
          passengers,
          travelClass: state.travelClass,
          fareType: state.fareType,
          zeroCancellation: state.zeroCancellation,
          legs: state.tripType === 'multicity' ? state.legs : undefined
        }
      },

      resetSearch: () => set({
        tripType: 'roundtrip',
        origin: null,
        destination: null,
        departureDate: null,
        returnDate: null,
        passengers: { adults: 1, children: 0, infants: 0 },
        travelClass: 'economy',
        fareType: 'regular',
        zeroCancellation: false,
        legs: [],
        isSearching: false,
        showTravelersPopover: false
      })
    }),
    {
      name: 'flight-search-storage',
      partialize: (state) => ({
        tripType: state.tripType,
        origin: state.origin,
        destination: state.destination,
        departureDate: state.departureDate,
        returnDate: state.returnDate,
        passengers: state.passengers,
        travelClass: state.travelClass,
        fareType: state.fareType,
        zeroCancellation: state.zeroCancellation,
        legs: state.legs
      })
    }
  )
)

// Hotel search store
interface HotelSearchStore {
  // Search parameters
  location: string
  checkIn: Date | null
  checkOut: Date | null
  rooms: RoomConfiguration[]
  priceRange?: [number, number]
  starRating?: number[]
  amenities?: string[]

  // UI state
  isSearching: boolean
  showRoomsPopover: boolean

  // Actions
  setLocation: (location: string) => void
  setCheckIn: (date: Date | null) => void
  setCheckOut: (date: Date | null) => void
  setRooms: (rooms: RoomConfiguration[]) => void
  addRoom: () => void
  removeRoom: (index: number) => void
  updateRoom: (index: number, room: Partial<RoomConfiguration>) => void
  setPriceRange: (range: [number, number] | undefined) => void
  setStarRating: (rating: number[] | undefined) => void
  setAmenities: (amenities: string[] | undefined) => void
  
  setIsSearching: (searching: boolean) => void
  setShowRoomsPopover: (show: boolean) => void
  
  getSearchParams: () => HotelSearchParams | null
  resetSearch: () => void
}

export const useHotelSearchStore = create<HotelSearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      location: '',
      checkIn: null,
      checkOut: null,
      rooms: [{ adults: 2, children: 0, childAges: [] }],
      
      isSearching: false,
      showRoomsPopover: false,

      // Actions
      setLocation: (location) => set({ location }),
      setCheckIn: (date) => set({ checkIn: date }),
      setCheckOut: (date) => set({ checkOut: date }),
      setRooms: (rooms) => set({ rooms }),

      addRoom: () => {
        const { rooms } = get()
        if (rooms.length < 4) {
          set({ 
            rooms: [...rooms, { adults: 2, children: 0, childAges: [] }] 
          })
        }
      },

      removeRoom: (index) => {
        const { rooms } = get()
        if (rooms.length > 1) {
          set({ rooms: rooms.filter((_, i) => i !== index) })
        }
      },

      updateRoom: (index, roomUpdate) => {
        const { rooms } = get()
        const newRooms = rooms.map((room, i) => {
          if (i === index) {
            const updated = { ...room, ...roomUpdate }
            // Ensure childAges array matches children count
            if (roomUpdate.children !== undefined) {
              updated.childAges = Array(roomUpdate.children).fill(0)
            }
            return updated
          }
          return room
        })
        set({ rooms: newRooms })
      },

      setPriceRange: (range) => set({ priceRange: range }),
      setStarRating: (rating) => set({ starRating: rating }),
      setAmenities: (amenities) => set({ amenities }),
      
      setIsSearching: (searching) => set({ isSearching: searching }),
      setShowRoomsPopover: (show) => set({ showRoomsPopover: show }),

      getSearchParams: () => {
        const state = get()
        const { location, checkIn, checkOut, rooms } = state

        if (!location || !checkIn || !checkOut) {
          return null
        }

        if (checkOut <= checkIn) {
          return null
        }

        return {
          location,
          checkIn,
          checkOut,
          rooms,
          priceRange: state.priceRange,
          starRating: state.starRating,
          amenities: state.amenities
        }
      },

      resetSearch: () => set({
        location: '',
        checkIn: null,
        checkOut: null,
        rooms: [{ adults: 2, children: 0, childAges: [] }],
        priceRange: undefined,
        starRating: undefined,
        amenities: undefined,
        isSearching: false,
        showRoomsPopover: false
      })
    }),
    {
      name: 'hotel-search-storage',
      partialize: (state) => ({
        location: state.location,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        rooms: state.rooms,
        priceRange: state.priceRange,
        starRating: state.starRating,
        amenities: state.amenities
      })
    }
  )
)

// UI preferences store
interface UIStore {
  // Theme and preferences
  currency: string
  language: string
  
  // Navigation
  mobileMenuOpen: boolean
  
  // Loading states
  globalLoading: boolean
  
  // Actions
  setCurrency: (currency: string) => void
  setLanguage: (language: string) => void
  setMobileMenuOpen: (open: boolean) => void
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      currency: 'INR',
      language: 'en',
      mobileMenuOpen: false,
      globalLoading: false,

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setGlobalLoading: (loading) => set({ globalLoading: loading })
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        currency: state.currency,
        language: state.language
      })
    }
  )
)

// Booking store for managing booking flow state
interface BookingStore {
  // Current booking data
  currentBooking: any | null
  step: number
  
  // Actions
  setCurrentBooking: (booking: any) => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  currentBooking: null,
  step: 1,

  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setStep: (step) => set({ step }),
  nextStep: () => {
    const { step } = get()
    set({ step: step + 1 })
  },
  prevStep: () => {
    const { step } = get()
    if (step > 1) {
      set({ step: step - 1 })
    }
  },
  resetBooking: () => set({ currentBooking: null, step: 1 })
}))

// Auth store for managing user authentication
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (updates) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Locale/Preferences store for multi-language and currency
interface LocaleStore {
  preferences: LocalePreferences
  setLanguage: (language: string) => void
  setCurrency: (currency: string) => void
  setDateFormat: (format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD') => void
  setTimeFormat: (format: '12h' | '24h') => void
  setPreferences: (prefs: Partial<LocalePreferences>) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      preferences: {
        language: 'en',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h'
      },
      
      setLanguage: (language) => set(state => ({
        preferences: { ...state.preferences, language }
      })),
      
      setCurrency: (currency) => set(state => ({
        preferences: { ...state.preferences, currency }
      })),
      
      setDateFormat: (dateFormat) => set(state => ({
        preferences: { ...state.preferences, dateFormat }
      })),
      
      setTimeFormat: (timeFormat) => set(state => ({
        preferences: { ...state.preferences, timeFormat }
      })),
      
      setPreferences: (prefs) => set(state => ({
        preferences: { ...state.preferences, ...prefs }
      }))
    }),
    {
      name: 'locale-storage'
    }
  )
)

// Notifications store for managing notification state
interface NotificationStore {
  notifications: any[]
  unreadCount: number
  setNotifications: (notifications: any[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: any) => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      
      setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter((n: any) => !n.read).length
      }),
      
      markAsRead: (id) => set(state => {
        const updated = state.notifications.map((n: any) => 
          n.id === id ? { ...n, read: true } : n
        )
        return {
          notifications: updated,
          unreadCount: updated.filter((n: any) => !n.read).length
        }
      }),
      
      markAllAsRead: () => set(state => ({
        notifications: state.notifications.map((n: any) => ({ ...n, read: true })),
        unreadCount: 0
      })),
      
      addNotification: (notification) => set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1
      }))
    }),
    {
      name: 'notifications-storage'
    }
  )
)
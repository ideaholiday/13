import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HotelSearchParams {
  cityId: string
  cityName: string
  countryName: string
  checkIn: string
  checkOut: string
  currency: string
  nationality: string
  rooms: Array<{
    adults: number
    children: number
    childAges?: number[]
  }>
  filters?: {
    starRating?: number[]
    priceRange?: [number, number]
    amenities?: string[]
  }
}

export interface HotelSearchResult {
  HotelCode: string
  HotelName: string
  StarRating: number
  HotelRooms: Array<{
    RoomTypeCode: string
    RoomTypeName: string
    MealType: string
    RoomRate: Array<{
      TotalFare: number
      OfferedFare: number
      Currency: string
      BookingCode: string
    }>
  }>
}

export interface HotelSearchResponse {
  Response: {
    TraceId: string
    HotelSearchResult: HotelSearchResult[]
  }
  usingMockData?: boolean
}

interface HotelSearchStore {
  // Search parameters
  searchParams: HotelSearchParams | null
  setSearchParams: (params: HotelSearchParams) => void
  
  // Search results
  searchResults: HotelSearchResponse | null
  setSearchResults: (results: HotelSearchResponse) => void
  
  // Selected hotel and room
  selectedHotel: HotelSearchResult | null
  selectedRoom: HotelSearchResult['HotelRooms'][0] | null
  setSelectedHotel: (hotel: HotelSearchResult | null) => void
  setSelectedRoom: (room: HotelSearchResult['HotelRooms'][0] | null) => void
  
  // Booking details
  traceId: string | null
  setTraceId: (traceId: string) => void
  
  // Guest details
  guests: Array<{
    title: string
    firstName: string
    lastName: string
    paxType: number // 1=Adult, 2=Child
    age?: number
    passportNo?: string
    passportExpiry?: string
    nationality?: string
  }>
  setGuests: (guests: Array<HotelSearchStore['guests'][0]>) => void
  
  // Contact details
  contact: {
    email: string
    phone: string
  }
  setContact: (contact: HotelSearchStore['contact']) => void
  
  // Booking status
  bookingId: string | null
  setBookingId: (bookingId: string) => void
  
  // Clear all data
  clearAll: () => void
}

export const useHotelSearchStore = create<HotelSearchStore>()(
  persist(
    (set, get) => ({
      // Search parameters
      searchParams: null,
      setSearchParams: (params) => set({ searchParams: params }),
      
      // Search results
      searchResults: null,
      setSearchResults: (results) => set({ searchResults: results }),
      
      // Selected hotel and room
      selectedHotel: null,
      selectedRoom: null,
      setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      
      // Booking details
      traceId: null,
      setTraceId: (traceId) => set({ traceId }),
      
      // Guest details
      guests: [],
      setGuests: (guests) => set({ guests }),
      
      // Contact details
      contact: {
        email: '',
        phone: '',
      },
      setContact: (contact) => set({ contact }),
      
      // Booking status
      bookingId: null,
      setBookingId: (bookingId) => set({ bookingId }),
      
      // Clear all data
      clearAll: () => set({
        searchParams: null,
        searchResults: null,
        selectedHotel: null,
        selectedRoom: null,
        traceId: null,
        guests: [],
        contact: { email: '', phone: '' },
        bookingId: null,
      }),
    }),
    {
      name: 'hotel-search-store',
      partialize: (state) => ({
        searchParams: state.searchParams,
        searchResults: state.searchResults,
        selectedHotel: state.selectedHotel,
        selectedRoom: state.selectedRoom,
        traceId: state.traceId,
        guests: state.guests,
        contact: state.contact,
        bookingId: state.bookingId,
      }),
    }
  )
)

import { HotelSearchParams, HotelSearchResponse } from '../stores/hotel-search-store'
import { resolveApiBase } from '@/lib/api-base'

const API_BASE_URL = resolveApiBase('/api/v1')

export class HttpError extends Error {
  status: number
  payload?: any

  constructor(status: number, message: string, payload?: any) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.payload = payload
  }
}

const normalizeHotelDate = (value: string) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const normalizeRooms = (
  rooms: HotelSearchParams['rooms']
) => rooms.map(room => ({
  adults: room.adults,
  children: room.children,
  childAges:
    room.children && room.children > 0
      ? (room.childAges?.length ? room.childAges : Array(room.children).fill(8))
      : [],
}))

export interface Country {
  id: number
  iso2: string
  iso3: string
  name: string
  tbo_country_code: string
}

export interface City {
  id: number
  name: string
  tbo_city_code: string
  latitude: string
  longitude: string
}

export interface HotelCode {
  id: number
  tbo_hotel_code: string
  name: string
  star_rating: number
  guest_rating: number
}

export interface HotelPrebookResponse {
  Response: {
    BookingCode: string
    IsPriceChanged: boolean
    IsPolicyChanged: boolean
    TotalFare: number
    Taxes: number
    NetAmount: number
    CancellationPolicy: string
    IsPanRequired: boolean
    IsPassportRequired: boolean
  }
}

export interface HotelBookResponse {
  success: boolean
  message: string
  bookingId?: string
  pnr?: string
  confirmationNo?: string
  status?: string
}

export interface HotelVoucherResponse {
  Response: {
    VoucherOutput: {
      ResponseStatus: number
      VoucherPath: string
    }
  }
}

export interface HotelBookingDetailResponse {
  Response: {
    BookingDetail: {
      ConfirmationNo: string
      BookingId: string
      Status: number
      HotelName: string
      HotelAddress: string
      CheckInDate: string
      CheckOutDate: string
      TotalFare: number
      Currency: string
      Rooms: Array<{
        RoomTypeName: string
        Price: {
          Currency: string
          RoomPrice: number
          Tax: number
          TotalFare: number
        }
        Guests: Array<{
          Title: string
          FirstName: string
          LastName: string
          PaxType: number
        }>
      }>
    }
  }
}

export interface HotelCancelResponse {
  Response: {
    ChangeRequestStatus: {
      ChangeRequestId: string
      Status: number
      Description: string
    }
  }
}

export interface HotelCancelStatusResponse {
  Response: {
    ChangeRequestStatus: {
      ChangeRequestId: string
      Status: number
      Description: string
      CancellationCharge?: number
      RefundAmount?: number
    }
  }
}

class HotelApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    const raw = await response.text()
    let data: any = null

    if (raw) {
      try {
        data = JSON.parse(raw)
      } catch {
        // leave data as null if parsing fails
      }
    }

    if (!response.ok) {
      const message =
        data?.message ||
        (data?.errors ? 'Validation failed. Please review your inputs.' : `HTTP error! status: ${response.status}`)

      throw new HttpError(response.status, message, data)
    }

    if (data === null) {
      throw new HttpError(response.status, 'Received an invalid response from the hotel service.')
    }

    return data
  }

  // Get countries list
  async getCountries(): Promise<{ success: boolean; data: Country[] }> {
    return this.request('/hotels/countries')
  }

  // Get cities for a country
  async getCities(countryCode: string): Promise<{ success: boolean; data: City[] }> {
    return this.request(`/hotels/cities?country=${countryCode}`)
  }

  // Get hotel codes for a city
  async getHotelCodes(cityCode: string): Promise<{ success: boolean; data: HotelCode[] }> {
    return this.request(`/hotels/hotel-codes?city=${cityCode}`)
  }

  // Search hotels
  async searchHotels(params: HotelSearchParams): Promise<{
    success: boolean
    data: {
      traceId: string
      searchResults: HotelSearchResponse
      markupPct: number
    }
    message?: string
  }> {
    const payload = {
      cityCode: params.cityCode?.toUpperCase(),
      checkInDate: normalizeHotelDate(params.checkIn),
      checkOutDate: normalizeHotelDate(params.checkOut),
      rooms: normalizeRooms(params.rooms),
      nationality: (params.nationality || 'IN').toUpperCase(),
      currency: (params.currency || 'INR').toUpperCase(),
    }

    return this.request('/hotels/search', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // Pre-book hotel (verify price and policy)
  async preBookHotel(data: {
    sessionId: string
    resultIndex: number
    hotelCode: string
    roomDetails: Array<{
      roomIndex: number
      ratePlanCode: string
      guests: Array<{
        title: string
        firstName: string
        lastName: string
        paxType: number
        age?: number
        passportNo?: string
        passportExpiry?: string
        nationality?: string
      }>
    }>
    contact: {
      email: string
      phone: string
    }
  }): Promise<{ success: boolean; data: HotelPrebookResponse }> {
    return this.request('/hotels/prebook', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Book hotel
  async bookHotel(data: {
    sessionId: string
    resultIndex: number
    hotelCode: string
    roomDetails: Array<{
      roomIndex: number
      ratePlanCode: string
      guests: Array<{
        title: string
        firstName: string
        lastName: string
        paxType: number
        age?: number
        passportNo?: string
        passportExpiry?: string
        nationality?: string
      }>
    }>
    contact: {
      email: string
      phone: string
    }
    paymentId?: string
  }): Promise<HotelBookResponse> {
    return this.request('/hotels/book', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Generate voucher
  async generateVoucher(bookingId: number): Promise<{ success: boolean; data: HotelVoucherResponse }> {
    return this.request('/hotels/voucher', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    })
  }

  // Get booking details
  async getBookingDetails(bookingId: string): Promise<{ success: boolean; data: HotelBookingDetailResponse }> {
    return this.request(`/hotels/booking-detail?bookingId=${bookingId}`)
  }

  // Cancel booking
  async cancelBooking(bookingId: number, reason?: string): Promise<{ success: boolean; data: HotelCancelResponse }> {
    return this.request('/hotels/cancel', {
      method: 'POST',
      body: JSON.stringify({ bookingId, reason }),
    })
  }

  // Get cancellation status
  async getCancelStatus(changeRequestId: string): Promise<{ success: boolean; data: HotelCancelStatusResponse }> {
    return this.request(`/hotels/cancel-status/${changeRequestId}`)
  }

  // Get booking by ID
  async getBooking(id: string): Promise<{ success: boolean; data: any }> {
    return this.request(`/hotels/booking/${id}`)
  }
}

export const hotelApi = new HotelApiClient()

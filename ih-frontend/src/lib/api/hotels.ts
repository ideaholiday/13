import { HotelSearchParams, HotelSearchResponse } from '../stores/hotel-search-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
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
  }> {
    return this.request('/hotels/search', {
      method: 'POST',
      body: JSON.stringify(params),
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

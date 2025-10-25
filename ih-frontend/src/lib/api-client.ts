import { z } from 'zod'
import { useAuthStore } from './stores/auth-store';

// ====================================
// API Client Configuration
// ====================================

export interface ApiClientConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
  retries?: number
  enableLogging?: boolean
}

export class ApiClient {
  private config: Required<ApiClientConfig>
  
  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      enableLogging: config.enableLogging || process.env.NODE_ENV === 'development'
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    const token = useAuthStore.getState().token;
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    })

    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    }

    if (this.config.enableLogging) {
      console.log(`[API] ${options.method || 'GET'} ${url}`)
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, config)
        
        if (!response.ok) {
          throw new ApiError(
            response.status,
            response.statusText,
            await this.parseErrorResponse(response)
          )
        }

        const data = await response.json()
        
        if (this.config.enableLogging) {
          console.log(`[API] Success: ${url}`)
        }

        return {
          success: true,
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (this.config.enableLogging) {
          console.warn(`[API] Attempt ${attempt} failed: ${url}`, lastError.message)
        }

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof ApiError && error.status < 500 && error.status !== 429) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error occurred',
      status: lastError instanceof ApiError ? lastError.status : 0
    }
  }

  private async parseErrorResponse(response: Response) {
    try {
      const text = await response.text()
      return text ? JSON.parse(text) : null
    } catch {
      return null
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return this.request<T>(url.pathname + url.search)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// ====================================
// Error Handling
// ====================================

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public details?: any
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'ApiError'
  }
}

// ====================================
// Response Types
// ====================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  status?: number
  headers?: Record<string, string>
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

// ====================================
// API Schema Validation
// ====================================

export const FlightSearchParamsSchema = z.object({
  origin: z.string().min(3, 'Origin airport code required'),
  destination: z.string().min(3, 'Destination airport code required'),
  departureDate: z.date(),
  returnDate: z.date().optional(),
  passengers: z.object({
    adults: z.number().min(1).max(9),
    children: z.number().min(0).max(8),
    infants: z.number().min(0).max(9),
  }),
  travelClass: z.enum(['economy', 'premium_economy', 'business', 'first']),
  tripType: z.enum(['oneway', 'roundtrip', 'multi-city']),
})

export const HotelSearchParamsSchema = z.object({
  destination: z.string().min(1, 'Destination required'),
  checkIn: z.date(),
  checkOut: z.date(),
  rooms: z.array(z.object({
    adults: z.number().min(1).max(4),
    children: z.array(z.number().min(0).max(17)).max(3),
  })).min(1).max(8),
  currency: z.string().default('INR'),
})

export const PackageSearchParamsSchema = z.object({
  destination: z.string().optional(),
  theme: z.string().optional(),
  budget: z.tuple([z.number(), z.number()]).optional(),
  duration: z.tuple([z.number(), z.number()]).optional(),
  departureDate: z.date().optional(),
  travelers: z.number().min(1).max(10).optional(),
})

// ====================================
// API Response Schemas
// ====================================

export const FlightResponseSchema = z.object({
  id: z.string(),
  airline: z.object({
    code: z.string(),
    name: z.string(),
    logo: z.string(),
  }),
  segments: z.array(z.object({
    origin: z.string(),
    destination: z.string(),
    departure: z.string().transform(str => new Date(str)),
    arrival: z.string().transform(str => new Date(str)),
    duration: z.number(),
    aircraft: z.string(),
    flightNumber: z.string(),
  })),
  price: z.object({
    total: z.number(),
    base: z.number(),
    taxes: z.number(),
    currency: z.string(),
  }),
  baggage: z.object({
    checkedBags: z.number(),
    cabinBag: z.number(),
  }),
  refundable: z.boolean(),
  bookingClass: z.string(),
})

export const HotelResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  starRating: z.number().min(1).max(5),
  rating: z.number().min(0).max(10),
  reviewCount: z.number().min(0),
  images: z.array(z.string()),
  amenities: z.array(z.string()),
  rooms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    maxGuests: z.number(),
    price: z.object({
      total: z.number(),
      perNight: z.number(),
      currency: z.string(),
      taxes: z.number(),
    }),
    availability: z.number(),
    cancellationPolicy: z.string(),
  })),
})

export const PackageResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  destination: z.string(),
  duration: z.number(),
  price: z.object({
    total: z.number(),
    perPerson: z.number(),
    currency: z.string(),
  }),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
    activities: z.array(z.string()),
  })),
  images: z.array(z.string()),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  availability: z.boolean(),
})

// ====================================
// Typed API Methods
// ====================================

export type FlightSearchParams = z.infer<typeof FlightSearchParamsSchema>
export type HotelSearchParams = z.infer<typeof HotelSearchParamsSchema>
export type PackageSearchParams = z.infer<typeof PackageSearchParamsSchema>

export type FlightResponse = z.infer<typeof FlightResponseSchema>
export type HotelResponse = z.infer<typeof HotelResponseSchema>
export type PackageResponse = z.infer<typeof PackageResponseSchema>

// ====================================
// API Service Methods
// ====================================

export class TravelApiService {
  constructor(private client: ApiClient) {}

  // Flight APIs
  async searchFlights(params: FlightSearchParams): Promise<ApiResponse<FlightResponse[]>> {
    const validatedParams = FlightSearchParamsSchema.parse(params)
    return this.client.post<FlightResponse[]>('/api/v1/flights/search', validatedParams)
  }

  async getFlightDetails(id: string): Promise<ApiResponse<FlightResponse>> {
    return this.client.get<FlightResponse>(`/api/v1/flights/${id}`)
  }

  async bookFlight(flightId: string, passengerDetails: any): Promise<ApiResponse<any>> {
    return this.client.post('/api/v1/flights/book', {
      flightId,
      passengerDetails
    })
  }

  // Hotel APIs
  async searchHotels(params: HotelSearchParams): Promise<ApiResponse<HotelResponse[]>> {
    const validatedParams = HotelSearchParamsSchema.parse(params)
    return this.client.get<HotelResponse[]>('/api/v1/hotels/search', validatedParams)
  }

  async getHotelDetails(id: string): Promise<ApiResponse<HotelResponse>> {
    return this.client.get<HotelResponse>(`/api/v1/hotels/${id}`)
  }

  async bookHotel(hotelId: string, roomId: string, guestDetails: any): Promise<ApiResponse<any>> {
    return this.client.post('/api/v1/hotels/book', {
      hotelId,
      roomId,
      guestDetails
    })
  }

  // Package APIs
  async searchPackages(params: PackageSearchParams): Promise<ApiResponse<PackageResponse[]>> {
    const validatedParams = PackageSearchParamsSchema.parse(params)
    return this.client.get<PackageResponse[]>('/api/v1/packages/search', validatedParams)
  }

  async getPackageDetails(id: string): Promise<ApiResponse<PackageResponse>> {
    return this.client.get<PackageResponse>(`/api/v1/packages/${id}`)
  }

  async bookPackage(packageId: string, travelers: any): Promise<ApiResponse<any>> {
    return this.client.post('/api/v1/packages/book', {
      packageId,
      travelers
    })
  }

  // Utility APIs
  async getAirports(query?: string): Promise<ApiResponse<any[]>> {
    return this.client.get('/api/v1/airports', query ? { q: query } : undefined)
  }

  async getDestinations(): Promise<ApiResponse<any[]>> {
    return this.client.get('/api/v1/destinations')
  }

  async getCurrencyRates(): Promise<ApiResponse<any>> {
    return this.client.get('/api/v1/currency-rates')
  }
}

// ====================================
// API Client Instance
// ====================================

// Create configured API client
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  enableLogging: process.env.NODE_ENV === 'development'
})

export const travelApi = new TravelApiService(apiClient)

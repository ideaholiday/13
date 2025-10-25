import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Airport,
  Destination,
  Testimonial,
  FlightSearchParams,
  FlightItinerary,
  HotelSearchParams,
  Hotel,
  Package,
  BlogPost,
  CMSPage
} from '@/types'

// Query key factories for better cache management
export const queryKeys = {
  airports: ['airports'] as const,
  destinations: ['destinations'] as const,
  testimonials: ['testimonials'] as const,
  
  flights: ['flights'] as const,
  flight: (id: string) => ['flights', id] as const,
  flightSearch: (params: FlightSearchParams) => ['flights', 'search', params] as const,
  
  hotels: ['hotels'] as const,
  hotel: (id: string) => ['hotels', id] as const,
  hotelSearch: (params: HotelSearchParams) => ['hotels', 'search', params] as const,
  
  packages: ['packages'] as const,
  package: (id: string) => ['packages', id] as const,
  
  blog: ['blog'] as const,
  blogPost: (slug: string) => ['blog', slug] as const,
  
  cms: (slug: string) => ['cms', slug] as const,
}

// Airport hooks
export function useAirports() {
  return useQuery({
    queryKey: queryKeys.airports,
    queryFn: () => api.flight.getAirports(),
    staleTime: 30 * 60 * 1000, // 30 minutes - airports don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useAirportSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['airports', 'search', query],
    queryFn: () => api.flight.searchAirports(query),
    enabled: enabled && query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Flight hooks
export function useFlightSearch(params: FlightSearchParams | null) {
  return useQuery({
    queryKey: params ? queryKeys.flightSearch(params) : ['flights', 'search'],
    queryFn: () => params ? api.flight.searchFlights(params) : Promise.resolve(null),
    enabled: !!params,
    staleTime: 2 * 60 * 1000, // 2 minutes - flight prices change frequently
  })
}

export function useFlightDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.flight(id),
    queryFn: () => api.flight.getFlightDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hotel hooks
export function useLocationSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['locations', 'search', query],
    queryFn: () => api.hotel.searchLocations(query),
    enabled: enabled && query.length >= 2,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useHotelSearch(params: HotelSearchParams | null) {
  return useQuery({
    queryKey: params ? queryKeys.hotelSearch(params) : ['hotels', 'search'],
    queryFn: () => params ? api.hotel.searchHotels(params) : Promise.resolve(null),
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useHotelDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.hotel(id),
    queryFn: () => api.hotel.getHotelDetails(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Package hooks
export function usePackageSearch(params?: {
  destination?: string
  theme?: string
  budget?: [number, number]
  duration?: [number, number]
}) {
  return useQuery({
    queryKey: ['packages', 'search', params],
    queryFn: () => api.package.searchPackages(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function usePackageDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.package(id),
    queryFn: () => api.package.getPackageDetails(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Content hooks
export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations,
    queryFn: () => api.content.getDestinations(),
    staleTime: 60 * 60 * 1000, // 1 hour - destinations are fairly static
  })
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials,
    queryFn: () => api.content.getTestimonials(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useBlogPosts(tag?: string) {
  return useQuery({
    queryKey: ['blog', 'posts', tag],
    queryFn: () => api.content.getBlogPosts(tag),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogPost(slug),
    queryFn: () => api.content.getBlogPost(slug),
    enabled: !!slug,
    staleTime: 60 * 60 * 1000, // 1 hour - blog posts don't change often
  })
}

export function useCMSPage(slug: string) {
  return useQuery({
    queryKey: queryKeys.cms(slug),
    queryFn: () => api.content.getCMSPage(slug),
    enabled: !!slug,
    staleTime: 60 * 60 * 1000, // 1 hour - CMS pages are fairly static
  })
}

// Booking mutations (for when we integrate with real backend)
export function useBookFlight() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (bookingData: any) => {
      // This will be implemented when backend is ready
      console.log('Booking flight:', bookingData)
      // return api.flight.bookFlight(bookingData)
      
      // Mock success response
      await new Promise(resolve => setTimeout(resolve, 2000))
      return {
        success: true,
        data: {
          id: `flight-booking-${Date.now()}`,
          pnr: `IH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          status: 'confirmed'
        }
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.flights })
      console.log('Flight booked successfully:', data)
    },
    onError: (error) => {
      console.error('Flight booking failed:', error)
    }
  })
}

export function useBookHotel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (bookingData: any) => {
      // This will be implemented when backend is ready
      console.log('Booking hotel:', bookingData)
      
      // Mock success response
      await new Promise(resolve => setTimeout(resolve, 2000))
      return {
        success: true,
        data: {
          id: `hotel-booking-${Date.now()}`,
          confirmationNumber: `IH${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: 'confirmed'
        }
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels })
      console.log('Hotel booked successfully:', data)
    },
    onError: (error) => {
      console.error('Hotel booking failed:', error)
    }
  })
}

export function useBookPackage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (bookingData: any) => {
      // This will be implemented when backend is ready
      console.log('Booking package:', bookingData)
      
      // Mock success response
      await new Promise(resolve => setTimeout(resolve, 2000))
      return {
        success: true,
        data: {
          id: `package-booking-${Date.now()}`,
          bookingReference: `PKG${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: 'confirmed'
        }
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages })
      console.log('Package booked successfully:', data)
    },
    onError: (error) => {
      console.error('Package booking failed:', error)
    }
  })
}

// Utility hooks
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Custom hook for managing search state with URL sync
export function useSearchParams<T>(
  initialParams: T,
  paramKey: string
): [T, (params: T) => void] {
  const [params, setParams] = useState<T>(initialParams)

  // In a real implementation, this would sync with URL search params
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search)
  //   const savedParams = urlParams.get(paramKey)
  //   if (savedParams) {
  //     try {
  //       setParams(JSON.parse(decodeURIComponent(savedParams)))
  //     } catch (error) {
  //       console.error('Failed to parse URL params:', error)
  //     }
  //   }
  // }, [paramKey])

  const updateParams = useCallback((newParams: T) => {
    setParams(newParams)
    
    // Update URL without page reload
    // const urlParams = new URLSearchParams(window.location.search)
    // urlParams.set(paramKey, encodeURIComponent(JSON.stringify(newParams)))
    // window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`)
  }, [paramKey])

  return [params, updateParams]
}
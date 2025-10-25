/**
 * Sanity API Layer
 * 
 * This module provides functions to fetch content from Sanity CMS
 * for packages, destinations, deals/offers, and blog posts.
 */

import { sanityClient } from './sanity.client'
import {
  packagesQuery,
  packageBySlugQuery,
  featuredPackagesQuery,
  packagesByDestinationQuery,
  packagesByThemeQuery,
  destinationsQuery,
  destinationBySlugQuery,
  dealsQuery,
  dealBySlugQuery,
  featuredDealsQuery,
  postsQuery,
  postBySlugQuery
} from './sanity.queries'

// Types
export interface SanityPackage {
  _id: string
  title: string
  slug: string
  description?: string
  shortDescription?: string
  coverImage?: string
  images?: string[]
  destination: {
    _id: string
    title: string
    slug: string
    country: string
  }
  duration: number
  theme: string[]
  difficulty?: string
  groupSize: {
    min: number
    max: number
  }
  pricing: {
    basePrice: number
    currency: string
    pricePerPerson: boolean
    childDiscount?: number
  }
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: any[]
  highlights?: string[]
  rating?: number
  reviewCount?: number
  available?: boolean
  departureDates?: string[]
  featured?: boolean
  deals?: any[]
  seo?: any
}

export interface SanityDestination {
  _id: string
  title: string
  slug: string
  country: string
  description?: string
  image?: string
  gallery?: string[]
  isPopular?: boolean
  averagePrice?: number
  bestTime?: string
  highlights?: string[]
  climate?: string
  packageCount?: number
  packages?: SanityPackage[]
  seo?: any
}

export interface SanityDeal {
  _id: string
  title: string
  slug: string
  description?: string
  image?: string
  discountPercent?: number
  discountAmount?: number
  originalPrice?: number
  offerPrice?: number
  validFrom?: string
  validTill?: string
  dealType?: string
  featured?: boolean
  active?: boolean
  termsAndConditions?: string
  relatedPackages?: SanityPackage[]
  seo?: any
}

export interface SanityBlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  coverImage?: any
  publishedAt?: string
  tags?: any[]
  author?: any
  body?: any
  seo?: any
}

// Package API
export const sanityPackageApi = {
  /**
   * Get all available packages
   */
  async getPackages(): Promise<SanityPackage[]> {
    try {
      const packages = await sanityClient.fetch<SanityPackage[]>(packagesQuery)
      return packages || []
    } catch (error) {
      console.error('Error fetching packages from Sanity:', error)
      return []
    }
  },

  /**
   * Get package by slug
   */
  async getPackageBySlug(slug: string): Promise<SanityPackage | null> {
    try {
      const pkg = await sanityClient.fetch<SanityPackage>(packageBySlugQuery, { slug })
      return pkg
    } catch (error) {
      console.error(`Error fetching package ${slug} from Sanity:`, error)
      return null
    }
  },

  /**
   * Get featured packages
   */
  async getFeaturedPackages(): Promise<SanityPackage[]> {
    try {
      const packages = await sanityClient.fetch<SanityPackage[]>(featuredPackagesQuery)
      return packages || []
    } catch (error) {
      console.error('Error fetching featured packages from Sanity:', error)
      return []
    }
  },

  /**
   * Get packages by destination slug
   */
  async getPackagesByDestination(destinationSlug: string): Promise<SanityPackage[]> {
    try {
      const packages = await sanityClient.fetch<SanityPackage[]>(
        packagesByDestinationQuery, 
        { destinationSlug }
      )
      return packages || []
    } catch (error) {
      console.error(`Error fetching packages for destination ${destinationSlug}:`, error)
      return []
    }
  },

  /**
   * Get packages by theme
   */
  async getPackagesByTheme(theme: string): Promise<SanityPackage[]> {
    try {
      const packages = await sanityClient.fetch<SanityPackage[]>(
        packagesByThemeQuery, 
        { theme }
      )
      return packages || []
    } catch (error) {
      console.error(`Error fetching packages for theme ${theme}:`, error)
      return []
    }
  },

  /**
   * Search packages with filters (client-side filtering)
   */
  async searchPackages(filters?: {
    destination?: string
    theme?: string
    budget?: [number, number]
    duration?: [number, number]
  }): Promise<SanityPackage[]> {
    try {
      let packages = await this.getPackages()

      if (!filters) return packages

      // Filter by destination
      if (filters.destination) {
        packages = packages.filter(pkg => 
          pkg.destination?.title?.toLowerCase().includes(filters.destination!.toLowerCase())
        )
      }

      // Filter by theme
      if (filters.theme) {
        packages = packages.filter(pkg => 
          pkg.theme?.includes(filters.theme!)
        )
      }

      // Filter by budget
      if (filters.budget) {
        const [minBudget, maxBudget] = filters.budget
        packages = packages.filter(pkg => 
          pkg.pricing?.basePrice >= minBudget && pkg.pricing?.basePrice <= maxBudget
        )
      }

      // Filter by duration
      if (filters.duration) {
        const [minDuration, maxDuration] = filters.duration
        packages = packages.filter(pkg => 
          pkg.duration >= minDuration && pkg.duration <= maxDuration
        )
      }

      return packages
    } catch (error) {
      console.error('Error searching packages from Sanity:', error)
      return []
    }
  }
}

// Destination API
export const sanityDestinationApi = {
  /**
   * Get all destinations
   */
  async getDestinations(): Promise<SanityDestination[]> {
    try {
      const destinations = await sanityClient.fetch<SanityDestination[]>(destinationsQuery)
      return destinations || []
    } catch (error) {
      console.error('Error fetching destinations from Sanity:', error)
      return []
    }
  },

  /**
   * Get destination by slug
   */
  async getDestinationBySlug(slug: string): Promise<SanityDestination | null> {
    try {
      const destination = await sanityClient.fetch<SanityDestination>(
        destinationBySlugQuery, 
        { slug }
      )
      return destination
    } catch (error) {
      console.error(`Error fetching destination ${slug} from Sanity:`, error)
      return null
    }
  },

  /**
   * Get popular destinations
   */
  async getPopularDestinations(): Promise<SanityDestination[]> {
    try {
      const destinations = await this.getDestinations()
      return destinations.filter(dest => dest.isPopular)
    } catch (error) {
      console.error('Error fetching popular destinations from Sanity:', error)
      return []
    }
  }
}

// Deals API
export const sanityDealApi = {
  /**
   * Get all active deals
   */
  async getDeals(): Promise<SanityDeal[]> {
    try {
      const deals = await sanityClient.fetch<SanityDeal[]>(dealsQuery)
      return deals || []
    } catch (error) {
      console.error('Error fetching deals from Sanity:', error)
      return []
    }
  },

  /**
   * Get deal by slug
   */
  async getDealBySlug(slug: string): Promise<SanityDeal | null> {
    try {
      const deal = await sanityClient.fetch<SanityDeal>(dealBySlugQuery, { slug })
      return deal
    } catch (error) {
      console.error(`Error fetching deal ${slug} from Sanity:`, error)
      return null
    }
  },

  /**
   * Get featured deals
   */
  async getFeaturedDeals(): Promise<SanityDeal[]> {
    try {
      const deals = await sanityClient.fetch<SanityDeal[]>(featuredDealsQuery)
      return deals || []
    } catch (error) {
      console.error('Error fetching featured deals from Sanity:', error)
      return []
    }
  }
}

// Blog API
export const sanityBlogApi = {
  /**
   * Get all blog posts
   */
  async getPosts(): Promise<SanityBlogPost[]> {
    try {
      const posts = await sanityClient.fetch<SanityBlogPost[]>(postsQuery)
      return posts || []
    } catch (error) {
      console.error('Error fetching blog posts from Sanity:', error)
      return []
    }
  },

  /**
   * Get blog post by slug
   */
  async getPostBySlug(slug: string): Promise<SanityBlogPost | null> {
    try {
      const post = await sanityClient.fetch<SanityBlogPost>(postBySlugQuery, { slug })
      return post
    } catch (error) {
      console.error(`Error fetching blog post ${slug} from Sanity:`, error)
      return null
    }
  }
}

// Unified export
export const sanityApi = {
  packages: sanityPackageApi,
  destinations: sanityDestinationApi,
  deals: sanityDealApi,
  blog: sanityBlogApi
}

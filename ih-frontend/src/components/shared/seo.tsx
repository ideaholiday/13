import Head from 'next/head'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  twitterCard?: 'summary' | 'summary_large_image'
  structuredData?: Record<string, any> | Record<string, any>[]
  noIndex?: boolean
  noFollow?: boolean
}

interface SEOComponentProps extends SEOProps {
  siteName?: string
  baseUrl?: string
}

const DEFAULT_TITLE = 'Idea Holiday - Your Dream Travel Partner'
const DEFAULT_DESCRIPTION = 'Book flights, hotels, and holiday packages at the best prices. Explore amazing destinations with Idea Holiday - your trusted travel companion.'
const DEFAULT_KEYWORDS = ['travel', 'flights', 'hotels', 'holiday packages', 'booking', 'vacation', 'tourism']
const DEFAULT_SITE_NAME = 'Idea Holiday'
const DEFAULT_OG_IMAGE = '/images/og-default.jpg'

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
  noFollow = false,
  siteName = DEFAULT_SITE_NAME,
  baseUrl = ''
}: SEOComponentProps) {
  
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${siteName}`
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      {fullCanonicalUrl && (
        <link rel="canonical" href={fullCanonicalUrl} />
      )}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={`${title} - ${siteName}`} />
      {fullCanonicalUrl && (
        <meta property="og:url" content={fullCanonicalUrl} />
      )}

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(structuredData) ? structuredData : [structuredData]
            )
          }}
        />
      )}
    </Head>
  )
}

// Predefined SEO configurations for different page types
export const SEOConfigs = {
  home: {
    title: 'Idea Holiday - Your Dream Travel Partner',
    description: 'Book flights, hotels, and holiday packages at the best prices. Explore amazing destinations with Idea Holiday - your trusted travel companion.',
    keywords: ['travel booking', 'cheap flights', 'hotel deals', 'holiday packages', 'vacation planning']
  },
  
  flights: {
    title: 'Flight Booking - Compare & Book Cheap Flights',
    description: 'Find and book cheap flights to destinations worldwide. Compare prices from multiple airlines and get the best deals on flight tickets.',
    keywords: ['flight booking', 'cheap flights', 'airline tickets', 'domestic flights', 'international flights']
  },
  
  hotels: {
    title: 'Hotel Booking - Find Best Hotel Deals',
    description: 'Book hotels at the best prices. Choose from luxury resorts to budget accommodations with instant confirmation and free cancellation.',
    keywords: ['hotel booking', 'hotel deals', 'accommodation', 'resort booking', 'cheap hotels']
  },
  
  packages: {
    title: 'Holiday Packages - Curated Travel Experiences',
    description: 'Discover amazing holiday packages with flights, hotels, and activities included. Book complete vacation packages at unbeatable prices.',
    keywords: ['holiday packages', 'vacation packages', 'travel deals', 'all-inclusive packages', 'tour packages']
  },
  
  deals: {
    title: 'Travel Deals & Offers - Limited Time Discounts',
    description: 'Grab the latest travel deals and offers on flights, hotels, and packages. Save more with exclusive discounts and promotional codes.',
    keywords: ['travel deals', 'flight offers', 'hotel discounts', 'travel promotions', 'vacation deals']
  }
}

// Generate structured data for different content types
export const StructuredDataGenerators = {
  website: (siteName: string, baseUrl: string) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }),

  organization: (name: string, logo: string, contactInfo?: any) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "logo": logo,
    "url": "https://ideaholiday.com",
    ...(contactInfo && {
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": contactInfo.phone,
        "contactType": "customer service"
      }
    })
  }),

  travelAgency: (name: string, description: string, baseUrl: string) => ({
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": name,
    "description": description,
    "url": baseUrl,
    "serviceType": ["Flight Booking", "Hotel Reservation", "Package Tours", "Travel Planning"]
  }),

  product: (name: string, description: string, price?: number, currency?: string) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    ...(price && {
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency || "INR",
        "availability": "https://schema.org/InStock"
      }
    })
  })
}
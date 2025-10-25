'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[]
  showHome?: boolean
}

export function Breadcrumbs({ customItems, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return showHome ? [{ label: 'Home', href: '/' }, ...customItems] : customItems
    }

    const pathSegments = (pathname || '').split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    if (showHome) {
      breadcrumbs.push({ label: 'Home', href: '/' })
    }

    let currentPath = ''
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Generate human-readable labels
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Handle special cases
      switch (segment) {
        case 'flights':
          label = 'Flights'
          break
        case 'hotels':
          label = 'Hotels'
          break
        case 'packages':
          label = 'Holiday Packages'
          break
        case 'search':
          label = 'Search Results'
          break
        case 'deals':
          label = 'Deals & Offers'
          break
        case 'blog':
          label = 'Travel Blog'
          break
        case 'cms':
          label = 'Information'
          break
        case 'dashboard':
          label = 'My Dashboard'
          break
        case 'trains':
          label = 'Train Booking'
          break
        case 'buses':
          label = 'Bus Booking'
          break
        case 'cabs':
          label = 'Cab Booking'
          break
        case 'plan':
          label = 'Trip Planner'
          break
        default:
          // Keep the capitalized version
          break
      }

      breadcrumbs.push({
        label,
        href: currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbItems = generateBreadcrumbs()

  if (breadcrumbItems.length <= 1) {
    return null // Don't show breadcrumbs for home page only
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="bg-slate-50 border-b border-slate-200 py-3"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1
            const isHome = index === 0 && showHome

            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
                )}
                
                {isLast ? (
                  <span className="text-sapphire-900 font-medium flex items-center">
                    {isHome && <Home className="w-4 h-4 mr-1" />}
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href}
                    className="text-slate-600 hover:text-sapphire-700 transition-colors flex items-center hover:underline"
                  >
                    {isHome && <Home className="w-4 h-4 mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

// Utility function to generate structured data for breadcrumbs
export function generateBreadcrumbStructuredData(items: BreadcrumbItem[], baseUrl: string = '') {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${baseUrl}${item.href}`
    }))
  }
}
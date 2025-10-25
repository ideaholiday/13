'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Plane, 
  Building, 
  Package, 
  MapPin, 
  Train, 
  Bus, 
  Car,
  Calendar,
  User,
  Heart,
  Clock,
  Settings
} from 'lucide-react'

interface QuickNavItem {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

interface QuickNavProps {
  variant?: 'horizontal' | 'vertical'
  className?: string
}

export function QuickNav({ variant = 'horizontal', className = '' }: QuickNavProps) {
  const pathname = usePathname()

  const navItems: QuickNavItem[] = [
    {
      label: 'Flights',
      href: '/flights',
      icon: <Plane className="w-4 h-4" />,
    },
    {
      label: 'Hotels',
      href: '/hotels',
      icon: <Building className="w-4 h-4" />,
    },
    {
      label: 'Packages',
      href: '/packages',
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: 'Trains',
      href: '/trains',
      icon: <Train className="w-4 h-4" />,
    },
    {
      label: 'Buses',
      href: '/buses',
      icon: <Bus className="w-4 h-4" />,
    },
    {
      label: 'Cabs',
      href: '/cabs',
      icon: <Car className="w-4 h-4" />,
    },
  ]

  // Mark active items based on pathname
  const itemsWithActive = navItems.map(item => ({
    ...item,
    active: (pathname || '').startsWith(item.href)
  }))

  if (variant === 'vertical') {
    return (
      <nav className={`space-y-1 ${className}`}>
        {itemsWithActive.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${item.active 
                ? 'bg-sapphire-100 text-sapphire-900 border border-sapphire-200' 
                : 'text-slate-600 hover:text-sapphire-700 hover:bg-slate-100'
              }
            `}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {itemsWithActive.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${item.active 
              ? 'bg-sapphire-100 text-sapphire-900 border border-sapphire-200' 
              : 'text-slate-600 hover:text-sapphire-700 hover:bg-slate-100'
            }
          `}
        >
          {item.icon}
          <span className="ml-2 hidden sm:inline">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

// Booking status navigation for user account/dashboard
export function BookingStatusNav() {
  const statusItems = [
    { label: 'Upcoming', icon: <Clock className="w-4 h-4" />, count: 2 },
    { label: 'Past Trips', icon: <Calendar className="w-4 h-4" />, count: 5 },
    { label: 'Wishlist', icon: <Heart className="w-4 h-4" />, count: 8 },
    { label: 'Profile', icon: <User className="w-4 h-4" />, count: null },
  ]

  return (
    <div className="flex items-center space-x-4">
      {statusItems.map((item) => (
        <button
          key={item.label}
          className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-sapphire-700 hover:bg-slate-100 transition-colors"
        >
          {item.icon}
          <span className="ml-2">{item.label}</span>
          {item.count && (
            <span className="ml-2 bg-sapphire-100 text-sapphire-700 text-xs px-2 py-1 rounded-full">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
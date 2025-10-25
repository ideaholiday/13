"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Home, Search, User, Ticket, Percent } from 'lucide-react'
import React from 'react'

type NavItem = {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badgeCount?: number
}

export type MobileBottomNavProps = {
  items?: NavItem[]
  className?: string
  safeArea?: boolean
  vibrateOnTap?: boolean
}

const defaultItems: NavItem[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'search', label: 'Search', href: '/flights', icon: Search },
  { key: 'bookings', label: 'Bookings', href: '/dashboard/bookings', icon: Ticket },
  { key: 'offers', label: 'Offers', href: '/packages', icon: Percent },
  { key: 'account', label: 'Account', href: '/account', icon: User },
]

export function MobileBottomNav({ items = defaultItems, className, safeArea = true, vibrateOnTap = true }: MobileBottomNavProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  function handleTap() {
    if (vibrateOnTap && typeof window !== 'undefined' && 'vibrate' in navigator) {
      // light haptic feedback on supported devices
      try {
        // @ts-ignore - not all TS lib doms include vibrate
        navigator.vibrate?.(10)
      } catch {}
    }
  }

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden',
        safeArea && 'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-5 gap-1 px-2 py-1.5">
        {items.map((item) => {
          const ActiveIcon = item.icon
          const active = isActive(item.href)
          return (
            <li key={item.key} className="relative">
              <Link href={item.href} prefetch className="block">
                <motion.button
                  type="button"
                  onClick={handleTap}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    'flex w-full flex-col items-center justify-center rounded-xl px-2 py-1.5 text-xs transition',
                    active ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-full border text-slate-700 transition',
                      active
                        ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                    <ActiveIcon className={cn('h-5 w-5', active && 'fill-rose-100')} />
                  </span>
                  <span className="mt-1 leading-none">{item.label}</span>
                  {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                    <span className="absolute -right-0.5 top-0 inline-flex min-w-[1.25rem] -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {item.badgeCount > 99 ? '99+' : item.badgeCount}
                    </span>
                  )}
                </motion.button>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default MobileBottomNav

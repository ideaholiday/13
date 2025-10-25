'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  MapPin, 
  Phone,
  Globe,
  IndianRupee,
  User,
  Settings,
  LogOut,
  Plane,
  Building,
  Package,
  FileText,
  Home,
  Newspaper
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { NotificationCenter } from '@/components/shared/NotificationCenter'
import { LocaleSelector } from '@/components/shared/LocaleSelector'
import { AuthStatus } from './AuthStatus';

const mainNavItems = [
  { 
    href: '/', 
    label: 'Home', 
    icon: Home,
    description: 'Go to homepage' 
  },
  { 
    href: '/flights', 
    label: 'Flights', 
    icon: Plane,
    description: 'Search and book flights' 
  },
  { 
    href: '/hotels', 
    label: 'Hotels', 
    icon: Building,
    description: 'Find and book hotels' 
  },
  { 
    href: '/packages', 
    label: 'Packages', 
    icon: Package,
    description: 'Holiday packages and deals' 
  },
  { 
    href: '/blog', 
    label: 'Blog', 
    icon: Newspaper,
    description: 'Travel tips and guides' 
  },
]

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export default function Header() {
  const pathname = usePathname()
  const { 
    mobileMenuOpen, 
    setMobileMenuOpen, 
    currency, 
    setCurrency, 
    language, 
    setLanguage 
  } = useUIStore()

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]
  const currentLanguage = languages.find(l => l.code === language) || languages[0]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sapphire-900 to-emerald-900 text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:-translate-y-0.5">
              IH
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold font-display gradient-text">
                Idea Holiday
              </div>
              <div className="text-xs text-slate-600 -mt-1">
                Your Travel Partner
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
                    isActive
                      ? 'bg-sapphire-100 text-sapphire-900 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Locale Selector (Language & Currency) */}
            <LocaleSelector variant="compact" />

            {/* User Menu */}
            <AuthStatus />

            {/* CTA Button */}
            <Button 
              variant="gradient" 
              size="sm" 
              className="hidden md:flex"
              asChild
            >
              <Link href="/packages">
                Plan a Trip
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 rounded-xl px-3 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-sapphire-100 text-sapphire-900'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-sm opacity-70">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
              
              <div className="pt-4 border-t border-slate-200 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {/* Mobile Currency Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sapphire-500 focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mobile Language Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sapphire-500 focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button 
                  variant="gradient" 
                  className="w-full mt-4"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/packages">
                    Plan a Trip
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Bar */}
      <div className="bg-sapphire-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 opacity-90">
                <Phone className="h-3 w-3" />
                <span>+91 9696 777 391</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1 opacity-90">
                <MapPin className="h-3 w-3" />
                <span>New Delhi, India</span>
              </div>
            </div>
            <div className="hidden md:block opacity-90">
              <span>24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
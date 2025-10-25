'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  Camera,
  Mountain,
  Waves,
  Building,
  Compass,
  Filter,
  Search
} from 'lucide-react'
import { sanityApi } from '@/lib/sanity-api'
import type { SanityPackage } from '@/lib/sanity-api'

export function PackageExplorer() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    destination: '',
    theme: '',
    budget: [0, 100000] as [number, number],
    duration: [0, 15] as [number, number]
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string>('')

  // Fetch packages from Sanity
  const { data: sanityPackages, isLoading } = useQuery({
    queryKey: ['sanity-packages'],
    queryFn: async () => {
      return await sanityApi.packages.getPackages()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Apply filters client-side
  const packages = useMemo(() => {
    if (!sanityPackages) return []
    
    let filtered = [...sanityPackages]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.shortDescription?.toLowerCase().includes(query) ||
        pkg.destination?.title?.toLowerCase().includes(query) ||
        pkg.theme?.some(t => t.toLowerCase().includes(query))
      )
    }

    // Filter by destination
    if (filters.destination) {
      filtered = filtered.filter(pkg =>
        pkg.destination?.title?.toLowerCase().includes(filters.destination.toLowerCase())
      )
    }

    // Filter by theme
    if (filters.theme) {
      filtered = filtered.filter(pkg =>
        pkg.theme?.includes(filters.theme)
      )
    }

    // Filter by budget
    const [minBudget, maxBudget] = filters.budget
    if (minBudget > 0 || maxBudget < 100000) {
      filtered = filtered.filter(pkg =>
        pkg.pricing?.basePrice >= minBudget && pkg.pricing?.basePrice <= maxBudget
      )
    }

    // Filter by duration
    const [minDuration, maxDuration] = filters.duration
    if (minDuration > 0 || maxDuration < 15) {
      filtered = filtered.filter(pkg =>
        pkg.duration >= minDuration && pkg.duration <= maxDuration
      )
    }

    return filtered
  }, [sanityPackages, filters, searchQuery])

  const themes = [
    { id: 'adventure', name: 'Adventure', icon: 'component', IconComponent: Mountain, color: 'emerald' },
    { id: 'beach', name: 'Beach', icon: 'component', IconComponent: Waves, color: 'sapphire' },
    { id: 'culture', name: 'Culture', icon: 'component', IconComponent: Building, color: 'ruby' },
    { id: 'romance', name: 'Romance', icon: '💕', color: 'gold' },
    { id: 'family', name: 'Family', icon: 'component', IconComponent: Users, color: 'emerald' },
    { id: 'city', name: 'City Break', icon: 'component', IconComponent: Building, color: 'slate' }
  ]

  const destinations = [
    'Dubai', 'Singapore', 'Thailand', 'Maldives', 'Bali', 'Japan', 'Switzerland', 'Turkey'
  ]

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    setFilters(prev => ({ ...prev, theme: themeId }))
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const formatDuration = (days: number) => {
    return `${days} Day${days !== 1 ? 's' : ''}`
  }

  const renderThemeIcon = (theme: any) => {
    if (theme.icon === 'component' && theme.IconComponent) {
      const IconComponent = theme.IconComponent
      return <IconComponent className="w-6 h-6 mx-auto mb-1" />
    }
    return <span className="text-xl block mb-1">{theme.icon}</span>
  }

  return (
    <div className="space-y-8">
      {/* Search & Filters Section */}
      <Card className="bg-gradient-to-r from-gold-50 to-sapphire-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search" className="text-slate-700 mb-2 block font-medium">
                  Search Packages
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Destination, theme, or activity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Theme Selection */}
            <div>
              <Label className="text-slate-700 mb-3 block font-medium">Popular Themes</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedTheme === theme.id
                        ? 'border-gold-500 bg-gold-50 text-gold-900'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {renderThemeIcon(theme)}
                    <span className="text-xs font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-700 mb-2 block text-sm">Destination</Label>
                <select 
                  value={filters.destination}
                  onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:border-gold-500 focus:outline-none"
                >
                  <option value="">All Destinations</option>
                  {destinations.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-slate-700 mb-2 block text-sm">Budget Range</Label>
                <select 
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-').map(Number)
                    setFilters(prev => ({ ...prev, budget: [min, max] }))
                  }}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:border-gold-500 focus:outline-none"
                >
                  <option value="0-100000">All Budgets</option>
                  <option value="0-25000">Under ₹25,000</option>
                  <option value="25000-50000">₹25,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                  <option value="100000-999999">Above ₹1,00,000</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-700 mb-2 block text-sm">Duration</Label>
                <select 
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-').map(Number)
                    setFilters(prev => ({ ...prev, duration: [min, max] }))
                  }}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:border-gold-500 focus:outline-none"
                >
                  <option value="0-15">All Durations</option>
                  <option value="1-3">1-3 Days</option>
                  <option value="4-7">4-7 Days</option>
                  <option value="8-15">8-15 Days</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilters({ destination: '', theme: '', budget: [0, 100000], duration: [0, 15] })}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-sapphire-900">
            {selectedTheme ? themes.find(t => t.id === selectedTheme)?.name + ' Packages' : 'All Packages'}
          </h2>
          <p className="text-slate-600">
            {isLoading ? 'Searching...' : `${packages?.length || 0} packages found`}
          </p>
        </div>
      </div>

      {/* Package Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-slate-200 rounded-t-lg"></div>
              <CardContent className="p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages?.map((pkg: SanityPackage) => (
            <Card key={pkg._id} className="group hover:shadow-xl transition-shadow overflow-hidden">
              {/* Package Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-sapphire-200 to-gold-200 relative overflow-hidden">
                {pkg.coverImage && (
                  <img src={pkg.coverImage} alt={pkg.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-sapphire-900">
                    {formatDuration(pkg.duration)}
                  </Badge>
                </div>
                {pkg.rating && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-gold-500 fill-current mr-1" />
                      <span className="text-xs font-medium text-sapphire-900">{pkg.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                {pkg.featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gold-600 text-white">Featured</Badge>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-gold-200 transition-colors">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{pkg.destination?.title || 'Unknown'}, {pkg.destination?.country || ''}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Package Info */}
                <div className="space-y-2">
                  <p className="text-slate-600 text-sm line-clamp-2">{pkg.shortDescription || pkg.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDuration(pkg.duration)}</span>
                    </div>
                    {pkg.groupSize && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{pkg.groupSize.min}-{pkg.groupSize.max} guests</span>
                      </div>
                    )}
                  </div>

                  {/* Theme badges */}
                  {pkg.theme && pkg.theme.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pkg.theme.slice(0, 3).map((theme, index) => (
                        <Badge key={index} variant="secondary" className="text-xs capitalize">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Highlights */}
                  {pkg.highlights && pkg.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pkg.highlights.slice(0, 2).map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-slate-500">Starting from</p>
                    <p className="text-xl font-bold text-sapphire-900">
                      {formatPrice(pkg.pricing?.basePrice || 0)}
                    </p>
                    <p className="text-xs text-slate-500">{pkg.pricing?.pricePerPerson ? 'per person' : 'total'}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="bg-gold-600 hover:bg-gold-700" onClick={() => router.push(`/packages/${pkg.slug}`)}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert('Quick Book coming soon!')}>
                      Quick Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {packages?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No packages found</h3>
          <p className="text-slate-500 mb-4">Try adjusting your search criteria or browse all packages</p>
          <Button onClick={() => setFilters({ destination: '', theme: '', budget: [0, 100000], duration: [0, 15] })}>
            View All Packages
          </Button>
        </div>
      )}
    </div>
  )
}
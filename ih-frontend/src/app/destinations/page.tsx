'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  MapPin,
  Star,
  Users,
  Calendar,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Heart,
  Share2,
  ArrowRight,
  Search,
  Filter,
  Globe,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function DestinationsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const regions = [
    { value: 'all', label: 'All Destinations', count: 24 },
    { value: 'asia', label: 'Asia', count: 12 },
    { value: 'europe', label: 'Europe', count: 6 },
    { value: 'americas', label: 'Americas', count: 4 },
    { value: 'africa', label: 'Africa', count: 2 }
  ]

  const budgetRanges = [
    { value: 'all', label: 'All Budgets' },
    { value: 'budget', label: 'Budget (Under ₹50k)' },
    { value: 'mid-range', label: 'Mid-range (₹50k-₹1L)' },
    { value: 'luxury', label: 'Luxury (₹1L+)' }
  ]

  const featuredDestinations = [
    {
      id: 1,
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'asia',
      description: 'Experience luxury, shopping, desert safaris, and iconic landmarks in the heart of the Middle East.',
      image: '/images/destinations/dubai.jpg',
      rating: 4.8,
      reviewCount: 15420,
      packagesCount: 15,
      startingPrice: 25999,
      currency: 'INR',
      bestTime: 'November to March',
      temperature: '25°C',
      highlights: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall', 'Palm Jumeirah'],
      tags: ['luxury', 'shopping', 'desert', 'modern'],
      featured: true,
      trending: true,
      budget: 'luxury',
      duration: '5-7 days'
    },
    {
      id: 2,
      name: 'Bali',
      country: 'Indonesia',
      region: 'asia',
      description: 'Discover beautiful beaches, ancient temples, lush rice terraces, and vibrant culture.',
      image: '/images/destinations/bali.jpg',
      rating: 4.7,
      reviewCount: 12850,
      packagesCount: 12,
      startingPrice: 19500,
      currency: 'INR',
      bestTime: 'April to October',
      temperature: '28°C',
      highlights: ['Ubud', 'Seminyak', 'Tanah Lot', 'Mount Batur'],
      tags: ['beaches', 'culture', 'temples', 'nature'],
      featured: true,
      trending: false,
      budget: 'mid-range',
      duration: '4-6 days'
    },
    {
      id: 3,
      name: 'Singapore',
      country: 'Singapore',
      region: 'asia',
      description: 'A perfect blend of modern attractions, cultural diversity, and family-friendly experiences.',
      image: '/images/destinations/singapore.jpg',
      rating: 4.6,
      reviewCount: 18750,
      packagesCount: 8,
      startingPrice: 28999,
      currency: 'INR',
      bestTime: 'Year-round',
      temperature: '30°C',
      highlights: ['Marina Bay Sands', 'Sentosa Island', 'Gardens by the Bay', 'Universal Studios'],
      tags: ['family', 'modern', 'attractions', 'shopping'],
      featured: true,
      trending: true,
      budget: 'luxury',
      duration: '3-5 days'
    }
  ]

  const destinations = [
    {
      id: 4,
      name: 'Thailand',
      country: 'Thailand',
      region: 'asia',
      description: 'Explore vibrant cities, beautiful islands, rich culture, and delicious cuisine.',
      image: '/images/destinations/thailand.jpg',
      rating: 4.5,
      reviewCount: 8950,
      packagesCount: 18,
      startingPrice: 22999,
      currency: 'INR',
      bestTime: 'November to March',
      temperature: '27°C',
      highlights: ['Bangkok', 'Phuket', 'Chiang Mai', 'Krabi'],
      tags: ['culture', 'islands', 'food', 'temples'],
      featured: false,
      trending: false,
      budget: 'mid-range',
      duration: '5-7 days'
    },
    {
      id: 5,
      name: 'Maldives',
      country: 'Maldives',
      region: 'asia',
      description: 'Paradise on earth with crystal-clear waters, overwater villas, and pristine beaches.',
      image: '/images/destinations/maldives.jpg',
      rating: 4.9,
      reviewCount: 12300,
      packagesCount: 6,
      startingPrice: 45000,
      currency: 'INR',
      bestTime: 'November to April',
      temperature: '29°C',
      highlights: ['Overwater Villas', 'Snorkeling', 'Spa Retreats', 'Sunset Cruises'],
      tags: ['honeymoon', 'luxury', 'beaches', 'romantic'],
      featured: false,
      trending: true,
      budget: 'luxury',
      duration: '4-6 days'
    },
    {
      id: 6,
      name: 'Nepal',
      country: 'Nepal',
      region: 'asia',
      description: 'Adventure paradise with Himalayan peaks, ancient temples, and rich cultural heritage.',
      image: '/images/destinations/nepal.jpg',
      rating: 4.4,
      reviewCount: 15600,
      packagesCount: 10,
      startingPrice: 15999,
      currency: 'INR',
      bestTime: 'October to May',
      temperature: '20°C',
      highlights: ['Kathmandu', 'Pokhara', 'Everest Base Camp', 'Chitwan National Park'],
      tags: ['adventure', 'trekking', 'mountains', 'culture'],
      featured: false,
      trending: false,
      budget: 'budget',
      duration: '7-10 days'
    },
    {
      id: 7,
      name: 'Switzerland',
      country: 'Switzerland',
      region: 'europe',
      description: 'Breathtaking Alpine landscapes, charming cities, and world-class skiing.',
      image: '/images/destinations/switzerland.jpg',
      rating: 4.8,
      reviewCount: 9870,
      packagesCount: 5,
      startingPrice: 85000,
      currency: 'INR',
      bestTime: 'June to September',
      temperature: '18°C',
      highlights: ['Zurich', 'Interlaken', 'Zermatt', 'Lucerne'],
      tags: ['mountains', 'scenic', 'luxury', 'adventure'],
      featured: false,
      trending: true,
      budget: 'luxury',
      duration: '6-8 days'
    },
    {
      id: 8,
      name: 'Japan',
      country: 'Japan',
      region: 'asia',
      description: 'Experience ancient traditions, modern technology, and unique cultural experiences.',
      image: '/images/destinations/japan.jpg',
      rating: 4.7,
      reviewCount: 11200,
      packagesCount: 7,
      startingPrice: 65000,
      currency: 'INR',
      bestTime: 'March to May',
      temperature: '22°C',
      highlights: ['Tokyo', 'Kyoto', 'Mount Fuji', 'Osaka'],
      tags: ['culture', 'technology', 'temples', 'food'],
      featured: false,
      trending: false,
      budget: 'luxury',
      duration: '7-10 days'
    },
    {
      id: 9,
      name: 'Turkey',
      country: 'Turkey',
      region: 'asia',
      description: 'Where East meets West with rich history, stunning architecture, and diverse landscapes.',
      image: '/images/destinations/turkey.jpg',
      rating: 4.3,
      reviewCount: 18900,
      packagesCount: 9,
      startingPrice: 35000,
      currency: 'INR',
      bestTime: 'April to October',
      temperature: '24°C',
      highlights: ['Istanbul', 'Cappadocia', 'Pamukkale', 'Antalya'],
      tags: ['history', 'culture', 'architecture', 'nature'],
      featured: false,
      trending: true,
      budget: 'mid-range',
      duration: '6-8 days'
    }
  ]

  const allDestinations = [...featuredDestinations, ...destinations]

  const filteredDestinations = allDestinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.highlights.some(highlight => highlight.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesRegion = selectedRegion === 'all' || destination.region === selectedRegion
    const matchesBudget = selectedBudget === 'all' || destination.budget === selectedBudget
    
    return matchesSearch && matchesRegion && matchesBudget
  })

  const destinationsPerPage = 6
  const totalPages = Math.ceil(filteredDestinations.length / destinationsPerPage)
  const paginatedDestinations = filteredDestinations.slice(
    (currentPage - 1) * destinationsPerPage,
    currentPage * destinationsPerPage
  )

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getBudgetColor = (budget: string) => {
    const colors = {
      budget: 'from-green-500 to-green-700',
      'mid-range': 'from-blue-500 to-blue-700',
      luxury: 'from-purple-500 to-purple-700'
    }
    return colors[budget as keyof typeof colors] || 'from-gray-500 to-gray-700'
  }

  const getRegionColor = (region: string) => {
    const colors = {
      asia: 'from-red-500 to-red-700',
      europe: 'from-blue-500 to-blue-700',
      americas: 'from-green-500 to-green-700',
      africa: 'from-orange-500 to-orange-700'
    }
    return colors[region as keyof typeof colors] || 'from-gray-500 to-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10"
        />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6"
            >
              <Globe className="w-4 h-4" />
              Explore the World
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 via-purple-900 to-emerald-900 bg-clip-text text-transparent">
                Destinations
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Travel to the world's most beautiful destinations with Idea Holiday Pvt Ltd. 
              Whether you're planning a romantic honeymoon, family vacation, or group tour, 
              we bring you exclusive deals to top travel spots.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-12"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search destinations, countries, experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-2">
                {regions.map((region) => (
                  <Button
                    key={region.value}
                    variant={selectedRegion === region.value ? 'default' : 'outline'}
                    onClick={() => setSelectedRegion(region.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedRegion === region.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {region.label}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {region.count}
                    </Badge>
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                {budgetRanges.map((budget) => (
                  <Button
                    key={budget.value}
                    variant={selectedBudget === budget.value ? 'default' : 'outline'}
                    onClick={() => setSelectedBudget(budget.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedBudget === budget.value
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                    }`}
                  >
                    {budget.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                Featured Destinations
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Handpicked destinations that offer unforgettable experiences and incredible value.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50 overflow-hidden">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Globe className="w-20 h-20 mx-auto mb-2" />
                        <span className="text-sm font-medium">{destination.name}</span>
                      </div>
                    </div>
                    
                    {destination.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    
                    {destination.trending && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4">
                      <Badge className={`bg-gradient-to-r ${getBudgetColor(destination.budget)} text-white`}>
                        <DollarSign className="w-3 h-3 mr-1" />
                        {destination.budget}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`bg-gradient-to-r ${getRegionColor(destination.region)} text-white`}>
                        {destination.region}
                      </Badge>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{destination.duration}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {destination.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{destination.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {destination.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {destination.reviewCount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Plane className="w-4 h-4" />
                        {destination.packagesCount} packages
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {destination.highlights.slice(0, 3).map((highlight) => (
                        <Badge key={highlight} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(destination.startingPrice, destination.currency)}
                        </div>
                        <div className="text-sm text-gray-500">starting from</div>
                      </div>
                      
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
                        Explore
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Destinations */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                All Destinations
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Discover amazing destinations across the globe with our curated collection of travel experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Globe className="w-16 h-16 mx-auto mb-2" />
                        <span className="text-sm font-medium">{destination.name}</span>
                      </div>
                    </div>
                    
                    {destination.trending && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`bg-gradient-to-r ${getRegionColor(destination.region)} text-white text-xs`}>
                        {destination.region}
                      </Badge>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{destination.duration}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {destination.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{destination.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {destination.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {(destination.reviewCount / 1000).toFixed(1)}k
                      </div>
                      <div className="flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        {destination.packagesCount}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(destination.startingPrice, destination.currency)}
                        </div>
                        <div className="text-xs text-gray-500">starting from</div>
                      </div>
                      
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center items-center gap-4 mt-12"
            >
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              Ready to Explore?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Let our travel experts help you plan the perfect trip to your dream destination. 
              Get personalized recommendations and exclusive deals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                <Plane className="w-5 h-5 mr-2" />
                Book Your Trip
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <MapPin className="w-5 h-5 mr-2" />
                Get Custom Quote
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <Users className="w-5 h-5 mr-2" />
                Talk to Expert
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

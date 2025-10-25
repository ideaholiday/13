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
  ChevronLeft,
  CheckCircle,
  Shield,
  Headphones,
  Gift,
  Tag,
  Timer,
  Navigation,
  Compass,
  Mountain,
  Crown,
  Waves,
  Building,
  TreePine,
  Coffee,
  Wifi,
  Car,
  Dumbbell,
  Waves as Pool,
  UtensilsCrossed,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import Link from 'next/link'

export default function PackagesPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [selectedDuration, setSelectedDuration] = useState([1, 15])
  const [selectedBudget, setSelectedBudget] = useState([10000, 200000])
  const [currentPage, setCurrentPage] = useState(1)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const destinations = [
    { value: 'all', label: 'All Destinations', count: 24 },
    { value: 'dubai', label: 'Dubai', count: 5 },
    { value: 'bali', label: 'Bali', count: 4 },
    { value: 'thailand', label: 'Thailand', count: 6 },
    { value: 'singapore', label: 'Singapore', count: 3 },
    { value: 'maldives', label: 'Maldives', count: 2 },
    { value: 'nepal', label: 'Nepal', count: 4 }
  ]

  const themes = [
    { value: 'all', label: 'All Themes', count: 24 },
    { value: 'adventure', label: 'Adventure', count: 6, icon: Mountain, color: 'from-green-500 to-green-700' },
    { value: 'beach', label: 'Beach', count: 5, icon: Waves, color: 'from-blue-500 to-blue-700' },
    { value: 'culture', label: 'Culture', count: 4, icon: Building, color: 'from-purple-500 to-purple-700' },
    { value: 'romance', label: 'Romance', count: 3, icon: Heart, color: 'from-pink-500 to-pink-700' },
    { value: 'family', label: 'Family', count: 4, icon: Users, color: 'from-orange-500 to-orange-700' },
    { value: 'luxury', label: 'Luxury', count: 2, icon: Crown, color: 'from-yellow-500 to-yellow-700' }
  ]

  const featuredPackages = [
    {
      id: 1,
      title: 'Dubai Luxury Escape',
      destination: 'Dubai',
      country: 'United Arab Emirates',
      duration: 5,
      theme: 'luxury',
      description: 'Experience the ultimate luxury in Dubai with 5-star accommodations, desert safaris, and iconic landmarks.',
      image: '/images/packages/dubai-luxury.jpg',
      rating: 4.8,
      reviewCount: 15420,
      price: 25999,
      originalPrice: 32999,
      currency: 'INR',
      discount: 21,
      groupSize: { min: 2, max: 6 },
      difficulty: 'easy',
      pace: 'relaxed',
      featured: true,
      trending: true,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '4 nights accommodation in 5-star hotel',
        'Daily breakfast',
        'Desert safari with dinner',
        'Burj Khalifa observation deck',
        'City tour with guide',
        'Airport transfers',
        'Travel insurance'
      ],
      highlights: [
        'Burj Khalifa observation deck',
        'Desert safari with camel ride',
        'Dubai Mall shopping',
        'Palm Jumeirah visit',
        'Dubai Fountain show'
      ],
      bestTime: 'November to March',
      departureDates: ['2024-02-15', '2024-03-01', '2024-03-15'],
      available: true
    },
    {
      id: 2,
      title: 'Bali Cultural Journey',
      destination: 'Bali',
      country: 'Indonesia',
      duration: 6,
      theme: 'culture',
      description: 'Immerse yourself in Balinese culture with temple visits, traditional ceremonies, and authentic experiences.',
      image: '/images/packages/bali-culture.jpg',
      rating: 4.7,
      reviewCount: 12850,
      price: 19500,
      originalPrice: 24500,
      currency: 'INR',
      discount: 20,
      groupSize: { min: 2, max: 8 },
      difficulty: 'easy',
      pace: 'moderate',
      featured: true,
      trending: false,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '5 nights accommodation in boutique hotel',
        'Daily breakfast',
        'Temple tour with guide',
        'Traditional cooking class',
        'Rice terrace visit',
        'Airport transfers',
        'Travel insurance'
      ],
      highlights: [
        'Tanah Lot temple sunset',
        'Ubud rice terraces',
        'Traditional Balinese cooking',
        'Sacred monkey forest',
        'Cultural dance performance'
      ],
      bestTime: 'April to October',
      departureDates: ['2024-02-20', '2024-03-05', '2024-03-20'],
      available: true
    },
    {
      id: 3,
      title: 'Thailand Adventure Package',
      destination: 'Thailand',
      country: 'Thailand',
      duration: 7,
      theme: 'adventure',
      description: 'Thrilling adventures in Thailand with island hopping, water sports, and cultural exploration.',
      image: '/images/packages/thailand-adventure.jpg',
      rating: 4.6,
      reviewCount: 18750,
      price: 22999,
      originalPrice: 28999,
      currency: 'INR',
      discount: 21,
      groupSize: { min: 2, max: 10 },
      difficulty: 'moderate',
      pace: 'active',
      featured: true,
      trending: true,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '6 nights accommodation',
        'Daily breakfast',
        'Island hopping tour',
        'Elephant sanctuary visit',
        'Thai cooking class',
        'Airport transfers',
        'Travel insurance'
      ],
      highlights: [
        'Phi Phi Islands tour',
        'Elephant sanctuary experience',
        'Thai cooking class',
        'Floating market visit',
        'Temple tour in Bangkok'
      ],
      bestTime: 'November to March',
      departureDates: ['2024-02-25', '2024-03-10', '2024-03-25'],
      available: true
    }
  ]

  const packages = [
    {
      id: 4,
      title: 'Singapore Family Fun',
      destination: 'Singapore',
      country: 'Singapore',
      duration: 4,
      theme: 'family',
      description: 'Perfect family vacation with theme parks, attractions, and kid-friendly activities.',
      image: '/images/packages/singapore-family.jpg',
      rating: 4.5,
      reviewCount: 8950,
      price: 28999,
      originalPrice: 34999,
      currency: 'INR',
      discount: 17,
      groupSize: { min: 2, max: 6 },
      difficulty: 'easy',
      pace: 'relaxed',
      featured: false,
      trending: false,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '3 nights accommodation',
        'Daily breakfast',
        'Universal Studios tickets',
        'Singapore Flyer',
        'Gardens by the Bay',
        'Airport transfers'
      ],
      highlights: [
        'Universal Studios Singapore',
        'Singapore Flyer',
        'Gardens by the Bay',
        'Marina Bay Sands',
        'Sentosa Island'
      ],
      bestTime: 'Year-round',
      departureDates: ['2024-02-28', '2024-03-12'],
      available: true
    },
    {
      id: 5,
      title: 'Maldives Honeymoon Paradise',
      destination: 'Maldives',
      country: 'Maldives',
      duration: 5,
      theme: 'romance',
      description: 'Romantic getaway in overwater villas with pristine beaches and crystal-clear waters.',
      image: '/images/packages/maldives-honeymoon.jpg',
      rating: 4.9,
      reviewCount: 12300,
      price: 45000,
      originalPrice: 55000,
      currency: 'INR',
      discount: 18,
      groupSize: { min: 2, max: 2 },
      difficulty: 'easy',
      pace: 'relaxed',
      featured: false,
      trending: true,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '4 nights overwater villa',
        'All meals included',
        'Snorkeling equipment',
        'Sunset cruise',
        'Spa treatment',
        'Airport transfers'
      ],
      highlights: [
        'Overwater villa stay',
        'Snorkeling in coral reefs',
        'Sunset cruise',
        'Couple spa treatment',
        'Private beach dinner'
      ],
      bestTime: 'November to April',
      departureDates: ['2024-02-18', '2024-03-08'],
      available: true
    },
    {
      id: 6,
      title: 'Nepal Trekking Adventure',
      destination: 'Nepal',
      country: 'Nepal',
      duration: 10,
      theme: 'adventure',
      description: 'Epic trekking adventure in the Himalayas with stunning mountain views and cultural experiences.',
      image: '/images/packages/nepal-trekking.jpg',
      rating: 4.4,
      reviewCount: 15600,
      price: 15999,
      originalPrice: 19999,
      currency: 'INR',
      discount: 20,
      groupSize: { min: 4, max: 12 },
      difficulty: 'challenging',
      pace: 'active',
      featured: false,
      trending: false,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '9 nights accommodation',
        'All meals included',
        'Trekking guide and porter',
        'Trekking permits',
        'Equipment rental',
        'Airport transfers'
      ],
      highlights: [
        'Everest Base Camp trek',
        'Kathmandu city tour',
        'Pokhara lake city',
        'Mountain flight',
        'Cultural village visit'
      ],
      bestTime: 'October to May',
      departureDates: ['2024-03-01', '2024-03-15'],
      available: true
    },
    {
      id: 7,
      title: 'Switzerland Alpine Beauty',
      destination: 'Switzerland',
      country: 'Switzerland',
      duration: 8,
      theme: 'luxury',
      description: 'Breathtaking Alpine landscapes, charming cities, and world-class experiences in Switzerland.',
      image: '/images/packages/switzerland-alpine.jpg',
      rating: 4.8,
      reviewCount: 9870,
      price: 85000,
      originalPrice: 105000,
      currency: 'INR',
      discount: 19,
      groupSize: { min: 2, max: 6 },
      difficulty: 'easy',
      pace: 'moderate',
      featured: false,
      trending: true,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '7 nights accommodation',
        'Daily breakfast',
        'Swiss Travel Pass',
        'Cable car rides',
        'City tours',
        'Airport transfers'
      ],
      highlights: [
        'Zurich city tour',
        'Interlaken adventure',
        'Zermatt Matterhorn',
        'Lucerne lake cruise',
        'Jungfraujoch excursion'
      ],
      bestTime: 'June to September',
      departureDates: ['2024-06-01', '2024-07-15'],
      available: true
    },
    {
      id: 8,
      title: 'Japan Cultural Experience',
      destination: 'Japan',
      country: 'Japan',
      duration: 9,
      theme: 'culture',
      description: 'Experience ancient traditions, modern technology, and unique cultural experiences in Japan.',
      image: '/images/packages/japan-culture.jpg',
      rating: 4.7,
      reviewCount: 11200,
      price: 65000,
      originalPrice: 80000,
      currency: 'INR',
      discount: 19,
      groupSize: { min: 2, max: 8 },
      difficulty: 'moderate',
      pace: 'moderate',
      featured: false,
      trending: false,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '8 nights accommodation',
        'Daily breakfast',
        'JR Pass',
        'Temple visits',
        'Cultural experiences',
        'Airport transfers'
      ],
      highlights: [
        'Tokyo city exploration',
        'Kyoto temples',
        'Mount Fuji visit',
        'Traditional tea ceremony',
        'Osaka food tour'
      ],
      bestTime: 'March to May',
      departureDates: ['2024-04-01', '2024-05-15'],
      available: true
    },
    {
      id: 9,
      title: 'Turkey Heritage Tour',
      destination: 'Turkey',
      country: 'Turkey',
      duration: 8,
      theme: 'culture',
      description: 'Explore rich history, stunning architecture, and diverse landscapes in Turkey.',
      image: '/images/packages/turkey-heritage.jpg',
      rating: 4.3,
      reviewCount: 18900,
      price: 35000,
      originalPrice: 42000,
      currency: 'INR',
      discount: 17,
      groupSize: { min: 2, max: 10 },
      difficulty: 'moderate',
      pace: 'moderate',
      featured: false,
      trending: true,
      inclusions: [
        'Return flights from Mumbai/Delhi',
        '7 nights accommodation',
        'Daily breakfast',
        'Guided city tours',
        'Hot air balloon ride',
        'Cultural experiences',
        'Airport transfers'
      ],
      highlights: [
        'Istanbul city tour',
        'Cappadocia hot air balloon',
        'Pamukkale thermal pools',
        'Antalya coastal city',
        'Traditional Turkish bath'
      ],
      bestTime: 'April to October',
      departureDates: ['2024-04-15', '2024-05-01'],
      available: true
    }
  ]

  const allPackages = [...featuredPackages, ...packages]

  const filteredPackages = allPackages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.highlights.some(highlight => highlight.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesDestination = selectedDestination === 'all' || pkg.destination.toLowerCase() === selectedDestination
    const matchesTheme = selectedTheme === 'all' || pkg.theme === selectedTheme
    const matchesDuration = pkg.duration >= selectedDuration[0] && pkg.duration <= selectedDuration[1]
    const matchesBudget = pkg.price >= selectedBudget[0] && pkg.price <= selectedBudget[1]
    
    return matchesSearch && matchesDestination && matchesTheme && matchesDuration && matchesBudget
  })

  const packagesPerPage = 6
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage)
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * packagesPerPage,
    currentPage * packagesPerPage
  )

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getThemeColor = (theme: string) => {
    const themeObj = themes.find(t => t.value === theme)
    return themeObj?.color || 'from-gray-500 to-gray-700'
  }

  const getThemeIcon = (theme: string) => {
    const themeObj = themes.find(t => t.value === theme)
    return themeObj?.icon || Globe
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'from-green-500 to-green-700',
      moderate: 'from-yellow-500 to-yellow-700',
      challenging: 'from-red-500 to-red-700'
    }
    return colors[difficulty as keyof typeof colors] || 'from-gray-500 to-gray-700'
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
              <Gift className="w-4 h-4" />
              Holiday Packages
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 via-purple-900 to-emerald-900 bg-clip-text text-transparent">
                Travel Packages
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Turn your travel dreams into reality with custom and fixed departure packages designed by travel experts. 
              From tropical islands to bustling cities, our curated holiday experiences include everything.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-12"
          >
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search packages, destinations, experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Destination Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {destinations.map((dest) => (
                      <option key={dest.value} value={dest.value}>
                        {dest.label} ({dest.count})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Theme Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {themes.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label} ({theme.count})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration: {selectedDuration[0]}-{selectedDuration[1]} days
                  </label>
                  <Slider
                    value={selectedDuration}
                    onValueChange={setSelectedDuration}
                    min={1}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                {/* Budget Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget: {formatPrice(selectedBudget[0], 'INR')} - {formatPrice(selectedBudget[1], 'INR')}
                  </label>
                  <Slider
                    value={selectedBudget}
                    onValueChange={setSelectedBudget}
                    min={10000}
                    max={200000}
                    step={5000}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Packages */}
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
                Featured Packages
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Handpicked packages that offer exceptional value and unforgettable experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {featuredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
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
                        <span className="text-sm font-medium">{pkg.title}</span>
                      </div>
                    </div>
                    
                    {pkg.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    
                    {pkg.trending && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-green-700 text-white">
                        {pkg.discount}% OFF
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`bg-gradient-to-r ${getThemeColor(pkg.theme)} text-white`}>
                        {(() => {
                          const IconComponent = getThemeIcon(pkg.theme)
                          return <IconComponent className="w-3 h-3 mr-1" />
                        })()}
                        {pkg.theme}
                      </Badge>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{pkg.duration} days</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {pkg.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {pkg.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {pkg.reviewCount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`bg-gradient-to-r ${getDifficultyColor(pkg.difficulty)} text-white text-xs`}>
                          {pkg.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {pkg.highlights.slice(0, 3).map((highlight) => (
                        <Badge key={highlight} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(pkg.price, pkg.currency)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(pkg.originalPrice, pkg.currency)}
                        </div>
                      </div>
                      
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
                        View Details
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

      {/* All Packages */}
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
                All Packages
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Explore our complete collection of travel packages designed for every type of traveler.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
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
                        <span className="text-sm font-medium">{pkg.title}</span>
                      </div>
                    </div>
                    
                    {pkg.trending && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-green-700 text-white text-xs">
                        {pkg.discount}% OFF
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`bg-gradient-to-r ${getThemeColor(pkg.theme)} text-white text-xs`}>
                        {(() => {
                          const IconComponent = getThemeIcon(pkg.theme)
                          return <IconComponent className="w-3 h-3 mr-1" />
                        })()}
                        {pkg.theme}
                      </Badge>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{pkg.duration} days</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {pkg.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{pkg.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {pkg.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {(pkg.reviewCount / 1000).toFixed(1)}k
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`bg-gradient-to-r ${getDifficultyColor(pkg.difficulty)} text-white text-xs`}>
                          {pkg.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(pkg.price, pkg.currency)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(pkg.originalPrice, pkg.currency)}
                        </div>
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
              Ready to Book Your Dream Trip?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Let our travel experts help you choose the perfect package for your next adventure. 
              Get personalized recommendations and exclusive deals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                <Plane className="w-5 h-5 mr-2" />
                Book Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Custom Quote
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                <Phone className="w-5 h-5 mr-2" />
                Call Expert
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
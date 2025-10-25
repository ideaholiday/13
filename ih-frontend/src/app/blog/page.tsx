'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Calendar,
  User,
  Clock,
  Tag,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Star,
  Eye,
  Heart,
  Share2,
  BookOpen,
  Globe,
  Plane,
  Hotel,
  MapPin,
  Sparkles,
  Zap,
  Award,
  Users,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { sanityClient } from '@/lib/sanity.client'
import { postsQuery } from '@/lib/sanity.queries'

export default function BlogPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const categories = [
    { value: 'all', label: 'All Posts', count: 24 },
    { value: 'destinations', label: 'Destinations', count: 8 },
    { value: 'travel-tips', label: 'Travel Tips', count: 6 },
    { value: 'guides', label: 'Travel Guides', count: 5 },
    { value: 'news', label: 'Travel News', count: 3 },
    { value: 'reviews', label: 'Reviews', count: 2 }
  ]

  const [featuredPosts, setFeaturedPosts] = useState<any[]>([])
  const [recentPosts, setRecentPosts] = useState<any[]>([])

  useEffect(() => {
    setIsLoaded(true)
    const load = async () => {
      try {
        const posts = await sanityClient.fetch(postsQuery)
        const list = posts || []
        setFeaturedPosts(list.slice(0, 3))
        setRecentPosts(list.slice(3))
      } catch {}
    }
    load()
  }, [])

  const featuredPostsFallback = [
    {
      id: 1,
      title: 'Ultimate Guide to Dubai: From Desert Safaris to Burj Khalifa Views',
      excerpt: 'Discover the magic of Dubai with our comprehensive guide covering everything from luxury shopping to desert adventures and iconic landmarks.',
      author: 'Sarah Johnson',
      authorAvatar: '/images/authors/sarah.jpg',
      publishedAt: '2024-01-15',
      readTime: '12 min read',
      category: 'destinations',
      tags: ['dubai', 'luxury', 'desert-safari', 'burj-khalifa'],
      image: '/images/blog/dubai-guide.jpg',
      views: 15420,
      likes: 892,
      featured: true,
      trending: true
    },
    {
      id: 2,
      title: '10 Essential Travel Hacks Every Backpacker Should Know',
      excerpt: 'Save money, pack smarter, and travel like a pro with these insider tips from experienced backpackers around the world.',
      author: 'Mike Chen',
      authorAvatar: '/images/authors/mike.jpg',
      publishedAt: '2024-01-12',
      readTime: '8 min read',
      category: 'travel-tips',
      tags: ['backpacking', 'budget-travel', 'tips', 'hacks'],
      image: '/images/blog/travel-hacks.jpg',
      views: 12850,
      likes: 756,
      featured: true,
      trending: false
    },
    {
      id: 3,
      title: 'Bali on a Budget: Complete 7-Day Itinerary Under ₹50,000',
      excerpt: 'Explore the beautiful island of Bali without breaking the bank. Our detailed itinerary covers temples, beaches, and cultural experiences.',
      author: 'Priya Sharma',
      authorAvatar: '/images/authors/priya.jpg',
      publishedAt: '2024-01-10',
      readTime: '15 min read',
      category: 'guides',
      tags: ['bali', 'budget', 'itinerary', 'indonesia'],
      image: '/images/blog/bali-budget.jpg',
      views: 18750,
      likes: 1024,
      featured: true,
      trending: true
    }
  ]

  const recentPostsFallback = [
    {
      id: 4,
      title: 'Singapore Food Guide: Where to Eat Like a Local',
      excerpt: 'From hawker centers to Michelin-starred restaurants, discover Singapore\'s incredible food scene.',
      author: 'David Lee',
      publishedAt: '2024-01-08',
      readTime: '10 min read',
      category: 'guides',
      tags: ['singapore', 'food', 'hawker-centers'],
      image: '/images/blog/singapore-food.jpg',
      views: 8950,
      likes: 423
    },
    {
      id: 5,
      title: 'Thailand Visa Requirements: Everything You Need to Know',
      excerpt: 'Complete guide to Thailand visa requirements, application process, and travel documents.',
      author: 'Lisa Wang',
      publishedAt: '2024-01-05',
      readTime: '6 min read',
      category: 'guides',
      tags: ['thailand', 'visa', 'requirements'],
      image: '/images/blog/thailand-visa.jpg',
      views: 12300,
      likes: 567
    },
    {
      id: 6,
      title: 'Best Time to Visit Maldives: Weather, Prices & Crowds',
      excerpt: 'Plan your perfect Maldives getaway by understanding the best seasons, weather patterns, and pricing.',
      author: 'Ahmed Hassan',
      publishedAt: '2024-01-03',
      readTime: '7 min read',
      category: 'destinations',
      tags: ['maldives', 'weather', 'best-time'],
      image: '/images/blog/maldives-weather.jpg',
      views: 15600,
      likes: 789
    },
    {
      id: 7,
      title: 'Travel Insurance: Why You Need It and How to Choose',
      excerpt: 'Protect your travel investment with the right insurance coverage. Learn what to look for and avoid.',
      author: 'Emma Thompson',
      publishedAt: '2024-01-01',
      readTime: '9 min read',
      category: 'travel-tips',
      tags: ['insurance', 'protection', 'travel-safety'],
      image: '/images/blog/travel-insurance.jpg',
      views: 9870,
      likes: 445
    },
    {
      id: 8,
      title: 'Hotel Booking Mistakes to Avoid: Expert Tips',
      excerpt: 'Common hotel booking mistakes that cost travelers money and how to avoid them.',
      author: 'James Wilson',
      publishedAt: '2023-12-28',
      readTime: '11 min read',
      category: 'travel-tips',
      tags: ['hotels', 'booking', 'tips'],
      image: '/images/blog/hotel-booking.jpg',
      views: 11200,
      likes: 623
    },
    {
      id: 9,
      title: 'Nepal Trekking Guide: Everest Base Camp vs Annapurna',
      excerpt: 'Compare the two most popular trekking routes in Nepal and choose the right one for your adventure.',
      author: 'Rajesh Kumar',
      publishedAt: '2023-12-25',
      readTime: '14 min read',
      category: 'destinations',
      tags: ['nepal', 'trekking', 'everest', 'annapurna'],
      image: '/images/blog/nepal-trekking.jpg',
      views: 18900,
      likes: 891
    }
  ]

  const usePosts = featuredPosts.length ? { featured: featuredPosts, recent: recentPosts } : { featured: featuredPostsFallback, recent: recentPostsFallback }
  const allPosts = [...usePosts.featured, ...usePosts.recent]

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const postsPerPage = 6
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      destinations: 'from-blue-500 to-blue-700',
      'travel-tips': 'from-green-500 to-green-700',
      guides: 'from-purple-500 to-purple-700',
      news: 'from-orange-500 to-orange-700',
      reviews: 'from-pink-500 to-pink-700'
    }
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-700'
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
              <BookOpen className="w-4 h-4" />
              Travel Blog & Tips
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-blue-900 via-purple-900 to-emerald-900 bg-clip-text text-transparent">
                Travel Blog
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay updated with travel news, destination guides, visa updates, and holiday inspirations from Idea Holiday experts. 
              From exploring offbeat places to travel hacks and top attractions.
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
                  placeholder="Search articles, destinations, tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {category.label}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
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
                Featured Articles
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Handpicked articles from our travel experts to inspire your next adventure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {(usePosts.featured).map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50 overflow-hidden">
                  <div className="relative">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Globe className="w-16 h-16 mx-auto mb-2" />
                          <span className="text-sm font-medium">Travel Image</span>
                        </div>
                      </div>
                    )}
                    
                    {post.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    
                    {post.trending && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
                        {post.category.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(post.tags || []).slice(0, 3).map((tag: any) => (
                        <Badge key={typeof tag === 'string' ? tag : tag.title} variant="outline" className="text-xs">
                          #{typeof tag === 'string' ? tag : tag.title}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{typeof post.author === 'string' ? post.author : post.author?.name}</div>
                          <div className="text-xs text-gray-500">{formatDate(post.publishedAt)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
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
                Latest Articles
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Fresh content from our travel experts covering destinations, tips, and industry news.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Globe className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-xs font-medium">Travel Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`bg-gradient-to-r ${getCategoryColor(post.category || 'guides')} text-white text-xs`}>
                        {(post.category || 'guides').replace('-', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{typeof post.author === 'string' ? post.author : post.author?.name}</div>
                          <div className="text-xs text-gray-500">{formatDate(post.publishedAt)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(post.views / 1000).toFixed(1)}k
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </div>
                      </div>
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

      {/* Newsletter CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              Stay Updated
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Subscribe to our newsletter and get the latest travel tips, destination guides, 
              and exclusive deals delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50"
              />
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold">
                Subscribe
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UnifiedFlightSearch } from '@/components/flight/UnifiedFlightSearch'
import { RecommendationsSection } from '@/components/shared/RecommendationsSection'
import Hero3D from '@/components/three/Hero3D'
import { 
  Plane, 
  Building, 
  Package,
  Search,
  Calendar,
  Users,
  Star,
  ChevronRight,
  MapPin,
  Shield,
  Clock,
  Award
} from 'lucide-react'
import { sanityClient } from '@/lib/sanity.client'
import { destinationsQuery, featuredPackagesQuery, postsQuery } from '@/lib/sanity.queries'

export default function HomePage() {
  // Structured Data for the website
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Idea Holiday",
    "description": "Your trusted travel partner for booking flights, hotels, and holiday packages at the best prices.",
    "url": "https://ideaholiday.com",
    "logo": "https://ideaholiday.com/logo.png",
    "serviceType": ["Flight Booking", "Hotel Reservation", "Holiday Packages", "Travel Planning"],
    "areaServed": "India",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/ideaholiday.in",
      "https://www.instagram.com/ideaholiday1/",
      "https://www.twitter.com/ideaholiday"
    ]
  }

  const [destinations, setDestinations] = useState<any[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [destinationsRes, postsRes] = await Promise.all([
          sanityClient.fetch(destinationsQuery),
          sanityClient.fetch(postsQuery)
        ])
        if (!mounted) return
        // Map destinations for cards (limit 4)
        const topDest = (destinationsRes || []).slice(0, 4).map((d: any) => ({
          name: d.title,
          image: d.image,
          packages: d.packageCount ?? 0,
          startingPrice: d.averagePrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(d.averagePrice) : '—'
        }))
        setDestinations(topDest)
        setFeaturedPosts((postsRes || []).slice(0, 3))
      } catch (e) {
        // ignore
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
      text: 'Amazing experience! The team handled everything perfectly. Our Dubai trip was unforgettable.',
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Delhi',
      rating: 5,
      text: 'Best prices and excellent service. Highly recommend for international travel planning.',
      image: '/api/placeholder/60/60'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-50 via-white to-ruby-50">
      {/* Modern Hero Section with Latest UI/UX Design */}
      <section className="relative h-[55vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Modern Gradient Background with Depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* Contemporary Geometric Patterns */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-16 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-24 right-1/3 w-36 h-36 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse delay-3000"></div>
          
          {/* Modern Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        {/* Contemporary Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400/40 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-emerald-400/40 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/40 rounded-full animate-ping delay-1500"></div>
        </div>

        {/* 3D Background - Only renders if feature flag is enabled */}
        {process.env.NEXT_PUBLIC_FEATURE_3D === 'true' && <Hero3D />}
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-10">
            {/* Modern Typography with Contemporary Effects */}
            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display relative leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Your Dream Journey
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent blur-sm opacity-30 -z-10">
                  Your Dream Journey
                </div>
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">
                <span className="bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 bg-clip-text text-transparent drop-shadow-xl">
                  Starts Here
                </span>
              </h2>
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
              Discover incredible destinations, find amazing deals, and create memories that last a lifetime
            </p>

            {/* Modern CTA Buttons with Contemporary Styling */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border border-white/10"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-2 border-white/20 text-white hover:bg-white/5 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:border-white/30"
              >
                <span className="relative z-10">Explore Destinations</span>
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Search Section with Perfect Spacing */}
      <div className="relative -mt-5 z-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Contemporary Search Section with Glass Morphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-3">
              <UnifiedFlightSearch variant="homepage" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern USP Cards Section with Contemporary Design */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 font-display">
              <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Why Choose Idea Holiday?
              </span>
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              Experience the difference with our premium travel services and unbeatable value
            </p>
          </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <div className="group relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                   <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-3xl text-center border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">
                     <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                       <Shield className="w-10 h-10 text-white" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-6">Best Price Guarantee</h3>
                     <p className="text-slate-600 leading-relaxed text-lg flex-grow">Find a lower price? We'll match it and give you extra savings!</p>
                   </div>
                 </div>

                 <div className="group relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                   <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-3xl text-center border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">
                     <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                       <Clock className="w-10 h-10 text-white" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-6">24/7 Support</h3>
                     <p className="text-slate-600 leading-relaxed text-lg flex-grow">Round-the-clock assistance for all your travel needs</p>
                   </div>
                 </div>

                 <div className="group relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                   <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-3xl text-center border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">
                     <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                       <Award className="w-10 h-10 text-white" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-6">Expert Planning</h3>
                     <p className="text-slate-600 leading-relaxed text-lg flex-grow">Personalized itineraries crafted by travel experts</p>
                   </div>
                 </div>

                 <div className="group relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                   <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-3xl text-center border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">
                     <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                       <Star className="w-10 h-10 text-white" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-6">Premium Experience</h3>
                     <p className="text-slate-600 leading-relaxed text-lg flex-grow">Luxury accommodations and exclusive experiences</p>
                   </div>
                 </div>
               </div>
        </div>
      </section>

      {/* AI-Driven Personalized Recommendations */}
      <RecommendationsSection />

      {/* Popular Destinations */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display gradient-text">
              Popular Destinations
            </h2>
            <p className="text-xl text-slate-600">Explore our handpicked travel packages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <div key={index} className="group relative glass-card rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <div className="aspect-[4/3] relative">
                  {destination.image ? (
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sapphire-200 to-ruby-200"></div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.packages} packages available</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Starting from</span>
                    <span className="text-lg font-bold text-sapphire-900">{destination.startingPrice}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 group-hover:bg-sapphire-600 group-hover:text-white transition-colors">
                    View Packages
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/packages">
              <Button size="lg" variant="outline" className="hover:bg-sapphire-600 hover:text-white">
                View All Destinations
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {featuredPosts.length > 0 && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display gradient-text">Latest from our Blog</h2>
              <p className="text-xl text-slate-600">Fresh insights and guides</p>
            </div>
          )}
          {featuredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {featuredPosts.map((post: any) => (
                <div key={post._id} className="glass-card p-6 rounded-2xl">
                  <h3 className="font-semibold text-sapphire-900 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{post.excerpt}</p>
                  <Link href={`/blog`}> <Button variant="outline" size="sm">Read More</Button></Link>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display gradient-text">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-slate-600">Real experiences from real customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-sapphire-300 to-ruby-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-sapphire-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-sapphire-600 to-ruby-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-display">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied travelers who chose Idea Holiday for their dream vacations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/flights">
              <Button size="lg" className="bg-white text-sapphire-600 hover:bg-white/90">
                Book Flights Now
              </Button>
            </Link>
            <Link href="/packages">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-sapphire-600">
                Explore Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, MapPin, Calendar, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRecommendations } from '@/hooks/use-enhancements'
import { useAuthStore } from '@/store'
import { Recommendation } from '@/types/enhancements'
import Link from 'next/link'
import Image from 'next/image'

export function RecommendationsSection() {
  const { user } = useAuthStore()
  const { data: recommendations, isLoading } = useRecommendations(user?.id)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-80 animate-pulse bg-gray-200" />
        ))}
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-emerald-600" />
            Personalized for You
          </h2>
          <p className="text-gray-600 mt-2">
            Handpicked recommendations based on your preferences
          </p>
        </div>
        <Link href="/recommendations">
          <Button variant="outline">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.slice(0, 4).map((rec: Recommendation, index: number) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={rec.image}
                  alt={rec.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {rec.score}% Match
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <MapPin className="h-4 w-4" />
                    {rec.destination}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{rec.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{rec.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg mb-3">
                  <Sparkles className="h-4 w-4" />
                  <span className="line-clamp-1">{rec.reason}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-sapphire-900">
                      ₹{rec.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-sapphire-900 to-emerald-900"
                    onClick={() => {
                      // Navigate to booking page or contact form
                      window.location.href = `/packages/${rec.id}`
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

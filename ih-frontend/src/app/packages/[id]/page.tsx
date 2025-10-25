'use client'

import { notFound } from 'next/navigation'
import { sanityApi } from '@/lib/sanity-api'
import type { SanityPackage } from '@/lib/sanity-api'
import { EnquiryFormModal } from '@/components/shared/EnquiryFormModal'
import { useState, useEffect } from 'react'

export default function PackageDetailsPage({ params }: { params: { id: string } }) {
  const [pkg, setPkg] = useState<SanityPackage | null>(null)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPackage() {
      setIsLoading(true)
      try {
        // Fetch from Sanity using slug
        const sanityPackage = await sanityApi.packages.getPackageBySlug(params.id)
        if (sanityPackage) {
          setPkg(sanityPackage)
        }
      } catch (error) {
        console.error('Failed to load package:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPackage()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-slate-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pkg) return notFound()
  if (!pkg) return notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sapphire-900 mb-2">{pkg.title}</h1>
          <div className="flex items-center gap-4 text-slate-600 mb-2">
            <span>{pkg.destination?.title || 'Unknown'}, {pkg.destination?.country || ''}</span>
            <span>• {pkg.duration} days</span>
            {pkg.theme && pkg.theme.length > 0 && <span>• {pkg.theme.join(', ')}</span>}
          </div>
          <p className="text-lg text-slate-700 mb-4">{pkg.shortDescription || pkg.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img 
              src={pkg.coverImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop'} 
              alt={pkg.title} 
              className="rounded-xl w-full object-cover aspect-[4/3]"
              onError={(e) => {
                // Fallback to a real image if placeholder fails
                e.currentTarget.src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop'
              }}
            />
            {pkg.images && pkg.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {pkg.images.slice(0, 4).map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`${pkg.title} - Image ${i + 1}`}
                    className="w-20 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=150&fit=crop'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-2">Inclusions</h2>
                <ul className="list-disc pl-5 text-slate-700 mb-4">
                  {pkg.inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
                </ul>
              </>
            )}
            {pkg.exclusions && pkg.exclusions.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-2">Exclusions</h2>
                <ul className="list-disc pl-5 text-slate-700 mb-4">
                  {pkg.exclusions.map((exc, i) => <li key={i}>{exc}</li>)}
                </ul>
              </>
            )}
            {pkg.pricing && (
              <div className="mt-6">
                <span className="text-lg font-bold text-sapphire-900">From ₹{pkg.pricing.basePrice.toLocaleString()}</span>
                <span className="text-sm text-slate-500 ml-2">{pkg.pricing.pricePerPerson ? 'per person' : 'total'}</span>
              </div>
            )}
          </div>
        </div>
        {pkg.itinerary && pkg.itinerary.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
            <div className="space-y-4">
              {pkg.itinerary.map(day => (
                <div key={day.day} className="bg-slate-50 rounded-lg p-4 border">
                  <div className="font-bold text-sapphire-900 mb-1">Day {day.day}: {day.title}</div>
                  <div className="text-slate-700">{day.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {pkg.highlights && pkg.highlights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Highlights</h2>
            <div className="flex flex-wrap gap-2">
              {pkg.highlights.map((h, i) => (
                <span key={i} className="bg-gold-100 text-gold-900 px-3 py-1 rounded-full text-xs font-medium">{h}</span>
              ))}
            </div>
          </div>
        )}
        {(pkg.rating || pkg.reviewCount) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="text-slate-600">
              {pkg.reviewCount || 0} reviews
              {pkg.rating && <span> • {pkg.rating.toFixed(1)} / 5</span>}
            </div>
          </div>
        )}
        <div className="text-center">
          <button 
            onClick={() => setIsEnquiryOpen(true)}
            className="bg-gold-600 hover:bg-gold-700 text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg transition"
          >
            Book This Package
          </button>
        </div>
      </div>

      <EnquiryFormModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        packageTitle={pkg.title}
        packageId={params.id}
      />
    </div>
  )
}

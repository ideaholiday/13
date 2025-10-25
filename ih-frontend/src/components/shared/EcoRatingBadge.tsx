'use client'

import { Leaf, Info } from 'lucide-react'
import { useEcoRating } from '@/hooks/use-enhancements'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface EcoRatingBadgeProps {
  propertyId: string
  propertyType: 'hotel' | 'package'
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
  showTooltip?: boolean
}

const getScoreGrade = (score: number): string => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  if (score >= 40) return 'E'
  return 'F'
}

const getLevelDescription = (level: 'low' | 'medium' | 'high' | 'excellent'): string => {
  switch (level) {
    case 'excellent':
      return 'Outstanding eco-friendly practices with multiple certifications'
    case 'high':
      return 'Strong commitment to sustainability and environmental protection'
    case 'medium':
      return 'Good environmental practices with room for improvement'
    case 'low':
      return 'Basic environmental considerations in place'
  }
}

const getRatingColor = (score: number): string => {
  const grade = getScoreGrade(score)
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-green-500 text-white border-green-600'
    case 'B':
      return 'bg-lime-500 text-white border-lime-600'
    case 'C':
      return 'bg-yellow-500 text-white border-yellow-600'
    case 'D':
      return 'bg-orange-500 text-white border-orange-600'
    case 'E':
    case 'F':
      return 'bg-red-500 text-white border-red-600'
    default:
      return 'bg-slate-400 text-white border-slate-500'
  }
}

export function EcoRatingBadge({
  propertyId,
  propertyType,
  variant = 'default',
  className,
  showTooltip = true
}: EcoRatingBadgeProps) {
  // useEcoRating only accepts "flight" or "hotel", so filter out "package"
  const apiType: 'flight' | 'hotel' = propertyType === 'package' ? 'hotel' : propertyType
  const { data: ecoRating, isLoading } = useEcoRating(propertyId, apiType)

  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-slate-200 rounded-lg', className)}>
        <div className="h-6 w-16"></div>
      </div>
    )
  }

  if (!ecoRating) {
    return null
  }

  if (variant === 'compact') {
    const grade = getScoreGrade(ecoRating.score)
    return (
      <div 
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border',
          getRatingColor(ecoRating.score),
          className
        )}
        title={showTooltip ? `Eco Rating: ${grade} (${ecoRating.score}/100) - ${getLevelDescription(ecoRating.level)}` : undefined}
      >
        <Leaf className="w-3 h-3" />
        <span>{grade}</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    const grade = getScoreGrade(ecoRating.score)
    const description = getLevelDescription(ecoRating.level)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm', className)}
      >
        <div className="flex items-start gap-3">
          {/* Rating Badge */}
          <div
            className={cn(
              'flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl border-2 shadow-md',
              getRatingColor(ecoRating.score)
            )}
          >
            {grade}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-slate-900">Eco-Friendly Rating</h4>
            </div>
            <p className="text-sm text-slate-600 mb-3">{description}</p>

            {/* Certifications */}
            {ecoRating.certifications && ecoRating.certifications.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Certifications:
                </div>
                <div className="flex flex-wrap gap-2">
                  {ecoRating.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200"
                    >
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Green Features */}
            {ecoRating.features && ecoRating.features.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Green Features:
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {ecoRating.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  const grade = getScoreGrade(ecoRating.score)
  const description = getLevelDescription(ecoRating.level)
  
  return (
    <div className={cn('inline-block relative group', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 shadow-sm transition-transform hover:scale-105',
          getRatingColor(ecoRating.score)
        )}
      >
        <Leaf className="w-4 h-4" />
        <span>Eco Rating: {grade}</span>
      </div>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3 h-3" />
              <span className="font-semibold">Eco Rating: {grade} ({ecoRating.score}/100)</span>
            </div>
            <p className="leading-relaxed">{description}</p>
            {ecoRating.certifications && ecoRating.certifications.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <div className="font-medium mb-1">Certifications:</div>
                <div className="space-y-0.5">
                  {ecoRating.certifications.map((cert, idx) => (
                    <div key={idx} className="text-green-300">✓ {cert}</div>
                  ))}
                </div>
              </div>
            )}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-slate-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

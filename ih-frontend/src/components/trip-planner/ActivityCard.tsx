'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, DollarSign, Star, Grip } from 'lucide-react'
import type { Activity } from '@/types/itinerary'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ActivityCardProps {
  activity: Activity
  isDragging?: boolean
  dragHandleProps?: any
  showDragHandle?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function ActivityCard({
  activity,
  isDragging = false,
  dragHandleProps,
  showDragHandle = true,
  onEdit,
  onDelete
}: ActivityCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'INR' || currency === 'Rs') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount}`
  }

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      attraction: 'bg-blue-100 text-blue-700 border-blue-200',
      meal: 'bg-orange-100 text-orange-700 border-orange-200',
      transport: 'bg-gray-100 text-gray-700 border-gray-200',
      accommodation: 'bg-purple-100 text-purple-700 border-purple-200',
      shopping: 'bg-pink-100 text-pink-700 border-pink-200',
      adventure: 'bg-green-100 text-green-700 border-green-200',
      cultural: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      relaxation: 'bg-teal-100 text-teal-700 border-teal-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`
          relative overflow-hidden transition-all duration-200
          ${isDragging ? 'shadow-2xl ring-2 ring-primary rotate-2' : 'shadow-sm hover:shadow-md'}
          ${isDragging ? 'opacity-50' : 'opacity-100'}
        `}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Drag Handle */}
            {showDragHandle && (
              <div
                {...dragHandleProps}
                className="flex items-start pt-1 cursor-grab active:cursor-grabbing"
              >
                <Grip className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium mb-2 ${getActivityColor(activity.type)}`}
                  >
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </Badge>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {activity.title}
                  </h4>
                </div>
                
                {/* Rating */}
                {activity.rating && (
                  <div className="flex items-center gap-1 text-xs bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-yellow-700">{activity.rating}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {activity.description}
              </p>

              {/* Details */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {/* Time */}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {formatTime(activity.timeSlot.start)} - {formatTime(activity.timeSlot.end)}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{activity.location.name}</span>
                </div>

                {/* Cost */}
                {activity.cost && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="font-medium text-gray-700">
                      {formatCurrency(activity.cost.amount, activity.cost.currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activity.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {activity.tags.length > 3 && (
                    <span className="text-xs text-gray-400 px-1">
                      +{activity.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Booking Required Warning */}
              {activity.bookingRequired && (
                <div className="mt-2 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                  ⚠️ Advance booking required
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

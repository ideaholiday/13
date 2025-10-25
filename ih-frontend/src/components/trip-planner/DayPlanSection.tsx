'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Plus } from 'lucide-react'
import type { DayPlan, Activity } from '@/types/itinerary'
import { ActivityCard } from './ActivityCard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DayPlanSectionProps {
  day: DayPlan
  isDropTarget?: boolean
  onAddActivity?: () => void
  onEditActivity?: (activityId: string) => void
  onDeleteActivity?: (activityId: string) => void
  dragHandleProps?: (activity: Activity) => any
}

export function DayPlanSection({
  day,
  isDropTarget = false,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  dragHandleProps
}: DayPlanSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'INR' || currency === 'Rs') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount}`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: day.dayNumber * 0.05 }}
    >
      <Card 
        className={`
          transition-all duration-200
          ${isDropTarget ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}
        `}
      >
        <CardHeader className="pb-3">
          {/* Day Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {day.dayNumber}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {day.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-500 ml-10">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(day.date)}</span>
                </div>
                {day.totalCost && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">
                      {formatCurrency(day.totalCost.amount, day.totalCost.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Add Activity Button */}
            {onAddActivity && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAddActivity}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            )}
          </div>

          {/* Day Description */}
          {day.description && (
            <p className="text-sm text-gray-600 ml-10 mt-2">
              {day.description}
            </p>
          )}

          {/* Accommodation */}
          {day.accommodation && (
            <div className="ml-10 mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    {day.accommodation.name}
                  </p>
                  <p className="text-xs text-purple-600 mt-0.5">
                    Check-in: {day.accommodation.checkIn} • Check-out: {day.accommodation.checkOut}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Activities List */}
          <div className="space-y-3 ml-10">
            {day.activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 prose prose-lg max-w-2xl mx-auto"
              >
                {/* Show beautiful AI-generated dayBullets or description */}
                {day.dayBullets && day.dayBullets.length > 0 ? (
                  day.dayBullets.map((bullet, i) => (
                    <p key={i} className="mb-4">{bullet}</p>
                  ))
                ) : (
                  <p>{day.description}</p>
                )}
                {onAddActivity && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onAddActivity}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Activity
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {day.activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActivityCard
                      activity={activity}
                      dragHandleProps={dragHandleProps ? dragHandleProps(activity) : undefined}
                      onEdit={() => onEditActivity?.(activity.id)}
                      onDelete={() => onDeleteActivity?.(activity.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Drop Zone Indicator */}
          {isDropTarget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 border-2 border-dashed border-primary rounded-lg bg-primary/10"
            >
              <p className="text-sm text-center text-primary font-medium">
                Drop activity here
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

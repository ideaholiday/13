'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertCircle, TrendingDown, Plane, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/hooks/use-enhancements'
import { useAuthStore } from '@/store'
import { Notification as NotificationType } from '@/types/enhancements'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()
  const { data: notifications } = useNotifications(user?.id)
  const { data: unreadCount } = useUnreadNotificationsCount(user?.id)
  const markAsRead = useMarkNotificationRead()
  const markAllAsRead = useMarkAllNotificationsRead()

  const getIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'flight_status':
      case 'gate_change':
        return <Plane className="h-5 w-5" />
      case 'price_drop':
        return <TrendingDown className="h-5 w-5" />
      case 'travel_advisory':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: NotificationType['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-sapphire-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {notifications && notifications.length > 0 && (
                  <button
                    onClick={() => markAllAsRead.mutate()}
                    className="text-sm text-sapphire-700 hover:underline mt-2"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No notifications yet</p>
                    <p className="text-sm mt-1">We'll notify you when something important happens</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification: NotificationType) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead.mutate(notification.id)
                          }
                          if (notification.actionUrl) {
                            setIsOpen(false)
                            // Navigate to action URL
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </span>
                              {notification.actionUrl && (
                                <span className="text-xs text-sapphire-700 font-medium">
                                  View Details →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications && notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <Link
                    href="/account/notifications"
                    className="block text-center text-sm text-sapphire-700 font-medium hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

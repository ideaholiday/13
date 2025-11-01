import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Recommendation,
  Notification as NotificationType,
  Review,
  ForumPost,
  ForumReply,
  EcoRating,
  CarbonEmission,
  VRTour,
  ChatMessage
} from '@/types/enhancements'
import {
  mockRecommendations,
  mockNotifications,
  mockForumPosts,
  mockEcoRatings,
  mockCarbonEmissions,
  mockVRTours,
  mockChatbotFAQs
} from '@/data/enhancements'
import { toast } from 'sonner'

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// AI-Driven Personalisation Hooks
// ============================================

export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      await delay(800)
      // Simulate personalized recommendations based on user
      return mockRecommendations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRecommendationsByType(type: 'flight' | 'hotel' | 'package') {
  return useQuery({
    queryKey: ['recommendations', 'type', type],
    queryFn: async () => {
      await delay(600)
      return mockRecommendations.filter((r: Recommendation) => r.type === type)
    }
  })
}

// ============================================
// Real-Time Notifications Hooks
// ============================================

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      await delay(400)
      return mockNotifications
    },
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  })
}

export function useUnreadNotificationsCount(userId?: string) {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: async () => {
      await delay(200)
      return mockNotifications.filter((n: NotificationType) => !n.read).length
    },
    refetchInterval: 30000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await delay(300)
      // Simulate marking notification as read
      return { id: notificationId, read: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await delay(500)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    }
  })
}

// ============================================
// Community & Reviews Hooks
// ============================================

export function useReviews(itemId: string, type: 'hotel' | 'package') {
  return useQuery({
    queryKey: ['reviews', type, itemId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/reviews?type=${type}&id=${itemId}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      // If paginated, return data.data, else return data
      return data.data || data;
    }
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: Partial<Review>) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit review');
    }
  });
}

export function useForumPosts(destination?: string) {
  return useQuery({
    queryKey: ['forum-posts', destination],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = destination ? `?destination=${destination}` : '';
      const res = await fetch(`${apiUrl}/api/v1/forum/posts${params}`);
      if (!res.ok) throw new Error('Failed to fetch forum posts');
      const data = await res.json();
      return data.data || data;
    }
  })
}

export function useCreateForumPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (post: Partial<ForumPost>) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] })
      toast.success('Post created successfully!')
    },
    onError: () => {
      toast.error('Failed to create post')
    }
  })
}

export function useAddForumReply() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/forum/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to add reply');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] })
      toast.success('Reply added!')
    },
    onError: () => {
      toast.error('Failed to add reply')
    }
  })
}

// ============================================
// Sustainability Hooks
// ============================================

export function useEcoRating(itemId: string, type: 'hotel' | 'flight') {
  return useQuery({
    queryKey: ['eco-rating', type, itemId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let endpoint = '';
      if (type === 'hotel') {
        endpoint = `/api/v1/eco-ratings/hotel/${itemId}`;
      } else if (type === 'flight') {
        endpoint = `/api/v1/eco-ratings/flight/${itemId}`;
      } else {
        throw new Error('Unsupported eco rating type');
      }
      const res = await fetch(`${apiUrl}${endpoint}`);
      if (!res.ok) throw new Error('Failed to fetch eco rating');
      return await res.json();
    }
  })
}

export function useCarbonEmission(flightId: string) {
  return useQuery({
    queryKey: ['carbon-emission', flightId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/carbon-emissions/flight/${flightId}`);
      if (!res.ok) throw new Error('Failed to fetch carbon emission data');
      return res.json();
    }
  })
}

export function useOffsetCarbon() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ flightId, amountKg, price }: { flightId: string; amountKg: number; price: number }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/carbon-emissions/offset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_id: flightId,
          amount_kg: amountKg,
          price: price,
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to purchase carbon offset');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Carbon offset purchased successfully!')
    },
    onError: () => {
      toast.error('Failed to purchase carbon offset')
    }
  })
}

// ============================================
// Immersive Experiences Hooks
// ============================================

export function useVRTours(hotelId: string) {
  return useQuery({
    queryKey: ['vr-tours', hotelId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/vr-tours/hotel/${hotelId}`);
      if (!res.ok) throw new Error('Failed to fetch VR tours');
      return await res.json();
    }
  })
}

export function useVRTour(tourId: string) {
  return useQuery({
    queryKey: ['vr-tour', tourId],
    queryFn: async () => {
      await delay(500)
      return mockVRTours.find((t: VRTour) => t.id === tourId) || null
    }
  })
}

// ============================================
// Chatbot Hooks
// ============================================

export function useChatbotQuery() {
  return useMutation({
    mutationFn: async (query: string): Promise<ChatMessage> => {
      await delay(800)
      
      // Simple FAQ matching
      const faq = mockChatbotFAQs.find((f: any) => 
        query.toLowerCase().includes(f.question.toLowerCase().split(' ').slice(0, 3).join(' '))
      )
      
      if (faq) {
        return {
          id: 'msg_' + Date.now(),
          sender: 'bot',
          message: faq.answer,
          timestamp: new Date().toISOString(),
          options: [
            { label: 'Was this helpful?', value: 'helpful', action: 'reply' },
            { label: 'Talk to agent', value: 'agent', action: 'navigate' }
          ]
        }
      }
      
      // Default response
      return {
        id: 'msg_' + Date.now(),
        sender: 'bot',
        message: 'I can help you with booking questions, cancellations, payments, and more. What would you like to know?',
        timestamp: new Date().toISOString(),
        options: [
          { label: 'Cancel booking', value: 'cancel', action: 'reply' },
          { label: 'Payment methods', value: 'payment', action: 'reply' },
          { label: 'Flight status', value: 'flight_status', action: 'reply' }
        ]
      }
    }
  })
}

// ============================================
// Push Notifications Hook
// ============================================

export function useRequestPushPermission() {
  return useMutation({
    mutationFn: async () => {
      if (!('Notification' in window)) {
        throw new Error('Push notifications not supported')
      }
      
      const permission = await Notification.requestPermission()
      return permission
    },
    onSuccess: (permission) => {
      if (permission === 'granted') {
        toast.success('Push notifications enabled!')
      }
    },
    onError: () => {
      toast.error('Could not enable push notifications')
    }
  })
}

export function useSendPushNotification() {
  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        throw new Error('Push notifications not enabled')
      }
      
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      })
      
      return { success: true }
    }
  })
}

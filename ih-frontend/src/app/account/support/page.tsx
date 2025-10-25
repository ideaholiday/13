'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  MessageCircle, 
  Plus, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { useSupportTickets, useCreateTicket } from '@/hooks/use-account'

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  bookingId: z.string().optional()
})

type TicketFormData = z.infer<typeof ticketSchema>

const faqs = [
  {
    question: 'How do I cancel my booking?',
    answer: 'Go to My Bookings, select the booking you want to cancel, and click the Cancel Booking button. Cancellation charges may apply.'
  },
  {
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 7-10 business days and will be credited to your original payment method.'
  },
  {
    question: 'How can I modify my booking?',
    answer: 'Visit the booking details page and click Modify Booking. Changes are subject to availability and fare differences.'
  },
  {
    question: 'What documents do I need to travel?',
    answer: 'For domestic flights: Valid government-issued photo ID. For international flights: Valid passport and visa (if required).'
  },
  {
    question: 'How do I add baggage to my booking?',
    answer: 'You can add extra baggage through the Modify Booking option or by contacting our support team.'
  }
]

export default function SupportPage() {
  const { data: tickets, isLoading } = useSupportTickets()
  const { mutate: createTicket, isPending } = useCreateTicket()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema)
  })

  const onSubmit = (data: TicketFormData) => {
    createTicket({ ...data, status: 'open' }, {
      onSuccess: () => {
        setIsDialogOpen(false)
        reset()
      }
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Clock
      case 'in-progress': return Clock
      case 'resolved': return CheckCircle
      case 'closed': return XCircle
      default: return MessageCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-gold-100 text-gold-800'
      case 'resolved': return 'bg-emerald-100 text-emerald-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600 mt-1">
                Get help with your bookings and account
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>

          {/* Tickets List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Tickets</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {tickets.map((ticket, index) => {
                    const StatusIcon = getStatusIcon(ticket.status)
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-sapphire-100">
                                <MessageCircle className="h-5 w-5 text-sapphire-900" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {ticket.subject}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Ticket #{ticket.id}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {ticket.status}
                            </Badge>
                          </div>

                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {ticket.message}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-sm text-gray-600">
                              Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            {ticket.replies && ticket.replies.length > 0 && (
                              <span className="text-sm text-sapphire-900 font-medium">
                                {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                              </span>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-2">
                <div className="max-w-md mx-auto">
                  <div className="mb-4 inline-flex p-4 rounded-full bg-gray-100">
                    <MessageCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Support Tickets
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven't created any support tickets yet. Need help? Create a ticket.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Ticket
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="h-5 w-5 text-sapphire-900" />
              <h2 className="text-lg font-semibold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Still need help? Our support team is here for you.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsDialogOpen(true)}
              >
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Brief description of your issue"
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bookingId">Related Booking ID (Optional)</Label>
              <Input
                id="bookingId"
                {...register('bookingId')}
                placeholder="e.g., BKG123456"
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="Please describe your issue in detail..."
                rows={5}
              />
              {errors.message && (
                <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Send className="mr-2 h-4 w-4" />
                {isPending ? 'Creating...' : 'Create Ticket'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Mail, Phone, User, MessageSquare, Send } from 'lucide-react'

interface EnquiryFormModalProps {
  isOpen: boolean
  onClose: () => void
  packageTitle: string
  packageId: string
}

export function EnquiryFormModal({ isOpen, onClose, packageTitle, packageId }: EnquiryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    travelDates: '',
    travelers: '2'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Prepare enquiry data
      const enquiryData = {
        ...formData,
        packageId,
        packageTitle,
        submittedAt: new Date().toISOString()
      }

      // TODO: Replace with actual backend API call
      // Example: await fetch('/api/v1/enquiries', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(enquiryData)
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Log enquiry to console (for development)
      console.log('=== NEW ENQUIRY SUBMITTED ===')
      console.log('Package:', packageTitle)
      console.log('Package ID:', packageId)
      console.log('Customer Name:', formData.name)
      console.log('Email:', formData.email)
      console.log('Phone:', formData.phone)
      console.log('Travel Date:', formData.travelDates)
      console.log('Travelers:', formData.travelers)
      console.log('Message:', formData.message)
      console.log('Submitted At:', enquiryData.submittedAt)
      console.log('=============================')

      // In production, this data will be:
      // 1. Saved to database (enquiries table)
      // 2. Email sent to admin (bookings@ideaholiday.in)
      // 3. Email confirmation sent to customer
      // 4. Notification added to admin dashboard

      setSubmitStatus('success')
      
      // Reset form and close after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          travelDates: '',
          travelers: '2'
        })
        setSubmitStatus('idle')
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Failed to submit enquiry:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-sapphire-900">Enquire About This Package</DialogTitle>
          <DialogDescription className="text-slate-600">
            {packageTitle}
          </DialogDescription>
        </DialogHeader>

        {submitStatus === 'success' ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-sapphire-900 mb-2">Enquiry Sent Successfully!</h3>
            <p className="text-slate-600">
              Thank you for your interest. Our team will contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sapphire-500 focus:border-transparent outline-none transition"
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sapphire-500 focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sapphire-500 focus:border-transparent outline-none transition"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="travelDates" className="block text-sm font-medium text-slate-700 mb-1">
                  Preferred Travel Dates
                </label>
                <input
                  type="date"
                  id="travelDates"
                  name="travelDates"
                  value={formData.travelDates}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sapphire-500 focus:border-transparent outline-none transition cursor-pointer"
                  placeholder="Select travel start date"
                />
              </div>

              <div>
                <label htmlFor="travelers" className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Travelers
                </label>
                <select
                  id="travelers"
                  name="travelers"
                  value={formData.travelers}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sapphire-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="1">1 Traveler</option>
                  <option value="2">2 Travelers</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4 Travelers</option>
                  <option value="5">5 Travelers</option>
                  <option value="6+">6+ Travelers</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Additional Requirements
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sapphire-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Tell us about any special requirements, dietary preferences, or questions..."
              />
            </div>

            {submitStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Failed to submit enquiry. Please try again or contact us directly.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Enquiry
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useState } from 'react'
import { Download, Share2, Mail, MessageSquare, Printer, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ConfirmationActionsProps {
  bookingId: string
  passengerEmails: string[]
  onDownloadTicket?: () => void
  onPrintItinerary?: () => void
  onShareEmail?: (email: string) => void
  onShareSMS?: (phone: string) => void
  onManageBooking?: () => void
  onBookAnother?: () => void
  isProcessing?: boolean
}

export default function ConfirmationActions({
  bookingId,
  passengerEmails,
  onDownloadTicket,
  onPrintItinerary,
  onShareEmail,
  onShareSMS,
  onManageBooking,
  onBookAnother,
  isProcessing = false,
}: ConfirmationActionsProps) {
  const [activeShare, setActiveShare] = useState<'email' | 'sms' | null>(null)
  const [shareEmail, setShareEmail] = useState(passengerEmails[0] || '')
  const [shareSMS, setShareSMS] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  const handleDownload = async () => {
    try {
      onDownloadTicket?.()
      toast.success('Ticket downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download ticket')
    }
  }

  const handlePrint = async () => {
    try {
      window.print()
      toast.success('Print dialog opened')
    } catch (error) {
      toast.error('Failed to print')
    }
  }

  const handleShareEmail = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsSharing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onShareEmail?.(shareEmail)
      toast.success(`Booking details sent to ${shareEmail}`)
      setActiveShare(null)
      setShareEmail('')
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setIsSharing(false)
    }
  }

  const handleShareSMS = async () => {
    if (!shareSMS.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    setIsSharing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onShareSMS?.(shareSMS)
      toast.success(`Booking details sent to ${shareSMS}`)
      setActiveShare(null)
      setShareSMS('')
    } catch (error) {
      toast.error('Failed to send SMS')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* PRIMARY ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Download Ticket */}
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-6 h-6 text-emerald-600" />
          <div className="text-left">
            <p className="font-semibold text-gray-900">Download Ticket</p>
            <p className="text-xs text-gray-600">Save PDF to your device</p>
          </div>
        </button>

        {/* Print Itinerary */}
        <button
          onClick={handlePrint}
          disabled={isProcessing}
          className="p-4 border-2 border-sapphire-200 rounded-lg hover:bg-sapphire-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-6 h-6 text-sapphire-600" />
          <div className="text-left">
            <p className="font-semibold text-gray-900">Print Itinerary</p>
            <p className="text-xs text-gray-600">Print booking details</p>
          </div>
        </button>
      </div>

      {/* SECONDARY ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Share Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gold-600" />
            Share Booking
          </h3>

          {/* Email Share */}
          {activeShare === 'email' ? (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <div className="flex gap-2">
                <input
                  id="shareEmail"
                  type="email"
                  placeholder="recipient@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  disabled={isSharing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleShareEmail}
                  disabled={isSharing || !shareEmail.trim()}
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isSharing ? 'Sending...' : 'Send'}
                </button>
              </div>
              <button
                onClick={() => setActiveShare(null)}
                className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveShare('email')}
              disabled={isProcessing}
              className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <Mail className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Share via Email</p>
                <p className="text-xs text-gray-600">Send to email inbox</p>
              </div>
            </button>
          )}

          {/* SMS Share */}
          {activeShare === 'sms' ? (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <label htmlFor="shareSMS" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  id="shareSMS"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={shareSMS}
                  onChange={(e) => setShareSMS(e.target.value)}
                  disabled={isSharing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleShareSMS}
                  disabled={isSharing || !shareSMS.trim()}
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isSharing ? 'Sending...' : 'Send'}
                </button>
              </div>
              <button
                onClick={() => setActiveShare(null)}
                className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveShare('sms')}
              disabled={isProcessing}
              className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <MessageSquare className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Share via SMS</p>
                <p className="text-xs text-gray-600">Send to phone number</p>
              </div>
            </button>
          )}
        </div>

        {/* Booking Management */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Next Steps
          </h3>

          {/* Manage Booking */}
          <button
            onClick={onManageBooking}
            disabled={isProcessing}
            className="w-full p-3 border border-sapphire-200 rounded-lg hover:bg-sapphire-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="text-sm font-medium text-sapphire-900">Manage Your Booking</p>
            <p className="text-xs text-sapphire-700 mt-1">Change seats, add baggage, or modify details</p>
          </button>

          {/* Book Another */}
          <button
            onClick={onBookAnother}
            disabled={isProcessing}
            className="w-full p-3 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="text-sm font-medium text-emerald-900">Book Another Flight</p>
            <p className="text-xs text-emerald-700 mt-1">Find flights for your next trip</p>
          </button>
        </div>
      </div>

      {/* BOOKING REFERENCE */}
      <div className="bg-gradient-to-r from-sapphire-50 to-sapphire-25 border-2 border-sapphire-200 rounded-lg p-6">
        <p className="text-sm text-sapphire-600 font-medium mb-2">Save Your Booking Reference</p>
        <div className="flex items-center justify-between gap-3 bg-white border border-sapphire-200 rounded-lg p-4">
          <code className="font-mono text-lg font-bold text-sapphire-700">{bookingId}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(bookingId)
              toast.success('Booking ID copied!')
            }}
            className="px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-sapphire-600 mt-3">
          You'll need this ID to manage your booking or contact support.
        </p>
      </div>

      {/* INFO BOX */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>✓ Confirmation email sent!</strong> Check your inbox for flight details, ticket information, and
          payment receipt.
        </p>
      </div>
    </div>
  )
}

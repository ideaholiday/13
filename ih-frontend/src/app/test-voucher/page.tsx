'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoucherGenerator } from '@/lib/voucher-generator'
import { toast } from 'react-hot-toast'

export default function VoucherTestPage() {
  const [downloading, setDownloading] = useState(false)

  const testFlightVoucher = async () => {
    setDownloading(true)
    try {
      const mockFlightData = {
        bookingId: 'IH-FL-123456',
        bookingDate: new Date().toLocaleDateString(),
        passengerName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 9876543210',
        
        flights: [
          {
            airline: 'Air India',
            flightNumber: 'AI-101',
            from: 'Delhi (DEL)',
            to: 'Mumbai (BOM)',
            departure: '08:30 AM',
            arrival: '10:45 AM',
            date: '2025-10-20',
            duration: '2h 15m',
            class: 'Economy'
          }
        ],
        
        totalAmount: 8500,
        currency: 'INR',
        status: 'Confirmed',
        pnr: 'ABC123'
      }

      const pdfBlob = await VoucherGenerator.generateFlightVoucher(mockFlightData)
      VoucherGenerator.downloadPDF(pdfBlob, `test-flight-voucher-${Date.now()}.pdf`)
      toast.success('Flight voucher generated successfully!')
    } catch (error) {
      console.error('Error generating flight voucher:', error)
      toast.error('Failed to generate flight voucher')
    } finally {
      setDownloading(false)
    }
  }

  const testHotelVoucher = async () => {
    setDownloading(true)
    try {
      const mockHotelData = {
        bookingId: 'IH-HT-789012',
        bookingDate: new Date().toLocaleDateString(),
        guestName: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+91 9876543210',
        
        hotel: {
          name: 'Grand Palace Hotel',
          address: '123 Main Street, Mumbai',
          city: 'Mumbai',
          checkIn: '2025-10-20',
          checkOut: '2025-10-23',
          nights: 3,
          rooms: 1,
          roomType: 'Deluxe Suite',
          guests: 2
        },
        
        totalAmount: 15000,
        currency: 'INR',
        status: 'Confirmed',
        confirmationNumber: 'HTL-456789'
      }

      const pdfBlob = await VoucherGenerator.generateHotelVoucher(mockHotelData)
      VoucherGenerator.downloadPDF(pdfBlob, `test-hotel-voucher-${Date.now()}.pdf`)
      toast.success('Hotel voucher generated successfully!')
    } catch (error) {
      console.error('Error generating hotel voucher:', error)
      toast.error('Failed to generate hotel voucher')
    } finally {
      setDownloading(false)
    }
  }

  const testBookingSuccessWithMockData = () => {
    // Set mock flight booking data
    const mockFlightBooking = {
      bookingId: 'IH-FL-MOCK-123',
      status: 'confirmed',
      amount: 8500,
      contactDetails: {
        email: 'test@example.com',
        phone: '+91 9876543210'
      },
      passengers: [
        {
          title: 'Mr',
          firstName: 'John',
          lastName: 'Doe',
          type: 'Adult',
          age: 30
        }
      ],
      flightDetails: {
        airline: 'Air India',
        flightNumber: 'AI-101',
        departure: {
          airport: 'Delhi',
          code: 'DEL',
          time: '08:30',
          date: '2025-10-20'
        },
        arrival: {
          airport: 'Mumbai', 
          code: 'BOM',
          time: '10:45',
          date: '2025-10-20'
        }
      },
      payment: {
        id: 'pay_mock_123',
        method: 'razorpay',
        timestamp: new Date().toISOString()
      }
    }

    localStorage.setItem('confirmedBooking', JSON.stringify(mockFlightBooking))
    
    // Redirect to booking success page
    window.open(`/flights/booking-success?bookingId=${mockFlightBooking.bookingId}`, '_blank')
  }

  const testHotelBookingSuccessWithMockData = () => {
    // Set mock hotel booking data
    const mockHotelBooking = {
      bookingId: 'IH-HT-MOCK-456',
      status: 'confirmed',
      amount: 15000,
      contactDetails: {
        email: 'test@example.com',
        phone: '+91 9876543210'
      },
      guests: [
        {
          title: 'Ms',
          firstName: 'Jane',
          lastName: 'Smith',
          type: 'Adult',
          age: 28
        }
      ],
      hotelDetails: {
        name: 'Grand Palace Hotel',
        address: '123 Main Street, Mumbai',
        location: 'Mumbai',
        starRating: 5,
        room: {
          name: 'Deluxe Suite',
          bedType: 'King Bed',
          size: '450 sq ft',
          amenities: ['wifi', 'air-conditioning', 'room-service', 'minibar']
        }
      },
      searchParams: {
        checkIn: '2025-10-20',
        checkOut: '2025-10-23',
        rooms: 1,
        guests: 2
      },
      payment: {
        id: 'pay_hotel_mock_456',
        method: 'razorpay',
        timestamp: new Date().toISOString()
      }
    }

    localStorage.setItem('confirmedHotelBooking', JSON.stringify(mockHotelBooking))
    
    // Redirect to hotel booking success page
    window.open(`/hotels/booking-success?bookingId=${mockHotelBooking.bookingId}`, '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Voucher Generation Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testFlightVoucher} 
                disabled={downloading}
                className="w-full"
              >
                {downloading ? 'Generating...' : 'Test Flight Voucher'}
              </Button>
              
              <Button 
                onClick={testHotelVoucher} 
                disabled={downloading}
                className="w-full"
              >
                {downloading ? 'Generating...' : 'Test Hotel Voucher'}
              </Button>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">Test Full Booking Success Flow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testBookingSuccessWithMockData}
                  variant="outline"
                  className="w-full"
                >
                  Test Flight Booking Success
                </Button>
                
                <Button 
                  onClick={testHotelBookingSuccessWithMockData}
                  variant="outline"
                  className="w-full"
                >
                  Test Hotel Booking Success
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
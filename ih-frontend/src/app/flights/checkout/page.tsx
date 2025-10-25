'use client'

import { useFlightStore, useFlightSelection, usePassengerInfo, useBookingDetails } from '@/lib/stores/consolidated-flight-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Ticket, Users, Mail, Phone, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { paymentApi } from '@/lib/api/payment-api'
import { trackBooking } from '@/lib/track'

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { selectedOutbound, selectedReturn } = useFlightSelection()
  const { passengers, contactEmail, contactPhone } = usePassengerInfo()
  const { totalPrice } = useBookingDetails()

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!selectedOutbound || passengers.length === 0) {
    return (
       <div className="container mx-auto py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold">Incomplete Booking Details</h1>
        <p className="mt-2 text-slate-600">Please complete the previous steps to proceed.</p>
        <Button onClick={() => router.push('/flights')} className="mt-6">
          Start Over
        </Button>
      </div>
    )
  }

  const handlePayment = async () => {
    try {
      // Track checkout started event
      trackBooking.checkoutStarted('flight', selectedOutbound.id || 'unknown', totalPrice, passengers.length)
      
      const order = await paymentApi.createOrder({
        amount: totalPrice,
        currency: 'INR',
        receipt: `receipt_${selectedOutbound.id}`,
        notes: {
          flightId: selectedOutbound.id,
          contactEmail,
        }
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Idea Holiday',
        description: 'Flight Booking',
        order_id: order.order_id,
        handler: function (response: any) {
          console.log('Payment successful', response);
          
          // Track payment success event
          trackBooking.paymentSuccess('flight', selectedOutbound.id || 'unknown', totalPrice, 'razorpay')
          
          router.push('/flights/confirmation');
        },
        prefill: {
          name: `${passengers[0].firstName} ${passengers[0].lastName}`,
          email: contactEmail,
          contact: contactPhone,
        },
        notes: {
          address: 'Idea Holiday Corporate Office'
        },
        theme: {
          color: '#0F3D63'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed. Please try again.");
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Passenger Summary */}
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="mr-2"/>Passengers</CardTitle></CardHeader>
              <CardContent>
                {passengers.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <p>{p.firstName} {p.lastName}</p>
                    <p className="text-sm text-slate-500">{p.type}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

             {/* Contact Summary */}
            <Card>
              <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center"><Mail className="mr-2 h-4 w-4"/> {contactEmail}</p>
                <p className="flex items-center"><Phone className="mr-2 h-4 w-4"/> {contactPhone}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Total Price & Pay Button */}
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Total Price</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₹{totalPrice.toLocaleString()}</p>
                <Separator className="my-4"/>
                <Button onClick={handlePayment} size="lg" className="w-full">
                  <CreditCard className="mr-2"/> Pay Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

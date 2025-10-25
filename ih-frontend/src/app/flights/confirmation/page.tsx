'use client'

import { useFlightSelection, usePassengerInfo, useBookingDetails } from '@/lib/stores/consolidated-flight-store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Home, Printer } from 'lucide-react'
import { format } from 'date-fns'

export default function ConfirmationPage() {
  const router = useRouter()
  const { selectedOutbound } = useFlightSelection()
  const { passengers } = usePassengerInfo()
  const { totalPrice } = useBookingDetails()

  if (!selectedOutbound) {
    // Redirect to home if no booking data is found
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }
  
  const firstSegment = selectedOutbound.segments[0];
  const lastSegment = selectedOutbound.segments[selectedOutbound.segments.length - 1];

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4 my-8">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500"/>
          <CardTitle className="text-3xl font-bold mt-4">Booking Confirmed!</CardTitle>
          <p className="text-slate-600">Your flight to {lastSegment.destination.city} is confirmed.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator/>
          <div>
            <h3 className="font-semibold mb-2">Flight Details</h3>
            <div className="flex justify-between items-center">
                <p>{firstSegment.origin.city} to {lastSegment.destination.city}</p>
                <p className="text-sm text-slate-500">{format(new Date(firstSegment.departureTime), 'EEE, MMM d, yyyy')}</p>
            </div>
          </div>
           <div>
            <h3 className="font-semibold mb-2">Passengers</h3>
            {passengers.map((p, i) => (
              <p key={i} className="text-sm">{p.firstName} {p.lastName}</p>
            ))}
          </div>
          <Separator/>
           <div className="flex justify-between items-center font-bold text-lg">
            <p>Total Paid</p>
            <p>₹{totalPrice.toLocaleString()}</p>
          </div>
          <div className="flex gap-4 mt-6">
            <Button onClick={() => window.print()} className="w-full"><Printer className="mr-2"/>Print Ticket</Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full"><Home className="mr-2"/>Go to Homepage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

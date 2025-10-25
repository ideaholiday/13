import type { Metadata } from 'next'
import FlightSearchPage from '@/components/flights/FlightSearchPage'

export const metadata: Metadata = {
  title: 'Flight Booking - Compare & Book Cheap Flights',
  description: 'Find and book cheap flights to destinations worldwide. Compare prices from 500+ airlines and get the best deals on domestic and international flight tickets.',
  keywords: ['flight booking', 'cheap flights', 'airline tickets', 'domestic flights', 'international flights', 'flight deals', 'air travel', 'book flights'],
  openGraph: {
    title: 'Flight Booking - Compare & Book Cheap Flights | Idea Holiday',
    description: 'Find and book cheap flights to destinations worldwide. Compare prices from multiple airlines and get the best deals.',
    type: 'website',
    images: [
      {
        url: '/images/flights-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Flight Booking - Idea Holiday',
      },
    ],
  },
}

export default function FlightsPage() {
  return <FlightSearchPage />
}
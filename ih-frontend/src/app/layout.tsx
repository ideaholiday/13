import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Idea Holiday - Your Travel Partner',
    template: '%s | Idea Holiday'
  },
  description: 'Discover amazing destinations with Idea Holiday. Book flights, hotels, and holiday packages at the best prices.',
  keywords: ['travel', 'flights', 'hotels', 'packages', 'holidays', 'vacation'],
  authors: [{ name: 'Idea Holiday Team' }],
  creator: 'Idea Holiday Pvt Ltd',
  metadataBase: new URL('https://ideaholiday.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ideaholiday.com',
    siteName: 'Idea Holiday',
    title: 'Idea Holiday - Your Travel Partner',
    description: 'Discover amazing destinations with Idea Holiday. Book flights, hotels, and holiday packages at the best prices.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Idea Holiday',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idea Holiday - Your Travel Partner',
    description: 'Discover amazing destinations with Idea Holiday. Book flights, hotels, and holiday packages at the best prices.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import ReactQueryProvider from '@/providers/react-query'
import { ToastProvider } from '@/components/providers/toast-provider'
import { ChatbotWidget } from '@/components/shared/ChatbotWidget'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { PWAInstallPrompt } from '@/components/shared/PWAInstallPrompt'
import { OfflineRouteHandler } from '@/components/shared/OfflineRouteHandler'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a single query client per mount
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ServiceWorkerRegister />
        <ReactQueryProvider>
          <ErrorBoundary>
            <OfflineRouteHandler />
            <OfflineBanner />
            <div className="relative min-h-screen bg-slate-50 flex flex-col">
              <Header />
              <Breadcrumbs />
              <main className="flex-1 pb-16 md:pb-0">{/* space for mobile bottom nav */}
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
            <ToastProvider />
            <ChatbotWidget />
            <PWAInstallPrompt />
          </ErrorBoundary>
          <Analytics />
          <SpeedInsights />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
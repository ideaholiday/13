import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Flight Details Header */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>

          {/* Flight Route */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Baggage Information */}
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-28" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Seat Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <div className="flex justify-center space-x-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              
              {/* Passenger Details */}
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between pt-4 border-t">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Book Button */}
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

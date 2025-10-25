import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Search Filters Skeleton */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Skeleton className="h-6 w-20 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side - Flight Results */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>

            {/* Flight Cards Skeleton */}
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  {/* Airline Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>

                  {/* Flight Details */}
                  <div className="grid grid-cols-3 gap-4">
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

                  {/* Price and Book Button */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Skeleton className="h-6 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function ExploreMongoliaLoading() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Discovering Mongolia's Treasures...</h2>
        <p className="text-gray-600 font-medium">Loading natural attractions and travel information</p>
      </div>

      {/* Header Skeleton */}
      <div className="h-16 bg-white border-b mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-2/3 mx-auto mb-6" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Skeleton className="flex-1 h-12" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>

        {/* Results Summary Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Attractions Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 9 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-3" />
                <div className="flex gap-1 mb-3">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section Skeleton */}
        <div className="bg-gray-200 rounded-2xl p-8 text-center">
          <Skeleton className="h-8 w-2/3 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-6" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}

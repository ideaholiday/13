import React from 'react'
import VRTourViewer from '@/components/shared/VRTourViewer'

export default function VRTourViewerDemo() {
  // Demo: hardcoded tourId (replace with a real one from mock data)
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">VRTourViewer Demo</h1>
  <VRTourViewer tourId="tour_1" />
    </div>
  )
}

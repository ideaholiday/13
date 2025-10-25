"use client"
import React, { useRef, useEffect, useState } from 'react'
import { Loader2, Image as ImageIcon, RotateCcw } from 'lucide-react'
import { useVRTours } from '@/hooks/use-enhancements'

export interface VRTourViewerProps {
  tourId: string
  className?: string
}

// Simple 360° viewer using <img> and CSS for demo. For production, use three.js or aframe-react.
export const VRTourViewer: React.FC<VRTourViewerProps> = ({ tourId, className }) => {
  const { data: tours, isLoading, isError } = useVRTours("")
  const [current, setCurrent] = useState(0)
  const [angle, setAngle] = useState(0)
  const viewerRef = useRef<HTMLDivElement>(null)

  // Find the tour by ID
  const tour = Array.isArray(tours) ? tours.find(t => t.id === tourId) : undefined

  useEffect(() => {
    setCurrent(0)
    setAngle(0)
  }, [tourId])

  function handleDrag(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    let startX = e.clientX
    let startAngle = angle
    function onMove(ev: MouseEvent) {
      setAngle(startAngle + (ev.clientX - startX))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (isLoading) {
    return <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading tour...</div>
  }
  if (isError || !tour) {
    return <div className="rounded-xl border bg-white p-6 shadow-sm text-red-600">Failed to load VR tour.</div>
  }

  const image = tour.images[current]

  return (
    <section className={"rounded-xl border bg-white p-4 shadow-sm space-y-3 "+(className||"")}>
      <div className="flex items-center gap-3 mb-2">
        <ImageIcon className="text-blue-500" />
        <div>
          <div className="font-semibold text-lg text-slate-800">{tour.name}</div>
          <div className="text-xs text-slate-500">{image.title}</div>
        </div>
        <button className="ml-auto text-xs text-blue-600 flex items-center gap-1" onClick={()=>setAngle(0)}><RotateCcw size={14}/>Reset</button>
      </div>
      <div
        ref={viewerRef}
        className="relative w-full h-64 bg-slate-100 rounded overflow-hidden cursor-grab"
        style={{ perspective: 1000 }}
        onMouseDown={handleDrag}
        tabIndex={0}
        aria-label="360 degree viewer"
      >
        <img
          src={image.url}
          alt={image.title}
          className="absolute top-0 left-0 w-full h-full object-cover select-none"
          style={{ transform: `rotateY(${angle}deg)` }}
          draggable={false}
        />
      </div>
      <div className="flex gap-2 mt-2">
        {tour.images.map((img, i) => (
          <button
            key={img.id}
            className={"w-12 h-12 rounded border "+(i===current?'border-blue-500':'border-slate-200')}
            onClick={()=>{setCurrent(i);setAngle(0)}}
            aria-label={`Go to ${img.title}`}
          >
            <img src={img.url} alt={img.title} className="w-full h-full object-cover rounded" />
          </button>
        ))}
      </div>
    </section>
  )
}

export default VRTourViewer

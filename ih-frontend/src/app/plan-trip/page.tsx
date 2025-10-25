'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Itinerary, TripPlannerPrompt, GenerateItineraryRequest, GenerateItineraryResponse } from '@/types/itinerary'
import { PromptInputPanel } from '@/components/trip-planner/PromptInputPanel'
import { ItineraryBuilder } from '@/components/trip-planner/ItineraryBuilder'

export default function PlanTripPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (prompt: string, parsed?: TripPlannerPrompt) => {
    setIsGenerating(true)
    
    try {
      const requestBody: GenerateItineraryRequest = {
        prompt,
        parsed
      }

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data: GenerateItineraryResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate itinerary')
      }

      if (data.data) {
        setItinerary(data.data)
        toast.success('Itinerary generated successfully! 🎉')
      } else {
        throw new Error('No itinerary data received')
      }
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate itinerary. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = (updatedItinerary: Itinerary) => {
    setItinerary(updatedItinerary)
    // TODO: Implement actual save to backend/local storage
    toast.success('Itinerary saved successfully!')
  }

  const handleExport = (format: 'pdf' | 'json' | 'ical') => {
    if (!itinerary) return

    switch (format) {
      case 'json':
        // Download as JSON
        const jsonBlob = new Blob([JSON.stringify(itinerary, null, 2)], { type: 'application/json' })
        const jsonUrl = URL.createObjectURL(jsonBlob)
        const jsonLink = document.createElement('a')
        jsonLink.href = jsonUrl
        jsonLink.download = `${itinerary.title.replace(/\s+/g, '-').toLowerCase()}.json`
        jsonLink.click()
        URL.revokeObjectURL(jsonUrl)
        toast.success('Itinerary exported as JSON!')
        break

      case 'pdf':
        // TODO: Implement PDF export
        toast.info('PDF export coming soon!')
        break

      case 'ical':
        // TODO: Implement iCal export
        toast.info('Calendar export coming soon!')
        break
    }
  }

  const handleShare = () => {
    if (!itinerary) return

    // Create shareable URL (mock for now)
    const shareUrl = `${window.location.origin}/itinerary/${itinerary.id}`
    
    if (navigator.share) {
      navigator.share({
        title: itinerary.title,
        text: itinerary.description,
        url: shareUrl
      }).then(() => {
        toast.success('Shared successfully!')
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          copyToClipboard(shareUrl)
        }
      })
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!')
    }).catch((error) => {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link')
    })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Trip Planner</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create your perfect itinerary with AI assistance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {itinerary && (
              <span className="text-sm text-gray-500">
                {itinerary.duration} days • {itinerary.destination}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Prompt Input */}
        <div className="w-96 flex-shrink-0 border-r bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <PromptInputPanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Right Panel - Itinerary Builder */}
        <div className="flex-1 bg-white overflow-hidden">
          <ItineraryBuilder
            itinerary={itinerary}
            isLoading={isGenerating}
            onSave={handleSave}
            onExport={handleExport}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  )
}

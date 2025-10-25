'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Loader2, MapPin, Calendar, Users, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import type { TripPlannerPrompt } from '@/types/itinerary'

const promptTemplates = [
  '5 days in Japan with food and anime',
  '7 days romantic Bali honeymoon',
  '10 days adventure in New Zealand',
  '3 days shopping and sightseeing in Dubai',
  '14 days backpacking through Southeast Asia',
  '5 days family-friendly Singapore'
]

interface PromptInputPanelProps {
  onGenerate: (prompt: string, parsed?: TripPlannerPrompt) => Promise<void>
  isGenerating?: boolean
}

export function PromptInputPanel({ onGenerate, isGenerating = false }: PromptInputPanelProps) {
  const [promptText, setPromptText] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Advanced options
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('5')
  const [budget, setBudget] = useState<'budget' | 'moderate' | 'luxury'>('moderate')
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'fast-paced'>('moderate')
  const [adults, setAdults] = useState('2')
  const [children, setChildren] = useState('0')
  const [interests, setInterests] = useState<string[]>([])

  const interestOptions = [
    'Food & Dining',
    'Anime & Pop Culture',
    'Adventure & Outdoor',
    'Beach & Water Sports',
    'Culture & History',
    'Shopping',
    'Wellness & Spa',
    'Nightlife',
    'Romantic',
    'Family Friendly',
    'Photography',
    'Nature & Wildlife'
  ]

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleGenerate = async () => {
    if (!promptText.trim() && !destination) return

    let parsed: TripPlannerPrompt | undefined

    if (showAdvanced && destination) {
      parsed = {
        destination,
        duration: parseInt(duration) || 5,
        interests,
        budget,
        pace,
        travelers: {
          adults: parseInt(adults) || 2,
          children: parseInt(children) || 0
        },
        preferences: interests,
        freeText: promptText || undefined
      }
    }

    await onGenerate(promptText || `${duration} days in ${destination}`, parsed)
  }

  const handleTemplateClick = (template: string) => {
    setPromptText(template)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Trip Planner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your dream trip and let AI create your perfect itinerary
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
        {/* Quick Templates */}
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-2 block">
            Quick Start Templates
          </Label>
          <div className="flex flex-wrap gap-2">
            {promptTemplates.slice(0, 4).map((template) => (
              <Badge
                key={template}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleTemplateClick(template)}
              >
                {template}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Prompt Input */}
        <div>
          <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
            Describe Your Trip
          </Label>
          <Textarea
            id="prompt"
            placeholder="E.g., '5 days in Tokyo with focus on food and anime culture. Budget-friendly options preferred.'"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Toggle Advanced Options */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="self-start"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
        </Button>

        {/* Advanced Options */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-t"
          >
            {/* Destination */}
            <div>
              <Label htmlFor="destination" className="text-sm flex items-center gap-1 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="E.g., Tokyo, Japan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Duration and Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration" className="text-sm flex items-center gap-1 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Duration (days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="budget" className="text-sm flex items-center gap-1 mb-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Budget
                </Label>
                <Select value={budget} onValueChange={(value) => setBudget(value as typeof budget)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pace */}
            <div>
              <Label htmlFor="pace" className="text-sm mb-2 block">
                Travel Pace
              </Label>
              <Select value={pace} onValueChange={(value) => setPace(value as typeof pace)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed (fewer activities)</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="fast-paced">Fast-paced (packed schedule)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Travelers */}
            <div>
              <Label className="text-sm flex items-center gap-1 mb-2">
                <Users className="w-3.5 h-3.5" />
                Travelers
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Adults"
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Children"
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label className="text-sm mb-2 block">
                Interests & Preferences
              </Label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Badge
                    key={interest}
                    variant={interests.includes(interest) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (!promptText.trim() && !destination)}
          className="w-full mt-auto"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Itinerary...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Generate Itinerary
            </>
          )}
        </Button>

        {/* AI Notice */}
        <p className="text-xs text-center text-muted-foreground">
          ✨ Powered by AI • Results may vary
        </p>
      </CardContent>
    </Card>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import type { GenerateItineraryRequest, Itinerary, DayPlan, Activity } from '@/types/itinerary'
import {
  determineTravelerType,
  determineThemeTags,
  getWeatherConsiderations,
  getBestMonths,
  getScamAlerts,
  getHiddenGems,
  getPackingList,
  getVisaRequirements,
  getVaccinations,
  getLocalPhrases
} from './helper-functions'
import { getDocumentsRequired, getEmbassyContact } from './helper-functions'

// Mock AI-powered itinerary generation
export async function POST(request: NextRequest) {
  try {
    const body: GenerateItineraryRequest = await request.json()
    const { prompt, parsed } = body
    const parsedPrompt = parsed || parsePrompt(prompt)

    // Use Perplexity API to generate itinerary
      const apiKey = process.env.PERPLEXITY_API_KEY || ''
      if (!apiKey) {
        return NextResponse.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 })
      }
    // Compose prompt for Perplexity
    const systemPrompt = `You are an expert travel planner. Given a user's trip request, generate a detailed itinerary in JSON format matching the following TypeScript type:\n\ninterface Itinerary {\n  id: string;\n  title: string;\n  description: string;\n  destination: string;\n  duration: number;\n  startDate: string;\n  endDate: string;\n  tags: string[];\n  difficulty: string;\n  pace: string;\n  preferences: string[];\n  days: DayPlan[];\n  totalCost: { amount: number; currency: string; breakdown: Record<string, number>; };\n  createdAt: string;\n  updatedAt: string;\n  isPublic: boolean;\n  likes: number;\n  saves: number;\n  views: number;\n}\n\ninterface DayPlan {\n  id: string;\n  dayNumber: number;\n  date: string;\n  title: string;\n  description: string;\n  activities: Activity[];\n  totalCost: { amount: number; currency: string; };\n}\n\ninterface Activity {\n  id: string;\n  type: string;\n  title: string;\n  description: string;\n  startTime: string;\n  endTime: string;\n  location: string;\n  cost: { amount: number; currency: string; };\n  tags: string[];\n}\n\nRespond ONLY with valid JSON for the itinerary.`
    const userPrompt = parsed ? JSON.stringify(parsed) : prompt

    // Call Perplexity API
    let perplexityRes: Response | null = null
    try {
      perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3-sonar-large-32k-online',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      })
    } catch (networkErr) {
      console.error('Perplexity network error:', networkErr)
      const itinerary = generateMockItinerary(parsedPrompt)
      return NextResponse.json({
        success: true,
        data: itinerary,
        suggestions: [
          'Consider adding a day trip to nearby attractions',
          'Book accommodations in advance for better rates',
          'Check visa requirements for your destination'
        ],
        note: 'Perplexity network error - returned mock itinerary',
        perplexityError: networkErr instanceof Error ? networkErr.message : String(networkErr)
      })
    }

    if (!perplexityRes.ok) {
      const errorText = await perplexityRes.text()
      console.error('Perplexity API error:', errorText)
      const itinerary = generateMockItinerary(parsedPrompt)
      return NextResponse.json({
        success: true,
        data: itinerary,
        suggestions: [
          'Consider adding a day trip to nearby attractions',
          'Book accommodations in advance for better rates',
          'Check visa requirements for your destination'
        ],
        note: 'Perplexity API error - returned mock itinerary',
        perplexityError: errorText
      })
    }
    const perplexityData = await perplexityRes.json()
    const aiMessage = perplexityData.choices?.[0]?.message?.content
    let itinerary: Itinerary | null = null
    try {
      itinerary = JSON.parse(aiMessage)
      // Enrich with required travel essentials if missing
      if (itinerary) {
        const dest = itinerary.destination || parsedPrompt.destination
        if (!itinerary.visaRequirements) {
          itinerary.visaRequirements = getVisaRequirements(dest)
        }
        if (!itinerary.documentsRequired) {
          itinerary.documentsRequired = getDocumentsRequired(dest)
        }
        if (!itinerary.embassyContact) {
          itinerary.embassyContact = getEmbassyContact(dest)
        }
      }
      return NextResponse.json({
        success: true,
        data: itinerary,
        suggestions: [
          'Consider adding a day trip to nearby attractions',
          'Book accommodations in advance for better rates',
          'Check visa requirements for your destination'
        ]
      })
    } catch (e) {
      console.error('Failed to parse Perplexity response as JSON:', aiMessage)
      const fallback = generateMockItinerary(parsedPrompt)
      return NextResponse.json({
        success: true,
        data: fallback,
        suggestions: [
          'Consider adding a day trip to nearby attractions',
          'Book accommodations in advance for better rates',
          'Check visa requirements for your destination'
        ],
        note: 'Perplexity JSON parse error - returned mock itinerary',
        perplexityRaw: aiMessage
      })
    }
  } catch (error) {
    console.error('Error generating itinerary:', error)
    // Final safety net: always return a mock itinerary so UI can proceed
    const fallback = generateMockItinerary(parsePrompt(''))
    return NextResponse.json({
      success: true,
      data: fallback,
      suggestions: [
        'Consider adding a day trip to nearby attractions',
        'Book accommodations in advance for better rates',
        'Check visa requirements for your destination'
      ],
      note: 'Unhandled error - returned mock itinerary',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// Parse natural language prompt
function parsePrompt(text: string): {
  destination: string
  duration: number
  interests: string[]
  budget?: string
  pace?: 'relaxed' | 'moderate' | 'fast'
} {
  const lowerText = (text || '').toLowerCase()

  // Extract destination
  let destination = 'Tokyo' // default
  if (lowerText.includes('japan') || lowerText.includes('tokyo')) destination = 'Tokyo, Japan'
  if (lowerText.includes('bali') || lowerText.includes('indonesia')) destination = 'Bali, Indonesia'
  if (lowerText.includes('paris') || lowerText.includes('france')) destination = 'Paris, France'
  if (lowerText.includes('dubai') || lowerText.includes('uae')) destination = 'Dubai, UAE'
  if (lowerText.includes('thailand') || lowerText.includes('bangkok')) destination = 'Bangkok, Thailand'
  if (lowerText.includes('singapore')) destination = 'Singapore'
  if (lowerText.includes('maldives')) destination = 'Maldives'
  if (lowerText.includes('nepal') || lowerText.includes('kathmandu')) destination = 'Nepal'
  if (lowerText.includes('new york') || lowerText.includes('nyc')) destination = 'New York, USA'
  if (lowerText.includes('london') || lowerText.includes('uk')) destination = 'London, UK'

  // Extract duration
  let duration = 5 // default
  const durationMatch = text.match(/(\d+)\s*(day|days|night|nights)/i)
  if (durationMatch) {
    duration = parseInt(durationMatch[1])
  }

  // Extract interests
  const interests: string[] = []
  if (lowerText.includes('food') || lowerText.includes('cuisine') || lowerText.includes('dining')) {
    interests.push('food', 'restaurants')
  }
  if (lowerText.includes('anime') || lowerText.includes('manga') || lowerText.includes('otaku')) {
    interests.push('anime', 'pop culture')
  }
  if (lowerText.includes('adventure') || lowerText.includes('trek') || lowerText.includes('hiking')) {
    interests.push('adventure', 'outdoor activities')
  }
  if (lowerText.includes('beach') || lowerText.includes('ocean') || lowerText.includes('swim')) {
    interests.push('beach', 'water sports')
  }
  if (lowerText.includes('culture') || lowerText.includes('temple') || lowerText.includes('museum')) {
    interests.push('culture', 'history')
  }
  if (lowerText.includes('shopping') || lowerText.includes('mall')) {
    interests.push('shopping')
  }
  if (lowerText.includes('wellness') || lowerText.includes('yoga') || lowerText.includes('spa')) {
    interests.push('wellness', 'relaxation')
  }
  if (lowerText.includes('nightlife') || lowerText.includes('party') || lowerText.includes('bar')) {
    interests.push('nightlife', 'entertainment')
  }
  if (lowerText.includes('romantic') || lowerText.includes('honeymoon') || lowerText.includes('couple')) {
    interests.push('romantic', 'couples')
  }
  if (lowerText.includes('family') || lowerText.includes('kids')) {
    interests.push('family-friendly')
  }

  // Extract budget
  let budget: string | undefined
  if (lowerText.includes('budget') || lowerText.includes('cheap') || lowerText.includes('affordable')) {
    budget = 'budget'
  } else if (lowerText.includes('luxury') || lowerText.includes('premium') || lowerText.includes('high-end')) {
    budget = 'luxury'
  } else {
    budget = 'moderate'
  }

  // Extract pace
  let pace: 'relaxed' | 'moderate' | 'fast' = 'moderate'
  if (lowerText.includes('relaxed') || lowerText.includes('slow') || lowerText.includes('leisurely')) {
    pace = 'relaxed'
  } else if (lowerText.includes('fast') || lowerText.includes('packed') || lowerText.includes('intense')) {
    pace = 'fast'
  }

  return { destination, duration, interests, budget, pace }
}

// Generate mock itinerary
function generateMockItinerary(
  parsed: ReturnType<typeof parsePrompt> | import('@/types/itinerary').TripPlannerPrompt
): Itinerary {
  const destination = 'destination' in parsed && parsed.destination ? parsed.destination : 'Tokyo, Japan'
  const duration = 'duration' in parsed && parsed.duration ? parsed.duration : 5
  const interests = 'interests' in parsed && parsed.interests ? parsed.interests : ['sightseeing']
  const budget = 'budget' in parsed && parsed.budget ? parsed.budget : 'moderate'
  const pace = 'pace' in parsed && parsed.pace ? parsed.pace : 'moderate'
  
  const itineraryId = `itin-${Date.now()}`
  const days: DayPlan[] = []

  // Generate days
  for (let dayNum = 1; dayNum <= duration; dayNum++) {
    const day = generateDay(dayNum, destination, interests, budget, pace === 'fast-paced' ? 'fast' : pace)
    days.push(day)
  }

  // Compose inclusions and essentials
  let inclusions: string[] = []
  let essentials: string[] = []
  if (/dubai/i.test(destination)) {
    inclusions = [
      '4 nights hotel stay (preferably at Downtown Dubai or Al Barsha)',
      'Daily breakfast and transfers',
      'Burj Khalifa entry ticket',
      'Desert Safari with BBQ dinner',
      'Dhow Cruise with dinner',
      'Optional Abu Dhabi tour'
    ]
    essentials = [
      'Ideal duration: 4 nights / 5 days',
      'Best time to visit: November–March',
      'Budget range: ₹65,000–₹95,000 per person (including flights, visa & hotel)',
      'Transport: Dubai Metro, Careem rides, or private transfer'
    ]
  }

  // Map pace to proper type
  const finalPace: 'relaxed' | 'moderate' | 'fast-paced' = 
    pace === 'fast' ? 'fast-paced' : pace as 'relaxed' | 'moderate' | 'fast-paced'

  // Determine traveler type and theme tags
  const travelerType = determineTravelerType(interests)
  const themeTags = determineThemeTags(interests)

  return {
    id: itineraryId,
    title: `${duration} Days in ${destination}: ${interests.slice(0, 2).join(' & ')}`,
    description: `AI-generated comprehensive itinerary for ${destination} focusing on ${interests.join(', ')}. Perfect for ${travelerType} travelers.`,
    destination,
    duration,
    durationNights: Math.max(1, duration - 1),
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + (30 + duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelerType: travelerType as any,
    themeTags: themeTags as any,
    tags: interests,
    difficulty: pace === 'fast' || pace === 'fast-paced' ? 'moderate' : 'easy',
    pace: finalPace,
    preferences: interests,
    days,
    // Add inclusions and essentials for UI (not in type, but UI can use description or add support)
    // @ts-ignore
    inclusions,
    // @ts-ignore
    essentials,
    // Only add cost/fields if needed by UI
    totalCost: undefined,
    weatherConsiderations: getWeatherConsiderations(destination),
    bestMonthsToVisit: getBestMonths(destination),
    scamAlerts: getScamAlerts(destination),
    hiddenGems: getHiddenGems(destination, duration),
    packingList: getPackingList(destination, interests, duration),
    visaRequirements: getVisaRequirements(destination),
    vaccinations: getVaccinations(destination),
    documentsRequired: getDocumentsRequired(destination),
    embassyContact: getEmbassyContact(destination),
    alternatives: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
    likes: 0,
    saves: 0,
    views: 0
  }
}

// Generate a single day

function generateDay(
  dayNum: number,
  destination: string,
  interests: string[],
  budget: string,
  pace: string
): DayPlan {
  // Human-style, paragraph-based, descriptive bullet points
  const date = new Date(Date.now() + (30 + dayNum - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const city = destination.split(',')[0].trim()
  const isDubai = /dubai/i.test(destination)

  // Example: Dubai 5-day template with AI-generated modern, beautiful paragraphs
  const dubaiDays = [
    [
      '🌅 **Welcome to Dubai!** Your extraordinary journey begins as you touch down at Dubai International Airport, where luxury meets innovation. After a seamless meet-and-greet transfer, settle into your carefully selected hotel and take in the stunning city views.',
      '✨ As the golden hour paints the sky, embark on a magical **Dhow Cruise Dinner** along Dubai Marina or the historic Dubai Creek. Glide past illuminated skyscrapers while savoring an international buffet spread, traditional music, and mesmerizing city lights reflecting on the water. This enchanting evening sets the perfect tone for your Dubai adventure.',
      '🌙 Return to your hotel for a well-deserved rest, dreaming of the incredible experiences that await.'
    ],
    [
      '🏙️ **Iconic Dubai Unveiled**: Start your morning by ascending to the clouds at the **Burj Khalifa\'s 124th-floor observation deck**, where panoramic views of the city, desert, and ocean stretch endlessly before you. The world\'s tallest building offers an unforgettable perspective that will leave you breathless.',
      '🛍️ Descend into the world-renowned **Dubai Mall**, a shopper\'s paradise housing over 1,200 stores. Don\'t miss the mesmerizing Dubai Aquarium & Underwater Zoo, where thousands of marine creatures glide gracefully through massive viewing panels.',
      '🕌 Your afternoon transforms into a cultural journey as you visit the stunning **Jumeirah Mosque**, photograph the iconic sail-shaped **Burj Al Arab**, and ride the scenic monorail to the magnificent **Atlantis The Palm**. Each stop reveals a different facet of Dubai\'s architectural brilliance.',
      '⛲ As twilight descends, witness the spectacular **Dubai Fountain Show** – a choreographed water dance set to music that rivals any natural wonder. Cap off your evening with dinner at the charming **Souk Al Bahar**, where traditional Arabian ambiance meets modern dining elegance.'
    ],
    [
      '🏛️ **Journey Through Time**: Begin your day in the charming **Al Fahidi Historical District** (Bastakiya), where narrow lanes and traditional wind-tower architecture transport you to Old Dubai. Explore the fascinating **Dubai Museum** housed in the 18th-century Al Fahidi Fort, offering glimpses into the emirate\'s pearl-diving past.',
      '⛵ Experience authentic local life aboard a traditional **Abra (wooden boat)** as you cross Dubai Creek to the bustling **Deira district**. Lose yourself in the sensory overload of the legendary **Gold & Spice Souks**, where the aroma of saffron mingles with glittering displays of ornate jewelry.',
      '🏜️ **Desert Magic Awaits**: As afternoon transitions to evening, prepare for the adventure of a lifetime with a thrilling **Desert Safari**. Feel your heart race during exhilarating dune bashing, experience the timeless tradition of camel riding, and watch the sun paint the desert in spectacular hues.',
      '🌟 As darkness falls, indulge in a lavish BBQ dinner under a canopy of stars, mesmerized by captivating belly dance performances and the hypnotic spinning of the Tanoura show. This perfect blend of adrenaline and culture creates memories that will last forever.'
    ],
    [
      '🕌 **Abu Dhabi Grandeur**: Today\'s full-day excursion takes you to the UAE\'s majestic capital. Stand in awe before the **Sheikh Zayed Grand Mosque**, one of the world\'s most breathtaking architectural masterpieces, with its pristine white marble, intricate Islamic art, and the world\'s largest hand-knotted carpet.',
      '🏛️ Journey continues through the **Heritage Village**, where skilled artisans demonstrate traditional crafts, offering a window into Bedouin life before the oil boom transformed the region.',
      '🏎️ Choose your afternoon adventure: experience Formula 1 thrills at **Ferrari World** with the world\'s fastest roller coaster, or immerse yourself in world-class art at the stunning **Louvre Museum Abu Dhabi**, where masterpieces from across civilizations await.',
      '🌆 Return to Dubai by evening with time to unwind at leisure – perhaps indulge in last-minute shopping or savor gourmet cuisine at a rooftop restaurant with glittering city views stretching to the horizon.'
    ],
    [
      '🚀 **Future Meets Farewell**: Your final day in Dubai begins with wonder at the **Museum of the Future**, an architectural marvel that showcases cutting-edge innovations and humanity\'s potential. Alternatively, step through the massive frame of the **Dubai Frame** for stunning contrasting views of Old and New Dubai.',
      '🌺 If visiting between October and April, treat yourself to the kaleidoscope of colors at **Miracle Garden** (world\'s largest flower garden with 50 million blooms) or the vibrant multicultural celebration at **Global Village**, featuring pavilions from over 75 countries.',
      '🛍️ Dedicate your afternoon to final shopping adventures at the luxurious **Mall of the Emirates** (home to Ski Dubai!) or the trendy outdoor destination **City Walk**, perfect for picking up last-minute souvenirs and gifts.',
      '✈️ As evening approaches, bid farewell to this extraordinary city of dreams. Depart for the airport with a heart full of memories, a camera full of stunning photos, and stories that will captivate audiences for years to come. Dubai\'s magic will call you back!'
    ]
  ]

  let description = ''
  let bullets: string[] = []
  if (isDubai && dayNum <= 5) {
    description = dubaiDays[dayNum - 1].join(' ')
    bullets = dubaiDays[dayNum - 1]
  } else {
    // Generic fallback for other destinations with AI-generated modern style
    const genericTemplates = [
      [
        `✈️ **Your ${city} Adventure Begins!** Touch down in one of the world's most captivating destinations and feel the excitement building. After a smooth airport transfer, check into your thoughtfully selected accommodation and take a moment to soak in your surroundings.`,
        `🌆 As the day transitions to evening, venture out for your first taste of local culture. Perhaps a sunset stroll through the neighborhood, sampling street food delicacies, or simply finding that perfect rooftop spot to watch the city come alive with lights.`,
        `💫 Rest well tonight – tomorrow, your real adventure begins!`
      ],
      [
        `🏛️ **Cultural Immersion Day**: Wake up refreshed and ready to explore ${city}'s most iconic landmarks. Your carefully curated itinerary takes you to the heart of what makes this destination truly special – from ancient temples and historic quarters to architectural marvels that define the skyline.`,
        `📸 Every corner offers Instagram-worthy moments as you discover hidden courtyards, vibrant markets, and local artisans practicing centuries-old crafts. Engage with friendly locals, learn fascinating stories behind each monument, and let the city's rich heritage unfold before your eyes.`,
        `🍽️ Savor an authentic lunch at a beloved local eatery, where recipes passed down through generations deliver flavors that capture the essence of ${city}'s culinary soul.`
      ],
      [
        `⚡ **Adventure & Discovery**: Today is all about experiencing ${city} beyond the guidebook. Whether it's an adrenaline-pumping outdoor activity, a serene nature escape, or diving deep into local neighborhoods where tourists rarely venture – you're in for authentic experiences.`,
        `🎨 Afternoon brings creative exploration – perhaps a hands-on cooking class with a local chef, a traditional craft workshop, or a guided food tour that reveals the city's best-kept culinary secrets. These immersive activities create connections that transform sightseeing into storytelling.`,
        `🌙 As evening descends, experience ${city}'s vibrant nightlife scene, whether that means jazz clubs, rooftop bars with panoramic views, night markets buzzing with energy, or traditional cultural performances that showcase local artistry.`
      ],
      [
        `🗺️ **Hidden Gems & Local Favorites**: Today you'll explore ${city} like a local. Your guide takes you off the beaten path to discover secret viewpoints, family-run restaurants frequented by residents, and charming neighborhoods that most visitors never find.`,
        `🛍️ Dedicate time to thoughtful souvenir hunting in artisan markets and boutique shops where every purchase supports local craftspeople. Learn the stories behind traditional crafts, bargain playfully with vendors, and find unique treasures that embody your journey's spirit.`,
        `🌅 Catch the golden hour at a scenic spot known only to locals, where the setting sun casts magical light across the cityscape – a photographer's dream and a moment of peaceful reflection on your incredible journey so far.`
      ],
      [
        `📍 **Freestyle & Farewell**: Your final day offers beautiful flexibility. Revisit that café where the coffee tasted just right, return to that viewpoint for different lighting, or explore that intriguing side street you spotted earlier but didn't have time to wander.`,
        `🎁 Last-minute shopping becomes treasure hunting as you seek perfect gifts that will help loved ones back home experience your adventure vicariously. Perhaps pick up that cookbook, those handmade ceramics, or aromatic spices that will transport you back to ${city} with every use.`,
        `✨ As you prepare for departure, take a moment to absorb your final impressions – the sounds, smells, and energy that make ${city} unforgettable. You're not leaving; you're simply concluding this chapter, knowing you'll return with deeper understanding and appreciation. Safe travels, adventurer!`
      ]
    ]
    
    description = genericTemplates[dayNum - 1]?.join('\n\n') || genericTemplates[0].join('\n\n')
    bullets = genericTemplates[dayNum - 1] || genericTemplates[0]
  }

  return {
    id: `day-${dayNum}`,
    dayNumber: dayNum,
    date,
    title: getDayTitle(dayNum, destination, interests),
    description,
    activities: [], // Not used in this style
    morning: [],
    afternoon: [],
    evening: [],
    notes: undefined,
    safetyTips: undefined,
    localPhrases: undefined,
    accommodation: undefined,
    transportation: undefined,
    totalCost: undefined,
    // Add a new field for UI: dayBullets (not in type, but UI can use description or add support)
    // @ts-ignore
    dayBullets: bullets
  }
}

// Generate a single activity with comprehensive details
function generateActivity(
  activityIndex: number,
  dayNum: number,
  destination: string,
  interests: string[],
  budget: string,
  startTime: string
): Activity {
  // Only generate minimal fields: time, activity, location, tags
  const activityTypes: Activity['type'][] = ['attraction', 'cultural', 'shopping', 'adventure', 'relaxation']
  const type = activityTypes[activityIndex % activityTypes.length]
  const [hours, minutes] = startTime.split(':').map(Number)
  const duration = 2 // Always 2 hours for simplicity
  const endHours = hours + Math.floor(duration)
  const endMinutes = minutes + ((duration % 1) * 60)
  const endTime = `${String(endHours).padStart(2, '0')}:${String(Math.floor(endMinutes)).padStart(2, '0')}`

  return {
    id: `act-${dayNum}-${activityIndex + 1}`,
    type,
    title: getActivityTitle(type, interests, activityIndex, destination),
    description: '',
    location: {
      id: `loc-${dayNum}-${activityIndex}`,
      name: getLocationName(type, destination, interests, activityIndex),
      city: destination.split(',')[0],
      country: destination.split(',')[1]?.trim() || destination
    },
    timeSlot: {
      start: startTime,
      end: endTime,
      duration: Math.round(duration * 60)
    },
    tags: getActivityTags(type, interests)
    // All other fields omitted
  }
}

// Helper functions for generating content
function getDayTitle(dayNum: number, destination: string, interests: string[]): string {
  const city = destination.split(',')[0].trim()
  const isDubai = /dubai/i.test(destination)
  
  if (isDubai) {
    const dubaiTitles = [
      '🌅 Arrival & Marina Magic',
      '🏙️ Icons & Skyline Wonders', 
      '🏜️ Heritage & Desert Dreams',
      '🕌 Abu Dhabi Grand Journey',
      '🚀 Future Visions & Farewells'
    ]
    return dubaiTitles[dayNum - 1] || dubaiTitles[0]
  }
  
  // Generic beautiful titles for other destinations
  const templates = [
    `✈️ Welcome to ${city}`,
    `🏛️ Cultural Immersion`,
    `⚡ Adventure Awaits`,
    `🗺️ Hidden Treasures`,
    `🌅 Grand Finale`
  ]
  return templates[dayNum - 1] || templates[dayNum % templates.length]
}

function getDayDescription(dayNum: number, interests: string[]): string {
  return `Explore the best of ${interests.join(' and ')} experiences`
}

function getActivityTitle(type: Activity['type'], interests: string[], index: number, destination?: string): string {
  const city = destination?.split(',')[0] || 'City'
  const titles: Record<Activity['type'], string[]> = {
    attraction: [`${city} Tower Observation Deck`, 'Historic District Walking Tour', 'Iconic Temple Complex', 'Royal Palace Visit'],
    meal: ['Traditional Breakfast Spot', 'Riverside Lunch', 'Street Food Evening Tour', 'Rooftop Dinner Experience'],
    cultural: ['Ancient Temple Visit', 'National Museum Tour', 'Traditional Dance Performance', 'Local Art Gallery'],
    shopping: ['Morning Market Visit', 'Artisan Craft District', 'Designer Shopping Avenue', 'Night Bazaar Experience'],
    adventure: ['City Bike Tour', 'River Cruise', 'Cooking Class', 'Zip-line Adventure'],
    relaxation: ['Traditional Spa & Massage', 'Sunset Beach Time', 'Yoga & Meditation', 'Scenic Garden Walk'],
    transport: ['Airport Transfer', 'Train Ride', 'Boat Tour', 'Cable Car'],
    accommodation: ['Hotel Check-in', 'Resort Stay', 'Boutique Hotel', 'Hostel']
  }
  return titles[type][index % titles[type].length]
}

function getActivityDescription(type: Activity['type'], interests: string[]): string {
  const descriptions: Record<Activity['type'], string> = {
    attraction: 'Explore one of the city\'s most iconic landmarks with stunning views and rich history. Perfect for photography enthusiasts.',
    meal: 'Savor authentic local flavors at a highly-rated spot. Experience the culinary traditions that define this destination.',
    cultural: 'Immerse yourself in the local culture and traditions. Learn about the history and artistic heritage of the region.',
    shopping: 'Discover unique local crafts, souvenirs, and authentic products. Great for gifts and memorable keepsakes.',
    adventure: 'Get your adrenaline pumping with an exciting activity. Perfect for those seeking unique experiences.',
    relaxation: 'Unwind and rejuvenate with this peaceful experience. Balance your trip with moments of calm and serenity.',
    transport: 'Comfortable and scenic transportation to your next destination.',
    accommodation: 'Rest and recharge at your carefully selected accommodation.'
  }
  return descriptions[type]
}

function getLocationName(type: Activity['type'], destination: string, interests: string[], index: number): string {
  const city = destination.split(',')[0]
  const names: Record<Activity['type'], string[]> = {
    attraction: [`${city} Grand Palace`, `${city} Historical Center`, `${city} Observation Tower`, `${city} Ancient Temple`],
    meal: [`${city} Street Kitchen`, `Riverside ${city} Restaurant`, `Traditional ${city} Eatery`, `${city} Night Market`],
    cultural: [`${city} National Museum`, `${city} Cultural Center`, `${city} Traditional Theater`, `${city} Art District`],
    shopping: [`${city} Central Market`, `${city} Artisan Quarter`, `${city} Shopping District`, `${city} Night Bazaar`],
    adventure: [`${city} Adventure Park`, `${city} River Point`, `${city} Activity Center`, `${city} Outdoor Hub`],
    relaxation: [`${city} Wellness Spa`, `${city} Beach Resort`, `${city} Zen Garden`, `${city} Sunset Point`],
    transport: [`${city} Station`, `${city} Port`, `${city} Terminal`, `${city} Hub`],
    accommodation: [`${city} Hotel`, `${city} Resort`, `${city} Boutique Stay`, `${city} Lodge`]
  }
  return names[type][index % names[type].length]
}

function getActivityTags(type: Activity['type'], interests: string[]): string[] {
  const baseTags = [type]
  return [...baseTags, ...interests.slice(0, 2)]
}

// New helper functions for enhanced fields
function getOpeningHours(type: Activity['type']): string {
  const hours: Record<Activity['type'], string> = {
    attraction: '9:00 AM - 6:00 PM (Closed Mondays)',
    meal: 'Open all day',
    cultural: '10:00 AM - 5:00 PM',
    shopping: '10:00 AM - 9:00 PM',
    adventure: '8:00 AM - 5:00 PM',
    relaxation: '9:00 AM - 8:00 PM',
    transport: '24/7',
    accommodation: '24/7 check-in available'
  }
  return hours[type]
}

function getEstimatedDuration(type: Activity['type']): string {
  const durations: Record<Activity['type'], string> = {
    attraction: '2-3 hours',
    meal: '1-1.5 hours',
    cultural: '2-4 hours',
    shopping: '1.5-2 hours',
    adventure: '3-4 hours',
    relaxation: '2-3 hours',
    transport: '30-45 minutes',
    accommodation: 'N/A'
  }
  return durations[type]
}

function getNavigationTip(type: Activity['type'], destination: string): string {
  const city = destination.split(',')[0]
  const tips: Record<Activity['type'], string> = {
    attraction: `Take metro line 2 to ${city} Center Station (Exit 3). Walk 5 mins east. Very walkable.`,
    meal: 'Easily accessible via local tuk-tuk or 10-min walk from main square. Use Google Maps for best route.',
    cultural: 'Located in historic district. Metro + 7 min walk or direct taxi. Parking available nearby.',
    shopping: 'Central location, accessible by metro or on foot. Multiple bus routes stop nearby.',
    adventure: 'Pickup service available from major hotels. Otherwise take taxi (20 mins from city center).',
    relaxation: 'Complimentary shuttle from downtown hotels or 15-min taxi ride.',
    transport: 'Follow signage or use ride-hailing apps for direct transfers.',
    accommodation: 'Central location with easy access to public transport and main attractions.'
  }
  return tips[type]
}

function getStandoutFeature(type: Activity['type'], destination: string): string {
  const features: Record<Activity['type'], string> = {
    attraction: '360° panoramic views, Instagram-worthy spot, Golden hour photography',
    meal: 'Signature dish: Pad Thai with river prawns, Secret family recipe',
    cultural: 'UNESCO World Heritage Site, Live traditional music performances',
    shopping: 'Handmade local crafts, Bargaining expected (start at 50% of asking price)',
    adventure: 'Expert English-speaking guides, All equipment included, Beginner-friendly',
    relaxation: 'Organic aromatherapy oils, Sunset yoga sessions, Ocean view treatment rooms',
    transport: 'Air-conditioned vehicles, English-speaking drivers',
    accommodation: 'Rooftop pool with city views, Complimentary breakfast included'
  }
  return features[type]
}

function getLocalTip(type: Activity['type'], destination: string): string {
  const tips: Record<Activity['type'], string> = {
    attraction: '🎫 Buy tickets online to skip 30-min queues. Best visited early morning (8-10am) to avoid crowds.',
    meal: '💡 Ask for "mild spice" unless you love heat! Come hungry - portions are generous. Cash preferred.',
    cultural: '👗 Dress modestly (cover shoulders & knees). Free guided tours in English at 11am & 2pm daily.',
    shopping: '🛍️ Prices are negotiable - always ask for "best price". Quality varies, inspect carefully before buying.',
    adventure: '📸 Waterproof bags provided but bring extra phone protection. Wear comfortable closed shoes.',
    relaxation: '💆 Book 2 days ahead for weekend slots. Tip 10-15% if service was excellent. No phones allowed inside.',
    transport: '🚗 Use metered taxis or Grab app to avoid tourist pricing. Keep small bills for tolls.',
    accommodation: '🏨 Request rooms on higher floors for better views and less street noise.'
  }
  return tips[type]
}

function getCrowdLevel(type: Activity['type'], index: number): 'low' | 'moderate' | 'high' {
  const levels: ('low' | 'moderate' | 'high')[] = ['low', 'moderate', 'high']
  if (type === 'attraction' || type === 'shopping') return 'high'
  if (type === 'relaxation' || type === 'cultural') return index % 2 === 0 ? 'low' : 'moderate'
  return 'moderate'
}

function getBestTimeToVisit(type: Activity['type'], currentTime: string): string {
  const hour = parseInt(currentTime.split(':')[0])
  if (type === 'attraction') {
    return hour < 10 ? 'Perfect timing - less crowded now!' : 'Peak hours (10am-4pm) - expect crowds'
  }
  if (type === 'meal') {
    return hour >= 12 && hour <= 14 ? 'Prime lunch hour' : 'Off-peak - quicker service'
  }
  if (type === 'shopping') {
    return hour > 16 ? 'Evening markets come alive now!' : 'Morning is quieter for browsing'
  }
  return 'Anytime works well'
}

function getAlternative(type: Activity['type'], destination: string, budget: string): { title: string; description: string; reason: string } {
  const city = destination.split(',')[0]
  // Return a simple alternative suggestion for the activity type
  if (type === 'attraction') {
    return {
      title: `Alternative to main attraction in ${city}`,
      description: `If the main attraction is crowded or closed, visit a local museum or art gallery for a quieter experience.`,
      reason: 'Provides a backup plan for sightseeing.'
    }
  }
  // Add more cases for other types as needed
  return {
    title: `Alternative activity in ${city}`,
    description: `Try a local park or market for a change of pace.`,
    reason: 'Offers variety in your itinerary.'
  }
}

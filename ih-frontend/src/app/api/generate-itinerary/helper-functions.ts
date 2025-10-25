// Helper functions for comprehensive itinerary generation

export function determineTravelerType(interests: string[]): string {
  if (interests.some(i => i.includes('family') || i.includes('kids'))) return 'family'
  if (interests.some(i => i.includes('couple') || i.includes('romantic') || i.includes('honeymoon'))) return 'couple'
  if (interests.some(i => i.includes('solo') && i.includes('woman'))) return 'solo_woman'
  if (interests.some(i => i.includes('solo'))) return 'solo'
  if (interests.some(i => i.includes('gen z') || i.includes('youth') || i.includes('backpack'))) return 'gen_z'
  if (interests.some(i => i.includes('friend'))) return 'friends'
  return 'solo'
}

export function determineThemeTags(interests: string[]): string[] {
  const themes: string[] = []
  if (interests.some(i => i.includes('adventure') || i.includes('trek') || i.includes('hiking'))) themes.push('adventure')
  if (interests.some(i => i.includes('beach') || i.includes('ocean'))) themes.push('beach')
  if (interests.some(i => i.includes('culture') || i.includes('temple') || i.includes('museum'))) themes.push('culture')
  if (interests.some(i => i.includes('food') || i.includes('cuisine'))) themes.push('food')
  if (interests.some(i => i.includes('wellness') || i.includes('yoga') || i.includes('spa'))) themes.push('wellness')
  if (interests.some(i => i.includes('shopping'))) themes.push('shopping')
  if (interests.some(i => i.includes('nature') || i.includes('wildlife'))) themes.push('nature')
  if (interests.some(i => i.includes('nightlife') || i.includes('party'))) themes.push('nightlife')
  if (interests.some(i => i.includes('photo'))) themes.push('photography')
  if (interests.some(i => i.includes('spiritual') || i.includes('meditation'))) themes.push('spiritual')
  
  return themes.length > 0 ? themes : ['culture', 'sightseeing']
}

export function getWeatherConsiderations(destination: string): string {
  const city = destination.toLowerCase()
  if (city.includes('thailand') || city.includes('bangkok')) {
    return 'Hot & humid year-round (28-35°C). Rainy season: May-October. Best weather: November-February.'
  }
  if (city.includes('tokyo') || city.includes('japan')) {
    return 'Four distinct seasons. Cherry blossoms: March-April. Hot summer: June-August. Beautiful autumn: Sept-Nov.'
  }
  if (city.includes('bali') || city.includes('indonesia')) {
    return 'Tropical climate. Dry season: April-Sept (best). Wet season: Oct-March with afternoon showers.'
  }
  if (city.includes('dubai') || city.includes('uae')) {
    return 'Extremely hot summer (40-50°C). Best time: November-March (20-30°C). Indoor attractions during peak summer.'
  }
  if (city.includes('maldives')) {
    return 'Warm year-round (25-31°C). Dry season: Nov-April (best for diving). Monsoon: May-Oct with occasional rain.'
  }
  if (city.includes('paris') || city.includes('france')) {
    return 'Mild climate. Spring (Apr-June) & Fall (Sept-Oct) ideal. Hot summer, cold winter. Rain possible year-round.'
  }
  if (city.includes('london') || city.includes('uk')) {
    return 'Mild but rainy. Pack layers & umbrella. Best: May-Sept. Winter: Dec-Feb is cold & dark (4pm sunset).'
  }
  if (city.includes('new york')) {
    return 'Four seasons. Hot humid summer (June-Aug), cold snowy winter (Dec-Feb). Best: Spring & Fall.'
  }
  if (city.includes('singapore')) {
    return 'Hot & humid year-round (26-33°C). Rain showers common but brief. Driest: Feb-April. Always pack light layers.'
  }
  return 'Check local weather forecast 2 weeks before departure. Pack accordingly for seasonal variations.'
}

export function getBestMonths(destination: string): string[] {
  const city = destination.toLowerCase()
  if (city.includes('thailand') || city.includes('bangkok')) return ['November', 'December', 'January', 'February']
  if (city.includes('tokyo') || city.includes('japan')) return ['March', 'April', 'October', 'November']
  if (city.includes('bali')) return ['April', 'May', 'June', 'September']
  if (city.includes('dubai')) return ['November', 'December', 'January', 'February', 'March']
  if (city.includes('maldives')) return ['November', 'December', 'January', 'February', 'March', 'April']
  if (city.includes('paris')) return ['April', 'May', 'June', 'September', 'October']
  if (city.includes('london')) return ['May', 'June', 'July', 'August', 'September']
  if (city.includes('new york')) return ['April', 'May', 'September', 'October']
  if (city.includes('singapore')) return ['February', 'March', 'April']
  return ['Year-round']
}

export function getScamAlerts(destination: string): string[] {
  const city = destination.toLowerCase()
  const commonScams = [
    '🚫 Unmetered taxis: Always insist on meter or use Grab/Uber apps',
    '🚫 "Closed today" scam: Ignore touts saying attraction is closed - verify yourself',
    '🚫 Overcharging tourists: Check menu prices before ordering, especially drinks',
    '🚫 Fake tour guides: Book through official channels or reputable platforms only'
  ]
  
  if (city.includes('thailand') || city.includes('bangkok')) {
    return [
      ...commonScams,
      '🚫 Tuk-tuk "tours": They take you to gem/suit shops for commission. Politely decline.',
      '🚫 Grand Palace taxi scam: Drivers say it\'s closed (it\'s not) & offer expensive tour instead',
      '🚫 Jet ski rental: Photograph jet ski before use - scammers claim pre-existing damage'
    ]
  }
  
  if (city.includes('bali')) {
    return [
      ...commonScams,
      '🚫 Money changers: Count carefully, some use sleight of hand. Use official banks/ATMs',
      '🚫 "Blessing" ceremonies: Street "priests" demand payment after - politely decline',
      '🚫 Overpriced taxis at airport: Pre-book airport transfer or use official taxi counter'
    ]
  }
  
  if (city.includes('dubai')) {
    return [
      '✅ Generally safe! Low scam risk.',
      '🚫 Inflated taxi fares from airport: RTA taxis are metered & regulated',
      '🚫 Fake designer goods: If price is too good, it\'s fake. Buy from official stores',
      '💡 Haggling expected at souks (markets) but not malls'
    ]
  }
  
  if (city.includes('paris')) {
    return [
      ...commonScams,
      '🚫 Friendship bracelet: Person ties bracelet on wrist then demands payment - say NO',
      '🚫 Gold ring "find": Someone "finds" gold ring near you & offers it - it\'s brass, walk away',
      '🚫 Petition scam: Sign "petition" then demanded donation - don\'t engage',
      '🚫 Pickpockets on metro: Keep bags zipped & in front, especially Line 1 & tourist areas'
    ]
  }
  
  return commonScams
}

export function getHiddenGems(destination: string, duration: number): Array<{
  title: string
  description: string
  dayNumber?: number
}> {
  const city = destination.toLowerCase()
  
  if (city.includes('thailand') || city.includes('bangkok')) {
    return [
      {
        title: 'Talad Rot Fai Train Night Market',
        description: 'Vintage market with antiques, street food & live music. Open Thu-Sun evenings. Locals\' favorite!',
        dayNumber: 2
      },
      {
        title: 'Wat Pariwat (David Beckham Temple)',
        description: 'Quirky temple with Beckham statue, Hello Kitty shrine & Superman. Off tourist trail.',
        dayNumber: 3
      },
      {
        title: 'Baan Silapin (Artist House)',
        description: 'Traditional puppet shows (2pm daily) in 200-year-old wooden house. Magical atmosphere.',
        dayNumber: duration > 3 ? 4 : undefined
      }
    ]
  }
  
  if (city.includes('tokyo') || city.includes('japan')) {
    return [
      {
        title: 'Omoide Yokocho (Memory Lane)',
        description: 'Narrow alley of tiny yakitori bars near Shinjuku Station. Authentic local izakaya experience.',
        dayNumber: 1
      },
      {
        title: 'TeamLab Borderless Digital Art Museum',
        description: 'Mind-bending immersive digital art installations. Book online in advance - sells out!',
        dayNumber: 2
      },
      {
        title: 'Yanaka Ginza Shopping Street',
        description: 'Old Tokyo neighborhood escaped WWII bombings. Traditional shops, street food, cats everywhere!',
        dayNumber: duration > 4 ? 5 : undefined
      }
    ]
  }
  
  if (city.includes('bali')) {
    return [
      {
        title: 'Tukad Cepung Waterfall',
        description: 'Hidden waterfall inside a cave with magical light beams. Come early morning for best photos.',
        dayNumber: 3
      },
      {
        title: 'Warung Biah Biah (Campuhan Ridge)',
        description: 'Secret cliffside warung with best sunset view in Ubud. Order Bintang & Nasi Goreng.',
        dayNumber: 2
      }
    ]
  }
  
  return [
    {
      title: 'Local Market Morning',
      description: 'Wake up early & visit the local market where residents shop. Authentic food & cultural insight.',
      dayNumber: 2
    },
    {
      title: 'Neighborhood Walk',
      description: 'Explore residential areas away from tourist zones. Discover local cafes, parks & daily life.',
      dayNumber: duration > 2 ? 3 : undefined
    }
  ]
}

export function getPackingList(destination: string, interests: string[], duration: number): string[] {
  const city = destination.toLowerCase()
  const baseItems = [
    '📱 Phone charger & power bank',
    '💳 Credit cards + small amount of local cash',
    '🪪 Passport (6+ months validity) + photocopies',
    '💊 Basic medications & travel insurance details',
    '🧴 Sunscreen SPF 50+ & insect repellent',
    '🎒 Daypack for daily excursions'
  ]
  
  const clothingItems: string[] = []
  if (city.includes('thailand') || city.includes('bangkok') || city.includes('bali') || city.includes('singapore')) {
    clothingItems.push(
      '👕 Light, breathable clothing (cotton)',
      '🧣 Scarf/shawl for temple visits',
      '👟 Comfortable walking shoes (will get wet)',
      '🩴 Sandals for beach/casual',
      '🧥 Light rain jacket or umbrella'
    )
  }
  
  if (city.includes('dubai')) {
    clothingItems.push(
      '👗 Modest clothing (shoulders/knees covered for malls/mosques)',
      '🕶️ Sunglasses & hat essential',
      '👟 Comfortable shoes (air-conditioned indoors)',
      '🏊 Swimwear for hotel pool'
    )
  }
  
  if (city.includes('tokyo') || city.includes('japan')) {
    clothingItems.push(
      '👟 Extremely comfortable walking shoes (10k+ steps daily)',
      '🧦 Easy-to-remove shoes (temples require removal)',
      '🧥 Layers (temperature varies indoors/outdoors)',
      '😷 Face mask (optional but culturally normal)'
    )
  }
  
  if (city.includes('paris') || city.includes('london')) {
    clothingItems.push(
      '🧥 Layers! (weather changes quickly)',
      '☔ Compact umbrella (rain likely)',
      '👟 Comfortable walking shoes',
      '🧣 Scarf & light jacket (even summer evenings)'
    )
  }
  
  const activityItems: string[] = []
  if (interests.some(i => i.includes('beach') || i.includes('swim'))) {
    activityItems.push('🏊 Swimwear & beach towel', '🤿 Snorkel gear (or rent locally)')
  }
  
  if (interests.some(i => i.includes('adventure') || i.includes('trek'))) {
    activityItems.push('🥾 Sturdy hiking shoes', '🎒 Waterproof bag for valuables', '💧 Reusable water bottle')
  }
  
  if (interests.some(i => i.includes('photo'))) {
    activityItems.push('📸 Camera + extra battery', '🔌 Universal adapter', '💾 Extra memory cards')
  }
  
  if (duration > 7) {
    activityItems.push('🧺 Small laundry detergent (wash clothes in sink)')
  }
  
  return [...baseItems, ...clothingItems, ...activityItems]
}

export function getVisaRequirements(destination: string): string {
  const city = destination.toLowerCase()
  
  if (city.includes('thailand') || city.includes('bangkok')) {
    return '🇮🇳 Indian citizens: Visa-free for 15 days (from Nov 2023). For longer stays, apply for Tourist Visa (60 days, extendable). Passport must be valid 6+ months.'
  }
  
  if (city.includes('dubai') || city.includes('uae')) {
    return '🇮🇳 Indian citizens: Visa on arrival (14-30 days depending on passport type). Apply online before travel. Passport valid 6+ months required.'
  }
  
  if (city.includes('bali') || city.includes('indonesia')) {
    return '🇮🇳 Indian citizens: Visa on arrival available (30 days, extendable once for 30 more days). Cost: $35 USD. Passport valid 6+ months + return ticket required.'
  }
  
  if (city.includes('singapore')) {
    return '🇮🇳 Indian citizens: e-Visa required (apply online minimum 3 days before). Tourist visa: 30 days single/multiple entry. Processing: 3-5 business days.'
  }
  
  if (city.includes('tokyo') || city.includes('japan')) {
    return '🇮🇳 Indian citizens: e-Visa required (apply online minimum 3 business days before). Tourist visa: up to 90 days. Processing time: 5-7 business days. Passport valid 6+ months.'
  }
  
  if (city.includes('maldives')) {
    return '🇮🇳 Indian citizens: Visa-free! Free 30-day visa on arrival. Just need valid passport (6+ months), confirmed hotel booking, and return ticket.'
  }
  
  if (city.includes('paris') || city.includes('france') || city.includes('london') || city.includes('uk')) {
    return '🇮🇳 Indian citizens: Schengen/UK visa required. Apply at respective embassy/VFS 3-6 weeks before travel. Requires travel insurance, hotel bookings, bank statements.'
  }
  
  if (city.includes('new york') || city.includes('usa')) {
    return '🇮🇳 Indian citizens: B1/B2 Tourist Visa required. Apply 3-4 months in advance. In-person interview mandatory at US Embassy. Processing: 3-5 weeks after interview.'
  }
  
  return '✈️ Visa requirements vary by nationality. Check with embassy/consulate minimum 2 months before travel. Ensure passport validity of 6+ months beyond return date.'
}

export function getVaccinations(destination: string): string[] {
  const city = destination.toLowerCase()
  
  if (city.includes('thailand') || city.includes('bali') || city.includes('indonesia')) {
    return [
      '💉 Recommended: Hepatitis A, Typhoid',
      '🦟 Malaria prophylaxis (if visiting rural areas)',
      '💉 Routine: MMR, Polio, Tetanus (ensure up-to-date)',
      '🦟 Dengue awareness (no vaccine widely available)',
      '💡 Consult travel doctor 4-6 weeks before departure'
    ]
  }
  
  if (city.includes('dubai') || city.includes('singapore') || city.includes('tokyo') || city.includes('japan')) {
    return [
      '✅ No specific vaccinations required',
      '💉 Routine vaccinations recommended (MMR, Polio, Tetanus)',
      '💡 Travel insurance recommended',
      '😷 General health precautions sufficient'
    ]
  }
  
  if (city.includes('maldives')) {
    return [
      '✅ No mandatory vaccinations',
      '💉 Recommended: Hepatitis A, Typhoid (precautionary)',
      '💉 Routine vaccinations up-to-date',
      '☀️ Sunburn & dehydration main health risks'
    ]
  }
  
  return [
    '💉 Consult travel doctor 4-6 weeks before departure',
    '💉 Ensure routine vaccinations up-to-date',
    '🏥 Check if travel insurance covers medical emergencies',
    '💊 Carry prescription medications in original packaging'
  ]
}

export function getLocalPhrases(destination: string): Array<{
  phrase: string
  translation: string
  pronunciation?: string
}> {
  const city = destination.toLowerCase()
  
  if (city.includes('thailand') || city.includes('bangkok')) {
    return [
      { phrase: 'Hello', translation: 'Sawasdee krap/ka', pronunciation: 'sa-wad-dee krap/ka' },
      { phrase: 'Thank you', translation: 'Khob khun krap/ka', pronunciation: 'kop-koon krap/ka' },
      { phrase: 'How much?', translation: 'Tao rai?', pronunciation: 'tao-rye' },
      { phrase: 'Delicious', translation: 'Aroi', pronunciation: 'ah-roy' },
      { phrase: 'Too expensive', translation: 'Paeng pai', pronunciation: 'peng-pie' }
    ]
  }
  
  if (city.includes('tokyo') || city.includes('japan')) {
    return [
      { phrase: 'Hello', translation: 'Konnichiwa', pronunciation: 'kohn-nee-chee-wah' },
      { phrase: 'Thank you', translation: 'Arigatou gozaimasu', pronunciation: 'ah-ree-gah-toh goh-zigh-mahs' },
      { phrase: 'Excuse me', translation: 'Sumimasen', pronunciation: 'soo-mee-mah-sen' },
      { phrase: 'Delicious', translation: 'Oishii', pronunciation: 'oy-shee' },
      { phrase: 'I don\'t understand', translation: 'Wakarimasen', pronunciation: 'wah-kah-ree-mah-sen' }
    ]
  }
  
  if (city.includes('bali') || city.includes('indonesia')) {
    return [
      { phrase: 'Hello', translation: 'Selamat pagi/siang', pronunciation: 'se-lah-mat pah-gee/see-ang' },
      { phrase: 'Thank you', translation: 'Terima kasih', pronunciation: 'teh-ree-mah kah-see' },
      { phrase: 'How much?', translation: 'Berapa harganya?', pronunciation: 'beh-rah-pah har-gahn-yah' },
      { phrase: 'Delicious', translation: 'Enak', pronunciation: 'eh-nahk' },
      { phrase: 'Beautiful', translation: 'Cantik', pronunciation: 'chan-tik' }
    ]
  }
  
  if (city.includes('paris') || city.includes('france')) {
    return [
      { phrase: 'Hello', translation: 'Bonjour', pronunciation: 'bon-zhoor' },
      { phrase: 'Thank you', translation: 'Merci', pronunciation: 'mehr-see' },
      { phrase: 'Excuse me', translation: 'Excusez-moi', pronunciation: 'ex-kew-zay-mwah' },
      { phrase: 'How much?', translation: 'Combien?', pronunciation: 'kom-bee-en' },
      { phrase: 'The bill, please', translation: 'L\'addition, s\'il vous plaît', pronunciation: 'lah-dee-see-ohn see voo play' }
    ]
  }
  
  if (city.includes('dubai') || city.includes('uae')) {
    return [
      { phrase: 'Hello', translation: 'Marhaba', pronunciation: 'mar-ha-ba' },
      { phrase: 'Thank you', translation: 'Shukran', pronunciation: 'shoo-kran' },
      { phrase: 'Peace be upon you', translation: 'As-salamu alaykum', pronunciation: 'as-sa-lam-oo-ah-lay-koom' },
      { phrase: 'How much?', translation: 'Kam?', pronunciation: 'kam' },
      { phrase: 'Goodbye', translation: 'Ma\'a salama', pronunciation: 'mah-ah sa-lah-ma' }
    ]
  }
  
  // Default English-speaking destinations
  return [
    { phrase: 'Hello', translation: 'Hello', pronunciation: 'universal' },
    { phrase: 'Thank you', translation: 'Thank you', pronunciation: 'universal' },
    { phrase: 'Please', translation: 'Please', pronunciation: 'universal' }
  ]
}

// Documents required for most Indian travelers based on destination
export function getDocumentsRequired(destination: string): string[] {
  const city = destination.toLowerCase()
  const base: string[] = [
    '🪪 Passport with 6+ months validity from date of arrival',
    '📷 Photocopies of passport & visa (carry separately)',
    '🛡️ Travel insurance (medical + trip coverage)',
    '✈️ Confirmed return/onward ticket',
    '🏨 Hotel bookings or invitation letter',
    '💳 Proof of funds (bank statements / credit card)'
  ]

  if (city.includes('dubai') || city.includes('uae')) {
    return [
      ...base,
      '📄 UAE e-visa printout or visa-on-arrival eligibility proof',
      '🪙 International debit/credit card or forex card'
    ]
  }

  if (city.includes('bali') || city.includes('indonesia')) {
    return [
      ...base,
      '📄 Visa on Arrival fee (USD 35) – cash/card',
      '💉 Vaccination certificates if applicable (per latest advisory)'
    ]
  }

  if (city.includes('thailand') || city.includes('bangkok')) {
    return [
      ...base,
      '📄 Visa-free entry proof (if applicable) or tourist visa',
      '💵 Proof of sufficient funds (~THB 10,000 per person)'
    ]
  }

  if (city.includes('tokyo') || city.includes('japan')) {
    return [
      ...base,
      '📄 Japan e-visa approval PDF (if required)',
      '📝 Tentative itinerary & employer leave letter (often requested)'
    ]
  }

  if (city.includes('paris') || city.includes('france') || city.includes('london') || city.includes('uk')) {
    return [
      ...base,
      '📄 Schengen/UK visa vignette & copies',
      '🏦 3-6 months bank statements & ITR copy (keep handy)'
    ]
  }

  if (city.includes('new york') || city.includes('usa')) {
    return [
      ...base,
      '📄 US B1/B2 visa (in passport) & DS-160 confirmation email',
      '🏦 Proof of funds & ties to home country (optional but helpful)'
    ]
  }

  if (city.includes('maldives')) {
    return [
      ...base,
      '🏨 Confirmed resort booking for entire stay',
      '💰 Proof of sufficient funds (~USD 100/day recommended)'
    ]
  }

  return base
}

// Embassy/Consulate contact or directories; prefers official sources
export function getEmbassyContact(destination: string): {
  name: string
  country?: string
  city?: string
  website?: string
  directoryUrl?: string
  emergencyRegistration?: string
  email?: string
  phone?: string
  address?: string
  hours?: string
  notes?: string
} {
  const lower = destination.toLowerCase()

  // We link official directories because specific addresses/phones change often
  if (lower.includes('japan') || lower.includes('tokyo')) {
    return {
      name: 'Embassy of India, Tokyo',
      country: 'Japan',
      city: 'Tokyo',
      website: 'https://www.indembassy-tokyo.gov.in/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.tokyo@mea.gov.in',
      phone: '+81-3-3262-2391',
      notes: 'Check website for consular hours and appointment requirements.'
    }
  }

  if (lower.includes('thailand') || lower.includes('bangkok')) {
    return {
      name: 'Embassy of India, Bangkok',
      country: 'Thailand',
      city: 'Bangkok',
      website: 'https://www.indianembassy.in.th/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.bangkok@mea.gov.in',
      phone: '+66-2-258-0300',
      notes: 'Passport/visa services via VFS; verify latest timings.'
    }
  }

  if (lower.includes('bali') || lower.includes('indonesia')) {
    return {
      name: 'Embassy of India, Jakarta (covers Bali)',
      country: 'Indonesia',
      city: 'Jakarta',
      website: 'https://www.indianembassyjakarta.gov.in/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.jakarta@mea.gov.in',
      phone: '+62-21-2522299',
      notes: 'Honorary Consulate in Bali may assist; see embassy site for contacts.'
    }
  }

  if (lower.includes('dubai') || lower.includes('uae')) {
    return {
      name: 'Consulate General of India, Dubai',
      country: 'United Arab Emirates',
      city: 'Dubai',
      website: 'https://www.cgidubai.gov.in/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.dubai@mea.gov.in',
      phone: '+971-4-3971222',
      notes: 'For Abu Dhabi, see Embassy of India, Abu Dhabi website.'
    }
  }

  if (lower.includes('paris') || lower.includes('france')) {
    return {
      name: 'Embassy of India, Paris',
      country: 'France',
      city: 'Paris',
      website: 'https://www.ambinde.fr/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.paris@mea.gov.in',
      phone: '+33-1-4050-7070',
      notes: 'Consular services via VFS; check appointment system.'
    }
  }

  if (lower.includes('london') || lower.includes('uk') || lower.includes('united kingdom')) {
    return {
      name: 'High Commission of India, London',
      country: 'United Kingdom',
      city: 'London',
      website: 'https://www.hcilondon.gov.in/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'info.london@mea.gov.in',
      phone: '+44-20-7836-8484',
      notes: 'UK regions also covered by CGI Birmingham & CGI Edinburgh.'
    }
  }

  if (lower.includes('new york') || lower.includes('usa') || lower.includes('united states')) {
    return {
      name: 'Consulate General of India, New York',
      country: 'United States of America',
      city: 'New York',
      website: 'https://www.indiainnewyork.gov.in/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'info.newyork@mea.gov.in',
      phone: '+1-212-774-0600',
      notes: 'For other US regions, see Indian Embassy Washington DC and other CGIs.'
    }
  }

  if (lower.includes('singapore')) {
    return {
      name: 'High Commission of India, Singapore',
      country: 'Singapore',
      city: 'Singapore',
      website: 'https://hcisingapore.gov.in/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.singapore@mea.gov.in',
      phone: '+65-6737-6777',
      notes: 'Check website for OCI/Passport/Visa service providers & timings.'
    }
  }

  if (lower.includes('maldives')) {
    return {
      name: 'High Commission of India, Malé',
      country: 'Maldives',
      city: 'Malé',
      website: 'https://hci.gov.in/male/',
      directoryUrl: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
      emergencyRegistration: 'https://www.madad.gov.in/',
      email: 'cons.male@mea.gov.in',
      phone: '+960-332-3015',
      notes: 'For resort islands, contact local authorities for emergencies; HCI Malé supports Indian nationals.'
    }
  }

  // Default: official directory
  return {
    name: 'Indian Missions Abroad Directory',
    website: 'https://www.mea.gov.in/indian-missions-abroad-new.htm',
    emergencyRegistration: 'https://www.madad.gov.in/',
    notes: 'Use the official directory to find the nearest Indian Embassy/Consulate and verify contact details before visiting.'
  }
}

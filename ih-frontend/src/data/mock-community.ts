import type {
  User,
  Badge,
  TravelStory,
  QAThread,
  Answer,
  PublicItinerary,
  Comment,
  Reaction,
  DestinationCommunity
} from '@/types/community'

// Mock badges
export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Top Contributor',
    icon: '🏆',
    color: '#FFD700',
    description: 'Has shared 20+ helpful itineraries'
  },
  {
    id: 'badge-2',
    name: 'Globe Trotter',
    icon: '🌍',
    color: '#4169E1',
    description: 'Visited 30+ countries'
  },
  {
    id: 'badge-3',
    name: 'Foodie',
    icon: '🍜',
    color: '#FF6347',
    description: 'Expert in culinary travel experiences'
  },
  {
    id: 'badge-4',
    name: 'Adventure Seeker',
    icon: '⛰️',
    color: '#228B22',
    description: 'Completed 10+ adventure treks'
  },
  {
    id: 'badge-5',
    name: 'Photographer',
    icon: '📸',
    color: '#FF69B4',
    description: 'Shared stunning travel photography'
  },
  {
    id: 'badge-6',
    name: 'Budget Master',
    icon: '💰',
    color: '#32CD32',
    description: 'Expert in budget travel tips'
  },
  {
    id: 'badge-7',
    name: 'Wellness Guru',
    icon: '🧘',
    color: '#9370DB',
    description: 'Specialist in wellness and yoga retreats'
  }
]

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Maya Sharma',
    username: 'wanderlust_maya',
    avatar: '/images/avatars/maya.jpg',
    bio: 'Solo traveler & food blogger. 45 countries and counting! 🌍✈️',
    location: 'Mumbai, India',
    joinedDate: '2023-03-15T00:00:00Z',
    stats: {
      followers: 12453,
      following: 892,
      trips: 23,
      reviews: 156
    },
    verified: true,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2]]
  },
  {
    id: 'user-2',
    name: 'Raj Patel',
    username: 'adventure_raj',
    avatar: '/images/avatars/raj.jpg',
    bio: 'Mountain lover | Trekking enthusiast | Adventure photographer',
    location: 'Bangalore, India',
    joinedDate: '2022-11-20T00:00:00Z',
    stats: {
      followers: 8765,
      following: 543,
      trips: 15,
      reviews: 89
    },
    verified: true,
    badges: [mockBadges[3], mockBadges[4]]
  },
  {
    id: 'user-3',
    name: 'Priya Desai',
    username: 'budget_backpacker',
    avatar: '/images/avatars/priya.jpg',
    bio: 'Traveling the world on a shoestring budget. Tips & tricks for budget travelers!',
    location: 'Delhi, India',
    joinedDate: '2024-01-10T00:00:00Z',
    stats: {
      followers: 5432,
      following: 234,
      trips: 12,
      reviews: 67
    },
    badges: [mockBadges[5]]
  }
]

// Mock travel stories
export const mockStories: TravelStory[] = [
  {
    id: 'story-1',
    author: mockUsers[0],
    title: 'How I Fell in Love with Tokyo\'s Food Scene',
    excerpt: 'From hidden ramen shops to Michelin-starred sushi, my culinary journey through Tokyo...',
    content: `
# How I Fell in Love with Tokyo's Food Scene

When I first arrived in Tokyo, I thought I knew Japanese food. Boy, was I wrong! This city completely transformed my understanding of what Japanese cuisine could be.

## The Humble Ramen Shop

My journey started at a tiny ramen shop in Shibuya. No English menu, just a ticket machine with pictures. I pointed at something random and got the best tonkotsu ramen of my life. The chef smiled when he saw my reaction.

## Tsukiji Market at Dawn

Waking up at 4 AM for the fish market felt insane, but watching the tuna auction and eating the freshest sushi for breakfast was surreal. Pro tip: The outer market has better prices and equally delicious food!

## The Michelin Experience

I splurged on a 3-star sushi restaurant. 20 courses, each piece a work of art. Expensive? Yes. Worth it? Absolutely. But honestly, some of my favorite meals cost under ¥1000.

## Hidden Izakayas

The best discovery was the izakaya culture. Small bars serving incredible small plates. I stumbled into one in an alley and spent 3 hours chatting with locals over yakitori and sake.

## My Top Tips
1. Don't be afraid of places with no English menu
2. Eat breakfast at depachika (department store basements)
3. Try standing sushi bars for quality on a budget
4. Always say "gochisousama deshita" after meals
5. Convenience store food is surprisingly good!

Tokyo taught me that food isn't just about Michelin stars or Instagram photos. It's about the care, the tradition, and the joy of sharing a meal.
    `,
    images: ['/images/stories/tokyo-food.jpg'],
    destination: 'Tokyo, Japan',
    tags: ['food', 'tokyo', 'japan', 'culture', 'ramen', 'sushi'],
    readTime: 8,
    publishedAt: '2025-10-10T14:30:00Z',
    likes: 2834,
    comments: 156,
    saves: 892
  },
  {
    id: 'story-2',
    author: mockUsers[1],
    title: 'Conquering the Everest Base Camp Trek',
    excerpt: 'A 14-day journey to the roof of the world. Challenges, triumphs, and breathtaking views...',
    content: `
# Conquering the Everest Base Camp Trek

The Everest Base Camp trek had been on my bucket list for years. Finally, in April 2025, I made it happen. Here's my complete guide.

## Preparation (3 months before)

I trained religiously - cardio, strength training, and weekend hikes with a loaded backpack. Got all my gear sorted, including:
- Good quality trekking boots (broken in!)
- Warm sleeping bag (-20°C rated)
- Layers, layers, layers
- Water purification tablets
- First aid kit

## The Journey Begins

**Day 1-2: Lukla to Phakding to Namche Bazaar**
The flight to Lukla is infamous for being one of the scariest in the world. Totally true. Short runway on a mountain edge. But the pilots are pros!

**Day 3-5: Acclimatization in Namche**
Don't skip acclimatization! I did a side trip to Everest View Hotel. Saw my first clear view of Everest and it was magical.

## The Challenges

**Altitude Sickness**: Hit me hard at 4,500m. Headaches, nausea, exhaustion. Took it slow, drank tons of water, and powered through.

**Cold**: Below freezing at night. My sleeping bag was a lifesaver. Teahouses have no heating!

**Trail Congestion**: April is peak season. Sometimes had to wait 15 minutes for a yak train to pass.

## The Magic Moments

- Sunrise at Kala Patthar (5,545m) with Everest glowing pink
- Buddhist monastery prayers at Tengboche
- The camaraderie with fellow trekkers
- Dal bhat that tasted like heaven after a long day
- Standing at Base Camp, looking up at the Khumbu Icefall

## My Top Tips

1. **Go with a guide or porter** - Supports local economy and makes the trek safer
2. **Pack light** - You'll thank yourself later
3. **Take it slow** - "Pole pole" (slowly slowly) is the mantra
4. **Budget ₹1.2-1.5 lakhs** - Including flights, permits, guide, gear
5. **Best time**: March-May or September-November
6. **Physical fitness**: Train for at least 3 months
7. **Travel insurance**: Must have helicopter evacuation coverage

## Would I Do It Again?

Absolutely. Despite the challenges, it was life-changing. The mountains humble you. The locals inspire you. And you discover strengths you didn't know you had.

If you're thinking about it - DO IT. You won't regret it.
    `,
    images: ['/images/stories/everest-base-camp.jpg'],
    destination: 'Nepal',
    tags: ['trekking', 'everest', 'nepal', 'adventure', 'mountains', 'bucket-list'],
    readTime: 12,
    publishedAt: '2025-10-05T09:15:00Z',
    likes: 4521,
    comments: 234,
    saves: 1543
  },
  {
    id: 'story-3',
    author: mockUsers[2],
    title: 'Southeast Asia on $20 a Day',
    excerpt: 'My 3-month backpacking adventure through Thailand, Vietnam, and Cambodia on an ultra-tight budget...',
    content: `
# Southeast Asia on $20 a Day

Yes, you read that right. $20 a day. Total. Including accommodation, food, activities, and transport. Here's how I did it.

## The Route

Bangkok → Chiang Mai → Luang Prabang → Hanoi → Ha Long Bay → Hoi An → Ho Chi Minh City → Siem Reap → Phnom Penh → Back to Bangkok

Total: 90 days, 10 cities, 3 countries

## The Budget Breakdown (Per Day)

- **Accommodation**: $5-8 (hostels, dorms)
- **Food**: $6-8 (street food, local markets)
- **Activities**: $3-5 (temples, free walking tours)
- **Transport**: $2-3 (local buses, shared taxis)

**Average**: $18/day ($1,620 for 3 months!)

## How I Did It

### Accommodation Hacks
- Stayed in 8-12 bed dorms (as low as $3/night)
- Used hostel work exchange programs (free stay for 4 hours work/day)
- Couchsurfing in some cities
- Avoided party hostels (they upsell tours)

### Food Strategy
- Ate like locals: street food for every meal
- $1 pad thai, $0.50 banh mi, $2 curry
- Avoided restaurants catering to tourists
- Cooked in hostel kitchens when possible
- Free breakfast at hostels

### Transport Tricks
- Overnight buses (saves accommodation cost)
- Never took tuk-tuks (walk or local bus)
- Shared minivans instead of tourist buses
- Hitchhiked in rural areas (super safe in SEA)

### Activities for Free/Cheap
- Temples (most are free or $1-2)
- Free walking tours (tip-based)
- Beach days (always free!)
- Hiking (free in most places)
- Hostels with free events (pub crawls, cooking classes)

## The Splurges (Still Budget)

I saved for a few special experiences:
- **Ha Long Bay cruise**: $25 (bargained down from $60)
- **Cooking class in Chiang Mai**: $15
- **Angkor Wat 3-day pass**: $62 (worth every penny!)
- **Scuba diving in Koh Tao**: $80 for 2 dives

## Things I Learned

1. **Negotiate everything** - Except in restaurants
2. **Slow travel is cheap travel** - Staying longer = better deals
3. **Street food > restaurants** - Tastier and 1/5th the price
4. **Talk to other backpackers** - Best source of tips
5. **Don't book tours in advance** - Always cheaper locally

## The Reality Check

**What I Missed**: Comfort. Privacy. My own space. Hot showers. A.C.

**What I Gained**: Incredible friends. Life skills. Confidence. Stories. Perspective.

**Was it worth it?** 100%. Best 3 months of my life.

## My Packing List (7kg total!)

- 3 shirts, 2 shorts, 1 long pants, 1 dress
- Flip flops + sneakers
- Microfiber towel
- Water bottle with filter
- Power bank
- First aid kit
- Toiletries (buy there)
- Kindle
- Small daypack

That's it!

## Final Thoughts

You don't need a lot of money to travel. You need flexibility, resourcefulness, and an open mind. Southeast Asia is perfect for budget travelers - it's safe, cheap, and incredibly welcoming.

If I can do it, you can too. Book that flight!
    `,
    images: ['/images/stories/sea-backpacking.jpg'],
    destination: 'Southeast Asia',
    tags: ['budget-travel', 'backpacking', 'thailand', 'vietnam', 'cambodia', 'southeast-asia'],
    readTime: 10,
    publishedAt: '2025-09-28T16:45:00Z',
    likes: 5678,
    comments: 423,
    saves: 2345
  }
]

// Mock Q&A threads
export const mockQAThreads: QAThread[] = [
  {
    id: 'qa-1',
    author: {
      id: 'user-temp-1',
      name: 'Amit Kumar',
      username: 'first_timer_japan',
      joinedDate: '2025-09-15T00:00:00Z'
    },
    destination: 'Tokyo, Japan',
    question: 'First time in Tokyo - 5 days itinerary suggestions?',
    description: `Hi everyone! I'm visiting Tokyo for the first time in December with my wife. We have 5 full days. We love food, anime, and a bit of shopping. Not really into clubbing.

Budget: ₹15,000/day for both of us (excluding hotel)

Questions:
1. Which areas should we stay in?
2. Must-visit places for anime fans?
3. Best areas for street food?
4. Is 5 days enough or should we extend?
5. JR Pass worth it for just Tokyo?

Any help would be amazing! Thanks 🙏`,
    tags: ['tokyo', 'first-time', 'itinerary', 'food', 'anime'],
    createdAt: '2025-10-12T11:20:00Z',
    views: 1234,
    upvotes: 45,
    followers: 23,
    answers: [
      {
        id: 'ans-1-1',
        author: mockUsers[0],
        content: `Welcome to Tokyo planning! I've been there 3 times. Here are my suggestions:

**Where to stay**: Shibuya or Shinjuku. Central location, great train connections, lots to do at night.

**Anime must-visits**:
- Akihabara (Electric Town) - anime heaven!
- Ghibli Museum (book tickets NOW, they sell out 2 months in advance)
- teamLab Borderless - not anime but visual feast
- Mandarake and Animate stores
- Nakano Broadway (less touristy than Akihabara)

**Street food areas**:
- Takeshita Street in Harajuku
- Tsukiji Outer Market
- Ameya-Yokocho in Ueno
- Food stalls in Asakusa

**5 days is**: Perfect for Tokyo! You'll be busy but not rushed. You could add a day trip to Nikko or Kamakura if you want.

**JR Pass**: NOT worth it for just Tokyo. Get a Suica/Pasmo card instead. Much cheaper and more convenient.

**Sample 5-day breakdown**:
- Day 1: Arrive, Shibuya, Harajuku
- Day 2: Akihabara full day
- Day 3: Asakusa, Ueno, teamLab
- Day 4: Shinjuku, Ghibli Museum, Nakano
- Day 5: Tsukiji Market, shopping, departure prep

Let me know if you need specific restaurant recommendations! 🍜`,
        createdAt: '2025-10-12T12:45:00Z',
        upvotes: 67,
        downvotes: 2,
        isBest: true
      },
      {
        id: 'ans-1-2',
        author: mockUsers[1],
        content: `Just adding to Maya's excellent suggestions:

**Money-saving tips**:
- Convenience store breakfasts (₹150-200, surprisingly good!)
- Standing sushi bars for lunch (cheaper than sit-down)
- Depachika (department store basements) for ready-to-eat dinner
- Free observation decks: Tokyo Metropolitan Govt Building, Caretta Shiodome

**Don't miss**:
- Senso-ji Temple at sunrise (no crowds!)
- Robot Restaurant (touristy but fun for anime fans)
- Ichiran Ramen (solo dining booth experience)
- Don Quijote (weird everything store, open 24hrs)

**December specific**:
- Winter illuminations everywhere!
- Hot drinks from vending machines 🔥
- Kotatsu restaurants (heated table blankets)

Have a blast! Tokyo is incredible 🗼`,
        createdAt: '2025-10-12T14:30:00Z',
        upvotes: 34,
        downvotes: 1
      }
    ]
  },
  {
    id: 'qa-2',
    author: {
      id: 'user-temp-2',
      name: 'Neha Singh',
      username: 'mountain_curious',
      joinedDate: '2025-08-01T00:00:00Z'
    },
    destination: 'Nepal',
    question: 'Everest Base Camp vs Annapurna Circuit - which one for a beginner?',
    description: `I'm planning my first Himalayan trek next April. I've done weekend treks in India (Triund, Kedarkantha) but nothing multi-day at high altitude.

My concerns:
- Altitude sickness (heard EBC is higher?)
- Physical fitness (I can do 10km runs easily)
- Budget (₹80k max including everything)
- Time (have 15 days total)
- Solo female safety

Which trek would you recommend? EBC seems more famous but also more crowded?`,
    tags: ['nepal', 'trekking', 'ebc', 'annapurna', 'beginner'],
    createdAt: '2025-10-08T09:15:00Z',
    views: 892,
    upvotes: 32,
    followers: 15,
    answers: [
      {
        id: 'ans-2-1',
        author: mockUsers[1],
        content: `Great question! I've done both. Here's my honest comparison:

## Everest Base Camp
**Pros**:
- Iconic - you're trekking to EVEREST
- Better tea house facilities
- More structured (less route variation)
- Safer (more people around)

**Cons**:
- Crowded in peak season
- Higher altitude (5,364m) - more AMS risk
- More expensive (everything costs more as you go up)
- Can feel like a highway at times

## Annapurna Circuit
**Pros**:
- More diverse scenery (jungles to desert to snow)
- Less crowded
- Slightly cheaper
- More cultural diversity
- Lower max altitude (5,416m at Thorong La)

**Cons**:
- Route finding can be tricky in some sections
- Some parts affected by road construction
- More days needed to do full circuit

## My recommendation for YOU:
**Annapurna Base Camp (ABC)** - not the full circuit!

Here's why:
1. Perfect for beginners (max 4,130m)
2. Fits your 15-day timeframe perfectly
3. Within budget (₹60-70k all-in)
4. Less altitude risk
5. Beautiful throughout
6. Good tea houses
7. Very safe for solo females

## Solo female safety:
Both are VERY safe. You'll meet tons of other solo travelers. Just:
- Stick to main trail
- Start early (finish before dark)
- Stay in lodges with other trekkers
- Download maps.me offline maps

## Fitness:
If you can do 10km runs, you're fit enough for either trek. The altitude is the challenge, not the fitness.

## Final advice:
Do ABC this year, save EBC for when you have more high-altitude experience!

Feel free to DM if you want my detailed ABC itinerary! 🏔️`,
        createdAt: '2025-10-08T11:30:00Z',
        upvotes: 54,
        downvotes: 1,
        isBest: true
      }
    ]
  }
]

// Mock public itineraries (from community)
export const mockPublicItineraries: PublicItinerary[] = [
  {
    id: 'pub-itin-1',
    description: 'A rejuvenating week in Bali focusing on wellness, yoga, and healthy living',
    visibility: 'public',
    tags: ['wellness', 'yoga', 'bali', 'meditation', 'healthy'],
    publishedAt: '2025-09-20T00:00:00Z',
    itinerary: {
      id: 'itin-pub-bali-wellness',
      title: '7 Days Bali Wellness & Yoga Retreat',
      description: 'Rejuvenate your mind, body and soul in Ubud and Canggu',
      destination: 'Bali',
      duration: 7,
      tags: ['wellness', 'yoga', 'meditation', 'healthy', 'retreat'],
      difficulty: 'easy',
      pace: 'relaxed',
      days: [],
      totalCost: {
        amount: 75000,
        currency: 'INR',
        breakdown: {
          accommodation: 25000,
          activities: 20000,
          meals: 15000,
          transport: 5000,
          flights: 10000
        }
      },
      createdAt: '2025-09-20T00:00:00Z',
      updatedAt: '2025-09-20T00:00:00Z',
      isPublic: true
    },
    author: {
      id: 'user-4',
      name: 'Aarti Mehta',
      username: 'yoga_traveler',
      avatar: '/images/avatars/aarti.jpg',
      joinedDate: '2023-06-10T00:00:00Z',
      stats: {
        followers: 3456,
        following: 234,
        trips: 8,
        reviews: 45
      },
      badges: [mockBadges[6]]
    },
    likes: 1234,
    saves: 567,
    forks: 89,
    comments: []
  }
]

// Mock destination community data
export const mockDestinationCommunities: Record<string, DestinationCommunity> = {
  tokyo: {
    destination: 'Tokyo, Japan',
    stats: {
      totalMembers: 45678,
      activeToday: 892,
      totalTrips: 1247,
      totalStories: 3456,
      totalQuestions: 892
    },
    featuredItineraries: [mockPublicItineraries[0]],
    recentStories: [mockStories[0]],
    activeThreads: [mockQAThreads[0]],
    topContributors: [mockUsers[0], mockUsers[1], mockUsers[2]]
  },
  nepal: {
    destination: 'Nepal',
    stats: {
      totalMembers: 23456,
      activeToday: 345,
      totalTrips: 456,
      totalStories: 890,
      totalQuestions: 345
    },
    featuredItineraries: [],
    recentStories: [mockStories[1]],
    activeThreads: [mockQAThreads[1]],
    topContributors: [mockUsers[1], mockUsers[2]]
  }
}

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

// Helper function to add reaction
export const addReaction = (
  entityType: 'story' | 'answer' | 'comment',
  entityId: string,
  reactionType: Reaction['type'],
  userId: string
): void => {
  // This would be implemented with actual state management
  console.log(`Added ${reactionType} reaction to ${entityType} ${entityId} by user ${userId}`)
}

// Helper function to add comment
export const addComment = (
  entityType: 'story' | 'itinerary',
  entityId: string,
  content: string,
  userId: string
): Comment => {
  const user = getUserById(userId)
  if (!user) throw new Error('User not found')

  return {
    id: `comment-${Date.now()}`,
    author: user,
    content,
    createdAt: new Date().toISOString(),
    likes: 0
  }
}

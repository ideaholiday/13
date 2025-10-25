# Sanity CMS Architecture - Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SANITY CMS INTEGRATION                              │
│                         Content Management Flow                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: CONTENT EDITING (Sanity Studio)                                    │
└──────────────────────────────────────────────────────────────────────────────┘

    📝 Content Editor
         │
         ├─ Sanity Studio (https://project.sanity.studio)
         │  ├─ 📦 Packages (holiday-packages)
         │  ├─ 🌍 Destinations (countries/cities)
         │  ├─ 💰 Deals & Offers (promotions)
         │  ├─ 📰 Blog Posts (travel guides)
         │  └─ 📄 Pages (CMS pages)
         │
         └─ Actions:
            ├─ Create new content
            ├─ Edit existing content
            ├─ Upload images
            ├─ Publish changes
            └─ Delete/Archive

                    ↓ [Publish Button Clicked]

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: CONTENT STORAGE (Sanity Content Lake)                              │
└──────────────────────────────────────────────────────────────────────────────┘

    🗄️  Sanity Content Lake (Cloud)
         │
         ├─ Structured Content (JSON)
         │  ├─ Documents (packages, destinations, deals)
         │  ├─ Assets (images, videos)
         │  └─ References (package ↔ destination ↔ deal)
         │
         ├─ Versioning & History
         │  └─ All changes tracked
         │
         └─ CDN (Global Image Delivery)
            └─ Optimized, resized images

                    ↓ [Webhook Triggered]

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: REVALIDATION (Next.js Webhook)                                     │
└──────────────────────────────────────────────────────────────────────────────┘

    🔔 Webhook Fired
         │
         ├─ POST /api/sanity/revalidate
         │  ├─ Verify secret (x-sanity-signature)
         │  ├─ Parse payload (_type, slug)
         │  └─ Trigger ISR revalidation
         │
         └─ Revalidate Paths:
            ├─ package → /packages, /packages/[slug], /
            ├─ destination → /destinations, /destinations/[slug], /packages
            ├─ deal → /deals, /deals/[slug], /packages
            └─ post → /blog, /blog/[slug]

                    ↓ [Paths Revalidated]

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: DATA FETCHING (Next.js API)                                        │
└──────────────────────────────────────────────────────────────────────────────┘

    🔌 Sanity API Layer (src/lib/sanity-api.ts)
         │
         ├─ sanityApi.packages
         │  ├─ getPackages()
         │  ├─ getPackageBySlug(slug)
         │  ├─ getFeaturedPackages()
         │  ├─ searchPackages(filters)
         │  └─ getPackagesByTheme(theme)
         │
         ├─ sanityApi.destinations
         │  ├─ getDestinations()
         │  ├─ getDestinationBySlug(slug)
         │  └─ getPopularDestinations()
         │
         ├─ sanityApi.deals
         │  ├─ getDeals()
         │  ├─ getDealBySlug(slug)
         │  └─ getFeaturedDeals()
         │
         └─ GROQ Queries (src/lib/sanity.queries.ts)
            ├─ packagesQuery
            ├─ packageBySlugQuery
            ├─ destinationsQuery
            ├─ dealsQuery
            └─ etc.

                    ↓ [Data Fetched]

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 5: FRONTEND RENDERING (Next.js App)                                   │
└──────────────────────────────────────────────────────────────────────────────┘

    🌐 Next.js Pages & Components
         │
         ├─ /packages
         │  └─ PackageExplorer
         │     ├─ useQuery(['sanity-packages'])
         │     ├─ Filter by theme, price, duration
         │     └─ Display package cards
         │
         ├─ /packages/[slug]
         │  └─ PackageDetailsPage
         │     ├─ getPackageBySlug(params.id)
         │     ├─ Show full itinerary
         │     ├─ Display images
         │     └─ Book button → Enquiry form
         │
         ├─ /destinations
         │  └─ List all destinations
         │     └─ Link to destination detail
         │
         ├─ /deals
         │  └─ List active deals
         │     └─ Show related packages
         │
         └─ /blog
            └─ Blog posts from Sanity

                    ↓ [User Views Content]

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 6: USER EXPERIENCE                                                    │
└──────────────────────────────────────────────────────────────────────────────┘

    👤 End User
         │
         ├─ Browse Packages
         │  ├─ Filter by destination, theme, budget
         │  ├─ View beautiful images
         │  └─ Read detailed itineraries
         │
         ├─ Explore Destinations
         │  ├─ See highlights
         │  ├─ View related packages
         │  └─ Check best time to visit
         │
         ├─ Discover Deals
         │  ├─ Limited-time offers
         │  ├─ Discount badges
         │  └─ Apply to packages
         │
         └─ Read Blog
            └─ Travel tips & guides

═══════════════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Editor Action                Sanity                  Next.js                 User
─────────────────────────────────────────────────────────────────────────────

   [Edit]
     │
     ├──────► [Store] ──────────────────────────────────────┐
     │                                                       │
   [Publish]                                                │
     │                                                       │
     ├──────► [Webhook] ──────► [Revalidate]               │
     │                              │                       │
     │                              ├────► [Fetch Fresh]    │
     │                              │          │            │
     │                              │          └────────────┼──► [View]
     │                              │                       │
   [View in Studio]                │                       │
     │                              │                       │
     └──────► [Preview] ────────────┴───────────────────────┘

Time: ~2-5 seconds from publish to visible on frontend


┌─────────────────────────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE OVERVIEW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Project Root
│
├─ sanity/                          ← Sanity CMS Backend
│  ├─ schemas/
│  │  ├─ package.ts                 ✨ NEW Package schema
│  │  ├─ destination.ts             ✅ ENHANCED
│  │  ├─ deal.ts                    ✅ ENHANCED
│  │  ├─ post.ts                    ✅ Blog posts
│  │  ├─ page.ts                    ✅ CMS pages
│  │  └─ schema.ts                  ✅ UPDATED
│  ├─ sanity.config.ts              → Studio config
│  └─ package.json
│
├─ ih-frontend/                     ← Next.js Frontend
│  ├─ src/
│  │  ├─ lib/
│  │  │  ├─ sanity.client.ts        → Sanity connection
│  │  │  ├─ sanity.queries.ts       ✅ GROQ queries
│  │  │  └─ sanity-api.ts           ✨ NEW API layer
│  │  │
│  │  ├─ components/
│  │  │  └─ packages/
│  │  │     └─ package-explorer.tsx ✅ UPDATED
│  │  │
│  │  ├─ app/
│  │  │  ├─ packages/
│  │  │  │  ├─ page.tsx             → Listing
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx          ✅ UPDATED Detail
│  │  │  │
│  │  │  └─ api/
│  │  │     └─ sanity/
│  │  │        └─ revalidate/
│  │  │           └─ route.ts       ✨ NEW Webhook
│  │  │
│  │  └─ types/
│  │     └─ index.ts                → TypeScript types
│  │
│  ├─ .env.local                    ← Environment variables
│  └─ package.json
│
├─ SANITY_INTEGRATION_COMPLETE.md   ✨ Setup guide
├─ SANITY_WEBHOOK_SETUP.md          ✨ Webhook reference
├─ SANITY_CHECKLIST.md              ✨ Step-by-step checklist
├─ SANITY_SUMMARY.md                ✨ Quick overview
└─ sanity-quickstart.sh             ✨ Automated setup


┌─────────────────────────────────────────────────────────────────────────────┐
│                        KEY TECHNOLOGIES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Sanity    │   │   Next.js   │   │    GROQ     │   │     ISR     │
│     CMS     │   │  App Router │   │   Queries   │   │ Revalidation│
│             │   │             │   │             │   │             │
│ Headless    │   │ React 18+   │   │ Filtering   │   │ Instant     │
│ Content API │   │ TypeScript  │   │ Joins       │   │ Updates     │
│ Image CDN   │   │ Tailwind    │   │ Projections │   │ Caching     │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                       CONTENT RELATIONSHIPS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ Destination  │
    │  (Dubai)     │
    └───────┬──────┘
            │
            │ has many
            ↓
    ┌──────────────┐         ┌──────────────┐
    │   Package    │ ←───────│     Deal     │
    │ (5D/4N Tour) │  linked │  (20% OFF)   │
    └───────┬──────┘         └──────────────┘
            │
            │ has many
            ↓
    ┌──────────────┐
    │  Itinerary   │
    │  (Day by Day)│
    └──────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      WEBHOOK FLOW (Detailed)                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. Editor publishes content in Sanity Studio
        ↓
2. Sanity fires webhook
        POST /api/sanity/revalidate
        Headers: x-sanity-signature: <secret>
        Body: { _type: "package", _id: "...", slug: { current: "dubai-luxury" } }
        ↓
3. Next.js webhook endpoint:
        ├─ Verify secret ✓
        ├─ Parse _type and slug
        ├─ Determine affected paths
        └─ Call revalidatePath() for each
        ↓
4. Next.js ISR:
        ├─ Mark paths as stale
        ├─ Keep showing old content
        ├─ Fetch fresh data in background
        └─ Swap to new content when ready
        ↓
5. User visits page:
        └─ Sees fresh content (2-5 seconds after publish)


┌─────────────────────────────────────────────────────────────────────────────┐
│                          GROQ QUERY EXAMPLE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Query:
────────────────────────────────────────────────────────────────────────────
*[_type == "package" && available == true] | order(featured desc, rating desc){
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "coverImage": coverImage.asset->url,
  "destination": destination->{
    _id,
    title,
    "slug": slug.current,
    country
  },
  duration,
  theme,
  pricing,
  rating,
  reviewCount,
  featured
}
────────────────────────────────────────────────────────────────────────────

Result:
────────────────────────────────────────────────────────────────────────────
[
  {
    "_id": "abc123",
    "title": "Dubai Luxury Escape 5D/4N",
    "slug": "dubai-luxury-escape",
    "shortDescription": "Experience luxury in Dubai...",
    "coverImage": "https://cdn.sanity.io/images/project/dataset/...",
    "destination": {
      "_id": "dest-dubai",
      "title": "Dubai",
      "slug": "dubai",
      "country": "United Arab Emirates"
    },
    "duration": 5,
    "theme": ["luxury", "city"],
    "pricing": {
      "basePrice": 45000,
      "currency": "INR",
      "pricePerPerson": true
    },
    "rating": 4.5,
    "reviewCount": 127,
    "featured": true
  }
]
────────────────────────────────────────────────────────────────────────────


┌─────────────────────────────────────────────────────────────────────────────┐
│                      PERFORMANCE METRICS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬─────────────────────────────────────────┐
│ Metric               │ Target                                  │
├──────────────────────┼─────────────────────────────────────────┤
│ Content Update       │ 2-5 seconds (publish → live)            │
│ Page Load (ISR)      │ < 1 second (cached)                     │
│ Page Load (Fresh)    │ < 2 seconds (fetch from Sanity)         │
│ Image Load           │ < 500ms (Sanity CDN + optimization)     │
│ Webhook Response     │ < 200ms (revalidation trigger)          │
│ Studio Load          │ < 2 seconds                             │
└──────────────────────┴─────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                            🎉 YOU'RE ALL SET! 🎉

Your Sanity CMS integration is complete. Content editors can now manage:
  ✓ Holiday Packages
  ✓ Destinations
  ✓ Deals & Offers
  ✓ Blog Posts
  ✓ CMS Pages

All changes go live in seconds with zero downtime!

═══════════════════════════════════════════════════════════════════════════════

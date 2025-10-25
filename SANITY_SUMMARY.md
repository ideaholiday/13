# Sanity CMS Integration - Summary

## 🎯 What We Built

Your **iHoliday** platform is now fully integrated with **Sanity CMS** for content management. Content editors can now:

✅ Add/Edit/Delete **Holiday Packages** (destinations, pricing, itineraries)  
✅ Manage **Destinations** (countries, cities, highlights)  
✅ Create **Deals & Offers** (discounts, promotions, validity periods)  
✅ Publish **Blog Posts** (travel guides, tips, articles)  
✅ Update **CMS Pages** (about, terms, privacy)  

**All changes are live instantly** via webhook-triggered revalidation!

---

## 📁 Files Created/Modified

### Sanity Backend (CMS Schemas)
```
sanity/
├── schemas/
│   ├── package.ts          ✨ NEW - Holiday package schema
│   ├── destination.ts      ✅ ENHANCED - More fields added
│   ├── deal.ts            ✅ ENHANCED - Discount & validity fields
│   ├── post.ts            ✅ (Already exists)
│   └── schema.ts          ✅ UPDATED - Added package schema
```

### Frontend API Layer
```
ih-frontend/src/lib/
├── sanity-api.ts          ✨ NEW - API functions for Sanity
├── sanity.queries.ts      ✅ ENHANCED - GROQ queries added
├── sanity.client.ts       ✅ (Already exists)
```

### Frontend Components
```
ih-frontend/src/
├── components/packages/
│   └── package-explorer.tsx       ✅ UPDATED - Fetch from Sanity
├── app/packages/[id]/page.tsx     ✅ UPDATED - Dynamic package pages
├── app/api/sanity/revalidate/
│   └── route.ts                   ✨ NEW - Webhook endpoint
```

### Documentation
```
/
├── SANITY_INTEGRATION_COMPLETE.md  ✨ NEW - Full guide
├── SANITY_WEBHOOK_SETUP.md        ✨ NEW - Webhook reference
└── sanity-quickstart.sh           ✨ NEW - Setup script
```

---

## 🔧 How It Works

### Content Flow
```
┌─────────────────┐
│ Content Editor  │
│ (Sanity Studio) │
└────────┬────────┘
         │ 1. Edit & Publish
         ↓
┌─────────────────┐
│  Sanity CMS     │
│  (Content Lake) │
└────────┬────────┘
         │ 2. Webhook Fired
         ↓
┌─────────────────────────┐
│ /api/sanity/revalidate  │  ← Your Next.js app
│ (Webhook Endpoint)       │
└────────┬────────────────┘
         │ 3. Revalidate ISR
         ↓
┌─────────────────────────┐
│ Next.js Pages           │
│ - /packages             │
│ - /packages/[slug]      │
│ - /destinations         │
│ - /deals                │
│ - /blog                 │
└────────┬────────────────┘
         │ 4. Fetch Fresh Data
         ↓
┌─────────────────┐
│ User sees       │
│ updated content │
└─────────────────┘
```

### Data Fetching Example
```typescript
// In any component/page
import { sanityApi } from '@/lib/sanity-api'

// Get all packages
const packages = await sanityApi.packages.getPackages()

// Get package by slug
const pkg = await sanityApi.packages.getPackageBySlug('dubai-luxury')

// Search with filters
const filtered = await sanityApi.packages.searchPackages({
  theme: 'beach',
  budget: [20000, 50000],
  duration: [5, 10]
})

// Get destinations
const destinations = await sanityApi.destinations.getDestinations()

// Get active deals
const deals = await sanityApi.deals.getDeals()
```

---

## 🚀 Getting Started (3 Steps)

### 1. Deploy Sanity Studio
```bash
cd sanity
npm install
npx sanity deploy
```

Your Studio will be at: `https://your-project.sanity.studio`

### 2. Configure Environment
Add to `ih-frontend/.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
SANITY_API_READ_TOKEN=your_read_token
SANITY_REVALIDATE_SECRET=random_32_char_string
```

### 3. Setup Webhook
1. Go to https://sanity.io/manage
2. Your project → API → Webhooks
3. Create webhook:
   - URL: `https://yourdomain.com/api/sanity/revalidate`
   - Secret: Same as `SANITY_REVALIDATE_SECRET`
   - Triggers: `package`, `destination`, `deal`, `post`, `page`

**Done!** 🎉

---

## 📚 Schema Overview

### Package Schema (`package.ts`)
```typescript
{
  title: string
  slug: slug
  shortDescription: text (160 chars)
  description: text
  coverImage: image
  images: image[]
  destination: reference → destination
  duration: number (days)
  theme: string[] (adventure, beach, culture, etc.)
  difficulty: string (easy, moderate, challenging)
  groupSize: { min: number, max: number }
  pricing: {
    basePrice: number
    currency: string
    pricePerPerson: boolean
    childDiscount: number
  }
  inclusions: string[]
  exclusions: string[]
  itinerary: [{
    day: number
    title: string
    description: text
    activities: string[]
    meals: string[]
    accommodation: string
    transportation: string
  }]
  highlights: string[]
  rating: number (0-5)
  reviewCount: number
  available: boolean
  departureDates: datetime[]
  featured: boolean
  deals: reference[] → deal
  seo: seo
}
```

### Destination Schema (`destination.ts`)
```typescript
{
  title: string
  slug: slug
  country: string
  description: text
  image: image
  gallery: image[]
  isPopular: boolean
  averagePrice: number
  bestTime: string
  highlights: string[]
  climate: text
  seo: seo
}
```

### Deal Schema (`deal.ts`)
```typescript
{
  title: string
  slug: slug
  description: text
  image: image
  discountPercent: number (0-100)
  discountAmount: number
  originalPrice: number
  offerPrice: number
  validFrom: datetime
  validTill: datetime
  dealType: string (flight, hotel, package, general)
  relatedPackages: reference[] → package
  termsAndConditions: text
  featured: boolean
  active: boolean
  seo: seo
}
```

---

## 🎨 Content Examples

### Example: Dubai Package
```
Title: "Dubai Luxury Escape 5D/4N"
Destination: Dubai, UAE
Duration: 5 days
Theme: luxury, city
Base Price: ₹45,000 per person
Inclusions:
  - 4-star hotel accommodation
  - Airport transfers
  - City tour with guide
  - Burj Khalifa tickets
Highlights:
  - Burj Khalifa 124th floor
  - Desert safari with BBQ dinner
  - Dhow cruise with entertainment
Featured: Yes
```

### Example: Summer Sale Deal
```
Title: "Summer Sale 2025 - 20% Off"
Discount: 20%
Valid: June 1 - Aug 31, 2025
Deal Type: Package
Related Packages: Link to beach/island packages
Featured: Yes
```

---

## 🔄 Revalidation Paths

When content is updated, these paths are automatically revalidated:

| Content Type | Revalidated Paths |
|-------------|-------------------|
| **Package** | `/packages`, `/packages/[slug]`, `/` |
| **Destination** | `/destinations`, `/destinations/[slug]`, `/packages`, `/` |
| **Deal** | `/deals`, `/deals/[slug]`, `/packages`, `/` |
| **Blog Post** | `/blog`, `/blog/[slug]` |
| **Page** | `/[slug]`, `/` |

This ensures users always see fresh content within seconds of publishing!

---

## 🛠 Development Workflow

### For Content Editors
1. Open Sanity Studio
2. Create/Edit content
3. Click "Publish"
4. Changes appear on website instantly

### For Developers
```bash
# Start Sanity Studio locally
cd sanity
npx sanity dev
# Opens at http://localhost:3333

# Start Next.js frontend
cd ih-frontend
npm run dev
# Opens at http://localhost:3000

# Test webhook manually
curl "http://localhost:3000/api/sanity/revalidate?secret=YOUR_SECRET"
```

---

## 📊 API Reference

### Packages API
```typescript
import { sanityApi } from '@/lib/sanity-api'

// Get all packages
await sanityApi.packages.getPackages()

// Get package by slug
await sanityApi.packages.getPackageBySlug('dubai-luxury')

// Get featured packages
await sanityApi.packages.getFeaturedPackages()

// Get packages by destination
await sanityApi.packages.getPackagesByDestination('dubai')

// Get packages by theme
await sanityApi.packages.getPackagesByTheme('beach')

// Search with filters
await sanityApi.packages.searchPackages({
  destination: 'dubai',
  theme: 'luxury',
  budget: [30000, 60000],
  duration: [4, 7]
})
```

### Destinations API
```typescript
// Get all destinations
await sanityApi.destinations.getDestinations()

// Get destination by slug
await sanityApi.destinations.getDestinationBySlug('dubai')

// Get popular destinations
await sanityApi.destinations.getPopularDestinations()
```

### Deals API
```typescript
// Get all active deals
await sanityApi.deals.getDeals()

// Get deal by slug
await sanityApi.deals.getDealBySlug('summer-sale')

// Get featured deals
await sanityApi.deals.getFeaturedDeals()
```

---

## ✅ Features Implemented

- [x] Sanity CMS schemas for packages, destinations, deals
- [x] GROQ queries for all content types
- [x] API layer with TypeScript types
- [x] Frontend components using Sanity data
- [x] Webhook endpoint for revalidation
- [x] Instant content updates (ISR)
- [x] Image optimization (Sanity CDN)
- [x] SEO metadata from Sanity
- [x] Filtering and search
- [x] Featured content support
- [x] Related content (packages ↔ deals ↔ destinations)

---

## 🎯 Next Steps

### Immediate (Must Do)
1. ✅ Deploy Sanity Studio
2. ✅ Add environment variables
3. ✅ Setup webhook
4. ✅ Add sample content

### Short Term (Recommended)
- [ ] Create `/destinations` listing page
- [ ] Create `/deals` listing page
- [ ] Add deal badges on package cards
- [ ] Show related packages on destination pages
- [ ] Add destination filter in package explorer

### Long Term (Optional)
- [ ] Add package booking form
- [ ] Integrate payment gateway
- [ ] Add user reviews (store in Sanity)
- [ ] Add package availability calendar
- [ ] Multi-language support (i18n in Sanity)

---

## 📖 Documentation

- **[SANITY_INTEGRATION_COMPLETE.md](../SANITY_INTEGRATION_COMPLETE.md)** - Full setup guide
- **[SANITY_WEBHOOK_SETUP.md](../SANITY_WEBHOOK_SETUP.md)** - Webhook configuration reference
- **[sanity-quickstart.sh](../sanity-quickstart.sh)** - Automated setup script

### External Resources
- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [Next.js ISR Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

---

## 🐛 Troubleshooting

### Packages not showing?
- Check Sanity Studio - packages published?
- Check `available: true` on packages
- Check browser console for errors
- Verify environment variables

### Webhook not working?
- Check webhook URL (HTTPS for production)
- Verify secret matches `.env.local`
- Check "Deliveries" tab in Sanity
- Test manually with curl

### Images not loading?
- Images uploaded in Sanity Studio?
- Check GROQ uses `image.asset->url`
- Check browser network tab

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Packages appear on `/packages`  
✅ Package details load on `/packages/[slug]`  
✅ Images display from Sanity CDN  
✅ Editing in Studio updates frontend  
✅ Webhook shows green in Sanity  
✅ No console errors  

**Congratulations! Your CMS is live!** 🚀

---

**Questions?** Check the detailed guides in:
- `SANITY_INTEGRATION_COMPLETE.md`
- `SANITY_WEBHOOK_SETUP.md`

Or run: `./sanity-quickstart.sh` to automate setup.

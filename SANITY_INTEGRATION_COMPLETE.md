# Sanity CMS Integration Complete

## Overview
Your frontend is now fully wired to Sanity CMS for managing:
- **Packages** (holiday packages with full details)
- **Destinations** (countries/cities with packages)
- **Deals/Offers** (limited-time promotions)
- **Blog Posts** (already configured)

## What Was Done

### 1. Sanity Schemas (Backend)
✅ **Created/Updated** in `/sanity/schemas/`:
- `package.ts` - Full holiday package schema with pricing, itinerary, inclusions, etc.
- `destination.ts` - Enhanced with country, highlights, climate, popular flag
- `deal.ts` - Enhanced with discount types, validity, related packages
- `schema.ts` - Updated to include all schemas

### 2. GROQ Queries
✅ **Updated** `/ih-frontend/src/lib/sanity.queries.ts` with queries for:
- All packages, package by slug, featured packages
- Packages by destination, packages by theme
- All destinations, destination by slug
- All deals, deal by slug, featured deals
- All blog posts, post by slug

### 3. Sanity API Layer
✅ **Created** `/ih-frontend/src/lib/sanity-api.ts`:
- `sanityPackageApi` - Get, search, filter packages
- `sanityDestinationApi` - Get all/popular destinations
- `sanityDealApi` - Get active/featured deals
- `sanityBlogApi` - Get blog posts
- Unified export: `sanityApi.packages`, `sanityApi.destinations`, etc.

### 4. Frontend Components
✅ **Updated** to use Sanity:
- `/ih-frontend/src/components/packages/package-explorer.tsx` - Fetches from Sanity
- `/ih-frontend/src/app/packages/[id]/page.tsx` - Fetches package details from Sanity

### 5. Revalidation API
✅ **Created** `/ih-frontend/src/app/api/sanity/revalidate/route.ts`:
- Webhook endpoint for instant content updates
- Supports POST (from Sanity) and GET (for testing)
- Revalidates affected paths based on content type

---

## Setup Instructions

### Step 1: Deploy Sanity Studio
```bash
cd sanity
npm install
npx sanity deploy
```

This will give you a Studio URL like: `https://your-project.sanity.studio`

### Step 2: Configure Environment Variables

Add to `/ih-frontend/.env.local`:
```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
SANITY_API_READ_TOKEN=your_read_token_here
SANITY_REVALIDATE_SECRET=your_secret_here_random_string
```

**To get these values:**
1. Go to https://sanity.io/manage
2. Select your project
3. API > Tokens: Create a read token
4. For `SANITY_REVALIDATE_SECRET`, generate a random string (e.g., `openssl rand -base64 32`)

### Step 3: Setup Sanity Webhook

1. Go to https://sanity.io/manage
2. Select your project > API > Webhooks
3. Click "Create webhook"
4. Configure:
   - **Name**: "Next.js Revalidation"
   - **URL**: `https://yourdomain.com/api/sanity/revalidate`
   - **Secret**: Use the same value as `SANITY_REVALIDATE_SECRET`
   - **Trigger on**: Select these document types:
     - `package` - Create, Update, Delete
     - `destination` - Create, Update, Delete
     - `deal` - Create, Update, Delete
     - `post` - Create, Update, Delete
     - `page` - Create, Update, Delete
   - **HTTP method**: POST
   - **API version**: v2021-03-25 or later
   - **Include drafts**: No
   - **Dataset**: production

5. Save webhook

### Step 4: Add Sample Content in Sanity Studio

1. Open your Sanity Studio (from Step 1)
2. Create sample content:
   
   **Destination Example:**
   - Title: "Dubai"
   - Country: "United Arab Emirates"
   - Description: "Modern city with luxury shopping and stunning architecture"
   - Upload a cover image
   - Mark as "Popular Destination"
   - Best Time: "November to March"
   - Add highlights: "Burj Khalifa", "Dubai Mall", "Desert Safari"
   
   **Package Example:**
   - Title: "Dubai Luxury Escape 5D/4N"
   - Destination: Select the Dubai destination you created
   - Duration: 5 days
   - Theme: Select "luxury", "city"
   - Base Price: 45000
   - Currency: INR
   - Upload cover image and gallery images
   - Add inclusions: "4-star hotel", "Airport transfers", "City tour"
   - Add exclusions: "International flights", "Visa fees"
   - Add itinerary for each day
   - Add highlights: "Burj Khalifa visit", "Desert safari", "Dhow cruise"
   - Mark as "Featured Package"
   
   **Deal Example:**
   - Title: "Early Bird Discount - 20% Off"
   - Description: "Book now and save 20% on all packages"
   - Discount Percent: 20
   - Valid Till: Set a future date
   - Deal Type: "package"
   - Mark as "Featured Deal"
   - Link to packages

3. Publish your content

### Step 5: Test the Integration

1. **Frontend - View Packages:**
   ```bash
   cd ih-frontend
   npm run dev
   ```
   Visit: http://localhost:3000/packages
   
   You should see packages from Sanity!

2. **Test Revalidation (Local):**
   ```bash
   # Using the secret from your .env.local
   curl "http://localhost:3000/api/sanity/revalidate?secret=YOUR_SECRET"
   ```

3. **Update Content in Sanity:**
   - Edit a package in Sanity Studio
   - Publish changes
   - Visit the package page - changes should appear within seconds!

---

## How It Works

### Content Flow:
1. **Editor updates content** in Sanity Studio
2. **Sanity webhook fires** to `/api/sanity/revalidate`
3. **Next.js revalidates** affected pages (ISR)
4. **Frontend fetches fresh data** from Sanity on next visit

### Data Fetching:
```typescript
// In any component
import { sanityApi } from '@/lib/sanity-api'

// Get all packages
const packages = await sanityApi.packages.getPackages()

// Get package by slug
const pkg = await sanityApi.packages.getPackageBySlug('dubai-luxury-escape')

// Search packages with filters
const filtered = await sanityApi.packages.searchPackages({
  theme: 'luxury',
  budget: [20000, 50000]
})

// Get destinations
const destinations = await sanityApi.destinations.getDestinations()

// Get active deals
const deals = await sanityApi.deals.getDeals()
```

---

## Additional Features You Can Add

### 1. Deals Page
Create `/ih-frontend/src/app/deals/page.tsx`:
```typescript
import { sanityApi } from '@/lib/sanity-api'

export default async function DealsPage() {
  const deals = await sanityApi.deals.getDeals()
  
  return (
    <div>
      {deals.map(deal => (
        <DealCard key={deal._id} deal={deal} />
      ))}
    </div>
  )
}
```

### 2. Destinations Page
Create `/ih-frontend/src/app/destinations/page.tsx`:
```typescript
import { sanityApi } from '@/lib/sanity-api'

export default async function DestinationsPage() {
  const destinations = await sanityApi.destinations.getDestinations()
  
  return (
    <div>
      {destinations.map(dest => (
        <DestinationCard key={dest._id} destination={dest} />
      ))}
    </div>
  )
}
```

### 3. Show Deals on Package Cards
Already wired! Packages can have linked deals:
```typescript
// In package detail page
{pkg.deals && pkg.deals.length > 0 && (
  <div className="deals">
    {pkg.deals.map(deal => (
      <DealBadge key={deal._id} deal={deal} />
    ))}
  </div>
)}
```

---

## Troubleshooting

### Packages not showing?
1. Check Sanity Studio - are packages published?
2. Check browser console for errors
3. Verify environment variables in `.env.local`
4. Check that `available` is set to `true` on packages

### Webhook not firing?
1. Go to Sanity > API > Webhooks > Your webhook
2. Check "Deliveries" tab for errors
3. Verify webhook URL is correct (https required for production)
4. Check secret matches between Sanity and `.env.local`

### Images not loading?
1. Images need to be uploaded in Sanity Studio
2. GROQ queries use `image.asset->url` to get CDN URLs
3. Check browser network tab for 404s

### Revalidation not working?
1. Test manually: `GET /api/sanity/revalidate?secret=YOUR_SECRET`
2. Check webhook deliveries in Sanity
3. Ensure `SANITY_REVALIDATE_SECRET` matches in both places
4. For production, use HTTPS for webhook URL

---

## Next Steps

1. ✅ Deploy Sanity Studio
2. ✅ Add environment variables
3. ✅ Setup webhook
4. ✅ Add sample content
5. ✅ Test locally
6. 🚀 Deploy to production

Your content is now editor-friendly and updates are instant! 🎉

---

## Production Deployment Checklist

- [ ] Deploy Sanity Studio to Sanity's hosting
- [ ] Add production environment variables to Vercel/hosting
- [ ] Configure Sanity webhook with production URL (HTTPS)
- [ ] Test webhook in production
- [ ] Train content editors on Sanity Studio
- [ ] Monitor webhook deliveries in Sanity dashboard
- [ ] Set up Sanity CORS if needed (API > CORS Origins)

---

Need help? Check:
- Sanity Docs: https://www.sanity.io/docs
- Next.js ISR: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
- GROQ Query Cheat Sheet: https://www.sanity.io/docs/query-cheat-sheet

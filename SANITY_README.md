# 🎨 Sanity CMS Integration - Complete Package

Welcome! Your **iHoliday** platform is now integrated with **Sanity CMS** for powerful, editor-friendly content management.

---

## 📦 What's Included

This integration provides:

✅ **Sanity Schemas** - Package, Destination, Deal, Blog  
✅ **API Layer** - TypeScript functions for data fetching  
✅ **Frontend Components** - Updated to use Sanity  
✅ **Webhook Endpoint** - Instant content updates (ISR)  
✅ **Complete Documentation** - Step-by-step guides  
✅ **Setup Script** - Automated configuration  

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Deploy Sanity Studio
```bash
cd sanity
npm install
npx sanity deploy
```

### 2️⃣ Configure Environment
Add to `ih-frontend/.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
SANITY_API_READ_TOKEN=your_read_token
SANITY_REVALIDATE_SECRET=random_secret
```

### 3️⃣ Setup Webhook
1. Go to https://sanity.io/manage
2. API → Webhooks → Create webhook
3. URL: `https://yourdomain.com/api/sanity/revalidate`
4. Triggers: `package`, `destination`, `deal`, `post`, `page`

**Done!** 🎉

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[SANITY_SUMMARY.md](./SANITY_SUMMARY.md)** | 📝 Quick overview & what we built |
| **[SANITY_CHECKLIST.md](./SANITY_CHECKLIST.md)** | ✅ Step-by-step setup checklist |
| **[SANITY_INTEGRATION_COMPLETE.md](./SANITY_INTEGRATION_COMPLETE.md)** | 📖 Full setup guide with examples |
| **[SANITY_WEBHOOK_SETUP.md](./SANITY_WEBHOOK_SETUP.md)** | 🔔 Webhook configuration reference |
| **[SANITY_ARCHITECTURE.md](./SANITY_ARCHITECTURE.md)** | 🏗️ Visual architecture & data flow |

---

## 🛠 Automated Setup

Run the quickstart script:
```bash
./sanity-quickstart.sh
```

This will:
- ✅ Install dependencies
- ✅ Check configuration
- ✅ Update environment variables
- ✅ Deploy Sanity Studio
- ✅ Guide you through setup

---

## 📁 File Structure

```
sanity/
├── schemas/
│   ├── package.ts          ✨ NEW - Holiday packages
│   ├── destination.ts      ✅ ENHANCED
│   ├── deal.ts            ✅ ENHANCED
│   └── schema.ts          ✅ UPDATED

ih-frontend/
├── src/lib/
│   ├── sanity-api.ts       ✨ NEW - API layer
│   ├── sanity.queries.ts   ✅ GROQ queries
│   └── sanity.client.ts    ✅ Sanity client
│
├── src/app/
│   ├── packages/
│   │   └── [id]/page.tsx   ✅ UPDATED
│   └── api/sanity/revalidate/
│       └── route.ts        ✨ NEW - Webhook
│
└── src/components/packages/
    └── package-explorer.tsx ✅ UPDATED
```

---

## 🎯 Features

### Content Management
- 📦 **Packages** - Full itinerary, pricing, inclusions
- 🌍 **Destinations** - Countries, highlights, climate
- 💰 **Deals** - Discounts, validity, related packages
- 📰 **Blog** - Travel guides and tips
- 📄 **Pages** - CMS pages (about, terms, etc.)

### Technical Features
- 🔄 **Instant Updates** - Content goes live in 2-5 seconds
- 🖼️ **Image CDN** - Optimized, fast-loading images
- 🔍 **SEO-Friendly** - Metadata from Sanity
- 🎨 **Rich Content** - Markdown, blocks, portable text
- 🔗 **Relationships** - Package ↔ Destination ↔ Deal

---

## 💻 Usage Examples

### Fetch Packages
```typescript
import { sanityApi } from '@/lib/sanity-api'

// Get all packages
const packages = await sanityApi.packages.getPackages()

// Get package by slug
const pkg = await sanityApi.packages.getPackageBySlug('dubai-luxury')

// Search with filters
const filtered = await sanityApi.packages.searchPackages({
  theme: 'beach',
  budget: [20000, 50000]
})
```

### Fetch Destinations
```typescript
// Get all destinations
const destinations = await sanityApi.destinations.getDestinations()

// Get popular destinations
const popular = await sanityApi.destinations.getPopularDestinations()
```

### Fetch Deals
```typescript
// Get active deals
const deals = await sanityApi.deals.getDeals()

// Get featured deals
const featured = await sanityApi.deals.getFeaturedDeals()
```

---

## 🔄 Content Update Flow

```
Editor publishes in Sanity Studio
         ↓
Sanity fires webhook
         ↓
Next.js revalidates affected pages
         ↓
Frontend fetches fresh content
         ↓
User sees updated content (2-5 seconds)
```

---

## ✅ Verification

After setup, verify:

1. **Sanity Studio** - Accessible and shows all schemas
2. **Frontend** - Packages appear on `/packages`
3. **Images** - Load from Sanity CDN
4. **Webhook** - Shows 200 OK in Sanity deliveries
5. **Updates** - Changes in Studio appear on frontend

---

## 🎓 Learn More

### Sanity Resources
- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [Sanity Studio](https://www.sanity.io/docs/sanity-studio)

### Next.js Resources
- [Next.js ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Next.js Webhooks](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🆘 Troubleshooting

### Common Issues

**Packages not showing?**
- Check Sanity Studio - packages published?
- Verify `available: true` on packages
- Check environment variables

**Webhook not working?**
- Verify secret matches `.env.local`
- Check webhook URL (HTTPS for production)
- Check "Deliveries" tab in Sanity

**Images not loading?**
- Images uploaded in Sanity Studio?
- Check GROQ uses `image.asset->url`

See **[SANITY_WEBHOOK_SETUP.md](./SANITY_WEBHOOK_SETUP.md)** for detailed troubleshooting.

---

## 🎉 What's Next?

Now that your CMS is integrated:

1. ✅ Add sample content (packages, destinations, deals)
2. ✅ Train content editors on Sanity Studio
3. 🚀 Create `/destinations` listing page
4. 🚀 Create `/deals` listing page
5. 🚀 Add deal badges to package cards
6. 🚀 Integrate booking flow
7. 🚀 Add user reviews

---

## 📊 Support

Need help? Check:
- 📚 Documentation files (see table above)
- 🤖 Run `./sanity-quickstart.sh` for automated setup
- 📧 Contact: support@ideaholiday.com

---

## 📄 License

This integration is part of the iHoliday platform.

---

**Built with ❤️ for iHoliday Pvt Ltd**

*Last updated: October 17, 2025*

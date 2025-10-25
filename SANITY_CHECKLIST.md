# Sanity CMS Integration - Setup Checklist

Use this checklist to ensure your Sanity CMS integration is properly configured.

---

## 📋 Pre-Setup (Requirements)

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Sanity account created (https://www.sanity.io)
- [ ] Project cloned and dependencies installed

---

## 🏗️ Backend Setup (Sanity)

### Sanity Studio Configuration

- [ ] Navigate to `sanity/` directory
- [ ] Run `npm install` to install dependencies
- [ ] Verify `sanity.config.ts` exists
- [ ] Verify all schemas exist:
  - [ ] `schemas/package.ts` ✨ NEW
  - [ ] `schemas/destination.ts` ✅ ENHANCED
  - [ ] `schemas/deal.ts` ✅ ENHANCED
  - [ ] `schemas/post.ts` ✅ EXISTS
  - [ ] `schemas/page.ts` ✅ EXISTS
  - [ ] `schemas/schema.ts` ✅ UPDATED

### Sanity Project Initialization

- [ ] Run `npx sanity init` (if first time)
- [ ] Select existing project or create new one
- [ ] Choose dataset: `production`
- [ ] Note your Project ID: `__________________`

### Deploy Sanity Studio

- [ ] Run `npx sanity deploy`
- [ ] Choose a studio hostname (e.g., `iholiday-cms`)
- [ ] Verify Studio URL: `https://__________.sanity.studio`
- [ ] Open Studio and verify all schemas appear in menu

---

## 🔐 API & Tokens Setup

### Sanity API Token (Read)

- [ ] Go to https://sanity.io/manage
- [ ] Select your project
- [ ] Go to **API** → **Tokens**
- [ ] Click **Add API token**
- [ ] Name: "Frontend Read Token"
- [ ] Permissions: **Viewer** (read-only)
- [ ] Copy token: `sk_____________________________`
- [ ] Save token securely (won't be shown again!)

### Generate Revalidation Secret

Choose one method:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Or use any random string generator**

- [ ] Generated secret: `____________________________`

---

## 🌐 Frontend Setup (Next.js)

### Environment Variables

- [ ] Navigate to `ih-frontend/` directory
- [ ] Create/edit `.env.local` file
- [ ] Add the following variables:

```bash
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
SANITY_API_READ_TOKEN=sk_your_read_token_here
SANITY_REVALIDATE_SECRET=your_random_secret_here
```

**Verification:**
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` matches Sanity project ID
- [ ] `SANITY_API_READ_TOKEN` is the token created above
- [ ] `SANITY_REVALIDATE_SECRET` is the random secret generated
- [ ] All values filled (no empty strings)

### Install Dependencies

- [ ] Run `npm install` in `ih-frontend/`
- [ ] Verify no errors

### Test Frontend

- [ ] Run `npm run dev` in `ih-frontend/`
- [ ] Open http://localhost:3000
- [ ] Open http://localhost:3000/packages
- [ ] Check browser console for errors
- [ ] Verify page loads (may be empty if no content yet)

---

## 🔔 Webhook Setup

### Create Webhook in Sanity

- [ ] Go to https://sanity.io/manage
- [ ] Select your project
- [ ] Go to **API** → **Webhooks**
- [ ] Click **Create webhook**

### Configure Webhook

**Basic Settings:**
- [ ] Name: "Next.js Content Revalidation"
- [ ] URL: `https://yourdomain.com/api/sanity/revalidate`
  - For local testing: `http://localhost:3000/api/sanity/revalidate`
  - For production: Your deployed URL
- [ ] HTTP method: **POST**
- [ ] API version: **v2021-03-25** or later
- [ ] Dataset: **production**

**Authentication:**
- [ ] Secret: Use same value as `SANITY_REVALIDATE_SECRET`
- [ ] HTTP Header: `x-sanity-signature`

**Triggers:**
Select these document types:
- [ ] `package` → Create, Update, Delete
- [ ] `destination` → Create, Update, Delete
- [ ] `deal` → Create, Update, Delete
- [ ] `post` → Create, Update, Delete
- [ ] `page` → Create, Update, Delete

**Advanced:**
- [ ] Include drafts: **No** (unchecked)
- [ ] Projection: (leave empty)

- [ ] Click **Save**

### Test Webhook

**Option 1: From Sanity Dashboard**
- [ ] Edit any document (create a test package)
- [ ] Publish the document
- [ ] Go back to Webhooks → Your webhook → **Deliveries** tab
- [ ] Verify you see a delivery with **200 OK** status

**Option 2: Manual cURL Test**
```bash
curl -X POST http://localhost:3000/api/sanity/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"_type":"package","_id":"test","slug":{"current":"test"}}'
```

- [ ] Test returns `{"revalidated": true, ...}`
- [ ] No errors in terminal

---

## 📝 Content Creation

### Add Sample Destination

- [ ] Open Sanity Studio
- [ ] Click **Destination** in sidebar
- [ ] Click **Create new**
- [ ] Fill in:
  - [ ] Title: "Dubai"
  - [ ] Slug: "dubai" (auto-generated)
  - [ ] Country: "United Arab Emirates"
  - [ ] Description: (add a paragraph)
  - [ ] Upload cover image
  - [ ] Mark as "Popular Destination": Yes
  - [ ] Best Time: "November to March"
  - [ ] Add highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari"]
- [ ] Click **Publish**

### Add Sample Package

- [ ] Click **Holiday Package** in sidebar
- [ ] Click **Create new**
- [ ] Fill in:
  - [ ] Title: "Dubai Luxury Escape 5D/4N"
  - [ ] Slug: "dubai-luxury-escape" (auto-generated)
  - [ ] Short Description: (160 chars max)
  - [ ] Description: (full description)
  - [ ] Upload cover image
  - [ ] Upload 3-5 gallery images
  - [ ] Destination: Select "Dubai" (created above)
  - [ ] Duration: 5
  - [ ] Theme: Select "luxury", "city"
  - [ ] Difficulty: "Easy"
  - [ ] Group Size: Min 2, Max 10
  - [ ] Pricing:
    - Base Price: 45000
    - Currency: INR
    - Price Per Person: Yes
    - Child Discount: 10
  - [ ] Add 5+ inclusions
  - [ ] Add 3+ exclusions
  - [ ] Add 5-day itinerary (day-by-day plan)
  - [ ] Add 5+ highlights
  - [ ] Rating: 4.5
  - [ ] Review Count: 127
  - [ ] Available: Yes
  - [ ] Featured: Yes
- [ ] Click **Publish**

### Add Sample Deal

- [ ] Click **Deal / Offer** in sidebar
- [ ] Click **Create new**
- [ ] Fill in:
  - [ ] Title: "Early Bird Discount - 20% Off"
  - [ ] Slug: "early-bird-20-off"
  - [ ] Description: "Book now and save 20%"
  - [ ] Upload deal image
  - [ ] Discount Percent: 20
  - [ ] Valid Till: (30 days from now)
  - [ ] Deal Type: "package"
  - [ ] Related Packages: Link to Dubai package
  - [ ] Featured: Yes
  - [ ] Active: Yes
- [ ] Click **Publish**

---

## ✅ Verification & Testing

### Frontend Display

- [ ] Visit http://localhost:3000/packages
- [ ] Verify packages appear (Dubai package should show)
- [ ] Click on package card
- [ ] Verify detail page loads with:
  - [ ] Cover image displays
  - [ ] Gallery images display
  - [ ] All package info shows
  - [ ] Inclusions/exclusions list
  - [ ] Itinerary appears
  - [ ] Highlights show
  - [ ] Price displays correctly

### Content Update Test

- [ ] Edit package in Sanity Studio (change title)
- [ ] Publish changes
- [ ] Wait 5-10 seconds
- [ ] Refresh package page in browser
- [ ] Verify changes appear

### Webhook Verification

- [ ] Go to Sanity → API → Webhooks → Your webhook
- [ ] Click **Deliveries** tab
- [ ] Verify recent deliveries show **200** status
- [ ] Check timestamp matches your publish time

### Error Checking

- [ ] Check browser console (F12) - no errors
- [ ] Check Next.js terminal - no errors
- [ ] Check Sanity webhook deliveries - no 4xx/5xx errors

---

## 🚀 Production Deployment

### Sanity Studio

- [ ] Studio deployed: `https://__________.sanity.studio`
- [ ] Studio accessible and loading
- [ ] All schemas visible in Studio

### Frontend (Vercel/Netlify/etc.)

- [ ] Environment variables added to hosting platform:
  - [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_SANITY_DATASET`
  - [ ] `NEXT_PUBLIC_SANITY_API_VERSION`
  - [ ] `SANITY_API_READ_TOKEN`
  - [ ] `SANITY_REVALIDATE_SECRET`
- [ ] Frontend deployed successfully
- [ ] Production URL: `https://____________________`

### Webhook (Production)

- [ ] Webhook URL updated to production: `https://yourdomain.com/api/sanity/revalidate`
- [ ] Webhook secret matches production env variable
- [ ] Test webhook in production (edit content → verify update)

### CORS (If needed)

- [ ] Go to Sanity → API → CORS Origins
- [ ] Add production domain: `https://yourdomain.com`
- [ ] Add localhost (for dev): `http://localhost:3000`

---

## 📊 Final Verification

### Content Management

- [ ] Can create packages in Studio
- [ ] Can edit packages in Studio
- [ ] Can delete packages in Studio (archive)
- [ ] Changes reflect on frontend within seconds
- [ ] Images upload and display correctly
- [ ] All fields save properly

### Frontend Experience

- [ ] Package listing page loads
- [ ] Package detail pages load
- [ ] Filtering works (theme, destination, price)
- [ ] Search works
- [ ] Images load from Sanity CDN
- [ ] No console errors
- [ ] Mobile responsive

### Performance

- [ ] Pages load quickly (< 2 seconds)
- [ ] Images optimized (check Network tab)
- [ ] ISR working (content updates without rebuild)
- [ ] No unnecessary API calls

---

## 🎉 Success!

If all checkboxes above are marked, your Sanity CMS integration is **complete and working**! 🚀

### What You Achieved:

✅ Headless CMS for content management  
✅ Editor-friendly interface (Sanity Studio)  
✅ Instant content updates (webhook + ISR)  
✅ Image optimization (Sanity CDN)  
✅ SEO-friendly content  
✅ Scalable architecture  

---

## 📚 Next Steps

- [ ] Train content editors on Sanity Studio
- [ ] Add more sample content (10+ packages, destinations)
- [ ] Create `/destinations` page
- [ ] Create `/deals` page
- [ ] Add deal badges to package cards
- [ ] Integrate booking form
- [ ] Add user reviews
- [ ] Setup analytics

---

## 🆘 Need Help?

If something isn't working, check:

1. **Detailed Guides:**
   - `SANITY_INTEGRATION_COMPLETE.md` - Full setup guide
   - `SANITY_WEBHOOK_SETUP.md` - Webhook troubleshooting
   - `SANITY_SUMMARY.md` - Quick overview

2. **Quick Setup:**
   - Run `./sanity-quickstart.sh` for automated setup

3. **Common Issues:**
   - Check environment variables are correct
   - Verify Sanity Studio is deployed
   - Check webhook secret matches
   - Look for errors in browser console and terminal

4. **External Resources:**
   - [Sanity Docs](https://www.sanity.io/docs)
   - [Next.js ISR Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

---

**Happy content managing!** ✨

*Last updated: October 17, 2025*

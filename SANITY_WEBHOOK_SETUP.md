# Sanity Webhook Configuration - Quick Reference

## 🔗 Webhook Setup (Sanity Dashboard)

### Step 1: Navigate to Webhooks
1. Go to https://sanity.io/manage
2. Select your project
3. Click **API** in left sidebar
4. Click **Webhooks** tab
5. Click **Create webhook** button

### Step 2: Configure Webhook

**Basic Settings:**
```
Name: Next.js Content Revalidation
URL: https://yourdomain.com/api/sanity/revalidate
(For local testing: http://localhost:3000/api/sanity/revalidate)
```

**Authentication:**
```
Secret: [Use same value as SANITY_REVALIDATE_SECRET from .env]
HTTP Header: x-sanity-signature
```

**Trigger Configuration:**
Select these document types and actions:

| Document Type | Actions |
|--------------|---------|
| `package` | ✅ Create, ✅ Update, ✅ Delete |
| `destination` | ✅ Create, ✅ Update, ✅ Delete |
| `deal` | ✅ Create, ✅ Update, ✅ Delete |
| `post` | ✅ Create, ✅ Update, ✅ Delete |
| `page` | ✅ Create, ✅ Update, ✅ Delete |

**Advanced Settings:**
```
HTTP method: POST
API version: v2021-03-25 (or later)
Dataset: production
Include drafts: No (unchecked)
Projection: (leave empty, uses default)
```

### Step 3: Test Webhook

After saving, you can test the webhook:

**From Sanity Dashboard:**
1. Go to the webhook you just created
2. Click **Deliveries** tab
3. Edit any document (package, destination, etc.)
4. Publish the changes
5. Check **Deliveries** - you should see a successful 200 response

**Manual Test (using curl):**
```bash
# Local testing
curl -X POST http://localhost:3000/api/sanity/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "_type": "package",
    "_id": "test-id",
    "slug": { "current": "test-package" }
  }'

# Production testing
curl -X POST https://yourdomain.com/api/sanity/revalidate \
  -H "Content-Type: application/json" \
  -H "x-sanity-signature: YOUR_SECRET" \
  -d '{
    "_type": "package",
    "_id": "test-id",
    "slug": { "current": "test-package" }
  }'
```

**Expected Response:**
```json
{
  "revalidated": true,
  "now": 1697500000000,
  "type": "package",
  "slug": "test-package"
}
```

---

## 🔐 Environment Variables Required

Add these to `/ih-frontend/.env.local`:

```bash
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
SANITY_API_READ_TOKEN=skAbcDef1234567890GhIjKlMnOpQrStUvWxYz
SANITY_REVALIDATE_SECRET=generate_random_32_char_string_here
```

**How to get values:**

1. **SANITY_PROJECT_ID**: 
   - Go to https://sanity.io/manage
   - Select project → Settings → Project details
   - Copy "Project ID"

2. **SANITY_API_READ_TOKEN**:
   - Go to https://sanity.io/manage
   - Select project → API → Tokens
   - Click "Add API token"
   - Name: "Frontend Read Token"
   - Permissions: "Viewer" (read-only)
   - Copy the token (save it - you won't see it again!)

3. **SANITY_REVALIDATE_SECRET**:
   - Generate a random string:
   ```bash
   # macOS/Linux
   openssl rand -base64 32
   
   # Or use any random string generator
   # Example: "8f3d9a7b2c1e4f6g8h9i0j1k2l3m4n5o"
   ```

---

## 📋 Webhook Payload Examples

### Package Updated
```json
{
  "_type": "package",
  "_id": "draft-abc123",
  "slug": { "current": "dubai-luxury-escape" },
  "title": "Dubai Luxury Escape 5D/4N"
}
```
**Revalidates:**
- `/packages` (listing)
- `/packages/dubai-luxury-escape` (detail)
- `/` (home page)

### Destination Updated
```json
{
  "_type": "destination",
  "_id": "def456",
  "slug": { "current": "dubai" },
  "title": "Dubai"
}
```
**Revalidates:**
- `/destinations` (listing)
- `/destinations/dubai` (detail)
- `/packages` (packages may show destination)
- `/` (home page)

### Deal Created
```json
{
  "_type": "deal",
  "_id": "ghi789",
  "slug": { "current": "summer-sale-2025" },
  "title": "Summer Sale 2025"
}
```
**Revalidates:**
- `/deals` (listing)
- `/deals/summer-sale-2025` (detail)
- `/packages` (packages may have deals)
- `/` (home page)

### Blog Post Published
```json
{
  "_type": "post",
  "_id": "jkl012",
  "slug": { "current": "top-10-dubai-attractions" },
  "title": "Top 10 Dubai Attractions"
}
```
**Revalidates:**
- `/blog` (listing)
- `/blog/top-10-dubai-attractions` (detail)

---

## 🐛 Troubleshooting

### Webhook Returns 401 Unauthorized
**Cause:** Secret mismatch
**Fix:** 
1. Check `SANITY_REVALIDATE_SECRET` in `.env.local`
2. Check webhook secret in Sanity dashboard
3. Ensure both are identical
4. Restart Next.js dev server after changing `.env.local`

### Webhook Returns 500 Internal Server Error
**Cause:** Error in revalidation logic
**Fix:**
1. Check Next.js server logs
2. Check webhook delivery details in Sanity
3. Test manually with curl (see above)
4. Check that paths exist in your app

### Content Not Updating on Frontend
**Cause:** Cache not cleared
**Fix:**
1. Check webhook is firing (Deliveries tab in Sanity)
2. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check revalidation paths in `/api/sanity/revalidate/route.ts`
4. Verify Next.js ISR is working (not using `export const dynamic = 'force-static'`)

### Webhook Not Firing at All
**Cause:** Webhook not saved or disabled
**Fix:**
1. Go to Sanity webhooks
2. Check webhook status is "Active" (green)
3. Check document type triggers are selected
4. Ensure webhook URL is correct (HTTPS for production)
5. Try editing and publishing a document

### Local Development - Webhook Not Reachable
**Cause:** Sanity can't reach localhost
**Fix:**
For local testing, use one of these:
1. **ngrok** (recommended):
   ```bash
   ngrok http 3000
   # Use the https URL in Sanity webhook
   ```
2. **Skip webhook** - manually trigger revalidation:
   ```bash
   curl "http://localhost:3000/api/sanity/revalidate?secret=YOUR_SECRET"
   ```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Sanity Studio deployed and accessible
- [ ] All schemas visible in Studio (package, destination, deal, post, page)
- [ ] Environment variables added to `.env.local`
- [ ] Frontend can fetch content from Sanity (check browser console)
- [ ] Webhook created in Sanity dashboard
- [ ] Webhook URL is correct (HTTPS for production)
- [ ] Webhook secret matches `.env.local`
- [ ] Document type triggers selected
- [ ] Webhook test successful (check Deliveries tab)
- [ ] Manual revalidation test works (curl command)
- [ ] Content update in Studio reflects on frontend
- [ ] No console errors in frontend or webhook logs

---

## 🚀 Production Deployment

When deploying to production (Vercel/Netlify/etc.):

1. **Add environment variables** to hosting platform
2. **Update webhook URL** to production domain (HTTPS)
3. **Test webhook** after deployment
4. **Enable CORS** in Sanity if needed:
   - Go to API → CORS Origins
   - Add your production domain
5. **Monitor webhook deliveries** in Sanity dashboard

---

## 📚 Additional Resources

- [Sanity Webhooks Documentation](https://www.sanity.io/docs/webhooks)
- [Next.js Revalidation (ISR)](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Sanity GROQ Query Reference](https://www.sanity.io/docs/query-cheat-sheet)
- [Sanity Content Lake](https://www.sanity.io/docs/datastore)

---

**Need help?** Check the main integration guide: `SANITY_INTEGRATION_COMPLETE.md`

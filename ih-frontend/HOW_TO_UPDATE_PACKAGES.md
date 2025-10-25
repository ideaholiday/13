# How to Update Personalized Content/Packages

## 📦 Where is the Data?

The personalized packages/recommendations are stored in:
**File:** `data/enhancements.ts`

## 🎯 How to Add/Update Packages

### Step 1: Open the Data File

```bash
cd ih-frontend
# Open in your editor
code data/enhancements.ts
```

### Step 2: Update `mockRecommendations` Array

Find the `mockRecommendations` array (around line 16) and add/edit packages:

```typescript
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_1',                    // Unique ID
    type: 'package',                // Type: 'package', 'flight', or 'hotel'
    title: 'Romantic Maldives Getaway',
    description: '5 nights in overwater villa with spa treatments',
    destination: 'Maldives',
    price: 125000,                  // Price in INR
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    tags: ['beach', 'luxury', 'romantic', 'honeymoon'],
    score: 95,                      // Match score (1-100)
    reason: 'Based on your recent searches for beach destinations'
  },
  // Add more packages here...
]
```

### Step 3: Add Your Custom Package

Example - Adding a new Thailand package:

```typescript
{
  id: 'rec_5',
  type: 'package',
  title: '7 Days Thailand Adventure',
  description: 'Bangkok, Phuket, and Phi Phi Islands with activities',
  destination: 'Thailand',
  price: 65000,
  currency: 'INR',
  image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
  tags: ['beach', 'adventure', 'culture', 'nightlife'],
  score: 90,
  reason: 'Perfect for adventure seekers'
}
```

## 🖼️ How to Get Good Images

### Option 1: Unsplash (Free)
1. Go to https://unsplash.com
2. Search for destination (e.g., "Maldives beach")
3. Open image
4. Copy URL and add `?w=800` at the end
5. Example: `https://images.unsplash.com/photo-123456?w=800`

### Option 2: Upload Your Own
1. Place images in `public/images/packages/`
2. Use path: `/images/packages/your-image.jpg`

## 🔧 Package Types

### 1. Holiday Package
```typescript
{
  type: 'package',
  title: 'Complete holiday package name',
  // ... other fields
}
```

### 2. Flight Only
```typescript
{
  type: 'flight',
  title: 'Flight deal name',
  // ... other fields
}
```

### 3. Hotel Only
```typescript
{
  type: 'hotel',
  title: 'Hotel name',
  // ... other fields
}
```

## 📊 Package Fields Explained

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier | `'rec_1'` |
| `type` | string | Package type | `'package'`, `'flight'`, `'hotel'` |
| `title` | string | Package name | `'5 Days Dubai Trip'` |
| `description` | string | Short description | `'City tour with desert safari'` |
| `destination` | string | Destination name | `'Dubai'` |
| `price` | number | Price in INR | `45000` |
| `currency` | string | Currency code | `'INR'` |
| `image` | string | Image URL or path | URL or `/images/...` |
| `tags` | string[] | Category tags | `['city', 'luxury']` |
| `score` | number | Match percentage | `85` (1-100) |
| `reason` | string | Why recommended | `'Matches your preferences'` |

## 🏷️ Common Tags to Use

- **Destination Type:** `beach`, `city`, `mountains`, `desert`
- **Style:** `luxury`, `budget`, `adventure`, `relaxation`
- **Audience:** `romantic`, `family-friendly`, `solo`, `group`
- **Activities:** `shopping`, `nightlife`, `culture`, `wildlife`
- **Themes:** `honeymoon`, `theme-park`, `spa`, `historical`

## 📝 Complete Example - Adding a Goa Package

```typescript
export const mockRecommendations: Recommendation[] = [
  // ... existing packages ...
  
  {
    id: 'rec_6',
    type: 'package',
    title: '4 Days Goa Beach Holiday',
    description: 'North & South Goa beaches with water sports and nightlife',
    destination: 'Goa',
    price: 28000,
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    tags: ['beach', 'nightlife', 'water-sports', 'party'],
    score: 88,
    reason: 'Popular beach destination for weekend getaways'
  }
]
```

## 🔄 After Making Changes

1. **Save the file** (`data/enhancements.ts`)
2. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. **Refresh browser** - Your new packages will appear!

## 🎨 Tips for Better Packages

### 1. Use High-Quality Images
- Minimum 800px wide
- Landscape orientation works best
- Show the destination, not just generic images

### 2. Write Compelling Titles
- ❌ Bad: "Maldives Trip"
- ✅ Good: "Romantic Maldives Getaway"

### 3. Add Specific Details
- ❌ Bad: "Nice hotel in Dubai"
- ✅ Good: "5-star luxury with Burj Khalifa view and spa"

### 4. Use Relevant Tags
- Helps with filtering
- Maximum 4-5 tags per package
- Mix destination type + audience + activities

### 5. Set Realistic Scores
- 95-100: Premium/perfect match packages
- 85-94: Very good matches
- 75-84: Good options
- Below 75: Alternative choices

## 🚀 Advanced: Dynamic Packages

For real backend integration (future):

1. Create API endpoint: `/api/packages`
2. Update hook in `src/hooks/use-enhancements.ts`:

```typescript
export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      const response = await fetch('/api/packages')
      return response.json()
    }
  })
}
```

## 📞 Need Help?

If you get stuck:
1. Check the existing packages for reference
2. Make sure all required fields are filled
3. Verify image URLs work
4. Check browser console for errors

## ✅ Checklist Before Publishing

- [ ] All packages have unique IDs
- [ ] Images load correctly
- [ ] Prices are accurate
- [ ] Descriptions are clear
- [ ] Tags are relevant
- [ ] No TypeScript errors
- [ ] Tested on dev server

---

**File Location:** `data/enhancements.ts`  
**Component Using Data:** `src/components/shared/RecommendationsSection.tsx`

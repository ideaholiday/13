# ReviewCard Component

A user review display card for hotels, packages, and experiences. Shows reviewer info, star rating, verified badge, review text (with expand/collapse), helpful votes, photo gallery, and optional business response.

---

## Features
- Reviewer avatar, name, and date
- 1–5 star rating (colored stars)
- Verified badge for confirmed bookings
- Trip type label (solo, couple, family, business)
- Review title and content (expand/collapse for long text)
- Photo gallery (up to 4 images, with "+N more" indicator)
- Helpful/Not Helpful voting buttons
- Business/host response (if present)
- Accessible, keyboard/tab friendly
- Responsive design

---

## Usage

```tsx
import { ReviewCard } from '@/components/shared/ReviewCard'
import { useReviews } from '@/hooks/use-enhancements'

const { data: reviews } = useReviews('hotel_123', 'hotel')

{reviews?.map(r => <ReviewCard key={r.id} review={r} />)}
```

---

## Props
| Prop        | Type     | Description                                 |
|-------------|----------|---------------------------------------------|
| review      | Review   | Review object (see types)                    |
| onHelpful   | (id, v)  | Optional callback for helpful vote           |
| showActions | boolean  | Show helpful buttons (default: true)         |
| className   | string   | Extra classes                               |

---

## Demo
See `/demo/review-card` for a live example with mock data.

---

## Best Practices
- Use in hotel/package detail pages, testimonials, and review feeds
- Show verified badge only for confirmed bookings
- Limit review text to 220 chars, with "Read more" for long reviews
- Show up to 4 images, then "+N more"
- Allow only one helpful vote per user per review

---

## Status
- **Component:** Complete
- **Demo:** Complete
- **Docs:** Complete
- **Ready for production use**

---

## Author
Idea Holiday Frontend Team
October 16, 2025

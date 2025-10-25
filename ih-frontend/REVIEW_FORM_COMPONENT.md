# ReviewForm Component

A user review submission form for hotels, packages, and experiences. Includes star rating selector, title, review text, photo upload, validation, and success/error handling.

---

## Features
- 1–5 star rating selector (clickable stars)
- Title input (max 80 chars)
- Review text area (20–1000 chars, live count)
- Photo upload (multiple, with previews)
- Submit button with loading state
- Success and error messages
- Accessible, keyboard/tab friendly
- Responsive design

---

## Usage

```tsx
import { ReviewForm } from '@/components/shared/ReviewForm'

<ReviewForm onSuccess={() => alert('Review submitted!')} />
```

---

## Props
| Prop      | Type     | Description                                 |
|-----------|----------|---------------------------------------------|
| onSuccess | () => {} | Callback after successful submit             |
| className | string   | Extra classes                               |

---

## Demo
See `/demo/review-form` for a live example.

---

## Best Practices
- Use in hotel/package detail pages, after booking, or in review feeds
- Require at least 1 star, title, and 20+ chars in review
- Allow up to 6 images (limit for performance)
- Show clear success/error feedback

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

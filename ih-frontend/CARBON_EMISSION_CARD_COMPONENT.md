# CarbonEmissionCard Component

A carbon footprint calculator card for flights/packages. Shows CO₂ emissions per passenger, total emissions, comparison to average, offset purchase option, and eco info.

---

## Features
- CO₂ emissions per passenger (kg)
- Total emissions for all passengers
- Comparison to average (e.g., "20% less than average")
- Offset purchase button (with cost)
- Success/error feedback
- Tree planting equivalent
- Loading and error states
- Accessible, keyboard/tab friendly
- Responsive design

---

## Usage

```tsx
import { CarbonEmissionCard } from '@/components/shared/CarbonEmissionCard'

<CarbonEmissionCard flightId="flight_123" bookingId="booking_123" />
```

---

## Props
| Prop      | Type     | Description                                 |
|-----------|----------|---------------------------------------------|
| flightId  | string   | Flight or route ID for emission data         |
| bookingId | string   | Booking ID for offset action (optional)      |
| className | string   | Extra classes                                |

---

## Demo
See `/demo/carbon-emission-card` for a live example.

---

## Best Practices
- Use on flight/package checkout and confirmation pages
- Show offset option only if available
- Display tree planting equivalent for context
- Provide clear feedback on offset action

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

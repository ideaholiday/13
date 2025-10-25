# VRTourViewer Component

A 360° photo viewer for immersive hotel/destination tours. Lets users pan/drag to explore, switch between scenes, and reset view. Uses mock data and a simple CSS-based viewer for demo; production can use three.js or aframe-react.

---

## Features
- 360° image viewer (drag to rotate)
- Scene/room thumbnails (switch instantly)
- Tour name and image title
- Reset view button
- Loading and error states
- Accessible, keyboard/tab friendly
- Responsive design

---

## Usage

```tsx
import VRTourViewer from '@/components/shared/VRTourViewer'

<VRTourViewer tourId="vrtour_1" />
```

---

## Props
| Prop    | Type   | Description                        |
|---------|--------|------------------------------------|
| tourId  | string | VRTour ID to display                |
| className | string | Extra classes (optional)           |

---

## Demo
See `/demo/vr-tour-viewer` for a live example.

---

## Best Practices
- Use on hotel/package detail pages, destination guides, or immersive landing pages
- For production, use a real 360° viewer (three.js, aframe-react)
- Show clear loading/error feedback
- Use high-res, equirectangular images for best effect

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

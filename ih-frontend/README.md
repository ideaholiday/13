# Idea Holiday Frontend

A modern, production-ready frontend for "Idea Holiday Pvt Ltd." built with Next.js 14, TypeScript, and Tailwind CSS. Enhanced with 2025 travel app trends including AI personalization, real-time notifications, voice search, and sustainability features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## ✨ New 2025 Features

This application includes cutting-edge features aligned with 2025 travel industry trends:

- **🤖 AI-Driven Personalization** - Smart recommendations based on user preferences and behavior
- **🔔 Real-Time Notifications** - Flight status, price drops, and travel advisories with push notifications
- **🌐 360° Virtual Tours** - Immersive hotel and destination previews
- **🌱 Sustainability Metrics** - Carbon emissions calculator and eco-rating badges
- **🎤 Voice Search** - Web Speech API integration for hands-free search
- **💬 AI Chatbot** - 24/7 travel assistant for FAQs and booking help
- **⭐ Community Features** - User reviews, ratings, and destination forums
- **🌍 Multi-Language/Currency** - 6 languages and currencies with instant conversion
- **🛡️ Trust Elements** - Progress bars, refund policies, and security badges
- **📱 Mobile-First** - Offline support, swipeable UI, and thumb-friendly design

📖 **[Read Full Documentation →](./ENHANCEMENTS_2025.md)**

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Components:** shadcn/ui + custom components
- **Icons:** Lucide React
- **State Management:** Zustand (client state) + React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **CMS:** Sanity CMS (headless CMS for packages, destinations, deals, blog)
- **Content:** MDX support for blog and CMS pages

## 🎨 Design System

### Color Palette
- **Primary:** Deep Sapphire (#0F3D63)
- **Secondary:** Ruby (#D7263D)  
- **Accent:** Emerald (#1FA37C)
- **Gold:** (#E9B949)
- **Background:** Off-white (#F8FAFC)
- **Text:** Dark (#0B1020)

### Typography
- **Display:** Outfit (headings)
- **Body:** Inter (body text)

### Design Principles
- Glassmorphic cards with backdrop blur
- Large rounded corners (2xl)
- Soft shadows and gradients
- 150-250ms spring transitions
- Accessible contrast ratios (≥4.5:1)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles & Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── flights/           # Flight booking flow
│   ├── hotels/            # Hotel booking flow
│   ├── packages/          # Holiday packages
│   ├── blog/              # Blog pages
│   └── cms/               # CMS pages
├── components/            # React components
│   ├── ui/                # Shared UI components
│   ├── flights/           # Flight-specific components
│   ├── hotels/            # Hotel-specific components
│   └── shared/            # Common components
├── lib/                   # Utility functions
│   ├── api.ts            # API layer with mock data
│   └── utils.ts          # Helper functions
├── store/                 # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── data/                  # Mock JSON data

content/
├── blog/                  # MDX blog posts
└── pages/                 # MDX CMS pages
```

## 🔌 API Integration

The app is designed with clear API boundaries for easy backend integration:

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000  # Backend API URL
```

### API Endpoints (Ready for Integration)
- `GET /api/v1/flights/search` - Flight search
- `GET /api/v1/hotels/search` - Hotel search  
- `GET /api/v1/packages` - Holiday packages
- `GET /api/v1/destinations` - Popular destinations
- `POST /api/v1/bookings` - Create booking

## 🎯 Features

### ✅ Completed
- [x] Next.js 14 + TypeScript setup
- [x] Tailwind CSS with custom design system
- [x] Comprehensive TypeScript types
- [x] Mock data layer with simulated API calls
- [x] Zustand stores for state management
- [x] React Query hooks for data fetching

### 🚧 In Progress
- [ ] Shared UI components (Button, Form inputs, etc.)
- [ ] Header & navigation with mobile menu
- [ ] Flight search with multi-city support
- [ ] Hotel search with room configurations
- [ ] Package browsing and filtering
- [ ] Booking flows and confirmation pages

### 📋 Planned
- [ ] MDX blog and CMS integration
- [ ] Framer Motion animations
- [ ] SEO optimization and metadata
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Testing setup

## 🔍 Key Features

### Flight Search
- One-way, round-trip, and multi-city options
- Advanced passenger configuration (adults, children, infants)
- Travel class selection (Economy to First Class)
- Special fare types (Student, Senior, Medical)
- Zero cancellation option
- URL parameter synchronization

### Hotel Search  
- Location autocomplete
- Flexible date selection
- Multi-room configurations
- Per-child age specification
- Price range filtering
- Star rating and amenity filters

### Holiday Packages
- Curated destination packages
- Theme-based filtering
- Budget and duration options
- Detailed itineraries
- Inclusions/exclusions

## 🎨 Component Examples

### Button Usage
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Primary Button</Button>
<Button variant="outline">Secondary Button</Button>
<Button variant="gradient" size="lg">CTA Button</Button>
```

### Store Usage
```tsx
import { useFlightSearchStore } from '@/store'

const { origin, setOrigin, passengers, setPassengers } = useFlightSearchStore()
```

### API Hooks
```tsx
import { useFlightSearch } from '@/hooks'

const { data: flights, isLoading } = useFlightSearch(searchParams)
```

## 🚀 Deployment

### Build Commands
```bash
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks  
```

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure `NEXT_PUBLIC_API_BASE` for your backend
3. Set up any additional environment variables

## 🤝 Backend Integration

When ready to connect to a real backend:

1. Update `NEXT_PUBLIC_API_BASE` in environment variables
2. Replace mock responses in `src/lib/api.ts` with real fetch calls
3. Adjust TypeScript types if needed for actual API responses
4. Configure authentication if required

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface elements
- Optimized for both mobile and desktop experiences

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- High contrast ratios
- Screen reader compatibility
- Focus management

## 🔧 Development Scripts

```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
npm run format     # Format code with Prettier
```

## 📄 License

This project is proprietary to Idea Holiday Pvt Ltd.

---

Built with ❤️ by the Idea Holiday Team
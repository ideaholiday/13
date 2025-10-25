# Voice Search Setup Guide

## Overview
The Idea Holiday platform now includes AI-powered voice search that works across:
- ✈️ **Flights** - "Find flights from Delhi to Dubai next week"
- 🏨 **Hotels** - "Show me hotels in Paris for next weekend"
- 📦 **Packages** - "Dubai holiday packages for 5 days"
- 🔍 **General Content** - "What are your cancellation policies?"

## Features
- **Multi-language support**: English, Hindi, Hinglish
- **Smart intent detection**: Automatically routes to appropriate pages
- **Context-aware**: Understands natural language queries
- **Voice feedback**: Speaks responses back to users
- **Global search**: Floating button accessible from anywhere
- **Form integration**: Voice button in flight search form

## Setup Instructions

### 1. Get OpenAI API Key (Recommended)

For production-quality voice search:

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key

### 2. Configure Environment Variables

Edit `.env.local` and add your API key:

```bash
# OpenAI API for Voice Search
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Without API Key**: The system will use mock responses (good for development/testing)

### 3. Alternative: Use Gemini API (Free Tier Available)

If you prefer Google's Gemini:

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `/src/app/api/voice-search/route.ts`:

```typescript
// Replace OpenAI calls with Gemini
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: transcript }] }]
    })
  }
)
```

## Usage

### Global Voice Search (Floating Button)
- **Bottom-right floating button** on all pages
- Click to open voice search dialog
- Speak your query
- Automatically routes to appropriate page

### In-Form Voice Search (Flight Form)
- **Microphone icon** next to "Search Flights" button
- Click and speak: "Find flights from Delhi to Dubai next week"
- Auto-fills form and triggers search

## Supported Query Examples

### Flight Queries
```
"Find flights from Delhi to Dubai next week"
"Book a one-way flight from Mumbai to London"
"Round trip from Delhi to New York, economy class"
"Show me business class flights to Singapore"
```

### Hotel Queries
```
"Find hotels in Paris for next weekend"
"Show me 5-star hotels in Dubai"
"Book a hotel in London for 3 nights"
"Hotels near Times Square New York"
```

### Package Queries
```
"Dubai holiday packages"
"5-day tour to Bali"
"Show me Europe tour packages"
"Honeymoon packages to Maldives"
```

### General Queries
```
"What are your cancellation policies?"
"How do I change my booking?"
"Show my bookings"
"Cancel my flight"
```

## Troubleshooting

### Voice Not Working
1. **Check microphone permission**: Browser should request access
2. **Use HTTPS**: Voice API requires secure connection (or localhost)
3. **Check browser support**: Works in Chrome, Edge, Safari (latest versions)

### API Errors
1. **Check API key**: Ensure it's valid and not expired
2. **Check quota**: OpenAI has usage limits
3. **Fallback mode**: System works with mock data if API fails

### No Speech Output
1. **Check volume**: Ensure system volume is up
2. **Browser settings**: Check if site has audio permission
3. **Try different browser**: Some browsers handle speech synthesis differently

## Development

### Mock Mode (No API Key)
The system automatically uses mock responses when:
- No `OPENAI_API_KEY` is set
- API key is set to `your-openai-api-key-here`
- API requests fail

Mock responses are defined in `/src/app/api/voice-search/route.ts`

### Testing Locally
```bash
# Start dev server
cd ih-frontend
npm run dev

# Open browser (must be HTTPS or localhost)
http://localhost:3010

# Click voice search button
# Grant microphone permission
# Speak your query
```

### Extending Voice Search

Add new intents in `/src/app/api/voice-search/route.ts`:

```typescript
// In GPT system prompt
Supported intents: search_flight, search_hotel, search_package, 
                   book_flight, book_hotel, cancel_booking, 
                   general_query, YOUR_NEW_INTENT
```

Add routing in `/src/components/shared/GlobalVoiceSearch.tsx`:

```typescript
case 'YOUR_NEW_INTENT':
  // Handle routing
  router.push('/your-page')
  break
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Voice Input | ✅ | ✅ | ✅ | ✅ |
| Speech Output | ✅ | ✅ | ✅ | ✅ |
| Audio Recording | ✅ | ✅ | ✅ | ✅ |

## Performance

- **Audio recording**: ~10KB per second
- **API latency**: 1-3 seconds (OpenAI Whisper + GPT)
- **Mock mode**: Instant (300ms delay for realism)

## Privacy & Security

- **Audio data**: Sent to OpenAI API (encrypted HTTPS)
- **Not stored**: Audio is processed and discarded
- **Opt-in**: Users must grant microphone permission
- **Local storage**: No audio cached in browser

## Cost Estimation (OpenAI)

- **Whisper API**: $0.006 per minute
- **GPT-4 API**: $0.01 per 1K tokens
- **Average query cost**: ~$0.01 per voice search

For 1000 queries/month: ~$10/month

## Support

For issues or questions:
- Check browser console for errors
- Review API logs in Vercel/deployment platform
- Test with mock mode first
- Contact: dev@ideaholiday.com

## Next Steps

1. ✅ Set up API key
2. ✅ Test voice search locally
3. ✅ Try different query types
4. 🚀 Deploy to production
5. 📊 Monitor usage and costs
6. 🎨 Customize responses and routing

---

**Last Updated**: October 2025  
**Version**: 1.0.0

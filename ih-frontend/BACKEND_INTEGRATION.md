# Backend Integration Guide

This document provides a comprehensive guide for integrating the frontend with the backend API.

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment file and configure your settings:

```bash
cp .env.example .env.local
```

Update the following key variables in `.env.local`:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-api-key-here

# Disable mock data to use real API
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 2. Backend API Requirements

The frontend expects the backend to provide RESTful APIs with the following endpoints:

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

#### Flight APIs
- `GET /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/:id` - Get flight details
- `POST /api/v1/flights/book` - Book a flight
- `GET /api/v1/airports` - Get airports list

#### Hotel APIs
- `GET /api/v1/hotels/search` - Search hotels
- `GET /api/v1/hotels/:id` - Get hotel details
- `POST /api/v1/hotels/book` - Book a hotel
- `GET /api/v1/destinations` - Get destinations list

#### Package APIs
- `GET /api/v1/packages/search` - Search packages
- `GET /api/v1/packages/:id` - Get package details
- `POST /api/v1/packages/book` - Book a package

#### Utility APIs
- `GET /api/v1/currency-rates` - Get current currency rates
- `GET /api/v1/cms/:slug` - Get CMS content
- `GET /api/v1/blog` - Get blog posts
- `GET /api/v1/blog/:slug` - Get blog post details

## 🔧 API Integration

### Using the API Client

The frontend includes a type-safe API client with schema validation:

```typescript
import { travelApi } from '@/lib/api-client'

// Search flights
const flightResponse = await travelApi.searchFlights({
  origin: 'DEL',
  destination: 'BOM',
  departureDate: new Date('2024-12-15'),
  passengers: {
    adults: 2,
    children: 0,
    infants: 0,
  },
  travelClass: 'economy',
  tripType: 'roundtrip',
})

if (flightResponse.success) {
  console.log('Flights found:', flightResponse.data)
} else {
  console.error('Error:', flightResponse.error)
}
```

### Mock vs Real API

The frontend automatically switches between mock and real APIs based on the `NEXT_PUBLIC_USE_MOCK_DATA` environment variable:

- `true` - Uses mock data (default for development)
- `false` - Uses real backend API

### Error Handling

The API client includes comprehensive error handling:

```typescript
import { ApiError } from '@/lib/api-client'

try {
  const response = await travelApi.searchFlights(params)
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`)
    console.error('Details:', error.details)
  } else {
    console.error('Network or other error:', error)
  }
}
```

## 📋 API Schema Specifications

### Flight Search Request

```typescript
{
  "origin": "DEL",              // Airport code (3-letter IATA)
  "destination": "BOM",         // Airport code (3-letter IATA)  
  "departureDate": "2024-12-15", // ISO date string
  "returnDate": "2024-12-20",   // ISO date string (optional for roundtrip)
  "passengers": {
    "adults": 2,                // 1-9
    "children": 1,              // 0-8
    "infants": 0                // 0-9
  },
  "travelClass": "economy",     // economy|premium_economy|business|first
  "tripType": "roundtrip"       // oneway|roundtrip|multi-city
}
```

### Hotel Search Request

```typescript
{
  "destination": "Dubai",       // City or hotel name
  "checkIn": "2024-12-15",     // ISO date string
  "checkOut": "2024-12-20",    // ISO date string
  "rooms": [
    {
      "adults": 2,              // 1-4 per room
      "children": [8, 12]       // Ages array (max 3 children per room)
    }
  ],
  "currency": "INR"             // Currency code
}
```

### Package Search Request

```typescript
{
  "destination": "Dubai",       // Optional destination filter
  "theme": "adventure",         // Optional theme filter
  "budget": [25000, 75000],    // Optional price range [min, max]
  "duration": [3, 7],          // Optional duration range [min, max] days
  "departureDate": "2024-12-15", // Optional departure date
  "travelers": 4               // Optional number of travelers
}
```

## 🔐 Authentication & Security

### API Key Authentication

Include the API key in request headers:

```javascript
headers: {
  'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
  'Content-Type': 'application/json'
}
```

### JWT Authentication (for user sessions)

After user login, include JWT token:

```javascript
headers: {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

## 🎯 Response Formats

### Success Response

```typescript
{
  "success": true,
  "data": [...],              // Response data
  "pagination": {             // For paginated results
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```typescript
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "origin",
    "message": "Airport code is required"
  },
  "status": 400
}
```

## 🚦 Migration Steps

### Step 1: Set Up Backend Environment

1. Configure Laravel backend with required APIs
2. Set up database migrations
3. Configure external API integrations (TBO, payment gateways)
4. Set up authentication middleware

### Step 2: Update Frontend Configuration

1. Update `.env.local` with backend URL and API key
2. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. Test API endpoints individually

### Step 3: Testing

1. Test flight search and booking flow
2. Test hotel search and booking flow  
3. Test package search and booking flow
4. Test authentication flows
5. Test error handling scenarios

### Step 4: Production Deployment

1. Configure production environment variables
2. Set up SSL/TLS certificates
3. Configure CORS policies
4. Set up monitoring and logging
5. Configure CDN for static assets

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows frontend domain in CORS configuration
   - Check preflight OPTIONS requests

2. **API Key Issues**
   - Verify API key is correctly set in environment
   - Check backend middleware for API key validation

3. **Network Timeouts**
   - Adjust timeout values in API client configuration
   - Check backend response times

4. **Schema Validation Errors**
   - Ensure backend responses match expected schema
   - Check for missing required fields

### Debug Mode

Enable detailed logging in development:

```bash
NODE_ENV=development
```

This will log all API requests and responses to the browser console.

## 📚 Additional Resources

- [Laravel Backend Setup Guide](../ih-backend/README.md)
- [TBO API Documentation](https://docs.tbotechnology.in/)
- [Environment Variables Reference](.env.example)
- [API Type Definitions](src/types/index.ts)

## 🤝 Support

For backend integration issues:
1. Check the browser network tab for failed requests
2. Review server logs for error details
3. Verify environment configuration
4. Test API endpoints using tools like Postman
5. Refer to the Laravel backend documentation
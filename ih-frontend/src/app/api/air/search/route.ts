/**
 * Flight Search API Route - Proxy to Laravel Backend
 * 
 * This route proxies flight search requests from the frontend to the Laravel backend API.
 * It transforms frontend payload format to match backend expectations.
 * 
 * Flow: Frontend → Next.js API Route → Laravel Backend (/api/v1/flights/search) → TBO API
 */

import { NextResponse } from "next/server";

// Backend API base URL - server-side only, not exposed to browser
// Use regular env var (not NEXT_PUBLIC_) since this is server-side code
const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Helper to normalize date to YYYY-MM-DD format
 * Handles multiple input formats while avoiding timezone issues
 */
function toYMD(input?: string): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim();
  
  // Already YYYY-MM-DD - validate and return
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    // Validate it's a real date
    const [year, month, day] = s.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return s;
    }
    return undefined;
  }
  
  // Strip time component if present (ISO format)
  if (s.includes('T')) {
    const dateOnly = s.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return toYMD(dateOnly); // Recursive call to validate
    }
  }
  
  // Try parsing as date - use UTC to avoid timezone issues
  const d = new Date(s);
  if (isNaN(d.getTime())) return undefined;
  
  // Extract components in UTC to avoid timezone conversion
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Map cabin class from frontend format to backend format
 */
function mapCabinClass(c: string | null | undefined): 'E' | 'W' | 'B' | 'F' {
  switch ((c || 'E').toUpperCase()) {
    case 'PE': return 'W';  // Premium Economy
    case 'B': return 'B';   // Business
    case 'F': return 'F';   // First
    case 'E': 
    default: return 'E';    // Economy
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("[Flight Search Proxy] Received request:", body);
    
    // Transform frontend payload to backend format
    const origin = body.origin?.toUpperCase();
    const destination = body.destination?.toUpperCase();
    const departDate = toYMD(body.departDate);
    const returnDate = body.returnDate ? toYMD(body.returnDate) : undefined;
    const tripType = body.tripType || 'O';
    const cabinClass = mapCabinClass(body.cabinClass);
    
    // Build segments array for backend
    const segments = [
      {
        origin,
        destination,
        departureDate: departDate,
      }
    ];
    
    // Add return segment for round trips
    if (tripType === 'R' && returnDate) {
      segments.push({
        origin: destination,
        destination: origin,
        departureDate: returnDate,
      });
    }
    
    // Build backend payload
    const backendPayload = {
      segments,
      tripType,
      adults: Number(body.adults ?? 1),
      children: Number(body.children ?? 0),
      infants: Number(body.infants ?? 0),
      cabinClass,
    };
    
    console.log("[Flight Search Proxy] Sending to backend:", backendPayload);
    
    // Call Laravel backend with timeout
    const backendUrl = `${API_BASE_URL}/api/v1/flights/search`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(backendPayload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
    
      console.log("[Flight Search Proxy] Backend response status:", response.status);
      
      if (!response.ok) {
        console.error("[Flight Search Proxy] Backend error:", data);
        return NextResponse.json({
          success: false,
          message: data.message || 'Failed to search flights',
          errors: data.errors,
        }, { status: response.status });
      }
    
    // Transform backend response to frontend format
    // Backend returns: { results: [...], TraceId, ... }
    // Frontend expects: { success: true, results: [...] }
    
    const results = data.results || data.Results || [];
    const traceId = data.TraceId || data.traceId || data.SessionId;
    
    console.log(`[Flight Search Proxy] Found ${results.length} results`);
    
    // Normalize results to frontend format
    const normalizedResults = results.map((flight: any) => {
      const firstSegment = flight.Segments?.[0];
      const firstLeg = Array.isArray(firstSegment) ? firstSegment[0] : firstSegment;
      const airline = firstLeg?.Airline || {};
      const origin = firstLeg?.Origin || {};
      const destination = firstLeg?.Destination || {};
      
      return {
        resultIndex: flight.ResultIndex || flight.resultIndex,
        isRefundable: !!flight.IsRefundable || !!flight.isRefundable,
        isLCC: !!flight.IsLCC || !!flight.isLCC,
        fare: {
          published: flight.Fare?.PublishedFare || flight.fare?.published || 0,
          offered: flight.Fare?.OfferedFare || flight.fare?.offered || flight.Fare?.PublishedFare || flight.fare?.published || 0,
          currency: flight.Fare?.Currency || flight.fare?.currency || 'INR',
          baseFare: flight.Fare?.BaseFare || flight.fare?.baseFare || 0,
          tax: flight.Fare?.Tax || flight.fare?.tax || 0,
        },
        leg: {
          depTime: origin.DepTime || firstLeg?.depTime,
          arrTime: destination.ArrTime || firstLeg?.arrTime,
          duration: firstLeg?.Duration || firstLeg?.duration || 0,
          from: origin.Airport?.AirportCode || origin.Airport?.CityCode || firstLeg?.from,
          to: destination.Airport?.AirportCode || destination.Airport?.CityCode || firstLeg?.to,
          fromCity: origin.Airport?.CityName || firstLeg?.fromCity,
          toCity: destination.Airport?.CityName || firstLeg?.toCity,
        },
        airline: {
          name: airline.AirlineName || airline.name,
          code: airline.AirlineCode || airline.code,
          flightNumber: airline.FlightNumber || airline.flightNumber,
          operatingCarrier: airline.OperatingCarrier || airline.operatingCarrier || airline.AirlineCode || airline.code,
        },
        segments: flight.Segments || flight.segments,
        provider: flight.Source || flight.provider || 'TBO',
        raw: flight,
      };
    });
    
    if (normalizedResults.length === 0) {
      return NextResponse.json({
        success: false,
        providerError: {
          code: 0,
          message: data.message || "No flights available for this route and date. Please try different dates or nearby airports.",
        },
        results: [],
      });
    }
    
    return NextResponse.json({
      success: true,
      results: normalizedResults,
      totalResults: normalizedResults.length,
      traceId,
      searchCriteria: {
        from: body.origin,
        to: body.destination,
        departDate: body.departDate,
        returnDate: body.returnDate,
        adults: body.adults,
        children: body.children,
        infants: body.infants,
        cabin: body.cabinClass,
        tripType: body.tripType,
      },
    });
    
  } catch (e: any) {
    console.error("[Flight Search Proxy] Error:", e);
    
    // Handle timeout specifically
    if (e.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: "Backend request timeout. Please try again.",
        error: process.env.NODE_ENV === 'development' ? 'Request aborted after 30 seconds' : undefined,
      }, { status: 504 }); // Gateway Timeout
    }
    
    return NextResponse.json({
      success: false,
      message: e.message || "Failed to connect to backend API",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined,
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import axios from "axios";
import NodeCache from "node-cache";

const tokenCache = new NodeCache({ stdTTL: 540 });

const AUTH = "https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate";
const SEARCH = "https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search";

async function getToken() {
  const cached = tokenCache.get<string>("tbo_token");
  if (cached) return cached;
  
  const { data } = await axios.post(AUTH, {
    ClientId: process.env.TBO_CLIENT_ID,
    UserName: process.env.TBO_USERNAME,
    Password: process.env.TBO_PASSWORD,
    EndUserIp: process.env.TBO_ENDUSER_IP,
  }, { headers: { "Content-Type": "application/json" }});
  
  if (!data?.TokenId) throw new Error("TBO authentication failed");
  tokenCache.set("tbo_token", data.TokenId);
  return data.TokenId as string;
}

function mapCabin(c: string | null | undefined) {
  // UI uses E/PE/B/F → TBO numeric (1=E,2=PE,3=B,4=F). Default 1.
  switch ((c || "E").toUpperCase()) {
    case "PE": case "W": return "2";
    case "B": return "3";
    case "F": return "4";
    default: return "1";
  }
}

function validateInput(body: any) {
  const errors: string[] = [];
  
  if (!body.origin || body.origin.length !== 3) {
    errors.push("Invalid origin airport code");
  }
  if (!body.destination || body.destination.length !== 3) {
    errors.push("Invalid destination airport code");
  }
  if (!body.departDate) {
    errors.push("Departure date is required");
  }
  if (body.tripType === "R" && !body.returnDate) {
    errors.push("Return date is required for round trip");
  }
  
  const adults = Number(body.adults ?? 1);
  const children = Number(body.children ?? 0);
  const infants = Number(body.infants ?? 0);
  
  if (adults < 1 || adults > 9) {
    errors.push("Adults must be between 1 and 9");
  }
  if (children < 0 || children > 8) {
    errors.push("Children must be between 0 and 8");
  }
  if (infants < 0 || infants > adults) {
    errors.push("Infants cannot exceed number of adults");
  }
  if (adults + children + infants > 9) {
    errors.push("Total passengers cannot exceed 9");
  }
  
  return errors;
}

async function searchTBO(payload: any, retryCount = 0): Promise<any> {
  try {
    const { data } = await axios.post(SEARCH, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
    
    // Handle provider errors
    const err = data?.Response?.Error;
    if (err && err.ErrorCode && err.ErrorCode !== 0) {
      return {
        success: false,
        providerError: {
          code: err.ErrorCode,
          message: err.ErrorMessage || "Unknown error from flight provider",
        },
        results: [],
      };
    }
    
    // TBO structure: Results is Array of "buckets"
    // For one-way: [[flight1, flight2, ...]]
    // For round-trip: [[onward flights], [return flights]]
    const results = data?.Response?.Results;
    
    // Check if results exist
    if (!results || !Array.isArray(results) || results.length === 0) {
      // Retry once if Sources was null (try with Sources:[])
      if (retryCount === 0 && payload.Sources === null) {
        console.log("No results with Sources:null, retrying with Sources:[]");
        const retryPayload = { ...payload, Sources: [] };
        return searchTBO(retryPayload, 1);
      }
      
      return {
        success: false,
        providerError: {
          code: 0,
          message: "No flights available for this route and date. Please try different dates or nearby airports.",
        },
        results: [],
      };
    }
    
    // Flatten all buckets - handle nested arrays properly
    let allFlights: any[] = [];
    
    for (const bucket of results) {
      if (Array.isArray(bucket)) {
        // Each bucket is an array of flights
        allFlights = allFlights.concat(bucket);
      } else if (bucket && typeof bucket === 'object') {
        // Sometimes TBO returns single objects
        allFlights.push(bucket);
      }
    }
    
    // Filter out invalid entries
    allFlights = allFlights.filter((flight) => {
      return flight && 
             flight.ResultIndex && 
             flight.Segments && 
             Array.isArray(flight.Segments) && 
             flight.Segments.length > 0;
    });
    
    if (allFlights.length === 0) {
      return {
        success: false,
        providerError: {
          code: 0,
          message: "No valid flights found. Please try different search criteria.",
        },
        results: [],
      };
    }
    
    // Normalize all flights
    const normalized = allFlights.map((flight) => {
      const firstSegment = flight.Segments[0];
      const firstLeg = Array.isArray(firstSegment) ? firstSegment[0] : firstSegment;
      const airline = firstLeg?.Airline || {};
      const origin = firstLeg?.Origin || {};
      const destination = firstLeg?.Destination || {};
      
      return {
        resultIndex: flight.ResultIndex,
        isRefundable: !!flight.IsRefundable,
        isLCC: !!flight.IsLCC,
        fare: {
          published: flight.Fare?.PublishedFare || 0,
          offered: flight.Fare?.OfferedFare || flight.Fare?.PublishedFare || 0,
          currency: flight.Fare?.Currency || "INR",
          baseFare: flight.Fare?.BaseFare || 0,
          tax: flight.Fare?.Tax || 0,
        },
        leg: {
          depTime: origin.DepTime,
          arrTime: destination.ArrTime,
          duration: firstLeg?.Duration || 0,
          from: origin.Airport?.AirportCode || origin.Airport?.CityCode,
          to: destination.Airport?.AirportCode || destination.Airport?.CityCode,
          fromCity: origin.Airport?.CityName,
          toCity: destination.Airport?.CityName,
        },
        airline: {
          name: airline.AirlineName,
          code: airline.AirlineCode,
          flightNumber: airline.FlightNumber,
          operatingCarrier: airline.OperatingCarrier || airline.AirlineCode,
        },
        segments: flight.Segments,
        provider: flight.Source || "TBO",
        raw: flight,
      };
    });
    
    return {
      success: true,
      results: normalized,
      totalResults: normalized.length,
    };
    
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        providerError: {
          code: 'TIMEOUT',
          message: "Request timeout. Please try again.",
        },
        results: [],
      };
    }
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        errors: validationErrors,
        message: validationErrors.join("; "),
      }, { status: 400 });
    }
    
    // Get token
    const token = await getToken();
    
    // Build search payload
    const tripOneway = (body.tripType ?? "O") !== "R";
    const seg = {
      Origin: body.origin.toUpperCase(),
      Destination: body.destination.toUpperCase(),
      FlightCabinClass: mapCabin(body.cabinClass),
      PreferredDepartureTime: body.departDate,
      PreferredArrivalTime: body.departDate,
    };
    
    const payload = {
      EndUserIp: process.env.TBO_ENDUSER_IP || "192.168.1.1",
      TokenId: token,
      AdultCount: Number(body.adults ?? 1),
      ChildCount: Number(body.children ?? 0),
      InfantCount: Number(body.infants ?? 0),
      JourneyType: tripOneway ? "1" : "2",
      Segments: tripOneway
        ? [seg]
        : [
            seg,
            {
              Origin: body.destination.toUpperCase(),
              Destination: body.origin.toUpperCase(),
              FlightCabinClass: mapCabin(body.cabinClass),
              PreferredDepartureTime: body.returnDate,
              PreferredArrivalTime: body.returnDate,
            },
          ],
      Sources: null, // Will try [] as fallback if this returns empty
    };
    
    // Search with retry logic
    const result = await searchTBO(payload);
    
    return NextResponse.json({
      ...result,
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
    console.error("Flight search error:", e);
    return NextResponse.json({
      success: false,
      message: e.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined,
    }, { status: 500 });
  }
}

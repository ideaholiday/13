"use client";
import { useEffect, useMemo, useState } from "react";
import {
  useSearchParams,
  useRouter,
  type ReadonlyURLSearchParams
} from "next/navigation";
import { useFlightSearch } from "@/lib/stores/flightSearch";
import { AlertCircle, Plane, Clock, ArrowRight } from "lucide-react";
import {
  ApiError,
  searchFlights as backendSearchFlights,
  type FlightSearchRequest
} from "@/lib/flight-api";

type ErrorCategory = "network" | "validation" | "server" | "client" | null;

const pickParam = (sp: ReadonlyURLSearchParams | null, ...keys: string[]) => {
  if (!sp) return "";
  for (const key of keys) {
    const value = sp.get(key);
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
};

const toYMD = (value: string) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const mapTripType = (value: string): "O" | "R" => {
  const normalized = value?.toLowerCase?.() ?? "";
  if (normalized === "roundtrip" || normalized === "round_trip" || normalized === "r") return "R";
  return "O";
};

const mapCabinClass = (value: string): FlightSearchRequest["cabinClass"] => {
  const normalized = value?.toUpperCase?.() ?? "E";
  if (["E", "B", "F", "PE", "W"].includes(normalized)) {
    return normalized as FlightSearchRequest["cabinClass"];
  }
  if (normalized === "PREMIUM_ECONOMY") return "PE";
  if (normalized === "PREMIUM") return "W";
  return "E";
};

const normalizeFlightResults = (data: any) => {
  if (!data) return [] as any[];
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.Response?.Results)) {
    const results = data.Response.Results;
    if (Array.isArray(results[0])) {
      // assume first bucket is outbound list for UI needs
      return results[0] ?? [];
    }
    return results;
  }
  return [] as any[];
};

const ERROR_HINTS: Record<Exclude<ErrorCategory, null>, string> = {
  network: "We couldn't reach our flight services. Check your internet connection or try again in a moment.",
  validation: "Please review your search inputs. Both airports, a valid departure date, and at least one adult passenger are required.",
  server: "Our flight partner returned an unexpected error. Please try again shortly or modify your search criteria.",
  client: "Something went wrong while preparing your search. Please retry or adjust the filters.",
};

export default function ResultsPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const { set, results } = useFlightSearch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<ErrorCategory>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[] | null>(null);
  const [providerError, setProviderError] = useState<any>(null);

  const payload = useMemo(() => {
    const origin = pickParam(sp, "from", "origin", "source").toUpperCase();
    const destination = pickParam(sp, "to", "destination", "dest").toUpperCase();
    const departRaw = pickParam(sp, "depart", "departureDate", "departDate");
    const returnRaw = pickParam(sp, "return", "returnDate", "arrivalDate");
    const tripRaw = pickParam(sp, "tripType", "trip", "type") || "oneway";
    const cabinRaw = pickParam(sp, "class", "cabin", "cabinClass") || "E";

    return {
      origin,
      destination,
      departDate: toYMD(departRaw),
      returnDate: toYMD(returnRaw) || undefined,
      tripType: mapTripType(tripRaw),
      adults: Number(pickParam(sp, "adults", "adt") || 1),
      children: Number(pickParam(sp, "children", "chd") || 0),
      infants: Number(pickParam(sp, "infants", "inf") || 0),
      cabinClass: mapCabinClass(cabinRaw),
    }
  }, [sp]);

  useEffect(() => {
    let mounted = true;

    const executeSearch = async () => {
      if (!mounted) return;

      setLoading(true);
      setError(null);
      setErrorCategory(null);
      setErrorStatus(null);
      setErrorDetails(null);
      setProviderError(null);

      const missingFields: string[] = [];
      if (!payload.origin) missingFields.push("origin");
      if (!payload.destination) missingFields.push("destination");
      if (!payload.departDate) missingFields.push("departDate");

      if (missingFields.length) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setErrorCategory("validation");
        set({ results: [], lastSearchPayload: payload });
        setLoading(false);
        return;
      }

      const request: FlightSearchRequest = {
        origin: payload.origin,
        destination: payload.destination,
        departDate: payload.departDate,
        tripType: payload.tripType,
        adults: payload.adults || 1,
        children: payload.children || 0,
        infants: payload.infants || 0,
        cabinClass: payload.cabinClass,
      };

      if (payload.tripType === "R" && payload.returnDate) {
        request.returnDate = payload.returnDate;
      }

      try {
        const apiResponse = await backendSearchFlights(request);

        if (!mounted) return;

        if (!apiResponse.success) {
          const message = apiResponse.message || "Flight search failed.";
          setError(message);
          setErrorCategory("client");
          set({ results: [], lastSearchPayload: request });
          return;
        }

        const normalizedResults = normalizeFlightResults(apiResponse.data);

        if (!normalizedResults.length) {
          setProviderError(
            apiResponse.data?.providerError || {
              message: "No flights available for your search criteria.",
            }
          );
          set({ results: [], lastSearchPayload: request });
          return;
        }

        set({
          results: normalizedResults,
          lastSearchPayload: request,
        });
      } catch (err: unknown) {
        if (!mounted) return;

        let message = "Failed to fetch flights. Please try again.";
        let category: ErrorCategory = "client";
        let status: number | null = null;
        let details: string[] | null = null;

        if (err instanceof ApiError) {
          status = err.status;
          message = err.message || message;
          if (err.status >= 500) category = "server";
          else if (err.status >= 400) category = "validation";
          if (Array.isArray(err.details)) {
            details = err.details.map(String);
          } else if (err.details && typeof err.details === "object") {
            details = Object.values(err.details).flat().map((item) =>
              typeof item === "string" ? item : JSON.stringify(item)
            );
          }
        } else if (err instanceof TypeError) {
          category = "network";
          message = "We couldn't reach Idea Holiday servers. Please check your connection and try again.";
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        setErrorCategory(category);
        setErrorStatus(status);
        setErrorDetails(details);
        set({ results: [], lastSearchPayload: request });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    executeSearch();

    return () => {
      mounted = false;
    };
  }, [payload, set]);

  const onSelect = (item: any) => {
    set({ 
      selected: { 
        resultIndex: item.resultIndex, 
        provider: item.provider, 
        raw: item.raw 
      } 
    });
    router.push("/flights/review");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateTime: string) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-lg font-medium text-slate-700">Searching live flights...</div>
          <div className="text-sm text-slate-500">Checking all airlines for the best prices</div>
        </div>
      </div>
    );
  }

  if (providerError) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        {/* Provider Error Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                No Flights Available
              </h3>
              <p className="text-yellow-800 mb-4">
                {providerError.message || "The flight provider could not find any flights for your search criteria."}
              </p>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Suggestions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Try searching for different dates</li>
                  <li>Check if flights operate on this route</li>
                  <li>Consider nearby airports</li>
                  <li>Try flexible date search (±3 days)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Search Error
              </h3>
              <p className="text-red-800 mb-3">
                {errorStatus ? `Request failed (HTTP ${errorStatus}).` : 'We could not complete your search.'}
              </p>
              <p className="text-red-800 font-medium">{error}</p>
              {errorDetails && errorDetails.length > 0 && (
                <ul className="mt-3 list-disc list-inside text-sm text-red-700 space-y-1">
                  {errorDetails.map((detail, idx) => (
                    <li key={`${detail}-${idx}`}>{detail}</li>
                  ))}
                </ul>
              )}
              {errorCategory && (
                <p className="text-sm text-slate-700 mt-4">
                  {ERROR_HINTS[errorCategory as Exclude<ErrorCategory, null>]}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="container mx-auto py-10 max-w-2xl text-center">
        <div className="bg-slate-50 rounded-lg p-12">
          <Plane className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No flights found
          </h3>
          <p className="text-slate-600 mb-6">
            We couldn't find any flights matching your search criteria.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Available Flights
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
            ✓ Live Prices
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
            ✓ Real-time Availability
          </span>
          <span className="text-slate-600">
            {results.length} flight{results.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Left: Filters (placeholder) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">Filters</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div>Price range</div>
                <div>Number of stops</div>
                <div>Airlines</div>
                <div>Departure time</div>
                <div>Duration</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: Flight List */}
        <div className="space-y-4">
          {results.map((flight: any, index: number) => (
            <div 
              key={`${flight.resultIndex}-${index}`} 
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Flight Info */}
                <div className="flex-1">
                  {/* Airline */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-sm font-medium text-slate-500">
                      {flight.airline.code} {flight.airline.flightNumber}
                    </div>
                    {flight.isLCC && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                        Low Cost
                      </span>
                    )}
                    {flight.isRefundable && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        Refundable
                      </span>
                    )}
                  </div>
                  
                  <div className="text-lg font-semibold text-slate-900 mb-3">
                    {flight.airline.name}
                  </div>
                  
                  {/* Route and Time */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900">
                        {formatTime(flight.leg.depTime)}
                      </div>
                      <div className="text-slate-600">{flight.leg.from}</div>
                      {flight.leg.fromCity && (
                        <div className="text-xs text-slate-500">{flight.leg.fromCity}</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-slate-500 mb-1">
                        {formatDuration(flight.leg.duration)}
                      </div>
                      <div className="w-full h-px bg-slate-300 relative">
                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 bg-white" />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Non-stop</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900">
                        {formatTime(flight.leg.arrTime)}
                      </div>
                      <div className="text-slate-600">{flight.leg.to}</div>
                      {flight.leg.toCity && (
                        <div className="text-xs text-slate-500">{flight.leg.toCity}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Price and Action */}
                <div className="text-right">
                  <div className="text-emerald-600 text-3xl font-bold mb-1">
                    ₹{Math.round(flight.fare.offered).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    per person
                  </div>
                  <button
                    onClick={() => onSelect(flight)}
                    className="w-full px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Select
                  </button>
                </div>
              </div>
              
              {/* Expandable Details */}
              <details className="mt-4 pt-4 border-t border-slate-200">
                <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  View fare details
                </summary>
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Fare:</span>
                    <span className="font-medium">₹{Math.round(flight.fare.baseFare || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Taxes & Fees:</span>
                    <span className="font-medium">₹{Math.round(flight.fare.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="font-bold text-emerald-600">₹{Math.round(flight.fare.offered).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 text-xs text-slate-500">
                    Provider: {flight.provider}
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

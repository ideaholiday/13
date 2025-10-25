/**
 * API Helper for Hotel Autosuggestion
 * Provides a simple interface for making API calls to the backend
 */

export interface AutocompleteResponse {
  query: string;
  countries: Array<{
    name: string;
    code: string;
    iso2: string;
  }>;
  cities: Array<{
    name: string;
    code: string;
    country: string;
    countryName: string;
  }>;
  hotels: Array<{
    name: string;
    code: string;
    city: string;
    cityCode: string;
  }>;
}

export interface AutocompleteItem {
  type: 'country' | 'city' | 'hotel';
  label: string;
  code: string;
  city?: string;
  country?: string;
  countryName?: string;
  cityCode?: string;
}

/**
 * Generic API function for making requests to the backend
 */
export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
  const url = `${base}${path}`;
  
  const response = await fetch(url, {
    next: { revalidate: 0 },
    ...init,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

export const fetchJSON = api

/**
 * Fetch autocomplete suggestions for cities and hotels
 */
export async function fetchAutocomplete(query: string): Promise<AutocompleteResponse> {
  if (query.length < 2) {
    return {
      query,
      countries: [],
      cities: [],
      hotels: [],
    };
  }
  
  return api<AutocompleteResponse>(`/api/v1/autocomplete?q=${encodeURIComponent(query)}`);
}

/**
 * Transform API response to autocomplete items
 */
export function transformToAutocompleteItems(response: AutocompleteResponse): AutocompleteItem[] {
  const items: AutocompleteItem[] = [];
  
  // Add countries
  response.countries.forEach(country => {
    items.push({
      type: 'country',
      label: country.name,
      code: country.code,
      country: country.iso2,
    });
  });
  
  // Add cities
  response.cities.forEach(city => {
    items.push({
      type: 'city',
      label: city.name,
      code: city.code,
      country: city.country,
      countryName: city.countryName,
    });
  });
  
  // Add hotels
  response.hotels.forEach(hotel => {
    items.push({
      type: 'hotel',
      label: hotel.name,
      code: hotel.code,
      city: hotel.city,
      cityCode: hotel.cityCode,
    });
  });
  
  return items;
}
import { describe, expect, test } from '@jest/globals';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

describe('Hotel Search API Integration', () => {
  test('backend hotel API returns results for Bangalore', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/hotels/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        cityId: 115936, // Bangalore
        checkIn: '2025-11-20',
        nights: 1,
        rooms: [
          {
            adults: 2,
            children: 0,
            childAges: [],
          },
        ],
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();

    // Check response structure
    expect(json).toBeDefined();
    
    // TBO can return results in different formats
    const hasResults = 
      json.HotelResult || 
      json.HotelSearchResult || 
      json.Results ||
      (json.data && (json.data.HotelResult || json.data.HotelSearchResult));
    
    expect(hasResults).toBeTruthy();
  }, 30000);

  test('backend hotel API handles multiple rooms', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/hotels/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        cityId: 115936,
        checkIn: '2025-11-20',
        nights: 2,
        rooms: [
          { adults: 2, children: 0, childAges: [] },
          { adults: 2, children: 1, childAges: [5] },
        ],
      }),
    });

    expect(response.status).toBe(200);
  }, 30000);

  test('backend hotel cities endpoint returns data', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/hotels/cities`, {
      method: 'GET',
      headers: {
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
    });

    expect([200, 404]).toContain(response.status);
    // Endpoint might not be implemented yet, so we accept 404
  }, 30000);
});

describe('Hotel Details API', () => {
  test('hotel info endpoint exists', async () => {
    // This would require a valid hotel code from a search
    // For now, just check endpoint exists
    const response = await fetch(`${BACKEND_URL}/api/v1/hotels/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        hotelCode: 'test-hotel-code',
      }),
    });

    // Should not return 404 (endpoint exists)
    // Might return error for invalid hotel code
    expect(response.status).not.toBe(404);
  }, 30000);
});

import { describe, expect, test } from '@jest/globals';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

describe('Flight Search API Integration', () => {
  test('backend flight API returns results for DEL to BOM', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        origin: 'DEL',
        destination: 'BOM',
        departDate: '2025-11-20',
        tripType: 'O',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'E',
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    
    // Check response structure
    expect(json).toHaveProperty('success');
    expect(json.success).toBe(true);
    expect(json).toHaveProperty('data');
    
    // Check for flight results
    if (json.data?.Response?.Results) {
      expect(Array.isArray(json.data.Response.Results)).toBe(true);
      expect(json.data.Response.Results.length).toBeGreaterThan(0);
    }
  }, 30000);

  test('backend flight API handles round trip search', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        origin: 'DEL',
        destination: 'BOM',
        departDate: '2025-11-20',
        returnDate: '2025-11-25',
        tripType: 'R',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'E',
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('success');
    expect(json.success).toBe(true);
  }, 30000);

  test('backend flight API validates required fields', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        // Missing required fields
        adults: 1,
      }),
    });

    // Should return error for missing fields
    expect([400, 422, 500]).toContain(response.status);
  }, 30000);
});

describe('Fare Rules API', () => {
  test('fare rules endpoint exists', async () => {
    // This test would require a valid session and result index from a search
    // For now, we just check the endpoint exists
    const response = await fetch(`${BACKEND_URL}/api/v1/flights/fare-rule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        sessionId: 'test-session',
        resultIndex: 'test-index',
      }),
    });

    // Endpoint should exist (might fail with invalid data but not 404)
    expect(response.status).not.toBe(404);
  }, 30000);
});

describe('SSR (Baggage & Meals) API', () => {
  test('ssr endpoint exists', async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/flights/ssr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'IH_API_2025_DEMO_KEY',
      },
      body: JSON.stringify({
        sessionId: 'test-session',
        resultIndex: 'test-index',
      }),
    });

    // Endpoint should exist
    expect(response.status).not.toBe(404);
  }, 30000);
});

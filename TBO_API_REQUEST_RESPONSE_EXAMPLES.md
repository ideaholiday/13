# TBO API - Complete Request/Response Examples
**Full JSON Samples for All Flight and Hotel Operations**

---

## Flight Operations

### 1. Flight Search

#### Request
```json
POST /api/v1/flights/search

{
  "segments": [
    {
      "origin": "BOM",
      "destination": "LKO",
      "departureDate": "2025-12-15"
    }
  ],
  "tripType": "O",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "E"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "Error": {
        "ErrorCode": 0,
        "ErrorMessage": ""
      },
      "TraceId": "TRACE-20251024-ABC123XYZ",
      "Origin": "BOM",
      "Destination": "LKO",
      "Results": [
        {
          "ResultIndex": "0",
          "IsLCC": false,
          "IsRefundable": true,
          "Source": 1,
          "AirlineRemark": "Direct Flight",
          "Fare": {
            "Currency": "INR",
            "BaseFare": 3500,
            "Tax": 650,
            "YQTax": 0,
            "OtherTaxes": 0,
            "PGCharge": 0,
            "TaxBreakup": [
              {
                "key": "YQ",
                "value": 0
              },
              {
                "key": "Other",
                "value": 650
              }
            ],
            "OfferedFare": 4150
          },
          "Segments": [
            [
              {
                "Origin": {
                  "Airport": {
                    "AirportCode": "BOM",
                    "AirportName": "Bombay",
                    "CityCode": "BOM",
                    "CityName": "Mumbai",
                    "CountryCode": "IN",
                    "CountryName": "India"
                  },
                  "DepTime": "2025-12-15T06:00:00"
                },
                "Destination": {
                  "Airport": {
                    "AirportCode": "LKO",
                    "AirportName": "Lucknow",
                    "CityCode": "LKO",
                    "CityName": "Lucknow",
                    "CountryCode": "IN",
                    "CountryName": "India"
                  },
                  "ArrTime": "2025-12-15T08:30:00"
                },
                "DepTime": "2025-12-15T06:00:00",
                "ArrTime": "2025-12-15T08:30:00",
                "Duration": 150,
                "Baggage": "20 KG",
                "CabinBaggage": "6 KG",
                "Airline": {
                  "AirlineCode": "6E",
                  "AirlineName": "IndiGo",
                  "FlightNumber": "IE-633"
                },
                "Craft": "A320",
                "Equipment": "Airbus A320"
              }
            ]
          ]
        },
        {
          "ResultIndex": "1",
          "IsLCC": true,
          "IsRefundable": false,
          "Source": 1,
          "Fare": {
            "Currency": "INR",
            "BaseFare": 2800,
            "Tax": 540,
            "OfferedFare": 3340
          },
          "Segments": [
            [
              {
                "DepTime": "2025-12-15T10:15:00",
                "ArrTime": "2025-12-15T12:45:00",
                "Duration": 150,
                "Baggage": "15 KG",
                "CabinBaggage": "0 KG",
                "Airline": {
                  "AirlineCode": "SG",
                  "AirlineName": "SpiceJet",
                  "FlightNumber": "SG-701"
                }
              }
            ]
          ]
        }
      ]
    }
  }
}
```

#### Response - No Results
```json
{
  "success": false,
  "message": "No flights available for your selected route and dates",
  "suggestions": [
    "Try searching for different dates",
    "Check if the route is served by airlines",
    "Consider nearby airports",
    "Try flexible date search"
  ],
  "searchCriteria": {
    "origin": "BOM",
    "destination": "LKO",
    "departDate": "2025-12-15",
    "adults": 1,
    "children": 0,
    "infants": 0,
    "cabinClass": "E"
  },
  "traceId": "TRACE-20251024-ABC123XYZ"
}
```

#### Response - Error
```json
{
  "success": false,
  "message": "Unable to search flights at this time",
  "suggestions": [
    "Please try again later",
    "Contact support if the issue persists"
  ],
  "error": "Connection timeout after 30 seconds"
}
```

---

### 2. Fare Quote (Reprice)

#### Request
```json
POST /api/v1/flights/fare-quote

{
  "resultIndex": "0",
  "traceId": "TRACE-20251024-ABC123XYZ"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "Error": {
        "ErrorCode": 0
      },
      "TraceId": "TRACE-20251024-ABC123XYZ",
      "Status": 1,
      "IsRefundable": true,
      "Fare": {
        "Currency": "INR",
        "BaseFare": 3500,
        "Tax": 650,
        "OfferedFare": 4150
      },
      "QuoteId": "QUOTE-12345678",
      "ValidityDate": "2025-12-15T12:00:00"
    }
  }
}
```

---

### 3. Flight Booking

#### Request
```json
POST /api/v1/flights/book

{
  "resultIndex": "0",
  "traceId": "TRACE-20251024-ABC123XYZ",
  "passengers": [
    {
      "type": "ADT",
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "gender": "M",
      "passport": "A12345678",
      "passportExpiry": "2030-06-20",
      "nationality": "IN",
      "mobile": "+91-9876543210",
      "email": "john@example.com"
    }
  ],
  "contactPerson": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+91-9876543210",
    "address": "123 Main Street",
    "city": "Mumbai",
    "postalCode": "400001",
    "country": "IN"
  }
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "Error": {
        "ErrorCode": 0
      },
      "TraceId": "TRACE-20251024-ABC123XYZ",
      "PNR": "ABC1234",
      "BookingId": "BK-2025-12-15-001",
      "Status": "Confirmed",
      "Passengers": [
        {
          "Title": "Mr",
          "FirstName": "John",
          "LastName": "Doe",
          "PaxId": 1,
          "Nationality": "IN",
          "Email": "john@example.com"
        }
      ],
      "TicketNumber": "PENDING",
      "Fare": {
        "Currency": "INR",
        "BaseFare": 3500,
        "Tax": 650,
        "OfferedFare": 4150
      }
    }
  }
}
```

---

### 4. Ticket Issuance

#### Request
```json
POST /api/v1/flights/ticket

{
  "bookingId": "BK-2025-12-15-001",
  "pnr": "ABC1234"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "Error": {
        "ErrorCode": 0
      },
      "BookingId": "BK-2025-12-15-001",
      "PNR": "ABC1234",
      "TicketNumber": "1234567890123",
      "TicketingStatus": "Ticketed",
      "TicketIssueDate": "2025-10-24T14:30:00",
      "Passengers": [
        {
          "FirstName": "John",
          "LastName": "Doe",
          "TicketNumber": "1234567890123"
        }
      ]
    }
  }
}
```

---

### 5. Booking Details / PNR Retrieval

#### Request
```json
POST /api/v1/flights/booking-details

{
  "pnr": "ABC1234",
  "bookingId": "BK-2025-12-15-001"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "Error": {
        "ErrorCode": 0
      },
      "PNR": "ABC1234",
      "BookingId": "BK-2025-12-15-001",
      "Status": "Ticketed",
      "BookingDate": "2025-10-24T14:00:00",
      "Passengers": [
        {
          "Title": "Mr",
          "FirstName": "John",
          "LastName": "Doe",
          "Nationality": "IN",
          "Type": "ADT"
        }
      ],
      "Journey": {
        "Segments": [
          [
            {
              "DepTime": "2025-12-15T06:00:00",
              "ArrTime": "2025-12-15T08:30:00",
              "Origin": "BOM",
              "Destination": "LKO",
              "Airline": {
                "AirlineCode": "6E",
                "FlightNumber": "IE-633"
              }
            }
          ]
        ]
      },
      "Fare": {
        "Currency": "INR",
        "BaseFare": 3500,
        "Tax": 650,
        "Total": 4150
      },
      "Itinerary": [
        {
          "TicketNumber": "1234567890123",
          "Status": "Ticketed"
        }
      ]
    }
  }
}
```

---

### 6. Fare Rules

#### Request
```json
POST /api/v1/flights/fare-rule

{
  "resultIndex": "0",
  "traceId": "TRACE-20251024-ABC123XYZ"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "TraceId": "TRACE-20251024-ABC123XYZ",
      "FareRules": [
        {
          "RuleId": 1,
          "RuleCategory": "Baggage",
          "RuleDescription": "20 KG per passenger"
        },
        {
          "RuleId": 2,
          "RuleCategory": "Refund",
          "RuleDescription": "100% refund if cancelled 72 hours before departure"
        },
        {
          "RuleId": 3,
          "RuleCategory": "DateChange",
          "RuleDescription": "Free date change up to 30 days"
        },
        {
          "RuleId": 4,
          "RuleCategory": "CancellationCharges",
          "RuleDescription": "Non-refundable after 72 hours of booking"
        }
      ]
    }
  }
}
```

---

### 7. Special Service Requests (SSR)

#### Request
```json
POST /api/v1/flights/ssr

{
  "bookingId": "BK-2025-12-15-001",
  "pnr": "ABC1234",
  "ssrCode": "SEAT",
  "ssrRequestType": "PreferredSeat",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "seatPreference": "11A"
    }
  ]
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "Response": {
      "ResponseStatus": 1,
      "Status": "Added",
      "SSRCode": "SEAT",
      "Message": "Special Service Request has been added successfully"
    }
  }
}
```

---

## Hotel Operations

### 8. Hotel Search

#### Request
```json
POST /api/v1/hotels/search

{
  "cityId": "DXB",
  "cityName": "Dubai",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "currency": "AED",
  "nationality": "IN",
  "rooms": [
    {
      "adults": 2,
      "children": 1,
      "childAges": [8]
    }
  ],
  "filters": {
    "starRating": [5, 4],
    "maxPrice": 500
  },
  "page": 1,
  "pageSize": 20
}
```

#### Response - Success
```json
{
  "success": true,
  "data": [
    {
      "id": "HTL-ARMANI-001",
      "code": "ARMANI",
      "name": "Armani Hotel Dubai",
      "address": "Burj Khalifa, Downtown Dubai, Dubai 00000, United Arab Emirates",
      "starRating": 5,
      "guestRating": 4.8,
      "image": "https://example.com/armani.jpg",
      "amenities": [
        "Free WiFi",
        "Swimming Pool",
        "Gym",
        "Restaurant",
        "Bar",
        "Room Service 24/7",
        "Spa",
        "Concierge"
      ],
      "roomTypes": [
        {
          "roomTypeId": "RM-ARMANI-SUITE",
          "roomType": "Suite Deluxe",
          "occupancy": 3,
          "basePrice": 450,
          "currency": "AED",
          "taxes": 45,
          "totalPrice": 495,
          "availability": "Available",
          "breakup": {
            "roomCharge": 450,
            "serviceCharge": 0,
            "taxes": 45,
            "otherCharges": 0
          },
          "description": "Spacious suite with city view"
        },
        {
          "roomTypeId": "RM-ARMANI-VILLA",
          "roomType": "Private Villa",
          "occupancy": 4,
          "basePrice": 1200,
          "currency": "AED",
          "taxes": 120,
          "totalPrice": 1320,
          "availability": "Available",
          "description": "Exclusive villa with private pool"
        }
      ]
    },
    {
      "id": "HTL-BURJ-001",
      "code": "BURJALARAB",
      "name": "Burj Al Arab",
      "address": "Jumeirah Beach, Dubai",
      "starRating": 5,
      "guestRating": 4.7,
      "roomTypes": [
        {
          "roomTypeId": "RM-BURJ-SUITE",
          "roomType": "Signature Suite",
          "basePrice": 1500,
          "currency": "AED",
          "taxes": 150,
          "totalPrice": 1650,
          "availability": "Available"
        }
      ]
    }
  ],
  "pagination": {
    "traceId": "HTL_DUBAI_20251024_ABC123",
    "page": 1,
    "pageSize": 20,
    "total": 145,
    "lastPage": 8,
    "from": 1,
    "to": 20,
    "hasMorePages": true,
    "markupPct": 5.0,
    "usingMockData": false
  }
}
```

#### Response - No Hotels Found
```json
{
  "success": false,
  "message": "No hotels found for the selected criteria",
  "suggestions": [
    "Try different dates",
    "Try nearby cities",
    "Adjust your budget",
    "Select different room configuration"
  ]
}
```

---

### 9. Hotel PreBook

#### Request
```json
POST /api/v1/hotels/prebook

{
  "bookingCode": "ARMANI_SUITE_DXB_20251220",
  "traceId": "HTL_DUBAI_20251024_ABC123"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "bookingCode": "ARMANI_SUITE_DXB_20251220",
    "hotelName": "Armani Hotel Dubai",
    "roomType": "Suite Deluxe",
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "nights": 5,
    "pricePerNight": 495,
    "totalFare": 2475,
    "taxes": 247.50,
    "grossTotal": 2722.50,
    "policies": {
      "cancellation": "Free cancellation up to 48 hours before check-in",
      "refundable": true,
      "isPriceChanged": false,
      "isPolicyChanged": false,
      "lastCancellationDate": "2025-12-18T23:59:59"
    },
    "constraints": {
      "isPanRequired": true,
      "isPassportRequired": false,
      "isAgeRestricted": false
    },
    "breakup": [
      {
        "date": "2025-12-20",
        "roomCharge": 450,
        "tax": 45,
        "total": 495
      },
      {
        "date": "2025-12-21",
        "roomCharge": 450,
        "tax": 45,
        "total": 495
      },
      {
        "date": "2025-12-22",
        "roomCharge": 450,
        "tax": 45,
        "total": 495
      },
      {
        "date": "2025-12-23",
        "roomCharge": 450,
        "tax": 45,
        "total": 495
      },
      {
        "date": "2025-12-24",
        "roomCharge": 450,
        "tax": 45,
        "total": 495
      }
    ]
  }
}
```

---

### 10. Hotel Booking

#### Request
```json
POST /api/v1/hotels/book

{
  "bookingCode": "ARMANI_SUITE_DXB_20251220",
  "traceId": "HTL_DUBAI_20251024_ABC123",
  "guest": {
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+971-501234567",
    "nationality": "IN",
    "address": "123 Main Street",
    "city": "Mumbai",
    "postalCode": "400001"
  },
  "payment": {
    "method": "CC",
    "currency": "AED",
    "amount": 2722.50
  },
  "additionalGuests": [
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "relationToMainGuest": "Spouse"
    }
  ]
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "bookingId": "ARMANI-DXB-20251024-001",
    "referenceNumber": "HTL-2025-12-20-12345",
    "status": "Confirmed",
    "confirmationNumber": "CONF-123456",
    "hotelName": "Armani Hotel Dubai",
    "roomType": "Suite Deluxe",
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "nights": 5,
    "totalCost": 2722.50,
    "currency": "AED",
    "guestName": "John Doe",
    "confirmationEmail": "john@example.com",
    "checkInTime": "15:00",
    "checkOutTime": "11:00",
    "importantNotes": [
      "Please bring valid ID at check-in",
      "Cancellation free until 2025-12-18",
      "Late checkout available for additional charge"
    ]
  }
}
```

---

### 11. Hotel Booking Details

#### Request
```json
GET /api/v1/hotels/booking/ARMANI-DXB-20251024-001
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "bookingId": "ARMANI-DXB-20251024-001",
    "referenceNumber": "HTL-2025-12-20-12345",
    "status": "Confirmed",
    "hotelCode": "ARMANI",
    "hotelName": "Armani Hotel Dubai",
    "address": "Burj Khalifa, Downtown Dubai",
    "phone": "+971-4-888-3888",
    "email": "reservations@armanihotels.com",
    "checkIn": "2025-12-20T15:00:00",
    "checkOut": "2025-12-25T11:00:00",
    "nights": 5,
    "roomType": "Suite Deluxe",
    "roomNumber": "3401",
    "occupancy": {
      "adults": 2,
      "children": 1,
      "totalGuests": 3
    },
    "pricing": {
      "roomChargePerNight": 450,
      "taxPerNight": 45,
      "totalNightlyRate": 495,
      "numberOfNights": 5,
      "roomChargeTotal": 2250,
      "taxTotal": 225,
      "serviceCharge": 0,
      "discountApplied": 0,
      "grossTotal": 2475,
      "currency": "AED"
    },
    "guest": {
      "title": "Mr",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "mobile": "+971-501234567",
      "nationality": "IN"
    },
    "specialRequests": [
      "High floor room if available",
      "Late checkout requested"
    ],
    "amenities": [
      "Free WiFi",
      "Swimming Pool",
      "Gym",
      "Restaurant",
      "Spa"
    ],
    "cancellationPolicy": "Free cancellation up to 48 hours before check-in",
    "lastCancellationDate": "2025-12-18T23:59:59"
  }
}
```

---

### 12. Hotel Cancellation

#### Request
```json
POST /api/v1/hotels/cancel

{
  "bookingId": "ARMANI-DXB-20251024-001",
  "reason": "Change of plans"
}
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "bookingId": "ARMANI-DXB-20251024-001",
    "status": "Cancellation Initiated",
    "changeRequestId": "CHG-2025-10-24-001",
    "originalBookingStatus": "Confirmed",
    "cancellationStatus": "Pending",
    "hotelName": "Armani Hotel Dubai",
    "originalTotalCost": 2475,
    "refundableAmount": 2475,
    "cancellationCharges": 0,
    "netRefund": 2475,
    "currency": "AED",
    "message": "Cancellation request has been submitted. You will receive confirmation within 24 hours.",
    "estimatedRefundDate": "2025-10-27"
  }
}
```

---

### 13. Cancellation Status

#### Request
```json
GET /api/v1/hotels/cancel-status/CHG-2025-10-24-001
```

#### Response - Success
```json
{
  "success": true,
  "data": {
    "changeRequestId": "CHG-2025-10-24-001",
    "bookingId": "ARMANI-DXB-20251024-001",
    "status": "Completed",
    "originalStatus": "Confirmed",
    "currentStatus": "Cancelled",
    "processedAt": "2025-10-24T16:30:00",
    "refundStatus": "Processed",
    "refundAmount": 2475,
    "refundMethod": "Original Payment Method",
    "expectedRefundDate": "2025-10-27"
  }
}
```

---

### 14. Get Countries

#### Request
```json
GET /api/v1/hotels/countries
```

#### Response - Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "iso2": "AE",
      "iso3": "ARE",
      "name": "United Arab Emirates",
      "tbo_country_code": "AE"
    },
    {
      "id": 2,
      "iso2": "IN",
      "iso3": "IND",
      "name": "India",
      "tbo_country_code": "IN"
    },
    {
      "id": 3,
      "iso2": "US",
      "iso3": "USA",
      "name": "United States",
      "tbo_country_code": "US"
    },
    {
      "id": 4,
      "iso2": "GB",
      "iso3": "GBR",
      "name": "United Kingdom",
      "tbo_country_code": "GB"
    }
  ]
}
```

---

### 15. Get Cities

#### Request
```json
GET /api/v1/hotels/cities?country=AE
```

#### Response - Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dubai",
      "tbo_city_code": "DXB",
      "latitude": 25.2048,
      "longitude": 55.2708
    },
    {
      "id": 2,
      "name": "Abu Dhabi",
      "tbo_city_code": "AUH",
      "latitude": 24.4539,
      "longitude": 54.3773
    },
    {
      "id": 3,
      "name": "Sharjah",
      "tbo_city_code": "SHJ",
      "latitude": 25.3548,
      "longitude": 55.4033
    }
  ]
}
```

---

### 16. Get Hotel Codes

#### Request
```json
GET /api/v1/hotels/hotel-codes?city=DXB
```

#### Response - Success
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tbo_hotel_code": "ARMANI",
      "name": "Armani Hotel Dubai",
      "star_rating": 5,
      "guest_rating": 4.8
    },
    {
      "id": 2,
      "tbo_hotel_code": "BURJALARAB",
      "name": "Burj Al Arab",
      "star_rating": 5,
      "guest_rating": 4.7
    },
    {
      "id": 3,
      "tbo_hotel_code": "ATLANTISPALM",
      "name": "Atlantis The Palm",
      "star_rating": 5,
      "guest_rating": 4.5
    }
  ]
}
```

---

## Error Response Examples

### Common Error - Invalid Request

```json
{
  "success": false,
  "errors": {
    "origin": ["The origin field is required."],
    "destination": ["The destination field must be 3 characters."],
    "departureDate": ["The departure date must be a date after or equal to today."]
  }
}
```

### Common Error - API Error

```json
{
  "success": false,
  "message": "Unable to search flights at this time",
  "suggestions": [
    "Please try again later",
    "Contact support if the issue persists"
  ],
  "error": "SOAP Fault: Server is currently unavailable"
}
```

### Common Error - Authentication Failure

```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid TBO credentials",
  "code": 100
}
```

---

## Notes

- All requests should have `Content-Type: application/json`
- All dates should be in `YYYY-MM-DD` format or ISO 8601 format with time
- Currency codes follow ISO 4217 standard
- Airport codes are IATA 3-letter codes
- Response times typically range from 2-10 seconds depending on network
- All amounts are in specified currency (check response for currency field)

---

**Last Updated:** October 24, 2025

# TBO API cURL Test Commands

This file contains cURL commands to test all major TBO API endpoints after the update.

**Note**: Replace `YOUR_CLIENT_ID`, `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_TOKEN` with actual credentials from TBO.

## Flight API Tests

### 1. Authentication (Get TokenId)

```bash
curl -X POST https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1"
  }'
```

**Expected Response**:
```json
{
  "Status": 1,
  "TokenId": "abc123...",
  "Error": null
}
```

---

### 2. Air Search

```bash
curl -X POST https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "AdultCount": 1,
    "ChildCount": 0,
    "InfantCount": 0,
    "JourneyType": 1,
    "DirectFlight": false,
    "OneStopFlight": false,
    "Segments": [
      {
        "Origin": "DEL",
        "Destination": "BOM",
        "FlightCabinClass": 1,
        "PreferredDepartureTime": "2025-11-15T00:00:00",
        "PreferredArrivalTime": "2025-11-15T00:00:00"
      }
    ],
    "Sources": ["GDS", "LCC"]
  }'
```

**Expected Response**:
```json
{
  "Response": {
    "ResponseStatus": 1,
    "TraceId": "xyz789...",
    "Results": [[...flight results...]]
  }
}
```

---

### 3. Fare Quote

```bash
curl -X POST https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareQuote \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "ResultIndex": "1",
    "TraceId": "TRACE_ID_FROM_SEARCH"
  }'
```

**Expected Response**:
```json
{
  "Response": {
    "ResponseStatus": 1,
    "IsPriceChanged": false,
    "Results": {...}
  }
}
```

---

### 4. Fare Rule

```bash
curl -X POST https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareRule \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "ResultIndex": "1",
    "TraceId": "TRACE_ID_FROM_SEARCH"
  }'
```

---

### 5. SSR (Special Service Request)

```bash
curl -X POST https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SSR \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "ResultIndex": "1",
    "TraceId": "TRACE_ID_FROM_SEARCH"
  }'
```

---

### 6. Get Calendar Fare

```bash
curl -X POST https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCalendarFare \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "JourneyType": 1,
    "Segments": [
      {
        "Origin": "DEL",
        "Destination": "BOM",
        "FlightCabinClass": 1,
        "PreferredDepartureTime": "2025-11-15T00:00:00"
      }
    ]
  }'
```

---

### 7. Book Flight

```bash
curl -X POST https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Book \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "ResultIndex": "1",
    "TraceId": "TRACE_ID_FROM_SEARCH",
    "Passengers": [
      {
        "Title": "Mr",
        "FirstName": "John",
        "LastName": "Doe",
        "PaxType": 1,
        "DateOfBirth": "1990-01-01T00:00:00",
        "Gender": 1,
        "PassportNo": "",
        "PassportExpiry": "",
        "AddressLine1": "123 Main St",
        "City": "Mumbai",
        "CountryCode": "IN",
        "CountryName": "India",
        "Nationality": "IN",
        "ContactNo": "+91-9876543210",
        "Email": "john.doe@example.com"
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "Response": {
    "ResponseStatus": 1,
    "BookingId": 12345,
    "PNR": "ABC123",
    "Status": 1
  }
}
```

---

### 8. Ticket Flight

```bash
curl -X POST https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Ticket \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "BookingId": "BOOKING_ID_FROM_BOOK",
    "PNR": "PNR_FROM_BOOK"
  }'
```

---

### 9. Get Booking Details

```bash
curl -X POST https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetBookingDetails \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "BookingId": "BOOKING_ID",
    "PNR": "PNR_NUMBER"
  }'
```

---

### 10. Get Cancellation Charges

```bash
curl -X POST https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCancellationCharges \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "BookingId": "BOOKING_ID",
    "RequestType": 1
  }'
```

---

## Hotel API Tests

### 1. Hotel Authentication

Uses the same authentication endpoint as flights:

```bash
curl -X POST https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1"
  }'
```

---

### 2. Hotel Search

```bash
curl -X POST https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "CheckIn": "2025-12-01",
    "CheckOut": "2025-12-03",
    "HotelCodes": "123456",
    "GuestNationality": "IN",
    "NoOfRooms": 1,
    "PaxRooms": [
      {
        "Adults": 2,
        "Children": 0,
        "ChildrenAges": []
      }
    ],
    "IsDetailedResponse": true
  }'
```

**Expected Response**:
```json
{
  "Response": {
    "ResponseStatus": 1,
    "TraceId": "...",
    "HotelSearchResult": [...]
  }
}
```

---

### 3. Get Hotel Rooms (PreBook)

```bash
curl -X POST https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "ResultIndex": "RESULT_INDEX_FROM_SEARCH",
    "TraceId": "TRACE_ID_FROM_SEARCH",
    "HotelCode": "HOTEL_CODE"
  }'
```

---

### 4. Book Hotel

```bash
curl -X POST https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Book \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "ResultIndex": "RESULT_INDEX",
    "TraceId": "TRACE_ID",
    "HotelCode": "HOTEL_CODE",
    "HotelName": "Hotel Name",
    "GuestNationality": "IN",
    "NoOfRooms": 1,
    "HotelRoomsDetails": [...],
    "HotelPassenger": [...]
  }'
```

---

### 5. Get Booking Details

```bash
curl -X POST https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetBookingDetail \
  -H "Content-Type: application/json" \
  -d '{
    "ClientId": "YOUR_CLIENT_ID",
    "UserName": "YOUR_USERNAME",
    "Password": "YOUR_PASSWORD",
    "EndUserIp": "127.0.0.1",
    "TokenId": "YOUR_TOKEN",
    "BookingId": "BOOKING_ID"
  }'
```

---

## Testing Workflow

1. **Authenticate** - Get a TokenId (valid for 24 hours)
2. **Search** - Search for flights or hotels
3. **Fare Quote/PreBook** - Get detailed pricing and availability
4. **Book** - Create a booking
5. **Ticket/Voucher** - Generate tickets or vouchers
6. **Get Details** - Retrieve booking information

---

## Error Handling

### Common Error Responses

**Invalid Resource** (Wrong endpoint):
```json
{
  "Error": {
    "ErrorCode": 404,
    "ErrorMessage": "Invalid Resource Requested"
  }
}
```

**Authentication Failure**:
```json
{
  "Status": 0,
  "TokenId": null,
  "Error": {
    "ErrorCode": 401,
    "ErrorMessage": "Invalid credentials"
  }
}
```

**Validation Error**:
```json
{
  "Response": {
    "ResponseStatus": 0,
    "Error": {
      "ErrorCode": 400,
      "ErrorMessage": "Validation failed: ..."
    }
  }
}
```

---

## Notes

- All endpoints use **HTTPS** (not HTTP)
- TokenId is valid for **24 hours** after authentication
- TraceId from search is required for fare quote, book, and other operations
- BookingId is returned after successful booking and used for ticketing
- ResultIndex identifies a specific flight/hotel option from search results
- All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`
- Passenger details must be accurate for ticketing

---

## Additional Resources

- **TBO Flight API Documentation**: https://apidoc.tektravels.com/flight/
- **TBO Hotel API Documentation**: https://apidoc.tektravels.com/hotelnew/
- **Support**: Contact TBO support for API credentials and troubleshooting

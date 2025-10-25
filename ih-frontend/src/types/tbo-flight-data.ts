/**
 * Comprehensive TBO Flight API v10 Data Types
 * Maps all real TBO response fields for complete flight information
 */

// ============================================================================
// AIRLINE INFORMATION
// ============================================================================

export interface AirlineInfo {
  AirlineCode: string // e.g., "AI", "6E", "9W"
  AirlineName: string // e.g., "Air India", "IndiGo", "Jet Airways"
  FlightNumber: string // e.g., "2425"
  FareClass: string // e.g., "L", "Y" - IATA fare class
  OperatingCarrier?: string // If different from marketing carrier
}

// ============================================================================
// BAGGAGE & CABIN INFORMATION
// ============================================================================

export interface BaggageInfo {
  Baggage: string // e.g., "15 KG", "20 KG", "Included"
  CabinBaggage: string // e.g., "7 KG", "Included", "Not Included"
}

export interface CabinInfo extends BaggageInfo {
  CabinClass: number // 1=Economy, 2=Premium Economy, 3=Business, 4=First
  SupplierFareClass: string
}

// ============================================================================
// AIRPORT & LOCATION INFORMATION
// ============================================================================

export interface Airport {
  AirportCode: string // e.g., "DEL", "BOM"
  AirportName: string
  Terminal?: string
  CityCode: string
  CityName: string
  CountryCode: string
  CountryName: string
}

export interface AirportTime {
  Airport: Airport
  DepTime?: string // ISO 8601 format for departure
  ArrTime?: string // ISO 8601 format for arrival
}

// ============================================================================
// FLIGHT SEGMENT DETAILS
// ============================================================================

export interface Segment {
  Baggage: string
  CabinBaggage: string
  CabinClass: number
  SupplierFareClass: string
  TripIndicator: number // 1=Outbound, 2=Return, 3=Continuation
  SegmentIndicator: number
  Airline: AirlineInfo
  NoOfSeatAvailable: number // Real-time seat count
  Origin: AirportTime
  Destination: AirportTime
  Duration: number // Minutes
  GroundTime: number // For multi-leg flights
  Mile: number
  StopOver: boolean
  FlightInfoIndex: string
  StopPoint: string
  StopPointArrivalTime: string // ISO 8601
  StopPointDepartureTime: string // ISO 8601
  Craft: string // Aircraft code, e.g., "788" = Boeing 787
  Remark?: string
  IsETicketEligible: boolean
  FlightStatus: string // "Confirmed", "Operating", etc.
  Status: string
  FareClassification?: {
    Color: string // HTML color, e.g., "rgb(182,215,228)"
    Type: string // "Publish", "RestrictedPublish", etc.
  }
}

// ============================================================================
// FARE & PRICING INFORMATION
// ============================================================================

export interface TaxBreakup {
  key: string // e.g., "K3", "YQTax", "YR", "PSF", "UDF", "INTax", "OtherTaxes"
  value: number
}

export interface ChargeBreakup {
  key: string // e.g., "TBOMARKUP", "GLOBALPROCUREMENTCHARGE", "CONVENIENCECHARGE"
  value: number
}

export interface FareDetails {
  ServiceFeeDisplayType: number
  Currency: string // "INR", "USD", etc.
  BaseFare: number // Base fare amount
  Tax: number // Total tax
  TaxBreakup: TaxBreakup[] // Detailed tax breakdown
  YQTax: number // Fuel surcharge
  AdditionalTxnFeeOfrd: number
  AdditionalTxnFeePub: number
  PGCharge: number // Payment gateway charge
  OtherCharges: number
  ChargeBU: ChargeBreakup[] // Charges breakdown
  Discount: number
  PublishedFare: number
  CommissionEarned: number
  PLBEarned: number // Profit Loss Balance
  IncentiveEarned: number
  OfferedFare: number // Final offered price
  TotalFare?: number // Total fare (for compatibility)
  TdsOnCommission: number
  TdsOnPLB: number // Tax Deduction at Source
  TdsOnIncentive: number
  ServiceFee: number
  TotalBaggageCharges: number
  TotalMealCharges: number
  TotalSeatCharges: number
  TotalSpecialServiceCharges: number
  // Convenience fields
  baseFare: number // Copy of BaseFare
  finalFare: number // Total final fare
  markupPct: number // Applied markup percentage
}

export interface PassengerFareBreakdown {
  Currency: string
  PassengerType: number // 1=Adult, 2=Child, 3=Infant
  PassengerCount: number
  BaseFare: number
  Tax: number
  TaxBreakUp: TaxBreakup[]
  YQTax: number
  AdditionalTxnFeeOfrd: number
  AdditionalTxnFeePub: number
  PGCharge: number
  SupplierReissueCharges: number
}

// ============================================================================
// FARE RULES & RESTRICTIONS
// ============================================================================

export interface FareRule {
  Origin: string
  Destination: string
  Airline: string
  FareBasisCode: string // e.g., "LU1YXSII"
  FareRuleDetail: string
  FareRestriction: string
  FareFamilyCode: string
  FareRuleIndex: string
}

export interface MiniFareRule {
  JourneyPoints: string // e.g., "DEL-BOM"
  Type: string // "Cancellation", "Reissue", "Refund", etc.
  From?: number
  To?: number
  Unit?: string // "Days", "Hours", etc.
  Details: string // Human-readable description with amounts
  OnlineReissueAllowed: boolean
  OnlineRefundAllowed: boolean
}

// ============================================================================
// SPECIAL SERVICE REQUESTS (SSR)
// ============================================================================

export interface SsrOption {
  code: string // e.g., "MEAL", "SEAT", "BAGGAGE"
  name: string
  description?: string
  price?: {
    currency: string
    amount: number
  }
}

// ============================================================================
// FARE CLASSIFICATION & ADVISORIES
// ============================================================================

export interface FareClassification {
  Color: string // HTML color
  Type: string // "Publish", "RegularFare", etc.
}

// ============================================================================
// COMPLETE FLIGHT RESULT (Single Itinerary Option)
// ============================================================================

export interface FlightResult {
  // Identifiers
  ResultIndex: string // Unique identifier for booking reference
  Source: number // 5=GDS, 6=LCC, etc.

  // Airline Information
  AirlineCode: string
  ValidatingAirline: string
  AirlineRemark: string

  // Segments (grouped by legs for round-trip/multi-city)
  Segments: Segment[][]

  // Pricing
  Fare: FareDetails
  FareBreakdown: PassengerFareBreakdown[] // Per passenger type breakdown

  // Rules & Restrictions
  FareRules: FareRule[]
  MiniFareRules: MiniFareRule[][]
  FareInclusions: string[] // What's included in the fare
  FareClassification: FareClassification

  // Booking & Policy Flags
  IsBookableIfSeatNotAvailable: boolean
  IsExclusiveFare: boolean
  IsFreeMealAvailable: boolean
  IsRefundable: boolean
  IsUpsellAllowed: boolean
  IsLCC: boolean // Low-cost carrier
  IsCouponAppilcable: boolean
  IsGSTMandatory: boolean
  GSTAllowed: boolean
  IsHoldAllowedWithSSR: boolean
  IsHoldMandatoryWithSSR: boolean

  // Passenger Requirements
  FirstNameFormat?: string
  LastNameFormat?: string
  IsPanRequiredAtBook: boolean
  IsPanRequiredAtTicket: boolean
  IsPassportRequiredAtBook: boolean
  IsPassportRequiredAtTicket: boolean
  IsPassportFullDetailRequiredAtBook: boolean

  // Result Type & Ranking
  ResultFareType: string // "RegularFare", "RestrictedFare", etc.
  NonStopFirstRanking: number
  SmartChoiceRanking: number

  // Ticketing
  LastTicketDate: string // ISO 8601 deadline to ticket
  TicketAdvisory?: string

  // System Fields
  markupPct: number
}

// ============================================================================
// SEARCH RESPONSE
// ============================================================================

export interface FlightSearchResponse {
  success: boolean
  data: {
    origin: string
    destination: string
    results: FlightResult[]
    traceId?: string
    Response?: {
      ResponseStatus: number // 1=Success
      Error?: string
      Results?: FlightResult[][]
    }
    markupPct: number
  }
}

// ============================================================================
// FRONTEND DISPLAY MODELS (Derived from TBO data)
// ============================================================================

/**
 * Simplified flight option for search results display
 */
export interface FlightDisplayOption {
  id: string // Unique identifier (ResultIndex)
  airlineCode: string
  airlineName: string
  flightNumber: string
  departTime: string // HH:mm
  arrivalTime: string // HH:mm
  duration: string // "2h 25m"
  stops: number
  baseFare: number
  totalFare: number
  currency: string
  baggage: string
  cabinClass: string
  isRefundable: boolean
  isMeal: boolean
  ranking?: number // SmartChoiceRanking
  seats: number
  taxes: TaxBreakup[]
}

/**
 * Complete flight details for detail view
 */
export interface FlightDetailsDisplay {
  id: string
  flightOption: FlightDisplayOption
  segments: Segment[]
  fareRules: {
    cancellation: MiniFareRule[]
    reissue: MiniFareRule[]
  }
  fare: FareDetails
  fareBreakdown: PassengerFareBreakdown[]
  inclusions: string[]
  ssrOptions: SsrOption[]
  policies: {
    refundable: boolean
    mealIncluded: boolean
    seatAvailable: number
    lastTicketDate: string
    airlineRemark: string
  }
  validatingAirline: string
}


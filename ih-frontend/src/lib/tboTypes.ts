export interface TboTaxKV {
  key: string
  value: number
}

export interface TboFare {
  Currency: string
  BaseFare: number
  Tax: number
  YQTax?: number
  OtherTaxes?: number
  PGCharge?: number
  TaxBreakup?: TboTaxKV[]
  OfferedFare?: number
}

export interface TboAirlineInfo {
  AirlineCode?: string
  AirlineName?: string
  FlightNumber?: string
}

export interface TboSegment {
  Origin?: {
    Airport?: {
      AirportCode?: string
      AirportName?: string
      CityCode?: string
      CityName?: string
      CountryCode?: string
      CountryName?: string
    }
    DepTime?: string
  } | string
  Destination?: {
    Airport?: {
      AirportCode?: string
      AirportName?: string
      CityCode?: string
      CityName?: string
      CountryCode?: string
      CountryName?: string
    }
    ArrTime?: string
  } | string
  DepTime?: string
  ArrTime?: string
  Duration?: number
  Baggage?: string
  CabinBaggage?: string
  Airline?: TboAirlineInfo
  Craft?: string
}

export interface TboItinerary {
  ResultIndex: string
  Fare: TboFare
  Segments?: TboSegment[][] | TboSegment[]
  IsLCC?: boolean
  IsRefundable?: boolean
  Source?: number
  AirlineRemark?: string
}

export interface TboResponse {
  ResponseStatus: number
  Error: { ErrorCode: number; ErrorMessage?: string }
  TraceId: string
  Origin: string
  Destination: string
  Results?: TboItinerary[][] | TboItinerary[]
}

export interface TboFlightSearchResponse {
  success: boolean
  data: { Response: TboResponse }
}

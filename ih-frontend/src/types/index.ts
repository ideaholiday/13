// Core travel types
export interface Location {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

export interface Airport extends Location {
  iata: string;
  icao?: string;
  terminal?: string;
}

export interface City {
  code: string;
  name: string;
  country: string;
  airports: Airport[];
  isPopular?: boolean;
  image?: string;
}

// Date and time types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

// Passenger and traveler types
export type PassengerType = 'adult' | 'child' | 'infant';
export type Gender = 'male' | 'female' | 'other';
export type TravelClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type FareType = 'regular' | 'student' | 'senior' | 'armed_forces' | 'doctor_nurse';

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface Traveler {
  id: string;
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: Date;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: Date;
  email?: string;
  phone?: string;
}

// Flight related types
export type TripType = 'oneway' | 'roundtrip' | 'multicity';
export type StopType = 'nonstop' | '1stop' | '2+stops';

export interface FlightSearchParams {
  tripType: TripType;
  origin: Airport;
  destination: Airport;
  departureDate: Date;
  returnDate?: Date;
  passengers: PassengerCount;
  travelClass: TravelClass;
  fareType: FareType;
  zeroCancellation?: boolean;
  legs?: FlightLeg[]; // For multi-city
}

export interface FlightLeg {
  id: string;
  origin: Airport;
  destination: Airport;
  departureDate: Date;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
  rating?: number;
}

export interface Aircraft {
  code: string;
  name: string;
  manufacturer: string;
}

export interface FlightSegment {
  id: string;
  airline: Airline;
  flightNumber: string;
  aircraft: Aircraft;
  origin: Airport;
  destination: Airport;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in minutes
  stops: number;
  stopDetails?: Airport[];
  baggage: BaggageInfo;
  amenities: string[];
}

export interface FlightItinerary {
  id: string;
  outbound: FlightSegment[];
  inbound?: FlightSegment[];
  totalDuration: number;
  stops: number;
  fareDetails: FareBreakdown;
  available: boolean;
  seatsLeft?: number;
  lastUpdated: Date;
}

export interface BaggageInfo {
  cabin: string; // e.g., "7 kg"
  checkedBag: string; // e.g., "15 kg"
  additionalInfo?: string;
}

export interface FareBreakdown {
  baseFare: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
  fareType: string;
  refundable: boolean;
  changeable: boolean;
  fareRules: string[];
}

// Lightweight Flight type for search result cards
export interface Flight {
  id: string;
  airline: Airline;
  aircraft: Aircraft;
  segments: Array<{
    id: string;
    airline: Airline;
    flightNumber: string;
    aircraft: Aircraft;
    origin: Airport;
    destination: Airport;
    // keep names compatible with results component expectations
    departure: Date;
    arrival: Date;
    duration: number;
    stops: any[];
    baggage: {
      checkedBags: number;
      cabinBag: number;
      personalItem: number;
    };
  }>;
  price: {
    total: number;
    base: number;
    taxes: number;
    currency: string;
  };
  availability: {
    totalSeats: number;
    availableSeats: number;
  };
  amenities: string[];
  bookingClass: TravelClass | 'economy';
}

// Hotel related types
export type RoomType = 'single' | 'double' | 'twin' | 'suite' | 'family' | 'apartment';
export type MealPlan = 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';

export interface HotelSearchParams {
  location: string;
  checkIn: Date;
  checkOut: Date;
  rooms: RoomConfiguration[];
  priceRange?: [number, number];
  starRating?: number[];
  amenities?: string[];
  propertyType?: string[];
}

export interface RoomConfiguration {
  adults: number;
  children: number;
  childAges: number[]; // Ages of children (0-17)
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  images: string[];
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  starRating: number;
  guestRating: number;
  reviewCount: number;
  amenities: string[];
  propertyType: string;
  rooms: Room[];
  policies: HotelPolicies;
  nearbyAttractions?: string[];
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  images: string[];
  maxOccupancy: number;
  bedType: string;
  size?: number; // in sq ft
  amenities: string[];
  mealPlan: MealPlan;
  pricing: RoomPricing;
  available: boolean;
  freeCancellation: boolean;
  cancellationDeadline?: Date;
}

export interface RoomPricing {
  basePrice: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
  perNight: boolean;
  discountPercent?: number;
  originalPrice?: number;
}

export interface HotelPolicies {
  checkInTime: string;
  checkOutTime: string;
  childPolicy: string;
  petPolicy: string;
  cancellationPolicy: string;
  paymentPolicy: string;
}

// Package related types
export interface Package {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  images: string[];
  destination: string;
  duration: number; // in days
  theme: string[];
  difficulty?: string;
  groupSize: {
    min: number;
    max: number;
  };
  pricing: PackagePricing;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  highlights: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  departureDates: Date[];
}

export interface PackagePricing {
  basePrice: number;
  currency: string;
  pricePerPerson: boolean;
  childDiscount?: number;
  seasonalPricing?: {
    season: string;
    multiplier: number;
  }[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
  transportation?: string;
}

// Booking related types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  pnr?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  travelers: Traveler[];
  bookingDate: Date;
  totalAmount: number;
  currency: string;
  contactDetails: ContactDetails;
  specialRequests?: string;
}

export interface FlightBooking extends Booking {
  type: 'flight';
  itinerary: FlightItinerary;
  seatPreferences?: SeatPreference[];
  mealPreferences?: MealPreference[];
  addOns: BookingAddOn[];
}

export interface HotelBooking extends Booking {
  type: 'hotel';
  hotel: Hotel;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  rooms: number;
}

export interface PackageBooking extends Booking {
  type: 'package';
  package: Package;
  departureDate: Date;
  travelerCount: number;
}

export interface ContactDetails {
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface SeatPreference {
  travelerId: string;
  seatType: 'window' | 'aisle' | 'middle';
  legRoom?: 'standard' | 'extra';
}

export interface MealPreference {
  travelerId: string;
  mealType: string; // e.g., 'vegetarian', 'vegan', 'halal', etc.
}

export interface BookingAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

// Search and filter types
export interface SearchFilters {
  priceRange?: [number, number];
  duration?: [number, number];
  stops?: StopType[];
  airlines?: string[];
  departureTime?: TimeSlot;
  arrivalTime?: TimeSlot;
  rating?: number;
  amenities?: string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  meta?: {
    pagination?: PaginationState;
    filters?: SearchFilters;
    sortBy?: SortOption;
  };
}

// Content types for CMS and Blog
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  readTime: number;
  featured: boolean;
}

export interface CMSPage {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  rating: number;
  comment: string;
  tripType: string;
  date: Date;
  featured: boolean;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  isPopular: boolean;
  packageCount: number;
  averagePrice: number;
  bestTime: string;
  highlights: string[];
}
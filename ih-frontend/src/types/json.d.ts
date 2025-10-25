// Type definitions for JSON data files
declare module '@/data/hotel-cities.json' {
  interface HotelCity {
    id: number
    name: string
    country: string
    stateProvince: string
    countryCode: string
    type: string
  }
  
  const data: HotelCity[]
  export default data
}

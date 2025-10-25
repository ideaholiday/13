'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotelSearchStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { HotelCitySelector } from './hotel-city-selector'
import { 
  Building, 
  Calendar,
  MapPin,
  Users,
  Plus,
  Minus,
  Search
} from 'lucide-react'

export function HotelSearchForm() {
  const router = useRouter()
  const { 
    location,
    checkIn,
    checkOut,
    rooms,
    setLocation,
    setCheckIn,
    setCheckOut,
    setRooms,
    addRoom,
    removeRoom,
    updateRoom,
    showRoomsPopover,
    setShowRoomsPopover,
    getSearchParams
  } = useHotelSearchStore()

  // Local state for input values
  const [locationInput, setLocationInput] = useState(location || '')

  // Safely convert a Date or date-like value to yyyy-mm-dd for input[type=date]
  const toDateInputValue = (d: unknown): string => {
    if (!d) return ''
    try {
      const date = d instanceof Date ? d : new Date(d as any)
      if (Number.isNaN(date.getTime())) return ''
      // Normalize to UTC to avoid timezone off-by-one in input value
      const y = date.getUTCFullYear()
      const m = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    } catch {
      return ''
    }
  }

  const handleLocationChange = (value: string) => {
    setLocationInput(value)
    setLocation(value)
  }

  const updateGuestCount = (roomIndex: number, type: 'adults' | 'children', increment: boolean) => {
    const room = rooms[roomIndex]
    const current = room[type]
    let newCount = increment ? current + 1 : Math.max(type === 'adults' ? 1 : 0, current - 1)
    
    // Limit guests per room
    const totalGuests = type === 'adults' 
      ? newCount + room.children 
      : room.adults + newCount
    
    if (totalGuests > 6) return // Max 6 guests per room
    
    const updatedRoom = { 
      ...room, 
      [type]: newCount,
      // Update child ages array when children count changes
      childAges: type === 'children' 
        ? Array(newCount).fill(0).map((_, i) => room.childAges[i] || 8)
        : room.childAges
    }
    
    updateRoom(roomIndex, updatedRoom)
  }

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    const room = rooms[roomIndex]
    const newChildAges = [...room.childAges]
    newChildAges[childIndex] = age
    updateRoom(roomIndex, { childAges: newChildAges })
  }

  const handleSearch = () => {
    const searchParams = getSearchParams()
    if (!searchParams) {
      alert('Please fill in all required fields correctly')
      return
    }

    // Create URL params for navigation
    const checkin = toDateInputValue(checkIn as unknown)
    const checkout = toDateInputValue(checkOut as unknown)

    const urlParams = new URLSearchParams({
      location: location,
      checkIn: checkin,
      checkOut: checkout,
      rooms: rooms.length.toString(),
      // Encode room configurations
      ...rooms.reduce((acc, room, index) => ({
        ...acc,
        [`room${index}_adults`]: room.adults.toString(),
        [`room${index}_children`]: room.children.toString(),
        [`room${index}_childAges`]: room.childAges.join(',')
      }), {})
    })

    router.push(`/hotels/search?${urlParams.toString()}`)
  }

  const getTotalGuests = () => {
    return rooms.reduce((total, room) => total + room.adults + room.children, 0)
  }

  const getTotalRooms = () => rooms.length

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-lg">
      <CardContent className="p-8">
        {/* Hotel Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
          {/* Location - Using HotelCitySelector */}
          <div className="md:col-span-4">
            <HotelCitySelector
              label="City, Property Name Or Location"
              value={locationInput}
              onChange={handleLocationChange}
              placeholder="Search cities or hotels..."
            />
          </div>

          {/* Check-in Date */}
          <div className="md:col-span-3">
            <Label htmlFor="checkin" className="text-slate-600 mb-2 block">
              Check-in
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="checkin"
                type="date"
                value={toDateInputValue(checkIn as unknown)}
                onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : null)}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Check-out Date */}
          <div className="md:col-span-3">
            <Label htmlFor="checkout" className="text-slate-600 mb-2 block">
              Check-out
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="checkout"
                type="date"
                value={toDateInputValue(checkOut as unknown)}
                onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : null)}
                className="pl-10"
                min={toDateInputValue(checkIn as unknown) || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Rooms & Guests */}
          <div className="md:col-span-2 relative">
            <Label className="text-slate-600 mb-2 block">Rooms & Guests</Label>
            <button
              type="button"
              onClick={() => setShowRoomsPopover(!showRoomsPopover)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sapphire-400 focus:ring-offset-2"
            >
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-slate-400" />
                <span className="text-sm">
                  {getTotalRooms()} Room{getTotalRooms() !== 1 ? 's' : ''}, {getTotalGuests()} Guest{getTotalGuests() !== 1 ? 's' : ''}
                </span>
              </div>
            </button>

            {showRoomsPopover && (
              <Card className="absolute z-10 mt-2 w-80 shadow-lg right-0">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {rooms.map((room, roomIndex) => (
                      <div key={roomIndex} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sapphire-900">Room {roomIndex + 1}</h4>
                          {rooms.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRoom(roomIndex)}
                              className="h-6 w-6 p-0 text-ruby-600 hover:text-ruby-700 hover:bg-ruby-50"
                            >
                              ×
                            </Button>
                          )}
                        </div>

                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Adults</p>
                            <p className="text-sm text-slate-500">18+ years</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount(roomIndex, 'adults', false)}
                              disabled={room.adults <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{room.adults}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount(roomIndex, 'adults', true)}
                              disabled={room.adults + room.children >= 6}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Children</p>
                            <p className="text-sm text-slate-500">0-17 years</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount(roomIndex, 'children', false)}
                              disabled={room.children <= 0}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{room.children}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount(roomIndex, 'children', true)}
                              disabled={room.adults + room.children >= 6}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Child Ages */}
                        {room.children > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Children Ages</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {room.childAges.map((age, childIndex) => (
                                <select
                                  key={childIndex}
                                  value={age}
                                  onChange={(e) => updateChildAge(roomIndex, childIndex, parseInt(e.target.value))}
                                  className="text-sm border border-slate-200 rounded-md px-2 py-1 focus:border-sapphire-500 focus:outline-none"
                                >
                                  {Array.from({ length: 18 }, (_, i) => (
                                    <option key={i} value={i}>
                                      {i} {i === 1 ? 'year' : 'years'}
                                    </option>
                                  ))}
                                </select>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Room Button */}
                    {rooms.length < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addRoom}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Room
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={() => setShowRoomsPopover(false)}
                      className="w-full"
                      size="sm"
                    >
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSearch}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-12 py-3 text-lg font-semibold"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Hotels
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
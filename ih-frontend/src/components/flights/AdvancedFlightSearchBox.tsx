'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Plane,
  ArrowRightLeft,
  Loader,
  AlertCircle,
  Search,
  Clock,
  BarChart3,
} from 'lucide-react'
import { useFlightBookingStore } from '@/lib/stores/unified-flight-store'
import toast from 'react-hot-toast'

// Popular airport data
const POPULAR_AIRPORTS = [
  { code: 'DEL', name: 'Indira Gandhi', city: 'Delhi' },
  { code: 'BOM', name: 'Bombay', city: 'Mumbai' },
  { code: 'BLR', name: 'Kempegowda', city: 'Bangalore' },
  { code: 'HYD', name: 'Rajiv Gandhi', city: 'Hyderabad' },
  { code: 'CCU', name: 'Netaji Subhas', city: 'Kolkata' },
  { code: 'MAA', name: 'Chennai', city: 'Chennai' },
  { code: 'COK', name: 'Cochin', city: 'Kochi' },
  { code: 'PNQ', name: 'Pune', city: 'Pune' },
  { code: 'LHR', name: 'Heathrow', city: 'London' },
  { code: 'DXB', name: 'Dubai', city: 'Dubai' },
]

interface AirportSelectorProps {
  value: string
  onChange: (airport: any) => void
  label: string
  placeholder: string
}

function AirportSelector({ value, onChange, label, placeholder }: AirportSelectorProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [filteredAirports, setFilteredAirports] = useState(POPULAR_AIRPORTS)

  useEffect(() => {
    if (!search) {
      setFilteredAirports(POPULAR_AIRPORTS)
    } else {
      const query = search.toLowerCase()
      setFilteredAirports(
        POPULAR_AIRPORTS.filter(
          (a) =>
            a.code.toLowerCase().includes(query) ||
            a.name.toLowerCase().includes(query) ||
            a.city.toLowerCase().includes(query)
        )
      )
    }
  }, [search])

  const selectedAirport = POPULAR_AIRPORTS.find((a) => a.code === value)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-12 px-4 border-2 border-sapphire-200 hover:border-sapphire-400"
          >
            {selectedAirport ? (
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{selectedAirport.code}</span>
                <span className="text-xs text-slate-500">{selectedAirport.city}</span>
              </div>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold mb-4">{label}</h2>
            <Input
              placeholder="Search airport code or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredAirports.map((airport) => (
              <button
                key={airport.code}
                onClick={() => {
                  onChange(airport)
                  setOpen(false)
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-sapphire-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">{airport.code}</div>
                <div className="text-sm text-slate-600">
                  {airport.name} • {airport.city}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date) => void
  label: string
  minDate?: Date
}

function DatePicker({ value, onChange, label, minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-12 px-4 border-2 border-sapphire-200 hover:border-sapphire-400"
          >
            {value ? (
              <span className="font-semibold text-slate-900">{format(value, 'dd MMM yyyy')}</span>
            ) : (
              <span className="text-slate-500">Select date</span>
            )}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <h2 className="text-lg font-bold">{label}</h2>
          <Input
            type="date"
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = new Date(e.target.value)
              onChange(date)
              setOpen(false)
            }}
            min={minDate ? format(minDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
            className="h-12"
            autoFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TravelersPopoverProps {
  adults: number
  childCount: number
  infants: number
  onChange: (adults: number, children: number, infants: number) => void
}

function TravelersPopover({ adults, childCount, infants, onChange }: TravelersPopoverProps) {
  const [open, setOpen] = useState(false)
  const [localAdults, setLocalAdults] = useState(adults)
  const [localChildren, setLocalChildren] = useState(childCount)
  const [localInfants, setLocalInfants] = useState(infants)

  const handleApply = () => {
    onChange(localAdults, localChildren, localInfants)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Travelers</label>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-12 px-4 border-2 border-sapphire-200 hover:border-sapphire-400"
          >
            <span className="font-semibold text-slate-900">
              {adults + localChildren + infants === 1
                ? '1 Traveler'
                : `${adults + localChildren + infants} Travelers`}
            </span>
            <span className="text-xs text-slate-600 ml-2">
              ({adults}A {localChildren > 0 ? `${localChildren}C` : ''} {infants > 0 ? `${infants}I` : ''})
            </span>
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-sm">
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Select Travelers</h2>

          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Adults</div>
              <div className="text-sm text-slate-600">(12 years & above)</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalAdults(Math.max(1, localAdults - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center font-semibold">{localAdults}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalAdults(Math.min(9, localAdults + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Children</div>
              <div className="text-sm text-slate-600">(2-11 years)</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalChildren(Math.max(0, localChildren - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center font-semibold">{localChildren}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalChildren(Math.min(9, localChildren + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Infants</div>
              <div className="text-sm text-slate-600">(Below 2 years)</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalInfants(Math.max(0, localInfants - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center font-semibold">{localInfants}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalInfants(Math.min(9, localInfants + 1))}
              >
                +
              </Button>
            </div>
          </div>

          <Button onClick={handleApply} className="w-full bg-sapphire-600 hover:bg-sapphire-700">
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdvancedFlightSearchBox() {
  const router = useRouter()
  const store = useFlightBookingStore()

  const [tripTypeLocal, setTripTypeLocal] = useState<'O' | 'R' | 'M'>(store.tripType)
  const [fromLocal, setFromLocal] = useState(store.from)
  const [toLocal, setToLocal] = useState(store.to)
  const [departLocal, setDepartLocal] = useState(store.departDate)
  const [returnLocal, setReturnLocal] = useState(store.returnDate)

  const handleSwapAirports = () => {
    const temp = fromLocal
    setFromLocal(toLocal)
    setToLocal(temp)
  }

  const handleSearch = async () => {
    if (!fromLocal || !toLocal || !departLocal) {
      toast.error('Please fill all required fields')
      return
    }

    // Update store
    store.setOrigin(fromLocal)
    store.setDestination(toLocal)
    store.setDepartDate(departLocal)
    if (tripTypeLocal === 'R') {
      store.setReturnDate(returnLocal)
    }
    store.setTripType(tripTypeLocal)

    // Perform search
    await store.performSearch()

    // Navigate to results
    router.push('/flights/results')
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 -mt-16 relative z-10">
      {/* Trip Type Tabs */}
      <div className="flex gap-4 mb-6">
        {[
          { value: 'O' as const, label: 'One Way' },
          { value: 'R' as const, label: 'Round Trip' },
          { value: 'M' as const, label: 'Multi-City' },
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setTripTypeLocal(type.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              tripTypeLocal === type.value
                ? 'bg-sapphire-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* From */}
        <div className="relative">
          <AirportSelector
            value={fromLocal?.code || ''}
            onChange={setFromLocal}
            label="From"
            placeholder="Departure city"
          />
        </div>

        {/* Swap Button */}
        <div className="flex items-end justify-center pb-0 md:pb-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:bottom-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapAirports}
            className="rounded-full border-2 border-sapphire-200 hover:bg-sapphire-100 h-12 w-12"
          >
            <ArrowRightLeft className="w-5 h-5 text-sapphire-600" />
          </Button>
        </div>

        {/* To */}
        <div className="relative">
          <AirportSelector
            value={toLocal?.code || ''}
            onChange={setToLocal}
            label="To"
            placeholder="Arrival city"
          />
        </div>

        {/* Depart Date */}
        <DatePicker
          value={departLocal}
          onChange={setDepartLocal}
          label="Depart"
          minDate={new Date()}
        />

        {/* Return Date (if round trip) */}
        {tripTypeLocal === 'R' && (
          <DatePicker
            value={returnLocal}
            onChange={setReturnLocal}
            label="Return"
            minDate={departLocal || new Date()}
          />
        )}

        {/* Travelers */}
        <TravelersPopover
          adults={store.adults}
          childCount={store.children}
          infants={store.infants}
          onChange={(a, c, i) => {
            store.setPassengers(a, c, i)
          }}
        />

        {/* Cabin Class */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Cabin</label>
          <select
            value={store.class}
            onChange={(e) => store.setCabinClass(e.target.value)}
            className="w-full h-12 px-4 border-2 border-sapphire-200 rounded-lg font-semibold text-slate-900 hover:border-sapphire-400 focus:border-sapphire-600 focus:outline-none"
          >
            <option value="E">Economy</option>
            <option value="W">Premium Economy</option>
            <option value="B">Business</option>
            <option value="F">First Class</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={store.isSearching}
        className="w-full h-12 bg-sapphire-600 hover:bg-sapphire-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
      >
        {store.isSearching ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Flights
          </>
        )}
      </Button>

      {/* Error Display */}
      {store.searchError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Search Error</p>
            <p className="text-sm text-red-800">{store.searchError}</p>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex gap-2 text-slate-600">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Book 2-3 months in advance for best prices</span>
        </div>
        <div className="flex gap-2 text-slate-600">
          <BarChart3 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Prices usually lowest on Tuesday-Thursday</span>
        </div>
        <div className="flex gap-2 text-slate-600">
          <Plane className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Morning flights are often cheaper than evening</span>
        </div>
      </div>
    </div>
  )
}

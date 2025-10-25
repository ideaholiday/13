/**
 * Formatting utilities for flight booking display
 */

export function formatTime(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatDate(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(isoString: string | Date): string {
  return `${formatDate(isoString)} ${formatTime(isoString)}`
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPriceWithTax(base: number, tax: number): {
  base: string
  tax: string
  total: string
} {
  return {
    base: formatCurrency(base),
    tax: formatCurrency(tax),
    total: formatCurrency(base + tax),
  }
}

export function calculateLayoverTime(
  arrivalTime: string | Date,
  departureTime: string | Date
): number {
  const arrival = typeof arrivalTime === 'string' ? new Date(arrivalTime) : arrivalTime
  const departure = typeof departureTime === 'string' ? new Date(departureTime) : departureTime
  return Math.round((departure.getTime() - arrival.getTime()) / 60000) // minutes
}

export function formatLayover(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getDateRangeLabel(startDate: string, endDate?: string): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  const startLabel = start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  if (!end) return startLabel

  // Same month
  if (start.getMonth() === end.getMonth()) {
    const endLabel = end.getDate()
    return `${startLabel} - ${endLabel}`
  }

  // Different months
  const endLabel = end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  return `${startLabel} - ${endLabel}`
}

export function getTitleOptions() {
  return [
    { value: 'MR', label: 'Mr.' },
    { value: 'MRS', label: 'Mrs.' },
    { value: 'MS', label: 'Ms.' },
    { value: 'MSTR', label: 'Master' },
    { value: 'DR', label: 'Dr.' },
    { value: 'PROF', label: 'Prof.' },
  ]
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.replace(/[^\d]/g, ''))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return phone
}

export function formatPassengerName(firstName: string, lastName: string): string {
  return `${firstName.toUpperCase()} ${lastName.toUpperCase()}`
}

export function calculateAge(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

export function isMinorDate(dateOfBirth: string | Date): boolean {
  return calculateAge(dateOfBirth) < 18
}

export function isInfantDate(dateOfBirth: string | Date): boolean {
  return calculateAge(dateOfBirth) < 2
}

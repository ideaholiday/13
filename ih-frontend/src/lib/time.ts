export const formatTime = (iso: string) => {
  if (!iso) return '--:--'
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--:--'
  }
}

export const formatDuration = (m: number) => {
  if (!m || m < 0) return '0h 0m'
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

export const formatINR = (n: number, ccy = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: ccy }).format(n)

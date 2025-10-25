export function formatMoney(amount: number, currency = 'INR') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

export function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

/**
 * Formatting helpers.
 *
 * Every monetary figure in TaskMall is SIMULATED. The formatters below are
 * deliberately neutral about that fact — pairing a figure with a
 * <SimulatedTag /> is the caller's job.
 */

export const CURRENCY = 'LKR'

const nf2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 2388 -> "2,388.00" */
export function amount(n: number): string {
  return nf2.format(n)
}

/** 2388 -> "LKR 2,388.00" */
export function lkr(n: number): string {
  return `${CURRENCY} ${nf2.format(n)}`
}

/** 2388 -> "LKR 2,388" (compact, for grids/tables) */
export function lkrShort(n: number): string {
  return `${CURRENCY} ${nf0.format(Math.round(n))}`
}

/** 12482 -> "12,482" */
export function count(n: number): string {
  return nf0.format(n)
}

/** 82412 -> "82.4K" */
export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/** -5000 -> "- LKR 5,000.00" / 71.64 -> "+ LKR 71.64" */
export function signedLkr(n: number): string {
  const sign = n < 0 ? '-' : '+'
  return `${sign} ${CURRENCY} ${nf2.format(Math.abs(n))}`
}

/** 0.03 -> "3.00%" */
export function pct(rate: number, digits = 2): string {
  return `${(rate * 100).toFixed(digits)}%`
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const d2 = (n: number) => String(n).padStart(2, '0')

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

/** "10:25:34" */
export function timeOfDay(value: string | Date, withSeconds = true): string {
  const d = toDate(value)
  return withSeconds
    ? `${d2(d.getHours())}:${d2(d.getMinutes())}:${d2(d.getSeconds())}`
    : `${d2(d.getHours())}:${d2(d.getMinutes())}`
}

/** "10:25 AM" */
export function clock12(value: string | Date): string {
  const d = toDate(value)
  const h = d.getHours()
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${d2(d.getMinutes())} ${suffix}`
}

/** "01 Oct 2026" */
export function dateShort(value: string | Date): string {
  const d = toDate(value)
  return `${d2(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

/** "04 October 2026" */
export function dateLong(value: string | Date): string {
  const d = toDate(value)
  return `${d2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "01 Oct · 10:25 AM" */
export function dateTimeCompact(value: string | Date): string {
  const d = toDate(value)
  return `${d2(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)} · ${clock12(d)}`
}

/** "01 Oct 2026, 10:25:34" */
export function dateTimeFull(value: string | Date): string {
  return `${dateShort(value)}, ${timeOfDay(value)}`
}

/** "20261001" */
export function compactDate(value: string | Date): string {
  const d = toDate(value)
  return `${d.getFullYear()}${d2(d.getMonth() + 1)}${d2(d.getDate())}`
}

/** "2 minutes ago" / "in 3 hours" */
export function relative(value: string | Date, from: Date = new Date()): string {
  const diff = toDate(value).getTime() - from.getTime()
  const abs = Math.abs(diff)
  const past = diff < 0
  const units: [number, string][] = [
    [60_000, 'minute'],
    [3_600_000, 'hour'],
    [86_400_000, 'day'],
  ]
  if (abs < 60_000) return past ? 'Just now' : 'In a moment'
  let value_ = 0
  let unit = 'minute'
  for (const [ms, name] of units) {
    if (abs >= ms) {
      value_ = Math.floor(abs / ms)
      unit = name
    }
  }
  const plural = value_ === 1 ? unit : `${unit}s`
  return past ? `${value_} ${plural} ago` : `in ${value_} ${plural}`
}

/** "23h 14m" — time remaining before a task's effective window closes. */
export function countdown(target: string | Date, from: Date = new Date()): string {
  const diff = toDate(target).getTime() - from.getTime()
  if (diff <= 0) return 'Expired'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h >= 24) {
    const d = Math.floor(h / 24)
    return `${d}d ${h % 24}h`
  }
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Greeting based on hour of day. */
export function greeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  if (h < 21) return 'Good Evening'
  return 'Good Night'
}

/** "#...449390" — short form of a long order number for dense UI. */
export function shortOrder(orderNumber: string): string {
  return `#${orderNumber.slice(-9)}`
}

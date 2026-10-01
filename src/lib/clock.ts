import { useEffect, useState } from 'react'

/**
 * Demo clock.
 *
 * Seeded data is pinned to a fixed instant so the app looks identical on every
 * reload, but it still *ticks* — the virtual clock advances in real time from
 * the epoch below. Countdowns and "x minutes ago" labels therefore stay live
 * while remaining reproducible.
 */
export const DEMO_EPOCH = new Date(2026, 9, 1, 13, 5, 0) // 01 Oct 2026, 13:05 local

const bootedAt = Date.now()

export function demoNow(): Date {
  return new Date(DEMO_EPOCH.getTime() + (Date.now() - bootedAt))
}


export function isSameDay(a: Date | string, b: Date | string): boolean {
  const x = a instanceof Date ? a : new Date(a)
  const y = b instanceof Date ? b : new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
}

export function isToday(value: Date | string): boolean {
  return isSameDay(value, demoNow())
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000)
}

/** Re-renders on an interval so live countdowns stay current. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => demoNow())
  useEffect(() => {
    const id = setInterval(() => setNow(demoNow()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

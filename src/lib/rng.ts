/**
 * Deterministic pseudo-random helpers.
 *
 * Demo data must look varied but stay identical across reloads, so every
 * generator is driven by a seeded mulberry32 stream rather than Math.random.
 */

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function next(): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Rng {
  next(): number
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  bool(probability?: number): boolean
  float(min: number, max: number, decimals?: number): number
  digits(length: number): string
  shuffle<T>(items: readonly T[]): T[]
}

export function createRng(seed: number): Rng {
  const next = mulberry32(seed)
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min
  return {
    next,
    int,
    pick: <T,>(items: readonly T[]) => items[int(0, items.length - 1)],
    bool: (probability = 0.5) => next() < probability,
    float: (min: number, max: number, decimals = 2) => Number((next() * (max - min) + min).toFixed(decimals)),
    digits: (length: number) =>
      Array.from({ length }, () => int(0, 9))
        .join('')
        .padStart(length, '0'),
    shuffle: <T,>(items: readonly T[]) => {
      const out = [...items]
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i)
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
}

/** Stable 32-bit hash of a string — lets any id act as its own seed. */
export function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

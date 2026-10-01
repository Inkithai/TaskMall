/**
 * Membership levels.
 *
 * Levels are *earned* by completing orders and are *never* purchased. They
 * change badges, ordering and support queue position — nothing else. A level
 * must never alter a reward rate, an earning ceiling, a withdrawal limit or
 * any other monetary term; selling account upgrades that unlock earnings is
 * the central mechanic of task-scam fraud, so it is deliberately absent here.
 */

export type MembershipTierKey = 'free' | 'silver' | 'gold' | 'platinum'

export interface MembershipTier {
  key: MembershipTierKey
  name: string
  /** Lifetime completed orders required to reach this level. */
  threshold: number
  blurb: string
  /** Gradient stops, used inline so nothing depends on dynamic class names. */
  gradient: [string, string]
  /** Readable ink colour for text sitting on the gradient. */
  ink: string
  /** Soft background + text pair for the compact badge. */
  chip: { bg: string; fg: string }
  perks: string[]
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    key: 'free',
    name: 'Free',
    threshold: 0,
    blurb: 'Every account starts here. No cost, now or ever.',
    gradient: ['#64748B', '#94A3B8'],
    ink: '#FFFFFF',
    chip: { bg: '#F1F5F9', fg: '#475569' },
    perks: [
      'Full access to the task catalogue',
      'Daily activity streak and achievements',
      'Standard support queue',
      'Order and package tracking',
    ],
  },
  {
    key: 'silver',
    name: 'Silver',
    threshold: 10,
    blurb: 'Awarded after 10 completed orders.',
    gradient: ['#7C8DA4', '#C3CEDC'],
    ink: '#FFFFFF',
    chip: { bg: '#EEF2F7', fg: '#54657C' },
    perks: [
      'Silver badge on your profile and team list',
      'Transaction history export',
      'Saved delivery addresses',
    ],
  },
  {
    key: 'gold',
    name: 'Gold',
    threshold: 25,
    blurb: 'Awarded after 25 completed orders.',
    gradient: ['#C98B14', '#F0C254'],
    ink: '#FFFFFF',
    chip: { bg: '#FDF3DC', fg: '#8A5D06' },
    perks: [
      'Gold badge and profile ring',
      'Early visibility of new catalogue listings',
      'Priority support queue',
      'Monthly activity summary',
    ],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    threshold: 60,
    blurb: 'Awarded after 60 completed orders.',
    gradient: ['#3730A3', '#6D83F2'],
    ink: '#FFFFFF',
    chip: { bg: '#EAEDFD', fg: '#3B36A6' },
    perks: [
      'Platinum badge and profile frame',
      'Everything in Gold',
      'Named support contact',
      'Annual activity recap',
    ],
  },
]

/**
 * Things a level never does. Rendered verbatim in the UI so the boundary is
 * visible to the user, not just to whoever reads this file.
 */
export const MEMBERSHIP_NEVER = [
  'Cost money — levels cannot be bought, upgraded or gifted',
  'Change your reward rate on any task',
  'Raise or lower a withdrawal limit',
  'Unlock earnings that are otherwise locked',
  'Expire, or drop because you were inactive',
]

export function tierFor(completedOrders: number): MembershipTier {
  let current = MEMBERSHIP_TIERS[0]
  for (const tier of MEMBERSHIP_TIERS) {
    if (completedOrders >= tier.threshold) current = tier
  }
  return current
}

export function nextTierFor(completedOrders: number): MembershipTier | null {
  return MEMBERSHIP_TIERS.find((t) => completedOrders < t.threshold) ?? null
}

export interface TierProgress {
  current: MembershipTier
  next: MembershipTier | null
  /** Orders completed since entering the current level. */
  into: number
  /** Orders between the current level and the next. */
  span: number
  /** Orders still needed to reach the next level. */
  remaining: number
  /** 0–1 progress toward the next level (1 when already at the top). */
  ratio: number
  /** 1-based position of the current level. */
  position: number
}

export function tierProgress(completedOrders: number): TierProgress {
  const current = tierFor(completedOrders)
  const next = nextTierFor(completedOrders)
  const position = MEMBERSHIP_TIERS.findIndex((t) => t.key === current.key) + 1

  if (!next) {
    return { current, next: null, into: 0, span: 0, remaining: 0, ratio: 1, position }
  }

  const span = next.threshold - current.threshold
  const into = Math.max(0, completedOrders - current.threshold)
  return {
    current,
    next,
    into,
    span,
    remaining: Math.max(0, next.threshold - completedOrders),
    ratio: span <= 0 ? 1 : Math.min(1, into / span),
    position,
  }
}

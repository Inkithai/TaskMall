import type { MembershipTier } from '../../data/membership'
import { cx } from '../ui/primitives'

/** Compact level chip, reused on Profile, Team and the admin user table. */
export function TierBadge({
  tier,
  className,
  size = 'md',
}: {
  tier: MembershipTier
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap',
        size === 'sm' ? 'px-1.5 py-px text-[9.5px]' : 'px-2 py-0.5 text-[10.5px]',
        className,
      )}
      style={{ backgroundColor: tier.chip.bg, color: tier.chip.fg }}
    >
      <span
        aria-hidden
        className={cx('rounded-full', size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
        style={{ backgroundImage: `linear-gradient(135deg, ${tier.gradient[0]}, ${tier.gradient[1]})` }}
      />
      {tier.name}
    </span>
  )
}

import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import type { OrderStatus, PackageStatus } from '../../data/types'
import { PACKAGE_STATUS_META } from '../../data/packages'
import { cx } from './primitives'

export type Tone = 'ok' | 'pending' | 'danger' | 'info' | 'muted' | 'brand'

const TONES: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok',
  pending: 'bg-pending-soft text-pending',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-brand-700',
  muted: 'bg-[#eef1f6] text-muted',
  brand: 'bg-brand-600 text-white',
}

export function Badge({
  children,
  tone = 'muted',
  className,
  dot,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] leading-none font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'pending' },
  completed: { label: 'Completed', tone: 'ok' },
  timeout: { label: 'Time Out', tone: 'danger' },
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status]
  return (
    <Badge tone={meta.tone} className={className} dot>
      {meta.label}
    </Badge>
  )
}

const PKG_TONE: Record<string, Tone> = {
  ok: 'ok',
  info: 'info',
  pending: 'pending',
  danger: 'danger',
  muted: 'muted',
}

export function PackageStatusBadge({ status, className }: { status: PackageStatus; className?: string }) {
  const meta = PACKAGE_STATUS_META[status]
  return (
    <Badge tone={PKG_TONE[meta.tone]} className={className} dot>
      {meta.label}
    </Badge>
  )
}

/**
 * Marks a monetary figure as simulated. Required beside every balance,
 * reward, order amount and transaction in this build.
 */
export function SimulatedTag({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      title="Simulated value — no real money is involved"
      className={cx(
        'inline-flex items-center gap-1 rounded-[5px] border border-brand-200 bg-brand-50 font-bold tracking-[0.08em] text-brand-700 uppercase',
        compact ? 'px-1 py-px text-[8px]' : 'px-1.5 py-[2px] text-[9px]',
        className,
      )}
    >
      {!compact && <ShieldAlert size={9} strokeWidth={2.6} />}
      Simulated
    </span>
  )
}

/** Full-width demo disclosure strip. */
export function DemoNotice({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cx(
        'flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-[11px] leading-relaxed font-medium text-brand-800',
        className,
      )}
    >
      <ShieldAlert size={14} className="mt-px shrink-0" />
      <span>{children ?? 'DEMO / SIMULATION — NO REAL MONEY. Figures shown here are generated for demonstration.'}</span>
    </div>
  )
}

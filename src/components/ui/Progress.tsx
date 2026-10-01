import { cx } from './primitives'

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = 'brand',
  height = 10,
}: {
  value: number
  max?: number
  className?: string
  tone?: 'brand' | 'ok' | 'pending'
  height?: number
}) {
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max))
  const fill = {
    brand: 'tm-gradient',
    ok: 'bg-ok',
    pending: 'bg-pending',
  }[tone]
  return (
    <div
      className={cx('w-full overflow-hidden rounded-full bg-[#e8edf5]', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cx('h-full rounded-full transition-[width] duration-500 ease-out', fill)}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}

/** Segmented progress — one notch per task, as on the Home progress card. */
export function SegmentedProgress({ value, max, className }: { value: number; max: number; className?: string }) {
  return (
    <div className={cx('flex gap-1', className)}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cx('h-2.5 flex-1 rounded-full transition-colors', i < value ? 'tm-gradient' : 'bg-[#e8edf5]')}
        />
      ))}
    </div>
  )
}

export function RingProgress({
  value,
  max,
  size = 56,
  stroke = 6,
  children,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max))
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8edf5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  )
}

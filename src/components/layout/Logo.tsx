import { cx } from '../ui/primitives'

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="tmLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#tmLogoGrad)" />
        <path
          d="M19 24h26l-2.6 19.2A4 4 0 0 1 38.4 47H25.6a4 4 0 0 1-4-3.8L19 24Z"
          fill="#fff"
          fillOpacity=".95"
        />
        <path d="M26 26v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <path
          d="M27.5 35.2l3.6 3.6 6.4-7"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function Wordmark({
  size = 'md',
  tone = 'navy',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  tone?: 'navy' | 'white'
  className?: string
}) {
  const text = { sm: 'text-[15px]', md: 'text-[18px]', lg: 'text-[24px]' }[size]
  const mark = { sm: 22, md: 26, lg: 36 }[size]
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <LogoMark size={mark} />
      <span
        className={cx('font-extrabold tracking-[-0.02em]', text, tone === 'white' ? 'text-white' : 'text-navy')}
      >
        Task<span className={tone === 'white' ? 'text-brand-200' : 'text-brand-600'}>Mall</span>
      </span>
    </span>
  )
}

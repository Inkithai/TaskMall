import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cx } from '../ui/primitives'

/** Standard inner-screen header: ‹ back · title · optional right slot. */
export function ScreenHeader({
  title,
  right,
  onBack,
  subtitle,
  variant = 'light',
  sticky = true,
}: {
  title: ReactNode
  right?: ReactNode
  onBack?: () => void
  subtitle?: ReactNode
  variant?: 'light' | 'brand'
  sticky?: boolean
}) {
  const navigate = useNavigate()
  const brand = variant === 'brand'

  return (
    <header
      className={cx(
        'z-30 shrink-0',
        sticky && 'sticky top-0',
        brand ? 'tm-gradient text-white' : 'border-b border-hairline bg-white/95 backdrop-blur',
      )}
    >
      <div className="flex h-[52px] items-center gap-1 px-2">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          aria-label="Go back"
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
            brand ? 'text-white hover:bg-white/15' : 'text-navy hover:bg-canvas',
          )}
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <h1 className={cx('truncate text-[15px] font-bold', brand ? 'text-white' : 'text-navy')}>{title}</h1>
          {subtitle && (
            <p className={cx('truncate text-[11px]', brand ? 'text-brand-100' : 'text-muted')}>{subtitle}</p>
          )}
        </div>

        <div className="flex min-w-9 shrink-0 items-center justify-end gap-1 pr-1">{right}</div>
      </div>
    </header>
  )
}

export function HeaderAction({
  children,
  onClick,
  label,
  to,
}: {
  children: ReactNode
  onClick?: () => void
  label: string
  to?: string
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => (to ? navigate(to) : onClick?.())}
      className="flex h-9 items-center justify-center gap-1 rounded-full px-2 text-[12.5px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
    >
      {children}
    </button>
  )
}

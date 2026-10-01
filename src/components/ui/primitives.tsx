import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

type ClassValue = string | false | null | undefined | 0

export function cx(...parts: ClassValue[]): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ')
}

/* ---------------------------------- Card --------------------------------- */

export function Card({
  children,
  className,
  as: As = 'div',
  padded = true,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
  padded?: boolean
}) {
  return <As className={cx('tm-card', padded && 'p-4', className)}>{children}</As>
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('mb-2.5 flex items-end justify-between gap-3', className)}>
      <h2 className="text-[15px] font-semibold text-navy">{children}</h2>
      {action}
    </div>
  )
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('text-xs font-medium text-muted', className)}>{children}</span>
}

/** Key/value row used across detail screens. */
export function DataRow({
  label,
  value,
  mono = false,
  accent,
  className,
}: {
  label: ReactNode
  value: ReactNode
  mono?: boolean
  accent?: 'amount' | 'reward' | 'ok' | 'muted'
  className?: string
}) {
  const accentClass =
    accent === 'amount'
      ? 'text-amount'
      : accent === 'reward'
        ? 'text-reward'
        : accent === 'ok'
          ? 'text-ok'
          : accent === 'muted'
            ? 'text-muted'
            : 'text-navy'
  return (
    <div className={cx('flex items-start justify-between gap-4 py-2', className)}>
      <span className="shrink-0 pt-px text-[13px] text-muted">{label}</span>
      <span className={cx('text-right text-[13px] font-semibold tnum', mono && 'break-all', accentClass)}>{value}</span>
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cx('h-px w-full bg-hairline', className)} />
}

/* --------------------------------- Button -------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'tm-gradient text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)] hover:brightness-110 active:brightness-95',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  outline: 'border border-hairline bg-white text-navy hover:bg-canvas active:bg-brand-50',
  ghost: 'text-brand-700 hover:bg-brand-50',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  success: 'bg-ok text-white hover:brightness-110 active:brightness-95',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-[10px] gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-[52px] px-5 text-[15px] rounded-[14px] gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  block,
  icon,
  className,
  children,
}: {
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  icon?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={cx(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  )
}

/* ---------------------------------- Form --------------------------------- */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
}

export function Field({ label, hint, error, leading, trailing, className, id, ...rest }: FieldProps) {
  const inputId = id ?? rest.name
  return (
    <div className={className}>
      {label && (
        <label className="tm-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint">{leading}</span>
        )}
        <input
          id={inputId}
          {...rest}
          className={cx('tm-field', leading && 'pl-10', trailing && 'pr-11', error && '!border-danger')}
        />
        {trailing && <span className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</span>}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
}

export function SelectField({ label, hint, className, id, children, ...rest }: SelectFieldProps) {
  const selectId = id ?? rest.name
  return (
    <div className={className}>
      {label && (
        <label className="tm-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="relative">
        <select id={selectId} {...rest} className="tm-field cursor-pointer appearance-none pr-9">
          {children}
        </select>
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  id?: string
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink select-none">
      <span
        className={cx(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border transition-colors',
          checked ? 'border-brand-600 bg-brand-600' : 'border-[#cbd5e1] bg-white',
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M2.5 6.2 4.8 8.5 9.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}

export function Radio({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: () => void
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cx(
        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
        checked ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' : 'border-hairline bg-white',
      )}
    >
      <span
        className={cx(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked ? 'border-brand-600' : 'border-[#cbd5e1]',
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-brand-600" />}
      </span>
      {icon && <span className="text-muted">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-navy">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </button>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-brand-600' : 'bg-[#cbd5e1]',
      )}
    >
      <span
        className={cx(
          'absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}

/* -------------------------------- Feedback -------------------------------- */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        {icon}
      </div>
      <p className="text-[15px] font-semibold text-navy">{title}</p>
      {body && <p className="mt-1 max-w-[280px] text-[13px] leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Stat({
  label,
  value,
  tone = 'navy',
  sub,
}: {
  label: string
  value: ReactNode
  tone?: 'navy' | 'ok' | 'pending' | 'danger' | 'reward'
  sub?: ReactNode
}) {
  const toneClass = {
    navy: 'text-navy',
    ok: 'text-ok',
    pending: 'text-pending',
    danger: 'text-danger',
    reward: 'text-reward',
  }[tone]
  return (
    <div className="text-center">
      <p className={cx('text-xl font-bold tnum', toneClass)}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted">{label}</p>
      {sub}
    </div>
  )
}

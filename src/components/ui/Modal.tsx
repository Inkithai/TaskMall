import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from './primitives'

/** Bottom sheet for mobile, centred dialog on wide screens. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-[430px]',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          'tm-slide-up relative z-10 w-full rounded-t-[22px] bg-white shadow-[0_-8px_40px_rgba(15,31,61,0.2)] sm:rounded-[20px]',
          maxWidth,
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-[15px] font-bold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-hairline px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  )
}

/** Celebratory confirmation used after simulated wallet actions. */
export function ResultDialog({
  open,
  onClose,
  icon,
  title,
  children,
  action,
}: {
  open: boolean
  onClose: () => void
  icon: ReactNode
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="tm-pop relative z-10 w-full max-w-[340px] rounded-[22px] bg-white p-6 text-center shadow-[0_18px_50px_rgba(15,31,61,0.3)]">
        <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok">
          {icon}
        </div>
        <h3 className="text-[17px] font-bold text-navy">{title}</h3>
        <div className="mt-2 text-[13px] leading-relaxed text-muted">{children}</div>
        <div className="mt-5">{action}</div>
      </div>
    </div>
  )
}

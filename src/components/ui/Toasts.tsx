import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { cx } from './primitives'

const ICON = {
  ok: <CheckCircle2 size={17} className="text-ok" />,
  info: <Info size={17} className="text-brand-600" />,
  danger: <XCircle size={17} className="text-danger" />,
}

export function Toasts() {
  const { toasts, dismissToast } = useApp()
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            'tm-pop pointer-events-auto flex w-full max-w-[400px] items-start gap-2.5 rounded-xl bg-white px-3.5 py-3',
            'shadow-[0_8px_30px_rgba(15,31,61,0.18)] ring-1 ring-black/5',
          )}
        >
          <span className="mt-px shrink-0">{ICON[t.tone ?? 'ok']}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-snug font-semibold text-navy">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[12px] leading-snug text-muted">{t.body}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="shrink-0 text-faint transition-colors hover:text-muted"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

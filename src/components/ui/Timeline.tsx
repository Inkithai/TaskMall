import { Check, AlertTriangle } from 'lucide-react'
import type { TimelineState } from '../../data/types'
import { cx } from './primitives'

export interface TimelineRow {
  key: string
  label: string
  at: string | null
  state: TimelineState
  note?: string
  meta?: string
}

const DOT: Record<TimelineState, string> = {
  done: 'bg-ok text-white border-ok',
  current: 'bg-brand-600 text-white border-brand-600',
  upcoming: 'bg-white text-faint border-[#d6dde8]',
  exception: 'bg-danger text-white border-danger',
}

const LINE: Record<TimelineState, string> = {
  done: 'bg-ok/45',
  current: 'bg-[#dbe3ee]',
  upcoming: 'bg-[#dbe3ee]',
  exception: 'bg-danger/40',
}

const TEXT: Record<TimelineState, string> = {
  done: 'text-navy',
  current: 'text-brand-700',
  upcoming: 'text-faint',
  exception: 'text-danger',
}

/**
 * Vertical tracking timeline.
 * Green = completed · Blue = current · Grey = upcoming · Red = exception.
 */
export function Timeline({ rows, dense = false }: { rows: TimelineRow[]; dense?: boolean }) {
  return (
    <ol className="relative">
      {rows.map((row, i) => {
        const last = i === rows.length - 1
        return (
          <li key={row.key} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cx(
                  'relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  DOT[row.state],
                  row.state === 'current' && 'tm-pulse-ring',
                )}
              >
                {row.state === 'done' ? (
                  <Check size={12} strokeWidth={3.4} />
                ) : row.state === 'exception' ? (
                  <AlertTriangle size={11} strokeWidth={3} />
                ) : row.state === 'current' ? (
                  <span className="h-[7px] w-[7px] rounded-full bg-white" />
                ) : null}
              </span>
              {!last && <span className={cx('w-[2px] flex-1 rounded-full', LINE[row.state])} />}
            </div>

            <div className={cx('min-w-0 flex-1', last ? 'pb-0' : dense ? 'pb-4' : 'pb-5')}>
              <p className={cx('text-[13.5px] leading-tight font-semibold', TEXT[row.state])}>{row.label}</p>
              <p className="mt-1 text-[11.5px] tnum text-muted">{row.at ?? 'Pending'}</p>
              {row.note && <p className="mt-1 text-[11.5px] leading-snug text-muted">{row.note}</p>}
              {row.meta && <p className="mt-1 text-[11.5px] leading-snug text-faint">{row.meta}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Compact horizontal variant for the order lifecycle. */
export function StepTrack({ rows }: { rows: TimelineRow[] }) {
  return (
    <div className="flex items-start">
      {rows.map((row, i) => {
        const last = i === rows.length - 1
        return (
          <div key={row.key} className={cx('flex min-w-0 flex-1 flex-col items-center', last && 'flex-none')}>
            <div className="flex w-full items-center">
              <span
                className={cx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                  DOT[row.state],
                )}
              >
                {row.state === 'done' ? (
                  <Check size={12} strokeWidth={3.4} />
                ) : row.state === 'exception' ? (
                  <AlertTriangle size={11} strokeWidth={3} />
                ) : row.state === 'current' ? (
                  <span className="h-[6px] w-[6px] rounded-full bg-white" />
                ) : null}
              </span>
              {!last && <span className={cx('h-[2px] flex-1 rounded-full', LINE[row.state])} />}
            </div>
            <p className={cx('mt-1.5 w-full pr-2 text-[10.5px] leading-tight font-semibold', TEXT[row.state])}>
              {row.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

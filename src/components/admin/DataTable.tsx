import type { ReactNode } from 'react'
import { cx } from '../ui/primitives'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
  hideBelow?: 'sm' | 'md' | 'lg'
}

const HIDE: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = 'Nothing to display.',
  onRowClick,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: string
  onRowClick?: (row: T) => void
}) {
  return (
    <div className="tm-card overflow-hidden !p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-canvas">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cx(
                    'px-3.5 py-2.5 text-[10.5px] font-bold tracking-[0.07em] text-muted uppercase whitespace-nowrap',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.hideBelow && HIDE[c.hideBelow],
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cx(
                  'border-b border-hairline last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-brand-50/40',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cx(
                      'px-3.5 py-3 text-[12.5px] text-ink align-middle',
                      c.align === 'right' && 'text-right',
                      c.align === 'center' && 'text-center',
                      c.hideBelow && HIDE[c.hideBelow],
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[13px] text-muted">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  tone = 'brand',
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'brand' | 'ok' | 'pending' | 'danger' | 'navy'
  icon?: ReactNode
}) {
  const tint = {
    brand: 'bg-brand-50 text-brand-600',
    ok: 'bg-ok-soft text-ok',
    pending: 'bg-pending-soft text-pending',
    danger: 'bg-danger-soft text-danger',
    navy: 'bg-[#eef1f6] text-navy',
  }[tone]

  return (
    <div className="tm-card flex items-start gap-3">
      {icon && <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]', tint)}>{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-muted">{label}</p>
        <p className="mt-0.5 text-[21px] leading-none font-extrabold tracking-[-0.01em] tnum text-navy">{value}</p>
        {sub && <p className="mt-1 text-[11px] text-faint">{sub}</p>}
      </div>
    </div>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('tm-card', className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[13.5px] font-bold text-navy">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

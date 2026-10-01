import { cx } from './primitives'

export interface TabItem<T extends string> {
  key: T
  label: string
  count?: number
}

/** Underlined segmented tabs — used by Orders and Transaction History. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (key: T) => void
  className?: string
}) {
  return (
    <div className={cx('no-scrollbar flex gap-1 overflow-x-auto border-b border-hairline bg-white px-1', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cx(
              'relative shrink-0 px-3 pt-3 pb-2.5 text-[13px] font-semibold transition-colors',
              active ? 'text-brand-700' : 'text-muted hover:text-ink',
            )}
          >
            <span className="flex items-center gap-1.5">
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cx(
                    'rounded-full px-1.5 py-px text-[10px] leading-none font-bold tnum',
                    active ? 'bg-brand-600 text-white' : 'bg-[#eef1f6] text-muted',
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
            <span
              className={cx(
                'absolute inset-x-2 -bottom-px h-[2.5px] rounded-full transition-all',
                active ? 'bg-brand-600' : 'bg-transparent',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

/** Pill chips — category filters. */
export function ChipRail<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { key: T; label: string }[]
  value: T
  onChange: (key: T) => void
  className?: string
}) {
  return (
    <div className={cx('no-scrollbar flex gap-2 overflow-x-auto', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cx(
              'shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all',
              active
                ? 'tm-gradient text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                : 'border border-hairline bg-white text-muted hover:text-ink',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

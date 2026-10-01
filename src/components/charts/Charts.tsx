import { useId, useMemo, useState } from 'react'
import type { SeriesPoint } from '../../data/types'
import { compact } from '../../lib/format'
import { cx } from '../ui/primitives'

/* --------------------------- Area / line chart --------------------------- */

export function AreaChart({
  data,
  height = 160,
  color = '#2563eb',
  valueFormat = compact,
}: {
  data: SeriesPoint[]
  height?: number
  color?: string
  valueFormat?: (n: number) => string
}) {
  const gradientId = useId()
  const [hover, setHover] = useState<number | null>(null)
  const W = 320
  const H = height
  const padX = 10
  const padY = 16

  const { max, min, points, areaPath, linePath } = useMemo(() => {
    const values = data.map((d) => d.value)
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const span = max - min || 1
    const stepX = (W - padX * 2) / Math.max(1, data.length - 1)
    const points = data.map((d, i) => ({
      x: padX + i * stepX,
      y: padY + (1 - (d.value - min) / span) * (H - padY * 2),
      ...d,
    }))
    const linePath = points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = points[i - 1]
        const cx1 = prev.x + (p.x - prev.x) / 2
        return `C ${cx1} ${prev.y}, ${cx1} ${p.y}, ${p.x} ${p.y}`
      })
      .join(' ')
    const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${H} L ${points[0]?.x ?? 0} ${H} Z`
    return { max, min, points, areaPath, linePath }
  }, [data, H])

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={0}
            x2={W}
            y1={padY + t * (H - padY * 2)}
            y2={padY + t * (H - padY * 2)}
            stroke="#eef1f6"
            strokeWidth="1"
          />
        ))}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 4.5 : 3}
              fill="#fff"
              stroke={color}
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={p.x - 14}
              y={0}
              width={28}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      <div className="mt-1.5 flex justify-between px-1 text-[10.5px] font-medium text-faint">
        {data.map((d, i) => (
          <span key={i} className={cx(hover === i && 'font-bold text-brand-700')}>
            {d.label}
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between px-1 text-[10.5px] text-muted">
        <span>
          low {valueFormat(min)} · high {valueFormat(max)}
        </span>
        {hover !== null && (
          <span className="font-bold text-navy">
            {data[hover].label}: {valueFormat(data[hover].value)}
          </span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- Bar chart ------------------------------- */

export function BarChart({
  data,
  height = 160,
  color = '#3b82f6',
  valueFormat = compact,
}: {
  data: SeriesPoint[]
  height?: number
  color?: string
  valueFormat?: (n: number) => string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-bold text-navy opacity-0 transition-opacity group-hover:opacity-100">
              {valueFormat(d.value)}
            </span>
            <div
              className="w-full rounded-t-[5px] transition-all duration-500 ease-out hover:brightness-110"
              style={{
                height: `${(d.value / max) * (height - 22)}px`,
                background: `linear-gradient(180deg, ${color} 0%, ${color}bb 100%)`,
              }}
              title={`${d.label}: ${valueFormat(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d, i) => (
          <span key={i} className="min-w-0 flex-1 truncate text-center text-[10.5px] font-medium text-faint">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ Donut chart ------------------------------ */

const DONUT_COLORS = ['#0f9d74', '#f08c1a', '#e03131', '#2563eb', '#8b5cf6']

export function DonutChart({
  data,
  size = 150,
  thickness = 22,
  centerLabel,
  valueFormat = compact,
}: {
  data: SeriesPoint[]
  size?: number
  thickness?: number
  centerLabel?: string
  valueFormat?: (n: number) => string
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((d, i) => {
            const frac = d.value / total
            const dash = frac * c
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              >
                <title>{`${d.label}: ${valueFormat(d.value)}`}</title>
              </circle>
            )
            offset += dash
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tnum text-navy">{valueFormat(total)}</span>
          <span className="text-[10px] font-medium text-muted">{centerLabel ?? 'Total'}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted">{d.label}</span>
            <span className="text-[12.5px] font-bold tnum text-navy">{valueFormat(d.value)}</span>
            <span className="w-10 text-right text-[11px] tnum text-faint">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------- Sparkline ------------------------------- */

export function Sparkline({
  data,
  color = '#2563eb',
  width = 90,
  height = 30,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const span = max - min || 1
  const step = width / Math.max(1, data.length - 1)
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - ((v - min) / span) * height}`).join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Horizontal share bar — "Completed vs Pending" at a glance. */
export function SplitBar({ data }: { data: SeriesPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {data.map((d, i) => (
          <div
            key={i}
            style={{ width: `${(d.value / total) * 100}%`, background: DONUT_COLORS[i % DONUT_COLORS.length] }}
            title={`${d.label}: ${compact(d.value)}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            {d.label} <strong className="tnum text-navy">{compact(d.value)}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

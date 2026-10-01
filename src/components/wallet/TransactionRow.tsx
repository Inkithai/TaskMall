import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, Gift, ShoppingCart } from 'lucide-react'
import type { Transaction, TransactionType } from '../../data/types'
import { Badge, type Tone } from '../ui/Badge'
import { cx } from '../ui/primitives'
import { dateShort, signedLkr, timeOfDay } from '../../lib/format'
import { demoNow, isSameDay } from '../../lib/clock'

const ICONS: Record<TransactionType, typeof Gift> = {
  reward: Gift,
  order: ShoppingCart,
  recharge: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
}

const ICON_TINT: Record<TransactionType, string> = {
  reward: 'bg-info-soft text-brand-700',
  order: 'bg-[#eef1f6] text-muted',
  recharge: 'bg-ok-soft text-ok',
  withdrawal: 'bg-pending-soft text-pending',
}

const STATUS_TONE: Record<Transaction['status'], Tone> = {
  completed: 'ok',
  processing: 'pending',
  failed: 'danger',
}

const STATUS_LABEL: Record<Transaction['status'], string> = {
  completed: 'Completed',
  processing: 'Processing',
  failed: 'Failed',
}

export function TransactionRow({ tx, showDate = false }: { tx: Transaction; showDate?: boolean }) {
  const Icon = ICONS[tx.type]
  const positive = tx.amount >= 0

  const body = (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', ICON_TINT[tx.type])}>
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-navy">{tx.title}</p>
        {tx.reference && <p className="truncate text-[10.5px] tnum text-muted">#{tx.reference}</p>}
        {tx.method && <p className="truncate text-[10.5px] text-faint">{tx.method}</p>}
        {tx.note && !tx.method && <p className="truncate text-[10.5px] text-faint">{tx.note}</p>}
      </div>

      <div className="shrink-0 text-right">
        <p className={cx('text-[13.5px] font-extrabold tnum', positive ? 'text-reward' : 'text-amount')}>
          {signedLkr(tx.amount)}
        </p>
        <div className="mt-1 flex items-center justify-end gap-1.5">
          <Badge tone={STATUS_TONE[tx.status]} className="!px-1.5 !py-px !text-[9.5px]">
            {STATUS_LABEL[tx.status]}
          </Badge>
        </div>
        <p className="mt-0.5 text-[10px] tnum text-faint">
          {showDate ? dateShort(tx.at) : timeOfDay(tx.at, false)}
        </p>
      </div>
    </div>
  )

  if (tx.reference && /^\d{18}$/.test(tx.reference)) {
    return (
      <li>
        <Link to={`/orders/${tx.reference}`} className="block transition-colors active:bg-canvas">
          {body}
        </Link>
      </li>
    )
  }

  return <li>{body}</li>
}

/** Groups transactions into Today / Yesterday / date buckets. */
export function groupByDay(transactions: Transaction[]): [string, Transaction[]][] {
  const now = demoNow()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const buckets = new Map<string, Transaction[]>()

  for (const tx of transactions) {
    const label = isSameDay(tx.at, now) ? 'Today' : isSameDay(tx.at, yesterday) ? 'Yesterday' : dateShort(tx.at)
    const list = buckets.get(label) ?? []
    list.push(tx)
    buckets.set(label, list)
  }

  return [...buckets.entries()]
}

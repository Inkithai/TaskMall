import { Link } from 'react-router-dom'
import { Clock, Package as PackageIcon, Truck } from 'lucide-react'
import type { Order, Product } from '../../data/types'
import { OrderStatusBadge, SimulatedTag } from '../ui/Badge'
import { Button, Card, cx } from '../ui/primitives'
import { ProductThumb } from '../product/ProductThumb'
import { PACKAGE_STATUS_META } from '../../data/packages'
import { countdown, lkr, pct, timeOfDay } from '../../lib/format'
import { demoNow } from '../../lib/clock'

export function OrderCard({
  order,
  product,
  onComplete,
}: {
  order: Order
  product?: Product
  onComplete?: (orderNumber: string) => void
}) {
  const pkgMeta = PACKAGE_STATUS_META[order.pkg.status]
  const expiringSoon =
    order.status === 'pending' && new Date(order.expiresAt).getTime() - demoNow().getTime() < 3 * 3_600_000

  return (
    <Card className="tm-rise !p-0 overflow-hidden">
      {/* Header strip */}
      <div className="flex items-start justify-between gap-3 border-b border-hairline px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-muted">Order number:</p>
          <p className="truncate text-[13px] font-bold tnum text-navy">{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status} className="mt-1 shrink-0" />
      </div>

      <div className="px-4 py-3">
        {/* Product */}
        <div className="flex gap-3">
          {product && (
            <ProductThumb
              product={product}
              className="h-[62px] w-[62px] shrink-0 ring-1 ring-hairline"
              rounded="rounded-xl"
              glyphSize="text-2xl"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] leading-tight font-bold text-navy">{product?.name}</p>
            <p className="truncate text-[12px] text-muted">{product?.subtitle}</p>
            <p className="mt-1 text-[10.5px] tnum text-faint">
              {product?.id} · Qty {order.quantity}
            </p>
          </div>
        </div>

        {/* Financials */}
        <div className="mt-3 rounded-xl bg-canvas p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11.5px] font-medium text-muted">Order amount</span>
            <span className="flex items-center gap-1.5">
              <SimulatedTag compact />
              <span className="text-[16px] font-extrabold tnum text-amount">{lkr(order.amount)}</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[11.5px] font-medium text-muted">Income ratio</span>
            <span className="text-[12.5px] font-bold tnum text-navy">{pct(order.rewardRate)}</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-[11.5px] font-medium text-muted">
              {order.status === 'completed' ? 'Simulated reward' : 'Expected reward'}
            </span>
            <span className="text-[14px] font-extrabold tnum text-reward">{lkr(order.reward)}</span>
          </div>
        </div>

        {/* Package summary */}
        <Link
          to={`/packages/${order.pkg.packageId}`}
          className="mt-3 flex items-center gap-2 rounded-xl border border-hairline px-3 py-2 transition-colors hover:bg-canvas"
        >
          <PackageIcon size={14} className="shrink-0 text-muted" />
          <span className="truncate text-[11.5px] font-semibold tnum text-ink">{order.pkg.packageId}</span>
          <span className="mx-0.5 h-3 w-px shrink-0 bg-hairline" />
          <Truck size={14} className="shrink-0 text-muted" />
          <span
            className={cx(
              'truncate text-[11.5px] font-semibold',
              pkgMeta.tone === 'ok' && 'text-ok',
              pkgMeta.tone === 'info' && 'text-brand-700',
              pkgMeta.tone === 'pending' && 'text-pending',
              pkgMeta.tone === 'danger' && 'text-danger',
              pkgMeta.tone === 'muted' && 'text-muted',
            )}
          >
            {pkgMeta.label}
          </span>
        </Link>

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted">
          <span className="tnum">Order time: {timeOfDay(order.orderTime)}</span>
          <span className="tnum">Effective time: {order.effectiveHours} hours</span>
        </div>

        {order.status === 'pending' && (
          <div
            className={cx(
              'mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold',
              expiringSoon ? 'bg-danger-soft text-danger' : 'bg-pending-soft text-pending',
            )}
          >
            <Clock size={12} />
            {expiringSoon ? 'Expiring soon · ' : 'Time remaining · '}
            <span className="tnum">{countdown(order.expiresAt, demoNow())}</span>
          </div>
        )}

        {/* Actions */}
        <div className={cx('mt-3 grid gap-2', order.status === 'pending' && onComplete ? 'grid-cols-2' : 'grid-cols-1')}>
          <Link
            to={`/orders/${order.orderNumber}`}
            className="flex h-10 items-center justify-center rounded-xl bg-brand-50 text-[13px] font-bold text-brand-700 transition-colors hover:bg-brand-100"
          >
            Order Details
          </Link>
          {order.status === 'pending' && onComplete && (
            <Button size="md" onClick={() => onComplete(order.orderNumber)} className="!h-10">
              Complete Task
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

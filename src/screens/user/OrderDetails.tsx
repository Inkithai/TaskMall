import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, FileText, Package as PackageIcon, Truck } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, DataRow, EmptyState, SectionTitle, cx } from '../../components/ui/primitives'
import { Badge, ORDER_STATUS_META, OrderStatusBadge, PackageStatusBadge, SimulatedTag } from '../../components/ui/Badge'
import { Timeline, type TimelineRow } from '../../components/ui/Timeline'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useApp, useOrder, useProduct } from '../../store/AppContext'
import { countdown, dateTimeCompact, dateTimeFull, lkr, pct, timeOfDay } from '../../lib/format'
import { demoNow } from '../../lib/clock'
import { PACKAGE_STATUS_META } from '../../data/packages'
import type { TimelineState } from '../../data/types'

export default function OrderDetails() {
  const { orderNumber } = useParams()
  const order = useOrder(orderNumber)
  const product = useProduct(order?.productId)
  const { dispatch, toast } = useApp()

  const orderTimeline = useMemo<TimelineRow[]>(() => {
    if (!order) return []
    const created = new Date(order.orderTime)
    const assigned = new Date(created.getTime() + 60_000)
    const processing = new Date(created.getTime() + 180_000)

    const stateFor = (step: 'created' | 'assigned' | 'processing' | 'completed'): TimelineState => {
      if (order.status === 'completed') return 'done'
      if (order.status === 'timeout') {
        if (step === 'completed') return 'upcoming'
        if (step === 'processing') return 'exception'
        return 'done'
      }
      if (step === 'completed') return 'upcoming'
      if (step === 'processing') return 'current'
      return 'done'
    }

    return [
      { key: 'created', label: 'Order Created', at: dateTimeCompact(created), state: stateFor('created') },
      { key: 'assigned', label: 'Task Assigned', at: dateTimeCompact(assigned), state: stateFor('assigned') },
      {
        key: 'processing',
        label: order.status === 'timeout' ? 'Processing Expired' : 'Order Processing',
        at: order.status === 'timeout' ? dateTimeCompact(order.expiresAt) : dateTimeCompact(processing),
        state: stateFor('processing'),
        note:
          order.status === 'timeout'
            ? 'Effective time elapsed — simulated capital refunded in full, no reward issued.'
            : undefined,
      },
      {
        key: 'completed',
        label: 'Completed',
        at: order.completedAt ? dateTimeCompact(order.completedAt) : null,
        state: stateFor('completed'),
      },
    ]
  }, [order])

  const packageTimeline = useMemo<TimelineRow[]>(
    () =>
      (order?.pkg.timeline ?? []).map((e) => ({
        key: e.key,
        label: e.label,
        at: e.at ? dateTimeCompact(e.at) : null,
        state: e.state,
        note: e.note,
      })),
    [order],
  )

  if (!order || !product) {
    return (
      <div className="pb-24">
        <ScreenHeader title="Order Details" />
        <EmptyState icon={<FileText size={28} />} title="Order not found" body="This order is no longer available." />
      </div>
    )
  }

  const statusMeta = ORDER_STATUS_META[order.status]

  return (
    <div className="pb-24">
      <ScreenHeader title="Order Details" />

      <div className="space-y-3 px-4 pt-3">
        {/* Status banner */}
        <div
          className={cx(
            'tm-rise rounded-[16px] px-4 py-3.5',
            order.status === 'completed' && 'bg-ok-soft',
            order.status === 'pending' && 'bg-pending-soft',
            order.status === 'timeout' && 'bg-danger-soft',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className={cx(
                'flex items-center gap-2 text-[15px] font-extrabold tracking-[0.04em] uppercase',
                order.status === 'completed' && 'text-ok',
                order.status === 'pending' && 'text-pending',
                order.status === 'timeout' && 'text-danger',
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {statusMeta.label}
            </p>
            {order.status === 'pending' && (
              <span className="text-[11.5px] font-bold tnum text-pending">
                {countdown(order.expiresAt, demoNow())} left
              </span>
            )}
          </div>
          <p className="mt-1 text-[11.5px] tnum text-ink/70">Order #{order.orderNumber}</p>
        </div>

        {/* Product */}
        <Card>
          <SectionTitle>Product</SectionTitle>
          <Link to={`/products/${product.id}`} className="flex gap-3">
            <ProductThumb
              product={product}
              className="h-[84px] w-[84px] shrink-0 ring-1 ring-hairline"
              rounded="rounded-[14px]"
              glyphSize="text-3xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-tight font-bold text-navy">{product.name}</p>
              <p className="mt-0.5 text-[12px] text-muted">{product.subtitle}</p>
              <div className="mt-2 space-y-0.5">
                <p className="text-[11px] text-muted">
                  Product ID: <span className="font-semibold tnum text-ink">{product.id}</span>
                </p>
                <p className="text-[11px] text-muted">
                  Quantity: <span className="font-semibold tnum text-ink">{order.quantity}</span>
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="mt-1 shrink-0 text-faint" />
          </Link>
        </Card>

        {/* Financials */}
        <Card>
          <SectionTitle action={<SimulatedTag />}>Financial Details</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Order Amount" value={lkr(order.amount)} accent="amount" />
            <DataRow label="Reward Rate" value={pct(order.rewardRate)} />
            <DataRow label="Simulated Reward" value={lkr(order.reward)} accent="reward" />
            <DataRow
              label="Net effect on balance"
              value={order.status === 'completed' ? `+ ${lkr(order.reward)}` : order.status === 'timeout' ? 'LKR 0.00' : `${lkr(order.amount)} held`}
              accent={order.status === 'completed' ? 'ok' : 'muted'}
            />
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
            The order amount is simulated task capital. It is held while the task runs and returned in full on
            completion or expiry — only the reward changes the balance.
          </p>
        </Card>

        {/* Package */}
        <Card>
          <SectionTitle action={<PackageStatusBadge status={order.pkg.status} />}>Package</SectionTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[12.5px]">
              <PackageIcon size={15} className="shrink-0 text-muted" />
              <span className="font-bold tnum text-navy">{order.pkg.packageId}</span>
            </div>
            <div className="flex items-center gap-2 text-[12.5px]">
              <Truck size={15} className="shrink-0 text-muted" />
              <span className="font-semibold text-ink">{order.pkg.courier}</span>
            </div>
          </div>

          <div className="mt-3 divide-y divide-hairline">
            <DataRow label="Tracking" value={order.pkg.trackingNumber} mono />
            <DataRow label="Status" value={PACKAGE_STATUS_META[order.pkg.status].label} />
            <DataRow label="Estimated delivery" value={dateTimeCompact(order.pkg.estimatedDelivery).split(' · ')[0]} />
          </div>

          <Link to={`/packages/${order.pkg.packageId}`} className="mt-3 block">
            <Button variant="secondary" block>
              View Package Details
            </Button>
          </Link>
        </Card>

        {/* Order timeline */}
        <Card>
          <SectionTitle>Order Timeline</SectionTitle>
          <Timeline rows={orderTimeline} dense />
        </Card>

        {/* Package timeline */}
        <Card>
          <SectionTitle
            action={
              <Link to={`/packages/${order.pkg.packageId}`} className="text-[12px] font-semibold text-brand-700">
                Full tracking
              </Link>
            }
          >
            Package Timeline
          </SectionTitle>
          <Timeline rows={packageTimeline} dense />
        </Card>

        {/* Metadata */}
        <Card>
          <SectionTitle>Order Information</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Order number" value={order.orderNumber} mono />
            <DataRow label="Order time" value={timeOfDay(order.orderTime)} />
            <DataRow label="Order date" value={dateTimeFull(order.orderTime).split(',')[0]} />
            <DataRow
              label="Processing time"
              value={order.processingTime ? dateTimeFull(order.processingTime) : 'In progress'}
            />
            <DataRow label="Effective time" value={`${order.effectiveHours} hours`} />
            <DataRow label="Expires" value={dateTimeFull(order.expiresAt)} />
            <DataRow
              label="Status"
              value={<OrderStatusBadge status={order.status} />}
            />
          </div>
        </Card>

        {order.status === 'pending' && (
          <Button
            size="lg"
            block
            onClick={() => {
              dispatch({ type: 'order/complete', orderNumber: order.orderNumber })
              toast({ title: 'Task completed', body: `Simulated reward of ${lkr(order.reward)} credited.`, tone: 'ok' })
            }}
          >
            Complete Task
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 pt-1">
          <Badge tone="muted">Demo data</Badge>
          <span className="text-[11px] text-faint">No goods are shipped and no money moves.</span>
        </div>
      </div>
    </div>
  )
}

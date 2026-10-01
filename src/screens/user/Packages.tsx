import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageSearch, Truck } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, EmptyState, cx } from '../../components/ui/primitives'
import { PackageStatusBadge } from '../../components/ui/Badge'
import { ChipRail } from '../../components/ui/Tabs'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useApp } from '../../store/AppContext'
import { ALL_PACKAGE_STATUSES, PACKAGE_STATUS_META } from '../../data/packages'
import { dateLong } from '../../lib/format'
import type { PackageStatus } from '../../data/types'

type Filter = 'all' | PackageStatus

export default function Packages() {
  const { state } = useApp()
  const [filter, setFilter] = useState<Filter>('all')

  const available = useMemo(() => {
    const present = new Set(state.orders.map((o) => o.pkg.status))
    return ALL_PACKAGE_STATUSES.filter((s) => present.has(s))
  }, [state.orders])

  const visible = useMemo(
    () =>
      state.orders
        .filter((o) => filter === 'all' || o.pkg.status === filter)
        .sort((a, b) => +new Date(b.orderTime) - +new Date(a.orderTime)),
    [state.orders, filter],
  )

  return (
    <div className="pb-24">
      <ScreenHeader title="My Packages" />

      <div className="sticky top-[52px] z-20 border-b border-hairline bg-white px-4 py-3">
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: `All (${state.orders.length})` },
            ...available.map((s) => ({ key: s as Filter, label: PACKAGE_STATUS_META[s].label })),
          ]}
        />
      </div>

      <div className="space-y-3 px-4 pt-3">
        {visible.map((order) => {
          const product = state.products.find((p) => p.id === order.productId)
          const meta = PACKAGE_STATUS_META[order.pkg.status]
          const lastEvent = [...order.pkg.timeline].reverse().find((e) => e.at && e.state !== 'upcoming')
          return (
            <Link key={order.pkg.packageId} to={`/packages/${order.pkg.packageId}`} className="block">
              <Card className="tm-rise transition-transform active:scale-[0.99]">
                <div className="flex gap-3">
                  {product && (
                    <ProductThumb
                      product={product}
                      className="h-14 w-14 shrink-0 ring-1 ring-hairline"
                      rounded="rounded-xl"
                      glyphSize="text-xl"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[13.5px] font-bold text-navy">{product?.name}</p>
                      <PackageStatusBadge status={order.pkg.status} className="shrink-0" />
                    </div>
                    <p className="mt-0.5 truncate text-[11px] tnum text-muted">{order.pkg.packageId}</p>
                    <p className="truncate text-[11px] tnum text-faint">{order.pkg.trackingNumber}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2">
                  <Truck
                    size={14}
                    className={cx(
                      'shrink-0',
                      meta.tone === 'ok' ? 'text-ok' : meta.tone === 'danger' ? 'text-danger' : 'text-brand-600',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-ink">
                    {lastEvent?.label ?? meta.label}
                  </span>
                  <span className="shrink-0 text-[10.5px] tnum text-muted">
                    ETA {dateLong(order.pkg.estimatedDelivery).slice(0, 6)}
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}

        {visible.length === 0 && (
          <EmptyState
            icon={<PackageSearch size={28} />}
            title="No packages here"
            body="Packages appear once a simulated order is created."
          />
        )}
      </div>
    </div>
  )
}

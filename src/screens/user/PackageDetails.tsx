import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box, MapPin, Package as PackageIcon, Phone, Ruler, Truck, Weight } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, DataRow, EmptyState, SectionTitle, cx } from '../../components/ui/primitives'
import { Badge, PackageStatusBadge, SimulatedTag } from '../../components/ui/Badge'
import { Timeline, type TimelineRow } from '../../components/ui/Timeline'
import { Sheet } from '../../components/ui/Modal'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useApp, useOrderByPackage } from '../../store/AppContext'
import { COURIER, PACKAGE_STATUS_META } from '../../data/packages'
import { dateLong, dateTimeCompact, lkr } from '../../lib/format'

function CourierLogo() {
  return (
    <span className="tm-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-white shadow-[0_4px_12px_rgba(37,99,235,0.28)]">
      <Truck size={21} strokeWidth={2.2} />
    </span>
  )
}

export default function PackageDetails() {
  const { packageId } = useParams()
  const order = useOrderByPackage(packageId)
  const { state } = useApp()
  const [mapOpen, setMapOpen] = useState(false)

  const product = state.products.find((p) => p.id === order?.productId)

  const rows = useMemo<TimelineRow[]>(
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
        <ScreenHeader title="Package Details" />
        <EmptyState icon={<PackageIcon size={28} />} title="Package not found" body="This package is unavailable." />
      </div>
    )
  }

  const pkg = order.pkg
  const meta = PACKAGE_STATUS_META[pkg.status]
  const totalItems = pkg.contents.reduce((s, c) => s + c.quantity, 0)

  return (
    <div className="pb-24">
      <ScreenHeader title="Package Details" />

      <div className="space-y-3 px-4 pt-3">
        {/* Status hero */}
        <div className="tm-gradient tm-rise relative overflow-hidden rounded-[18px] px-4 py-6 text-center text-white">
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-white/[0.07]"
            aria-hidden
          />
          <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/18 backdrop-blur-sm">
              <PackageIcon size={30} />
            </span>
            <p className="mt-3 text-[18px] font-extrabold tracking-[-0.01em]">
              {pkg.status === 'in_transit' ? 'Package in Transit' : meta.label}
            </p>
            <p className="mt-0.5 text-[12px] text-brand-100">{meta.description}</p>

            <div className="mt-4 rounded-xl bg-white/12 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[10.5px] font-semibold tracking-[0.08em] text-brand-100 uppercase">
                Estimated Delivery
              </p>
              <p className="mt-0.5 text-[15px] font-bold tnum">{dateLong(pkg.estimatedDelivery)}</p>
            </div>
          </div>
        </div>

        {/* Package information */}
        <Card>
          <SectionTitle action={<PackageStatusBadge status={pkg.status} />}>Package Information</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Package ID" value={pkg.packageId} mono />
            <DataRow label="Tracking Number" value={pkg.trackingNumber} mono />
            <DataRow
              label="Order Number"
              value={
                <Link to={`/orders/${order.orderNumber}`} className="text-brand-700 underline-offset-2 hover:underline">
                  {order.orderNumber}
                </Link>
              }
              mono
            />
            <DataRow label="Package Type" value={pkg.packageType} />
            <DataRow label="Weight" value={`${pkg.weightKg} kg`} />
            <DataRow label="Quantity" value={totalItems} />
          </div>
        </Card>

        {/* Courier */}
        <Card>
          <SectionTitle>Delivery Partner</SectionTitle>
          <div className="flex items-center gap-3">
            <CourierLogo />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-navy">{pkg.courier}</p>
              <p className="text-[11.5px] text-muted">{pkg.service}</p>
            </div>
            <Badge tone="info">Fictional</Badge>
          </div>
          <div className="mt-3 divide-y divide-hairline">
            <DataRow label="Tracking Number" value={pkg.trackingNumber} mono />
            <DataRow label="Service" value={pkg.service} />
            <DataRow
              label="Contact"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={12} className="text-muted" />
                  {pkg.courierPhone}
                </span>
              }
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-faint">{COURIER.note}</p>
        </Card>

        {/* Tracking timeline */}
        <Card>
          <SectionTitle>Package Tracking</SectionTitle>
          <Timeline rows={rows} />
          <div className="mt-3 flex flex-wrap gap-3 border-t border-hairline pt-3 text-[10.5px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ok" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-600" /> Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#d6dde8]" /> Upcoming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" /> Exception
            </span>
          </div>
        </Card>

        {/* Address */}
        <Card>
          <SectionTitle>Delivery Address</SectionTitle>
          <div className="flex gap-2.5">
            <MapPin size={16} className="mt-0.5 shrink-0 text-muted" />
            <address className="text-[13px] leading-relaxed font-medium text-navy not-italic">
              {pkg.address.name}
              <br />
              {pkg.address.line1}
              {pkg.address.line2 && (
                <>
                  <br />
                  {pkg.address.line2}
                </>
              )}
              <br />
              {pkg.address.city} {pkg.address.postal}
              <br />
              {pkg.address.country}
            </address>
          </div>
          <Button variant="outline" block className="mt-3" onClick={() => setMapOpen(true)} icon={<MapPin size={15} />}>
            View on Map
          </Button>
          <p className="mt-2 text-[11px] text-faint">Sample address — generated for this demo.</p>
        </Card>

        {/* Contents */}
        <Card>
          <SectionTitle action={<span className="text-[11.5px] text-muted">Total items: {totalItems}</span>}>
            Package Contents
          </SectionTitle>
          <ul className="space-y-3">
            {pkg.contents.map((item) => {
              const p = state.products.find((x) => x.id === item.productId)
              return (
                <li key={item.productId} className="flex gap-3">
                  {p && (
                    <ProductThumb
                      product={p}
                      className="h-14 w-14 shrink-0 ring-1 ring-hairline"
                      rounded="rounded-xl"
                      glyphSize="text-xl"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-navy">{item.name}</p>
                    <p className="text-[11.5px] text-muted">Quantity: {item.quantity}</p>
                    <p className="mt-0.5 text-[11px] tnum text-faint">
                      {item.productId} · {item.weightKg} kg
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Dimensions */}
        <Card>
          <SectionTitle>Package Dimensions</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Length', value: `${pkg.dimensions.length} cm` },
              { label: 'Width', value: `${pkg.dimensions.width} cm` },
              { label: 'Height', value: `${pkg.dimensions.height} cm` },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-canvas py-3 text-center">
                <Ruler size={14} className="mx-auto text-muted" />
                <p className="mt-1 text-[14px] font-bold tnum text-navy">{d.value}</p>
                <p className="text-[10.5px] text-muted">{d.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-canvas px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
              <Weight size={14} /> Weight
            </span>
            <span className="text-[13.5px] font-bold tnum text-navy">{pkg.weightKg} kg</span>
          </div>
        </Card>

        {/* Delivery information */}
        <Card>
          <SectionTitle action={<SimulatedTag />}>Delivery Information</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Shipping Method" value={pkg.shippingMethod} />
            <DataRow label="Shipping Fee" value={lkr(pkg.shippingFee)} accent="amount" />
            <DataRow label="Estimated Delivery" value={pkg.estimatedWindow} />
            <DataRow label="Destination" value={pkg.destination} />
            <DataRow label="Delivery Status" value={meta.label} />
          </div>
        </Card>

        <div
          className={cx(
            'rounded-xl px-3 py-2.5 text-[11px] leading-relaxed',
            'border border-brand-200 bg-brand-50 text-brand-800',
          )}
        >
          <strong className="font-extrabold">Prototype notice.</strong> This package, courier, tracking number and
          address are fictional. Nothing is being shipped.
        </div>
      </div>

      <Sheet open={mapOpen} onClose={() => setMapOpen(false)} title="Map preview">
        <div className="flex h-44 items-center justify-center rounded-xl bg-canvas">
          <div className="text-center">
            <Box size={30} className="mx-auto text-faint" />
            <p className="mt-2 text-[13px] font-semibold text-navy">No map in this demo</p>
            <p className="mt-1 text-[12px] text-muted">The delivery address is fictional sample data.</p>
          </div>
        </div>
        <Button block className="mt-3" onClick={() => setMapOpen(false)}>
          Close
        </Button>
      </Sheet>
    </div>
  )
}

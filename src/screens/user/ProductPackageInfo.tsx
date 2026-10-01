import { useParams } from 'react-router-dom'
import { Box, PackageCheck, Ruler, Shield, Truck, Weight } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, DataRow, EmptyState, SectionTitle } from '../../components/ui/primitives'
import { Badge, SimulatedTag } from '../../components/ui/Badge'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useProduct } from '../../store/AppContext'
import { COURIER, shippingFeeFor } from '../../data/packages'
import { lkr } from '../../lib/format'

const HANDLING: Record<string, { note: string; tone: 'ok' | 'pending' | 'info' }> = {
  Standard: { note: 'Standard handling. No special requirements.', tone: 'ok' },
  Fragile: { note: 'Fragile — protective inner packaging and "handle with care" labelling.', tone: 'pending' },
  Bulk: { note: 'Oversized — may ship separately from other items in the same order.', tone: 'info' },
  Express: { note: 'Priority handling with expedited courier pickup.', tone: 'info' },
}

export default function ProductPackageInfo() {
  const { productId } = useParams()
  const product = useProduct(productId)

  if (!product) {
    return (
      <div className="pb-24">
        <ScreenHeader title="Package Information" />
        <EmptyState icon={<Box size={28} />} title="Product not found" />
      </div>
    )
  }

  const handling = HANDLING[product.packageType] ?? HANDLING.Standard
  const volume = (product.dimensions.length * product.dimensions.width * product.dimensions.height) / 1000

  return (
    <div className="pb-24">
      <ScreenHeader title="Package Information" subtitle={product.name} />

      <div className="space-y-3 px-4 pt-3">
        <Card>
          <div className="flex gap-3">
            <ProductThumb
              product={product}
              className="h-16 w-16 shrink-0 ring-1 ring-hairline"
              rounded="rounded-xl"
              glyphSize="text-2xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-bold text-navy">{product.name}</p>
              <p className="truncate text-[11.5px] text-muted">{product.subtitle}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge tone={handling.tone}>{product.packageType}</Badge>
                <span className="text-[10.5px] tnum text-faint">{product.id}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Packaging</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Package Type" value={product.packageType} />
            <DataRow label="Item Weight" value={`${product.weightKg} kg`} />
            <DataRow label="Volumetric" value={`${volume.toFixed(2)} L`} />
            <DataRow label="Stock Available" value={product.inStock ? `${product.stock} units` : 'Out of stock'} />
          </div>
          <div className="mt-3 flex gap-2 rounded-xl bg-canvas p-3">
            <Shield size={15} className="mt-px shrink-0 text-muted" />
            <p className="text-[11.5px] leading-relaxed text-muted">{handling.note}</p>
          </div>
        </Card>

        <Card>
          <SectionTitle>Dimensions</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Length', value: `${product.dimensions.length} cm` },
              { label: 'Width', value: `${product.dimensions.width} cm` },
              { label: 'Height', value: `${product.dimensions.height} cm` },
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
              <Weight size={14} /> Shipping weight
            </span>
            <span className="text-[13.5px] font-bold tnum text-navy">{product.weightKg} kg</span>
          </div>
        </Card>

        <Card>
          <SectionTitle action={<SimulatedTag />}>Delivery</SectionTitle>
          <div className="flex items-center gap-3">
            <span className="tm-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-white">
              <Truck size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-navy">{COURIER.name}</p>
              <p className="text-[11.5px] text-muted">
                {product.packageType === 'Express' ? 'Express Delivery' : COURIER.service}
              </p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-hairline">
            <DataRow
              label="Shipping Method"
              value={product.packageType === 'Express' ? 'Express' : 'Standard'}
            />
            <DataRow label="Shipping Fee" value={lkr(shippingFeeFor(product.packageType))} accent="amount" />
            <DataRow label="Estimated Delivery" value="3–5 days after dispatch" />
            <DataRow label="Destination" value="Sri Lanka" />
          </div>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
          <PackageCheck size={15} className="mt-px shrink-0 text-brand-700" />
          <p className="text-[11px] leading-relaxed text-brand-800">
            Packaging data is illustrative. Creating a task here does not dispatch a physical shipment.
          </p>
        </div>
      </div>
    </div>
  )
}

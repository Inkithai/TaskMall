import type { Address, PackageEvent, PackageInfo, PackageStatus, Product, TimelineState } from './types'
import { addMinutes } from '../lib/clock'
import type { Rng } from '../lib/rng'

/** Ordered happy-path stages. Offsets are minutes from order creation. */
export const PACKAGE_STAGES = [
  { key: 'created', label: 'Order Created', offset: 0 },
  { key: 'preparing', label: 'Package Prepared', offset: 105 },
  { key: 'ready', label: 'Ready for Pickup', offset: 130 },
  { key: 'picked_up', label: 'Picked Up', offset: 145 },
  { key: 'in_transit', label: 'In Transit', offset: 155 },
  { key: 'out_for_delivery', label: 'Out for Delivery', offset: 1395 },
  { key: 'delivered', label: 'Delivered', offset: 1620 },
] as const

export type StageKey = (typeof PACKAGE_STAGES)[number]['key']

export const PACKAGE_STATUS_META: Record<
  PackageStatus,
  { label: string; description: string; tone: 'ok' | 'info' | 'pending' | 'danger' | 'muted' }
> = {
  preparing: { label: 'Preparing', description: 'Package is being prepared', tone: 'pending' },
  ready: { label: 'Ready for Pickup', description: 'Package is ready for courier pickup', tone: 'pending' },
  picked_up: { label: 'Picked Up', description: 'Courier has collected the package', tone: 'info' },
  in_transit: { label: 'In Transit', description: 'Package is moving toward destination', tone: 'info' },
  out_for_delivery: { label: 'Out for Delivery', description: 'Package is with the delivery driver', tone: 'info' },
  delivered: { label: 'Delivered', description: 'Package delivered successfully', tone: 'ok' },
  exception: { label: 'Delivery Exception', description: 'Delivery requires attention', tone: 'danger' },
  cancelled: { label: 'Cancelled', description: 'Package shipment cancelled', tone: 'muted' },
}

export const ALL_PACKAGE_STATUSES = Object.keys(PACKAGE_STATUS_META) as PackageStatus[]

/** Fictional sample address — this demo never ships anything. */
export const SAMPLE_ADDRESS: Address = {
  name: 'Demo User (sample recipient)',
  line1: 'No. XX, Example Street',
  line2: 'Unit XX, Sample Building',
  city: 'Colombo',
  country: 'Sri Lanka',
  postal: 'XXXXX',
}

export const COURIER = {
  name: 'TaskMall Express',
  phone: '+94 XX XXX XXXX',
  service: 'Standard Delivery',
  note: 'Fictional courier — for interface demonstration only.',
}

const SHIPPING_FEE: Record<Product['packageType'], number> = {
  Standard: 250,
  Express: 480,
  Fragile: 350,
  Bulk: 620,
}

export function shippingFeeFor(packageType: Product['packageType']): number {
  return SHIPPING_FEE[packageType]
}

export function stageIndex(status: PackageStatus): number {
  const i = PACKAGE_STAGES.findIndex((s) => s.key === status)
  return i === -1 ? PACKAGE_STAGES.length - 2 : i
}

/**
 * Build the tracking timeline for a package.
 *
 * Completed stages carry a timestamp, the active stage is `current`, and
 * everything after it is `upcoming` with no time. Exception/cancelled append a
 * terminal red event instead of continuing the happy path.
 */
export function buildTimeline(orderTime: Date, status: PackageStatus): PackageEvent[] {
  const terminal = status === 'exception' || status === 'cancelled'
  const activeIndex = terminal ? stageIndex('picked_up') : stageIndex(status)

  const events: PackageEvent[] = PACKAGE_STAGES.map((stage, i) => {
    let state: TimelineState = 'upcoming'
    if (i < activeIndex) state = 'done'
    else if (i === activeIndex) state = terminal ? 'done' : status === 'delivered' ? 'done' : 'current'
    return {
      key: stage.key,
      label: stage.label,
      at: state === 'upcoming' ? null : addMinutes(orderTime, stage.offset).toISOString(),
      state,
    }
  })

  if (status === 'exception') {
    return [
      ...events.slice(0, activeIndex + 1),
      {
        key: 'exception',
        label: 'Delivery Exception',
        at: addMinutes(orderTime, 1500).toISOString(),
        state: 'exception',
        note: 'Recipient unavailable — simulated re-delivery scheduled.',
      },
      ...events.slice(activeIndex + 1).map((e) => ({ ...e, at: null, state: 'upcoming' as TimelineState })),
    ]
  }

  if (status === 'cancelled') {
    return [
      ...events.slice(0, 2).map((e) => ({ ...e, state: 'done' as TimelineState })),
      {
        key: 'cancelled',
        label: 'Shipment Cancelled',
        at: addMinutes(orderTime, 1460).toISOString(),
        state: 'exception',
        note: 'Task window expired — simulated shipment cancelled.',
      },
    ]
  }

  return events
}

export function buildPackage(args: {
  orderTime: Date
  product: Product
  quantity: number
  status: PackageStatus
  packageId?: string
  trackingNumber?: string
  rng: Rng
  estimatedDelivery: Date
  estimatedWindow: string
}): PackageInfo {
  const { orderTime, product, quantity, status, rng, estimatedDelivery, estimatedWindow } = args
  const weightKg = Number((product.weightKg * quantity).toFixed(2))

  return {
    packageId: args.packageId ?? `TM-PKG-${rng.digits(6)}`,
    trackingNumber:
      args.trackingNumber ??
      `TMX${orderTime.getFullYear()}${String(orderTime.getMonth() + 1).padStart(2, '0')}${String(
        orderTime.getDate(),
      ).padStart(2, '0')}${rng.digits(6)}`,
    courier: COURIER.name,
    courierPhone: COURIER.phone,
    service: product.packageType === 'Express' ? 'Express Delivery' : COURIER.service,
    status,
    packageType: product.packageType,
    weightKg,
    dimensions: product.dimensions,
    shippingMethod: product.packageType === 'Express' ? 'Express' : 'Standard',
    shippingFee: shippingFeeFor(product.packageType),
    address: SAMPLE_ADDRESS,
    destination: 'Sri Lanka',
    estimatedDelivery: estimatedDelivery.toISOString(),
    estimatedWindow,
    timeline: buildTimeline(orderTime, status),
    contents: [
      {
        productId: product.id,
        name: product.name,
        quantity,
        weightKg,
      },
    ],
  }
}

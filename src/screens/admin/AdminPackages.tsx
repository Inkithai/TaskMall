import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Truck } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { Button, DataRow, Field, SelectField } from '../../components/ui/primitives'
import { PackageStatusBadge, SimulatedTag } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { Timeline } from '../../components/ui/Timeline'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import { ALL_PACKAGE_STATUSES, PACKAGE_STATUS_META } from '../../data/packages'
import type { Order, PackageStatus } from '../../data/types'
import { count, dateLong, dateTimeCompact, lkr } from '../../lib/format'

type Filter = 'all' | PackageStatus

export default function AdminPackages() {
  const { state, dispatch, toast } = useApp()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ courier: '', trackingNumber: '', estimatedDelivery: '' })

  const selected = state.orders.find((o) => o.pkg.packageId === selectedId) ?? null

  useEffect(() => {
    if (params.get('q')) {
      setQuery(params.get('q') ?? '')
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.orders.filter((o) => {
      const matchesFilter = filter === 'all' || o.pkg.status === filter
      const matchesQuery =
        !q ||
        o.pkg.packageId.toLowerCase().includes(q) ||
        o.pkg.trackingNumber.toLowerCase().includes(q) ||
        o.orderNumber.includes(q)
      return matchesFilter && matchesQuery
    })
  }, [state.orders, query, filter])

  const summary = useMemo(() => {
    const byStatus = (s: PackageStatus) => state.orders.filter((o) => o.pkg.status === s).length
    return {
      total: state.orders.length,
      transit: byStatus('in_transit') + byStatus('out_for_delivery') + byStatus('picked_up'),
      delivered: byStatus('delivered'),
      issues: byStatus('exception') + byStatus('cancelled'),
    }
  }, [state.orders])

  function openEditor(order: Order) {
    setSelectedId(order.pkg.packageId)
    setDraft({
      courier: order.pkg.courier,
      trackingNumber: order.pkg.trackingNumber,
      estimatedDelivery: new Date(order.pkg.estimatedDelivery).toISOString().slice(0, 10),
    })
  }

  const columns: Column<Order>[] = [
    {
      key: 'pkg',
      header: 'Package ID',
      render: (o) => <span className="tnum font-semibold text-navy">{o.pkg.packageId}</span>,
    },
    {
      key: 'order',
      header: 'Order',
      render: (o) => <span className="tnum text-muted">#{o.orderNumber.slice(-9)}</span>,
    },
    { key: 'customer', header: 'Customer', hideBelow: 'md', render: (o) => <span className="tnum">{o.userId}</span> },
    { key: 'courier', header: 'Courier', hideBelow: 'sm', render: (o) => o.pkg.courier },
    {
      key: 'tracking',
      header: 'Tracking',
      hideBelow: 'lg',
      render: (o) => <span className="tnum text-muted">{o.pkg.trackingNumber}</span>,
    },
    { key: 'status', header: 'Status', render: (o) => <PackageStatusBadge status={o.pkg.status} /> },
    {
      key: 'eta',
      header: 'ETA',
      hideBelow: 'lg',
      render: (o) => <span className="tnum text-muted">{dateLong(o.pkg.estimatedDelivery)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (o) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            openEditor(o)
          }}
          className="rounded-lg px-2 py-1 text-[11.5px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Manage
        </button>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader
        icon={Truck}
        title="Package Management"
        description="Courier assignment, tracking numbers, delivery status and timelines"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Packages" value={count(summary.total)} tone="brand" icon={<Truck size={18} />} />
        <StatCard label="In transit" value={count(summary.transit)} tone="pending" />
        <StatCard label="Delivered" value={count(summary.delivered)} tone="ok" />
        <StatCard label="Exceptions / cancelled" value={count(summary.issues)} tone="danger" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="tm-field pl-9"
            placeholder="Search package ID, tracking number or order..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search packages"
          />
        </div>
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: 'All' },
            ...ALL_PACKAGE_STATUSES.map((s) => ({ key: s as Filter, label: PACKAGE_STATUS_META[s].label })),
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(o) => o.pkg.packageId}
        onRowClick={openEditor}
        empty="No packages match this filter."
      />

      <Sheet
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected ? `Package ${selected.pkg.packageId}` : ''}
        maxWidth="max-w-[520px]"
        footer={
          selected && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  dispatch({
                    type: 'admin/packagePatch',
                    packageId: selected.pkg.packageId,
                    patch: {
                      courier: draft.courier,
                      trackingNumber: draft.trackingNumber,
                      estimatedDelivery: new Date(draft.estimatedDelivery).toISOString(),
                    },
                  })
                  toast({ title: 'Package updated', tone: 'ok' })
                }}
              >
                Save changes
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <SelectField
              label="Package status"
              value={selected.pkg.status}
              onChange={(e) => {
                const status = e.target.value as PackageStatus
                dispatch({ type: 'admin/packageStatus', packageId: selected.pkg.packageId, status })
                toast({ title: `Status set to ${PACKAGE_STATUS_META[status].label}`, tone: 'info' })
              }}
              hint={PACKAGE_STATUS_META[selected.pkg.status].description}
            >
              {ALL_PACKAGE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PACKAGE_STATUS_META[s].label}
                </option>
              ))}
            </SelectField>

            <Field
              label="Assign courier"
              value={draft.courier}
              onChange={(e) => setDraft((d) => ({ ...d, courier: e.target.value }))}
            />
            <Field
              label="Tracking number"
              value={draft.trackingNumber}
              onChange={(e) => setDraft((d) => ({ ...d, trackingNumber: e.target.value }))}
            />
            <Field
              label="Estimated delivery date"
              type="date"
              value={draft.estimatedDelivery}
              onChange={(e) => setDraft((d) => ({ ...d, estimatedDelivery: e.target.value }))}
            />

            <div>
              <p className="mb-2 text-[12px] font-bold text-navy">Package details</p>
              <div className="divide-y divide-hairline">
                <DataRow label="Order" value={selected.orderNumber} mono />
                <DataRow label="Customer" value={selected.userId} mono />
                <DataRow label="Weight" value={`${selected.pkg.weightKg} kg`} />
                <DataRow
                  label="Dimensions"
                  value={`${selected.pkg.dimensions.length} × ${selected.pkg.dimensions.width} × ${selected.pkg.dimensions.height} cm`}
                />
                <DataRow label="Shipping method" value={selected.pkg.shippingMethod} />
                <DataRow label="Shipping fee" value={lkr(selected.pkg.shippingFee)} accent="amount" />
                <DataRow
                  label="Destination"
                  value={`${selected.pkg.address.city}, ${selected.pkg.address.country}`}
                />
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[12px] font-bold text-navy">Tracking timeline</p>
              <Timeline
                dense
                rows={selected.pkg.timeline.map((e) => ({
                  key: e.key,
                  label: e.label,
                  at: e.at ? dateTimeCompact(e.at) : null,
                  state: e.state,
                  note: e.note,
                }))}
              />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

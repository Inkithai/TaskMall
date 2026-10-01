import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Package, Search } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { Button, DataRow, SelectField } from '../../components/ui/primitives'
import { OrderStatusBadge, PackageStatusBadge, SimulatedTag } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { Order, OrderStatus } from '../../data/types'
import { count, dateTimeFull, lkr, lkrShort, pct, timeOfDay } from '../../lib/format'

type Filter = 'all' | OrderStatus

export default function AdminOrders() {
  const { state, dispatch, toast } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Order | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.orders.filter((o) => {
      const product = state.products.find((p) => p.id === o.productId)
      const matchesFilter = filter === 'all' || o.status === filter
      const matchesQuery =
        !q || o.orderNumber.includes(q) || (product?.name.toLowerCase().includes(q) ?? false) || o.pkg.packageId.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [state.orders, state.products, query, filter])

  const summary = useMemo(
    () => ({
      total: state.orders.length,
      completed: state.orders.filter((o) => o.status === 'completed').length,
      pending: state.orders.filter((o) => o.status === 'pending').length,
      timeout: state.orders.filter((o) => o.status === 'timeout').length,
      rewards: state.orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.reward, 0),
    }),
    [state.orders],
  )

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order ID',
      render: (o) => <span className="tnum font-semibold text-navy">{o.orderNumber}</span>,
    },
    { key: 'user', header: 'User', hideBelow: 'md', render: (o) => <span className="tnum text-muted">{o.userId}</span> },
    {
      key: 'product',
      header: 'Product',
      render: (o) => {
        const p = state.products.find((x) => x.id === o.productId)
        return (
          <div className="flex items-center gap-2">
            <span className="text-base">{p?.emoji}</span>
            <span className="truncate">{p?.name}</span>
          </div>
        )
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (o) => <span className="tnum font-bold text-amount">{lkr(o.amount)}</span>,
    },
    {
      key: 'reward',
      header: 'Reward',
      align: 'right',
      render: (o) => (
        <span className="tnum font-bold text-reward">
          {lkr(o.reward)}
          <span className="ml-1 text-[10px] font-medium text-faint">{pct(o.rewardRate, 1)}</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: 'package',
      header: 'Package',
      hideBelow: 'lg',
      render: (o) => <PackageStatusBadge status={o.pkg.status} />,
    },
    {
      key: 'created',
      header: 'Created',
      hideBelow: 'md',
      render: (o) => <span className="tnum text-muted">{timeOfDay(o.orderTime, false)}</span>,
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
            setSelected(o)
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
        icon={Package}
        title="Orders"
        description="Every simulated order across the platform"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Orders" value={count(summary.total)} tone="brand" />
        <StatCard label="Completed" value={count(summary.completed)} tone="ok" />
        <StatCard label="Pending" value={count(summary.pending)} tone="pending" />
        <StatCard label="Time out" value={count(summary.timeout)} tone="danger" />
        <StatCard label="Rewards issued" value={lkrShort(summary.rewards)} tone="navy" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="tm-field pl-9"
            placeholder="Search order number, product or package..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search orders"
          />
        </div>
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: 'All' },
            { key: 'pending' as Filter, label: 'Pending' },
            { key: 'completed' as Filter, label: 'Completed' },
            { key: 'timeout' as Filter, label: 'Time Out' },
          ]}
        />
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(o) => o.orderNumber} onRowClick={setSelected} empty="No orders match this filter." />

      <Sheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Order ${selected.orderNumber}` : ''}
        maxWidth="max-w-[480px]"
        footer={
          selected && (
            <div className="grid grid-cols-2 gap-2">
              <Link to={`/orders/${selected.orderNumber}`} className="contents">
                <Button variant="outline" icon={<ExternalLink size={14} />}>
                  Open in user app
                </Button>
              </Link>
              <Link to={`/admin/packages?q=${selected.pkg.packageId}`} className="contents">
                <Button>Manage package</Button>
              </Link>
            </div>
          )
        }
      >
        {selected && (
          <>
            <SelectField
              label="Order status"
              value={selected.status}
              onChange={(e) => {
                const status = e.target.value as OrderStatus
                dispatch({ type: 'admin/orderStatus', orderNumber: selected.orderNumber, status })
                setSelected({ ...selected, status })
                toast({ title: `Order marked ${status}`, tone: 'info' })
              }}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="timeout">Time Out</option>
            </SelectField>

            <div className="mt-3 divide-y divide-hairline">
              <DataRow label="Order number" value={selected.orderNumber} mono />
              <DataRow label="User" value={selected.userId} mono />
              <DataRow
                label="Product"
                value={state.products.find((p) => p.id === selected.productId)?.name ?? selected.productId}
              />
              <DataRow label="Quantity" value={selected.quantity} />
              <DataRow label="Amount" value={lkr(selected.amount)} accent="amount" />
              <DataRow label="Reward rate" value={pct(selected.rewardRate)} />
              <DataRow label="Reward" value={lkr(selected.reward)} accent="reward" />
              <DataRow label="Created" value={dateTimeFull(selected.orderTime)} />
              <DataRow label="Expires" value={dateTimeFull(selected.expiresAt)} />
              <DataRow label="Package" value={selected.pkg.packageId} mono />
              <DataRow label="Tracking" value={selected.pkg.trackingNumber} mono />
              <DataRow label="Package status" value={<PackageStatusBadge status={selected.pkg.status} />} />
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}

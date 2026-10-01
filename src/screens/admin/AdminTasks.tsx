import { useMemo, useState } from 'react'
import { ClipboardList, Search } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { OrderStatusBadge, SimulatedTag } from '../../components/ui/Badge'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { AdminTask, OrderStatus } from '../../data/types'
import { count, countdown, dateTimeFull, lkr, lkrShort } from '../../lib/format'
import { demoNow } from '../../lib/clock'

type Filter = 'all' | OrderStatus

export default function AdminTasks() {
  const { state } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.adminTasks.filter((t) => {
      const matchesFilter = filter === 'all' || t.status === filter
      const matchesQuery =
        !q || t.id.toLowerCase().includes(q) || t.orderNumber.includes(q) || t.userLabel.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [state.adminTasks, query, filter])

  const summary = useMemo(
    () => ({
      total: state.adminTasks.length,
      completed: state.adminTasks.filter((t) => t.status === 'completed').length,
      pending: state.adminTasks.filter((t) => t.status === 'pending').length,
      rewards: state.adminTasks.filter((t) => t.status === 'completed').reduce((s, t) => s + t.reward, 0),
    }),
    [state.adminTasks],
  )

  const columns: Column<AdminTask>[] = [
    { key: 'id', header: 'Task ID', render: (t) => <span className="tnum font-semibold text-navy">{t.id}</span> },
    { key: 'order', header: 'Order', render: (t) => <span className="tnum text-muted">#{t.orderNumber.slice(-9)}</span> },
    { key: 'user', header: 'Assigned to', hideBelow: 'sm', render: (t) => t.userLabel },
    {
      key: 'product',
      header: 'Product',
      hideBelow: 'md',
      render: (t) => {
        const p = state.products.find((x) => x.id === t.productId)
        return (
          <span className="flex items-center gap-1.5">
            <span>{p?.emoji}</span>
            <span className="truncate">{p?.name}</span>
          </span>
        )
      },
    },
    {
      key: 'reward',
      header: 'Reward',
      align: 'right',
      render: (t) => <span className="tnum font-bold text-reward">{lkr(t.reward)}</span>,
    },
    { key: 'status', header: 'Status', render: (t) => <OrderStatusBadge status={t.status} /> },
    {
      key: 'assigned',
      header: 'Assigned',
      hideBelow: 'lg',
      render: (t) => <span className="tnum text-muted">{dateTimeFull(t.assignedAt)}</span>,
    },
    {
      key: 'due',
      header: 'Due',
      align: 'right',
      render: (t) => (
        <span className={t.status === 'pending' ? 'tnum font-semibold text-pending' : 'tnum text-faint'}>
          {t.status === 'pending' ? countdown(t.dueAt, demoNow()) : '—'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader
        icon={ClipboardList}
        title="Tasks"
        description="Task assignments, effective windows and simulated rewards"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tasks" value={count(summary.total)} tone="brand" icon={<ClipboardList size={18} />} />
        <StatCard label="Completed" value={count(summary.completed)} tone="ok" />
        <StatCard label="Pending" value={count(summary.pending)} tone="pending" />
        <StatCard label="Rewards issued" value={lkrShort(summary.rewards)} tone="navy" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="tm-field pl-9"
            placeholder="Search task, order or user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tasks"
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

      <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} empty="No tasks match this filter." />
    </div>
  )
}

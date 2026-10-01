import { useMemo, useState } from 'react'
import { Activity, Ban, CheckCircle2, Eye, Pencil, Search, Users } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { Button, DataRow, Field, cx } from '../../components/ui/primitives'
import { Badge, SimulatedTag } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { AdminUserRow } from '../../data/types'
import { count, dateShort, lkrShort, relative } from '../../lib/format'
import { demoNow } from '../../lib/clock'

type Filter = 'all' | AdminUserRow['status']

const STATUS_TONE = { active: 'ok', suspended: 'danger', pending: 'pending' } as const

export default function AdminUsers() {
  const { state, dispatch, toast } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<AdminUserRow | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: '', email: '', phone: '' })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.adminUsers.filter((u) => {
      const matchesFilter = filter === 'all' || u.status === filter
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.email.includes(q)
      return matchesFilter && matchesQuery
    })
  }, [state.adminUsers, query, filter])

  const summary = useMemo(
    () => ({
      total: state.adminUsers.length,
      active: state.adminUsers.filter((u) => u.status === 'active').length,
      suspended: state.adminUsers.filter((u) => u.status === 'suspended').length,
      balance: state.adminUsers.reduce((s, u) => s + u.balance, 0),
    }),
    [state.adminUsers],
  )

  function setStatus(id: string, status: AdminUserRow['status']) {
    dispatch({ type: 'admin/userStatus', id, status })
    toast({ title: `User ${id} ${status}`, tone: status === 'suspended' ? 'danger' : 'ok' })
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  }

  const columns: Column<AdminUserRow>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10.5px] font-bold text-brand-700">
            {u.name.replace('User ', '')}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{u.name}</p>
            <p className="truncate text-[11px] text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'id', header: 'ID', render: (u) => <span className="tnum font-semibold">{u.id}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <Badge tone={STATUS_TONE[u.status]} dot>
          {u.status[0].toUpperCase() + u.status.slice(1)}
        </Badge>
      ),
    },
    { key: 'orders', header: 'Orders', align: 'right', render: (u) => <span className="tnum">{u.orders}</span> },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      render: (u) => <span className="tnum font-semibold text-navy">{lkrShort(u.balance)}</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      hideBelow: 'md',
      render: (u) => <span className="tnum text-muted">{dateShort(u.joined)}</span>,
    },
    {
      key: 'activity',
      header: 'Last active',
      hideBelow: 'lg',
      render: (u) => <span className="text-muted">{relative(u.lastActive, demoNow())}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelected(u)
            }}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
            aria-label={`View ${u.name}`}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelected(u)
              setDraft({ name: u.name, email: u.email, phone: u.phone })
              setEditing(true)
            }}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
            aria-label={`Edit ${u.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setStatus(u.id, u.status === 'suspended' ? 'active' : 'suspended')
            }}
            className={cx(
              'rounded-lg p-1.5 transition-colors',
              u.status === 'suspended'
                ? 'text-ok hover:bg-ok-soft'
                : 'text-muted hover:bg-danger-soft hover:text-danger',
            )}
            aria-label={u.status === 'suspended' ? `Activate ${u.name}` : `Suspend ${u.name}`}
          >
            {u.status === 'suspended' ? <CheckCircle2 size={15} /> : <Ban size={15} />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader
        icon={Users}
        title="Users"
        description="Accounts registered on the platform"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total users" value={count(summary.total)} tone="brand" icon={<Users size={18} />} />
        <StatCard label="Active" value={count(summary.active)} tone="ok" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Suspended" value={count(summary.suspended)} tone="danger" icon={<Ban size={18} />} />
        <StatCard
          label="Simulated balances"
          value={lkrShort(summary.balance)}
          tone="navy"
          icon={<Activity size={18} />}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="tm-field pl-9"
            placeholder="Search by name, ID or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: 'All' },
            { key: 'active' as Filter, label: 'Active' },
            { key: 'pending' as Filter, label: 'Pending' },
            { key: 'suspended' as Filter, label: 'Suspended' },
          ]}
        />
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(u) => u.id} onRowClick={(u) => setSelected(u)} />

      <Sheet
        open={selected !== null && !editing}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.name} · ${selected.id}` : ''}
        maxWidth="max-w-[460px]"
        footer={
          selected && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDraft({ name: selected.name, email: selected.email, phone: selected.phone })
                  setEditing(true)
                }}
              >
                Edit
              </Button>
              <Button
                variant={selected.status === 'suspended' ? 'success' : 'danger'}
                onClick={() => setStatus(selected.id, selected.status === 'suspended' ? 'active' : 'suspended')}
              >
                {selected.status === 'suspended' ? 'Activate' : 'Suspend'}
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <div className="divide-y divide-hairline">
            <DataRow label="User ID" value={selected.id} mono />
            <DataRow label="Email" value={selected.email} />
            <DataRow label="Phone" value={selected.phone} />
            <DataRow
              label="Status"
              value={<Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>}
            />
            <DataRow label="Level" value={`Level ${selected.level}`} />
            <DataRow label="Orders" value={selected.orders} />
            <DataRow label="Simulated balance" value={lkrShort(selected.balance)} accent="reward" />
            <DataRow label="Joined" value={dateShort(selected.joined)} />
            <DataRow label="Last active" value={relative(selected.lastActive, demoNow())} />
          </div>
        )}
      </Sheet>

      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit user"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditing(false)
                toast({ title: 'Changes saved', body: 'Simulated — user records are read-only in this demo.', tone: 'info' })
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <Field label="Email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
          <Field label="Phone" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
        </div>
      </Sheet>
    </div>
  )
}

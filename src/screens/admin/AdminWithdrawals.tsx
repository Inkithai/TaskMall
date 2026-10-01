import { useMemo, useState } from 'react'
import { Check, Wallet, X } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { Badge, DemoNotice, SimulatedTag } from '../../components/ui/Badge'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { WithdrawalRequest } from '../../data/types'
import { count, dateTimeFull, lkr } from '../../lib/format'

type Filter = 'all' | WithdrawalRequest['status']

const TONE = { simulated: 'info', processing: 'pending', approved: 'ok', rejected: 'danger' } as const

export default function AdminWithdrawals() {
  const { state, dispatch, toast } = useApp()
  const [filter, setFilter] = useState<Filter>('all')

  const rows = useMemo(
    () => state.withdrawals.filter((w) => filter === 'all' || w.status === filter),
    [state.withdrawals, filter],
  )

  const summary = useMemo(() => {
    const open = state.withdrawals.filter((w) => w.status === 'simulated' || w.status === 'processing')
    return {
      total: state.withdrawals.length,
      open: open.length,
      openValue: open.reduce((s, w) => s + w.amount, 0),
      approved: state.withdrawals.filter((w) => w.status === 'approved').length,
    }
  }, [state.withdrawals])

  function resolve(id: string, status: WithdrawalRequest['status']) {
    dispatch({ type: 'admin/withdrawal', id, status })
    toast({ title: `Request ${id} ${status}`, tone: status === 'rejected' ? 'danger' : 'ok' })
  }

  const columns: Column<WithdrawalRequest>[] = [
    { key: 'id', header: 'Request ID', render: (w) => <span className="tnum font-semibold text-navy">{w.id}</span> },
    { key: 'user', header: 'User', hideBelow: 'sm', render: (w) => <span className="tnum">{w.userId}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (w) => <span className="tnum font-bold text-amount">{lkr(w.amount)}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      hideBelow: 'md',
      render: (w) => (
        <div className="min-w-0">
          <p className="font-semibold text-navy">{w.method === 'bank' ? 'Bank Account' : 'E-Wallet'}</p>
          <p className="truncate text-[11px] tnum text-muted">{w.account}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (w) => (
        <Badge tone={TONE[w.status]} dot>
          {w.status === 'simulated' ? 'SIMULATED' : w.status}
        </Badge>
      ),
    },
    {
      key: 'at',
      header: 'Requested',
      hideBelow: 'lg',
      render: (w) => <span className="tnum text-muted">{dateTimeFull(w.at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (w) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            disabled={w.status === 'approved'}
            onClick={() => resolve(w.id, 'approved')}
            className="rounded-lg p-1.5 text-ok transition-colors hover:bg-ok-soft disabled:opacity-30"
            aria-label={`Approve ${w.id}`}
          >
            <Check size={15} />
          </button>
          <button
            type="button"
            disabled={w.status === 'rejected'}
            onClick={() => resolve(w.id, 'rejected')}
            className="rounded-lg p-1.5 text-danger transition-colors hover:bg-danger-soft disabled:opacity-30"
            aria-label={`Reject ${w.id}`}
          >
            <X size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader
        icon={Wallet}
        title="Withdrawals"
        description="Simulated withdrawal requests — no payout rail is connected"
        actions={<SimulatedTag />}
      />

      <DemoNotice className="mb-4">
        Approving or rejecting here only changes a label in the local dataset. A production build must never present
        simulated commissions as withdrawable funds.
      </DemoNotice>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Requests" value={count(summary.total)} tone="brand" icon={<Wallet size={18} />} />
        <StatCard label="Open" value={count(summary.open)} tone="pending" />
        <StatCard label="Open value" value={lkr(summary.openValue)} tone="navy" />
        <StatCard label="Approved" value={count(summary.approved)} tone="ok" />
      </div>

      <div className="mb-3">
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: 'All' },
            { key: 'simulated' as Filter, label: 'Simulated' },
            { key: 'processing' as Filter, label: 'Processing' },
            { key: 'approved' as Filter, label: 'Approved' },
            { key: 'rejected' as Filter, label: 'Rejected' },
          ]}
        />
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(w) => w.id} empty="No withdrawal requests." />
    </div>
  )
}

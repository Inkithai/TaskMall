import { useMemo, useState } from 'react'
import { Receipt, Search } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { Badge, SimulatedTag } from '../../components/ui/Badge'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { Transaction, TransactionType } from '../../data/types'
import { count, dateTimeFull, lkr, signedLkr } from '../../lib/format'
import { cx } from '../../components/ui/primitives'

type Filter = 'all' | TransactionType

const TYPE_LABEL: Record<TransactionType, string> = {
  reward: 'Reward',
  order: 'Order',
  recharge: 'Recharge',
  withdrawal: 'Withdrawal',
}

export default function AdminTransactions() {
  const { state } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.transactions.filter((t) => {
      const matchesFilter = filter === 'all' || t.type === filter
      const matchesQuery =
        !q || t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || (t.reference ?? '').includes(q)
      return matchesFilter && matchesQuery
    })
  }, [state.transactions, query, filter])

  const summary = useMemo(() => {
    const credits = state.transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const debits = state.transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    const rewards = state.transactions.filter((t) => t.type === 'reward').reduce((s, t) => s + t.amount, 0)
    return { entries: state.transactions.length, credits, debits, rewards }
  }, [state.transactions])

  const columns: Column<Transaction>[] = [
    { key: 'id', header: 'Entry', render: (t) => <span className="tnum text-muted">{t.id}</span> },
    {
      key: 'title',
      header: 'Description',
      render: (t) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{t.title}</p>
          {t.reference && <p className="truncate text-[11px] tnum text-muted">#{t.reference}</p>}
        </div>
      ),
    },
    { key: 'type', header: 'Type', hideBelow: 'sm', render: (t) => <Badge tone="muted">{TYPE_LABEL[t.type]}</Badge> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t) => (
        <span className={cx('tnum font-bold', t.amount >= 0 ? 'text-reward' : 'text-amount')}>
          {signedLkr(t.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <Badge tone={t.status === 'completed' ? 'ok' : t.status === 'processing' ? 'pending' : 'danger'} dot>
          {t.status}
        </Badge>
      ),
    },
    {
      key: 'at',
      header: 'Date',
      hideBelow: 'md',
      align: 'right',
      render: (t) => <span className="tnum text-muted">{dateTimeFull(t.at)}</span>,
    },
  ]

  return (
    <div>
      <AdminPageHeader
        icon={Receipt}
        title="Transactions"
        description="Simulated ledger — order holds, capital returns, rewards, recharges and withdrawals"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ledger entries" value={count(summary.entries)} tone="brand" icon={<Receipt size={18} />} />
        <StatCard label="Credits" value={lkr(summary.credits)} tone="ok" />
        <StatCard label="Debits" value={lkr(summary.debits)} tone="danger" />
        <StatCard label="Rewards" value={lkr(summary.rewards)} tone="navy" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="tm-field pl-9"
            placeholder="Search entries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search transactions"
          />
        </div>
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: 'All' },
            { key: 'reward' as Filter, label: 'Rewards' },
            { key: 'order' as Filter, label: 'Orders' },
            { key: 'recharge' as Filter, label: 'Recharge' },
            { key: 'withdrawal' as Filter, label: 'Withdrawal' },
          ]}
        />
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} empty="No ledger entries match this filter." />
    </div>
  )
}

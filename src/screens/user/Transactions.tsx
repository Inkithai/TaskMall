import { useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, EmptyState } from '../../components/ui/primitives'
import { SimulatedTag } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { TransactionRow, groupByDay } from '../../components/wallet/TransactionRow'
import { useApp } from '../../store/AppContext'
import type { TransactionType } from '../../data/types'
import { lkr } from '../../lib/format'

type Filter = 'all' | TransactionType

export default function Transactions() {
  const { state } = useApp()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? state.transactions : state.transactions.filter((t) => t.type === filter)),
    [state.transactions, filter],
  )

  const grouped = useMemo(() => groupByDay(filtered), [filtered])

  const totals = useMemo(() => {
    const inflow = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const outflow = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
    return { inflow, outflow, net: inflow + outflow }
  }, [filtered])

  return (
    <div className="pb-24">
      <ScreenHeader title="Transaction History" />

      <div className="sticky top-[52px] z-20">
        <Tabs
          items={[
            { key: 'all', label: 'All' },
            { key: 'reward', label: 'Rewards' },
            { key: 'order', label: 'Orders' },
            { key: 'recharge', label: 'Recharge' },
            { key: 'withdrawal', label: 'Withdrawal' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="px-4 pt-3">
        <Card className="!p-3">
          <div className="grid grid-cols-3 divide-x divide-hairline">
            <div className="px-1 text-center">
              <p className="text-[10px] font-medium text-muted">Credits</p>
              <p className="mt-0.5 text-[13px] font-bold tnum text-reward">{lkr(totals.inflow)}</p>
            </div>
            <div className="px-1 text-center">
              <p className="text-[10px] font-medium text-muted">Debits</p>
              <p className="mt-0.5 text-[13px] font-bold tnum text-amount">{lkr(Math.abs(totals.outflow))}</p>
            </div>
            <div className="px-1 text-center">
              <p className="text-[10px] font-medium text-muted">Net</p>
              <p className="mt-0.5 text-[13px] font-bold tnum text-navy">{lkr(totals.net)}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-hairline pt-2.5">
            <SimulatedTag compact />
            <span className="text-[10.5px] text-muted">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} · ledger reconciles to the available
              balance
            </span>
          </div>
        </Card>
      </div>

      <div className="space-y-3 px-4 pt-3">
        {grouped.map(([label, items]) => (
          <div key={label}>
            <p className="mb-1.5 px-1 text-[11.5px] font-bold text-muted">{label}</p>
            <Card className="!p-0">
              <ul className="divide-y divide-hairline">
                {items.map((t) => (
                  <TransactionRow key={t.id} tx={t} showDate={label !== 'Today' && label !== 'Yesterday'} />
                ))}
              </ul>
            </Card>
          </div>
        ))}

        {grouped.length === 0 && (
          <EmptyState icon={<Receipt size={28} />} title="No transactions" body="Nothing matches this filter yet." />
        )}
      </div>
    </div>
  )
}

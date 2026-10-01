import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, Info, Receipt } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, SectionTitle } from '../../components/ui/primitives'
import { SimulatedTag } from '../../components/ui/Badge'
import { TransactionRow, groupByDay } from '../../components/wallet/TransactionRow'
import { useApp, useWalletTotals } from '../../store/AppContext'
import { lkr } from '../../lib/format'

export default function Wallet() {
  const { state } = useApp()
  const totals = useWalletTotals()

  const recent = useMemo(() => groupByDay(state.transactions.slice(0, 12)), [state.transactions])
  const heldOrders = state.orders.filter((o) => o.status === 'pending')

  return (
    <div className="pb-24">
      <ScreenHeader
        title="Wallet"
        right={
          <Link
            to="/wallet/transactions"
            aria-label="Transaction history"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-50"
          >
            <Receipt size={18} />
          </Link>
        }
      />

      <div className="space-y-3 px-4 pt-3">
        {/* Balance */}
        <div className="tm-gradient tm-rise relative overflow-hidden rounded-[18px] p-4 text-white">
          <div className="pointer-events-none absolute -top-12 -right-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
          <div className="relative">
            <div className="flex items-center gap-2">
              <p className="text-[10.5px] font-bold tracking-[0.1em] text-brand-100 uppercase">Total Balance</p>
              <span className="rounded-[5px] border border-white/35 px-1.5 py-px text-[8.5px] font-bold tracking-[0.08em] uppercase">
                Simulated
              </span>
            </div>
            <p className="mt-1 text-[32px] leading-none font-extrabold tracking-[-0.02em] tnum">{lkr(totals.total)}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/12 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[10.5px] font-medium text-brand-100">Available</p>
                <p className="mt-0.5 text-[15px] font-bold tnum">{lkr(totals.available)}</p>
              </div>
              <div className="rounded-xl bg-white/12 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[10.5px] font-medium text-brand-100">Pending</p>
                <p className="mt-0.5 text-[15px] font-bold tnum">{lkr(totals.pending)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/wallet/recharge"
            className="tm-gradient flex h-12 items-center justify-center gap-2 rounded-[14px] text-[14px] font-bold text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)] transition-transform active:scale-[0.98]"
          >
            <ArrowDownToLine size={17} /> Recharge
          </Link>
          <Link
            to="/wallet/withdraw"
            className="flex h-12 items-center justify-center gap-2 rounded-[14px] bg-white text-[14px] font-bold text-brand-700 shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
          >
            <ArrowUpFromLine size={17} /> Withdraw
          </Link>
        </div>

        {/* How figures are calculated */}
        <Card className="!bg-brand-50 !shadow-none ring-1 ring-brand-100">
          <div className="flex gap-2">
            <Info size={15} className="mt-px shrink-0 text-brand-700" />
            <div className="min-w-0 text-[11.5px] leading-relaxed text-brand-800">
              <p className="font-bold">How these figures work</p>
              <p className="mt-1">
                <strong>Available</strong> is simulated balance you can spend on tasks.{' '}
                <strong>Pending</strong> is simulated task capital currently held by{' '}
                <strong className="tnum">{heldOrders.length}</strong> open{' '}
                {heldOrders.length === 1 ? 'order' : 'orders'} — it returns automatically when each task completes or
                expires.
              </p>
              <p className="mt-1.5 font-semibold">
                None of it is real money, and none of it is withdrawable.
              </p>
            </div>
          </div>
        </Card>

        {/* Transactions */}
        <div>
          <SectionTitle
            action={
              <Link to="/wallet/transactions" className="flex items-center text-[12px] font-semibold text-brand-700">
                View all <ChevronRight size={14} />
              </Link>
            }
          >
            Transaction History
          </SectionTitle>

          <div className="space-y-3">
            {recent.map(([label, items]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <p className="text-[11.5px] font-bold text-muted">{label}</p>
                  <SimulatedTag compact />
                </div>
                <Card className="!p-0">
                  <ul className="divide-y divide-hairline">
                    {items.map((t) => (
                      <TransactionRow key={t.id} tx={t} />
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

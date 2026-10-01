import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  Clock,
  Gift,
  Headset,
  LayoutDashboard,
  Package,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { Panel, StatCard } from '../../components/admin/DataTable'
import { AreaChart, BarChart, DonutChart, SplitBar } from '../../components/charts/Charts'
import { Badge, OrderStatusBadge } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'
import { compact, count, lkr, lkrShort, relative, shortOrder } from '../../lib/format'
import { demoNow } from '../../lib/clock'

export default function AdminDashboard() {
  const { state } = useApp()
  const s = state.adminStats
  const c = state.adminCharts

  const latestOrders = state.orders.slice(0, 6)
  const openTickets = state.tickets.filter((t) => t.status !== 'closed')

  return (
    <div>
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Platform overview · all figures simulated"
        actions={<Badge tone="info">Updated {relative(demoNow(), demoNow())}</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Users" value={count(s.totalUsers)} icon={<Users size={19} />} tone="brand" sub="+312 this week" />
        <StatCard label="Active Users" value={count(s.activeUsers)} icon={<UserCheck size={19} />} tone="ok" sub="38.6% of total" />
        <StatCard label="Orders" value={count(s.orders)} icon={<Package size={19} />} tone="navy" sub="all time" />
        <StatCard label="Completed" value={count(s.completed)} icon={<CheckCircle2 size={19} />} tone="ok" sub="87.1% rate" />
        <StatCard label="Pending" value={count(s.pending)} icon={<Clock size={19} />} tone="pending" sub="awaiting action" />
        <StatCard label="Support Tickets" value={count(s.supportTickets)} icon={<Headset size={19} />} tone="danger" sub={`${openTickets.length} open locally`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel
          title="Daily users"
          className="xl:col-span-2"
          action={<Badge tone="info">last 7 days</Badge>}
        >
          <AreaChart data={c.dailyUsers} height={180} />
        </Panel>

        <Panel title="Completed vs pending">
          <DonutChart data={c.completedVsPending} centerLabel="Orders" />
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Orders per day" action={<Badge tone="info">last 7 days</Badge>}>
          <BarChart data={c.ordersPerDay} height={170} />
        </Panel>

        <Panel title="Task activity" action={<Badge tone="info">last 7 days</Badge>}>
          <AreaChart data={c.taskActivity} height={170} color="#0f9d74" />
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          title="Simulated rewards issued"
          action={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-ok">
              <TrendingUp size={13} /> +12.4%
            </span>
          }
        >
          <BarChart data={c.simulatedRewards} height={170} color="#2563eb" valueFormat={(n) => lkrShort(n)} />
          <p className="mt-2 text-[11px] text-faint">Totals are simulated and are not liabilities.</p>
        </Panel>

        <Panel title="Withdrawal simulations">
          <BarChart data={c.withdrawalSimulations} height={170} color="#f08c1a" valueFormat={(n) => compact(n)} />
          <p className="mt-2 text-[11px] text-faint">No payout rail is connected to this console.</p>
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel title="Order mix" className="lg:col-span-1">
          <SplitBar data={c.completedVsPending} />
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Average order value</span>
              <span className="font-bold tnum text-navy">{lkr(4182)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Average reward rate</span>
              <span className="font-bold tnum text-reward">3.42%</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Timeout rate</span>
              <span className="font-bold tnum text-danger">2.8%</span>
            </div>
          </div>
        </Panel>

        <Panel
          title="Latest orders"
          className="lg:col-span-2"
          action={
            <Link to="/admin/orders" className="text-[12px] font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-hairline">
            {latestOrders.map((o) => {
              const product = state.products.find((p) => p.id === o.productId)
              return (
                <li key={o.orderNumber} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-canvas text-[15px]">
                    {product?.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-navy">{product?.name}</p>
                    <p className="truncate text-[11px] tnum text-muted">{shortOrder(o.orderNumber)}</p>
                  </div>
                  <span className="hidden shrink-0 text-[12px] font-bold tnum text-amount sm:block">
                    {lkr(o.amount)}
                  </span>
                  <span className="shrink-0 text-[12px] font-bold tnum text-reward">{lkr(o.reward)}</span>
                  <OrderStatusBadge status={o.status} className="shrink-0" />
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/admin/users', label: 'Manage users', Icon: Users },
          { to: '/admin/packages', label: 'Package management', Icon: Package },
          { to: '/admin/withdrawals', label: 'Withdrawal queue', Icon: Wallet },
          { to: '/admin/rewards', label: 'Reward programmes', Icon: Gift },
        ].map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="tm-card flex items-center gap-3 transition-shadow hover:shadow-[var(--shadow-float)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-brand-50 text-brand-600">
              <Icon size={17} />
            </span>
            <span className="text-[13px] font-semibold text-navy">{label}</span>
            <Activity size={15} className="ml-auto text-faint" />
          </Link>
        ))}
      </div>
    </div>
  )
}

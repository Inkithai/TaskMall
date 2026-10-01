import { useMemo } from 'react'
import { BarChart3, Download, TrendingUp } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, Panel, StatCard, type Column } from '../../components/admin/DataTable'
import { AreaChart, BarChart, DonutChart, SplitBar } from '../../components/charts/Charts'
import { Button } from '../../components/ui/primitives'
import { Badge, SimulatedTag } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'
import { CATEGORIES, type Category } from '../../data/types'
import { compact, count, lkr, lkrShort, pct } from '../../lib/format'

interface CategoryRow {
  category: Category
  products: number
  orders: number
  volume: number
  rewards: number
  avgRate: number
}

export default function AdminReports() {
  const { state, toast } = useApp()
  const c = state.adminCharts

  const categoryRows = useMemo<CategoryRow[]>(() => {
    return CATEGORIES.map((category) => {
      const products = state.products.filter((p) => p.category === category)
      const ids = new Set(products.map((p) => p.id))
      const orders = state.orders.filter((o) => ids.has(o.productId))
      return {
        category,
        products: products.length,
        orders: orders.length,
        volume: orders.reduce((s, o) => s + o.amount, 0),
        rewards: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.reward, 0),
        avgRate: products.reduce((s, p) => s + p.rewardRate, 0) / Math.max(1, products.length),
      }
    }).sort((a, b) => b.volume - a.volume)
  }, [state.products, state.orders])

  const columns: Column<CategoryRow>[] = [
    { key: 'category', header: 'Category', render: (r) => <span className="font-semibold text-navy">{r.category}</span> },
    { key: 'products', header: 'Products', align: 'right', render: (r) => <span className="tnum">{r.products}</span> },
    { key: 'orders', header: 'Orders', align: 'right', render: (r) => <span className="tnum">{r.orders}</span> },
    {
      key: 'volume',
      header: 'Order volume',
      align: 'right',
      render: (r) => <span className="tnum font-semibold text-amount">{lkrShort(r.volume)}</span>,
    },
    {
      key: 'rewards',
      header: 'Rewards',
      align: 'right',
      render: (r) => <span className="tnum font-semibold text-reward">{lkrShort(r.rewards)}</span>,
    },
    {
      key: 'rate',
      header: 'Avg rate',
      align: 'right',
      hideBelow: 'sm',
      render: (r) => <span className="tnum">{pct(r.avgRate)}</span>,
    },
  ]

  const totals = useMemo(
    () => ({
      volume: state.orders.reduce((s, o) => s + o.amount, 0),
      rewards: state.orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.reward, 0),
      completion:
        (state.orders.filter((o) => o.status === 'completed').length / Math.max(1, state.orders.length)) * 100,
      weekUsers: c.dailyUsers.reduce((s, d) => s + d.value, 0),
    }),
    [state.orders, c.dailyUsers],
  )

  function exportCsv() {
    const header = 'category,products,orders,volume_lkr,rewards_lkr,avg_rate\n'
    const body = categoryRows
      .map((r) => [r.category, r.products, r.orders, r.volume.toFixed(2), r.rewards.toFixed(2), r.avgRate.toFixed(4)].join(','))
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'taskmall-simulated-category-report.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Report exported', body: 'Simulated figures only.', tone: 'ok' })
  }

  return (
    <div>
      <AdminPageHeader
        icon={BarChart3}
        title="Reports"
        description="Aggregated platform analytics · simulated dataset"
        actions={
          <>
            <SimulatedTag />
            <Button size="sm" variant="outline" onClick={exportCsv} icon={<Download size={14} />}>
              Export CSV
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Order volume" value={lkrShort(totals.volume)} tone="brand" />
        <StatCard label="Rewards issued" value={lkr(totals.rewards)} tone="ok" />
        <StatCard label="Completion rate" value={`${totals.completion.toFixed(1)}%`} tone="navy" />
        <StatCard
          label="Weekly active users"
          value={compact(totals.weekUsers)}
          tone="pending"
          sub={
            <span className="flex items-center gap-1 text-ok">
              <TrendingUp size={11} /> +8.2% vs last week
            </span>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel title="Daily users" className="xl:col-span-2" action={<Badge tone="info">7 days</Badge>}>
          <AreaChart data={c.dailyUsers} height={190} />
        </Panel>
        <Panel title="Order outcomes">
          <DonutChart data={c.completedVsPending} centerLabel="Orders" />
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Orders per day">
          <BarChart data={c.ordersPerDay} height={170} />
        </Panel>
        <Panel title="Simulated rewards per day">
          <BarChart data={c.simulatedRewards} height={170} color="#0f9d74" valueFormat={lkrShort} />
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Task activity">
          <AreaChart data={c.taskActivity} height={170} color="#f08c1a" />
        </Panel>
        <Panel title="Withdrawal simulations">
          <AreaChart data={c.withdrawalSimulations} height={170} color="#e03131" valueFormat={(n) => String(n)} />
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title="Order mix">
          <SplitBar data={c.completedVsPending} />
        </Panel>
      </div>

      <div className="mt-3">
        <h3 className="mb-2.5 text-[13.5px] font-bold text-navy">Performance by category</h3>
        <DataTable columns={columns} rows={categoryRows} rowKey={(r) => r.category} />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-faint">
        Every figure on this page is derived from locally generated demo data. Nothing here represents real revenue,
        real users, or real liabilities. Totals: {count(state.orders.length)} orders across{' '}
        {count(state.products.length)} products.
      </p>
    </div>
  )
}

import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PackageSearch, ShoppingBag } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { OrderCard } from '../../components/order/OrderCard'
import { EmptyState, LinkButton } from '../../components/ui/primitives'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { OrderStatus } from '../../data/types'
import { lkr } from '../../lib/format'
import { isToday } from '../../lib/clock'

type TabKey = 'all' | OrderStatus

export default function Orders() {
  const { state, dispatch, toast } = useApp()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as TabKey) || 'all'

  const counts = useMemo(
    () => ({
      all: state.orders.length,
      pending: state.orders.filter((o) => o.status === 'pending').length,
      completed: state.orders.filter((o) => o.status === 'completed').length,
      timeout: state.orders.filter((o) => o.status === 'timeout').length,
    }),
    [state.orders],
  )

  const items: TabItem<TabKey>[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'timeout', label: 'Time Out', count: counts.timeout },
  ]

  const visible = useMemo(
    () => (tab === 'all' ? state.orders : state.orders.filter((o) => o.status === tab)),
    [state.orders, tab],
  )

  const todayReward = useMemo(
    () =>
      state.orders
        .filter((o) => o.status === 'completed' && o.completedAt && isToday(o.completedAt))
        .reduce((s, o) => s + o.reward, 0),
    [state.orders],
  )

  function completeTask(orderNumber: string) {
    const order = state.orders.find((o) => o.orderNumber === orderNumber)
    dispatch({ type: 'order/complete', orderNumber })
    toast({
      title: 'Task completed',
      body: order ? `Simulated reward of ${lkr(order.reward)} credited.` : undefined,
      tone: 'ok',
    })
  }

  return (
    <div className="pb-24">
      <ScreenHeader
        title="Order"
        right={
          <Link
            to="/products"
            className="flex h-9 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <ShoppingBag size={15} />
            Product List
          </Link>
        }
      />

      <div className="sticky top-[52px] z-20">
        <Tabs items={items} value={tab} onChange={(key) => setParams(key === 'all' ? {} : { tab: key })} />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1">
        <p className="text-[11.5px] text-muted">
          Showing <strong className="text-navy tnum">{visible.length}</strong>{' '}
          {visible.length === 1 ? 'order' : 'orders'}
        </p>
        <p className="text-[11.5px] text-muted">
          Today&apos;s reward <strong className="tnum text-reward">{lkr(todayReward)}</strong>
        </p>
      </div>

      <div className="space-y-3 px-4 pt-2">
        {visible.map((order) => (
          <OrderCard
            key={order.orderNumber}
            order={order}
            product={state.products.find((p) => p.id === order.productId)}
            onComplete={completeTask}
          />
        ))}

        {visible.length === 0 && (
          <EmptyState
            icon={<PackageSearch size={28} />}
            title={
              tab === 'pending'
                ? 'No pending orders'
                : tab === 'timeout'
                  ? 'No timed-out orders'
                  : tab === 'completed'
                    ? 'No completed orders yet'
                    : 'No orders yet'
            }
            body="Pick a product from the catalogue to generate a new simulated order."
            action={
              <LinkButton to="/products" size="md" icon={<ShoppingBag size={16} />}>
                Browse Product List
              </LinkButton>
            }
          />
        )}
      </div>
    </div>
  )
}

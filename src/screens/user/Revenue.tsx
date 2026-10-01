import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PackageSearch, Store } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { OrderCard } from '../../components/order/OrderCard'
import { Card, EmptyState, LinkButton } from '../../components/ui/primitives'
import { SimulatedTag } from '../../components/ui/Badge'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import { useLang } from '../../lib/i18n'
import type { OrderStatus } from '../../data/types'
import { lkr } from '../../lib/format'
import { isToday } from '../../lib/clock'

type TabKey = 'all' | OrderStatus

/**
 * The "Revenue" tab of the reference platform: an earnings summary above the
 * full order list. Every figure here is simulated, and the earnings card
 * carries the simulation tag — real platforms show these numbers unlabelled.
 */
export default function Revenue() {
  const { state, dispatch, toast } = useApp()
  const { t, fmt } = useLang()
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
    { key: 'all', label: t('common.all'), count: counts.all },
    { key: 'pending', label: t('home.pending'), count: counts.pending },
    { key: 'completed', label: t('home.completed'), count: counts.completed },
    { key: 'timeout', label: t('home.timeout'), count: counts.timeout },
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

  const lifetimeReward = useMemo(
    () => state.orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.reward, 0),
    [state.orders],
  )

  function completeTask(orderNumber: string) {
    const order = state.orders.find((o) => o.orderNumber === orderNumber)
    dispatch({ type: 'order/complete', orderNumber })
    toast({
      title: t('revenue.taskDone'),
      body: order ? fmt(t('revenue.taskDoneBody'), { amount: lkr(order.reward) }) : undefined,
      tone: 'ok',
    })
  }

  return (
    <div className="pb-24">
      <ScreenHeader
        title={
          <span className="flex items-center justify-center gap-1.5">
            {t('revenue.title')}
            <span className="text-[10px] font-semibold tracking-wide text-faint uppercase">Revenue</span>
          </span>
        }
        right={
          <Link
            to="/rent"
            className="flex h-9 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <Store size={15} />
            {t('rent.title')}
          </Link>
        }
      />

      {/* Earnings summary — the numbers the genre fills the screen with */}
      <div className="px-4 pt-3">
        <Card className="tm-rise !p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">{t('revenue.todayEarned')}</p>
            <SimulatedTag compact />
          </div>
          <p className="mt-1 text-[28px] leading-none font-extrabold tracking-[-0.02em] tnum text-reward">
            {lkr(todayReward)}
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
            <div>
              <p className="text-[10.5px] font-medium text-muted">{t('revenue.totalEarned')}</p>
              <p className="mt-0.5 text-[13px] font-bold tnum text-navy">{lkr(lifetimeReward)}</p>
            </div>
            <div>
              <p className="text-[10.5px] font-medium text-muted">{t('revenue.completedTasks')}</p>
              <p className="mt-0.5 text-[13px] font-bold tnum text-ok">{counts.completed}</p>
            </div>
            <div>
              <p className="text-[10.5px] font-medium text-muted">{t('revenue.pendingTasks')}</p>
              <p className="mt-0.5 text-[13px] font-bold tnum text-pending">{counts.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="sticky top-[52px] z-20 mt-3">
        <Tabs items={items} value={tab} onChange={(key) => setParams(key === 'all' ? {} : { tab: key })} />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1">
        <p className="text-[11.5px] text-muted">
          {t('revenue.showing')} <strong className="text-navy tnum">{visible.length}</strong>{' '}
          {visible.length === 1 ? t('revenue.order') : t('revenue.orders')}
        </p>
        <p className="text-[11.5px] text-muted">
          {t('revenue.todayReward')} <strong className="tnum text-reward">{lkr(todayReward)}</strong>
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
                ? t('revenue.emptyPending')
                : tab === 'timeout'
                  ? t('revenue.emptyTimeout')
                  : tab === 'completed'
                    ? t('revenue.emptyCompleted')
                    : t('revenue.emptyAll')
            }
            body={t('revenue.emptyBody')}
            action={
              <LinkButton to="/rent" size="md" icon={<Store size={16} />}>
                {t('revenue.browseRent')}
              </LinkButton>
            }
          />
        )}
      </div>
    </div>
  )
}

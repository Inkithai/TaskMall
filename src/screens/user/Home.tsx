import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  ChevronRight,
  Gift,
  Menu,
  Package,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { useApp, useUnreadCount, useWalletTotals } from '../../store/AppContext'
import { useShell } from '../../components/layout/MobileShell'
import { Card, SectionTitle, cx } from '../../components/ui/primitives'
import { Badge, PackageStatusBadge, SimulatedTag } from '../../components/ui/Badge'
import { SegmentedProgress } from '../../components/ui/Progress'
import { ProductThumb } from '../../components/product/ProductThumb'
import { BannerCarousel } from '../../components/home/BannerCarousel'
import { NoticeBar } from '../../components/home/NoticeBar'
import { lkr, relative, shortOrder, signedLkr } from '../../lib/format'
import { demoNow, isToday, useNow } from '../../lib/clock'
import { useLang } from '../../lib/i18n'
import { PACKAGE_STATUS_META } from '../../data/packages'

export default function Home() {
  const { state, dailyTarget } = useApp()
  const { openMenu } = useShell()
  const { t, fmt } = useLang()
  const unread = useUnreadCount()
  const totals = useWalletTotals()
  const now = useNow(30_000)

  const stats = useMemo(() => {
    const completedToday = state.orders.filter((o) => o.status === 'completed' && o.completedAt && isToday(o.completedAt))
    const pending = state.orders.filter((o) => o.status === 'pending')
    const timeoutToday = state.orders.filter((o) => o.status === 'timeout' && isToday(o.expiresAt))
    return {
      completed: completedToday.length,
      pending: pending.length,
      timeout: timeoutToday.length,
      todayReward: completedToday.reduce((sum, o) => sum + o.reward, 0),
    }
  }, [state.orders])

  const recent = useMemo(
    () =>
      state.orders
        .filter((o) => o.status === 'completed' && o.completedAt)
        .sort((a, b) => +new Date(b.completedAt!) - +new Date(a.completedAt!))
        .slice(0, 4),
    [state.orders],
  )

  const activePackages = useMemo(
    () =>
      state.orders
        .filter((o) => !['delivered', 'cancelled'].includes(o.pkg.status))
        .sort((a, b) => +new Date(b.orderTime) - +new Date(a.orderTime))
        .slice(0, 5),
    [state.orders],
  )

  const firstName = state.user.name.split(' ')[0]

  const greetingKey = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return 'greet.morning'
    if (h < 17) return 'greet.afternoon'
    if (h < 21) return 'greet.evening'
    return 'greet.night'
  }, [now])

  const quickActions = [
    { to: '/rent', label: t('home.rent'), Icon: Store, tint: 'from-[#fb923c] to-[#ea580c]' },
    { to: '/revenue', label: t('home.revenue'), Icon: TrendingUp, tint: 'from-[#3b82f6] to-[#2563eb]' },
    { to: '/wallet', label: t('home.wallet'), Icon: Wallet, tint: 'from-[#38bdf8] to-[#0ea5e9]' },
    { to: '/team', label: t('home.team'), Icon: Users, tint: 'from-[#818cf8] to-[#6366f1]' },
  ]

  return (
    <div className="pb-24">
      {/* Gradient header with promo carousel, like the reference home tab */}
      <div className="tm-gradient relative px-4 pt-3 pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={openMenu}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
          >
            <Menu size={20} />
          </button>
          <span className="text-[16px] font-extrabold tracking-[-0.01em] text-white">TaskMall</span>
          <Link
            to="/notifications"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-amount px-1 text-[9px] leading-none font-bold text-white ring-2 ring-brand-700">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </div>

        <div className="mt-3">
          <p className="text-[12.5px] font-medium text-brand-100">{t(greetingKey)},</p>
          <p className="text-[21px] leading-tight font-extrabold text-white">{firstName} 👋</p>
        </div>

        <div className="mt-4">
          <BannerCarousel />
        </div>
      </div>

      <div className="space-y-4 px-4 pt-3">
        {/* Notice marquee + simulated withdrawal ticker */}
        <NoticeBar />

        {/* Balance card */}
        <Card className="tm-rise overflow-hidden !p-0">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">{t('home.balance')}</span>
              <SimulatedTag compact />
            </div>
            <p className="mt-1 text-[30px] leading-none font-extrabold tracking-[-0.02em] tnum text-navy">
              {lkr(totals.total)}
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-muted">{t('home.todayReward')}</p>
                <p className="text-[17px] leading-tight font-bold tnum text-reward">{lkr(stats.todayReward)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-muted">{t('home.availablePending')}</p>
                <p className="text-[12.5px] font-semibold tnum text-ink">
                  {lkr(totals.available)} <span className="text-faint">/</span>{' '}
                  <span className="text-pending">{lkr(totals.pending)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-hairline p-3">
            <Link
              to="/wallet/recharge"
              className="tm-gradient flex h-11 items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.28)] transition-transform active:scale-[0.98]"
            >
              <ArrowDownToLine size={16} /> {t('home.recharge')}
            </Link>
            <Link
              to="/wallet/withdraw"
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-50 text-[13.5px] font-bold text-brand-700 transition-colors hover:bg-brand-100 active:bg-brand-200"
            >
              <ArrowUpFromLine size={16} /> {t('home.withdraw')}
            </Link>
          </div>
        </Card>

        {/* Today's tasks */}
        <Card>
          <SectionTitle
            action={
              <Link to="/revenue" className="flex items-center text-[12px] font-semibold text-brand-700">
                {t('common.viewAll')} <ChevronRight size={14} />
              </Link>
            }
          >
            {t('home.todaysTasks')}
          </SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('home.completed'), value: stats.completed, tone: 'ok' as const, to: '/revenue?tab=completed' },
              { label: t('home.pending'), value: stats.pending, tone: 'pending' as const, to: '/revenue?tab=pending' },
              { label: t('home.timeout'), value: stats.timeout, tone: 'danger' as const, to: '/revenue?tab=timeout' },
            ].map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className={cx(
                  'rounded-xl py-3 text-center transition-transform active:scale-[0.97]',
                  s.tone === 'ok' && 'bg-ok-soft',
                  s.tone === 'pending' && 'bg-pending-soft',
                  s.tone === 'danger' && 'bg-danger-soft',
                )}
              >
                <p
                  className={cx(
                    'text-[22px] leading-none font-extrabold tnum',
                    s.tone === 'ok' && 'text-ok',
                    s.tone === 'pending' && 'text-pending',
                    s.tone === 'danger' && 'text-danger',
                  )}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-muted">{s.label}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Progress */}
        <Card>
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-navy">{t('home.todaysProgress')}</h2>
            <span className="text-[12.5px] font-bold tnum text-brand-700">
              {stats.completed} / {dailyTarget}
            </span>
          </div>
          <SegmentedProgress value={stats.completed} max={dailyTarget} />
          <p className="mt-2 text-[11.5px] text-muted">
            {fmt(t('home.progressNote'), { done: String(stats.completed), total: String(dailyTarget) })}
            {stats.completed < dailyTarget &&
              ` · ${fmt(t('home.progressRemaining'), { count: String(dailyTarget - stats.completed) })}`}
          </p>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(({ to, label, Icon, tint }) => (
            <Link
              key={to}
              to={to}
              className="tm-card flex flex-col items-center gap-1.5 !px-1 !py-3 transition-transform active:scale-[0.96]"
            >
              <span
                className={cx(
                  'flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br text-white shadow-[0_4px_10px_rgba(37,99,235,0.2)]',
                  tint,
                )}
              >
                <Icon size={19} strokeWidth={2.2} />
              </span>
              <span className="text-center text-[10.5px] leading-tight font-semibold text-ink">{label}</span>
            </Link>
          ))}
        </div>

        {/* Active packages */}
        {activePackages.length > 0 && (
          <div>
            <SectionTitle
              action={
                <Link to="/packages" className="flex items-center text-[12px] font-semibold text-brand-700">
                  {t('home.allPackages')} <ChevronRight size={14} />
                </Link>
              }
            >
              {t('home.packages')}
            </SectionTitle>
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
              {activePackages.map((order) => {
                const product = state.products.find((p) => p.id === order.productId)
                return (
                  <Link
                    key={order.pkg.packageId}
                    to={`/packages/${order.pkg.packageId}`}
                    className="tm-card w-[210px] shrink-0 !p-3 transition-transform active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      {product && (
                        <ProductThumb
                          product={product}
                          className="h-10 w-10 shrink-0 ring-1 ring-hairline"
                          rounded="rounded-[10px]"
                          glyphSize="text-lg"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-navy">{product?.name}</p>
                        <p className="truncate text-[10.5px] tnum text-muted">{order.pkg.packageId}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <PackageStatusBadge status={order.pkg.status} />
                      <span className="flex items-center gap-1 text-[10.5px] font-medium text-muted">
                        <Truck size={12} /> {PACKAGE_STATUS_META[order.pkg.status].tone === 'ok' ? 'Done' : 'Live'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div>
          <SectionTitle
            action={
              <Link to="/wallet/transactions" className="flex items-center text-[12px] font-semibold text-brand-700">
                {t('home.history')} <ChevronRight size={14} />
              </Link>
            }
          >
            {t('home.recentActivity')}
          </SectionTitle>
          <Card className="!p-0">
            <ul className="divide-y divide-hairline">
              {recent.map((order) => (
                <li key={order.orderNumber}>
                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-canvas"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
                      <Package size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-navy">{t('home.orderCompleted')}</p>
                      <p className="truncate text-[11px] tnum text-muted">Order {shortOrder(order.orderNumber)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-bold tnum text-reward">{signedLkr(order.reward)}</p>
                      <p className="text-[10.5px] text-faint">{relative(order.completedAt!, demoNow())}</p>
                    </div>
                  </Link>
                </li>
              ))}
              {recent.length === 0 && (
                <li className="px-4 py-6 text-center text-[13px] text-muted">{t('home.noCompleted')}</li>
              )}
            </ul>
          </Card>
        </div>

        {/* Rewards teaser */}
        <Link to="/rewards" className="tm-card flex items-center gap-3 !p-3.5 transition-transform active:scale-[0.99]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] text-white">
            <Gift size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-navy">{t('home.dailyActivity')}</p>
            <p className="text-[11.5px] text-muted">
              {state.dailyCheckIn.filter((d) => d.claimed).length} {t('home.checkedIn')}
            </p>
          </div>
          <Badge tone="info">{t('drawer.rewards')}</Badge>
          <ChevronRight size={16} className="text-faint" />
        </Link>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, BellOff, CheckCircle2, Info, Wallet } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, EmptyState, cx } from '../../components/ui/primitives'
import { useApp, useUnreadCount } from '../../store/AppContext'
import type { NotificationKind } from '../../data/types'
import { relative } from '../../lib/format'
import { demoNow } from '../../lib/clock'

const META: Record<NotificationKind, { Icon: typeof Bell; tint: string }> = {
  task: { Icon: Bell, tint: 'bg-info-soft text-brand-700' },
  completed: { Icon: CheckCircle2, tint: 'bg-ok-soft text-ok' },
  expiring: { Icon: AlertTriangle, tint: 'bg-pending-soft text-pending' },
  wallet: { Icon: Wallet, tint: 'bg-brand-50 text-brand-600' },
  system: { Icon: Info, tint: 'bg-[#eef1f6] text-muted' },
}

export default function Notifications() {
  const { state, dispatch } = useApp()
  const unread = useUnreadCount()

  return (
    <div className="pb-24">
      <ScreenHeader
        title="Notifications"
        right={
          unread > 0 ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'notifications/readAll' })}
              className="rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      {unread > 0 && (
        <p className="px-4 pt-3 text-[11.5px] text-muted">
          <strong className="text-navy tnum">{unread}</strong> unread{' '}
          {unread === 1 ? 'notification' : 'notifications'}
        </p>
      )}

      <div className="space-y-2.5 px-4 pt-3">
        {state.notifications.map((n) => {
          const { Icon, tint } = META[n.kind]
          const content = (
            <Card
              className={cx(
                'tm-rise transition-colors',
                !n.read && 'ring-1 ring-brand-100',
              )}
            >
              <div className="flex gap-3">
                <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', tint)}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13.5px] font-bold text-navy">{n.title}</p>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amount" />}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed break-words text-muted">{n.body}</p>
                  <p className="mt-1.5 text-[10.5px] text-faint">{relative(n.at, demoNow())}</p>
                </div>
              </div>
            </Card>
          )

          return n.link ? (
            <Link key={n.id} to={n.link} onClick={() => dispatch({ type: 'notifications/read', id: n.id })} className="block">
              {content}
            </Link>
          ) : (
            <button
              key={n.id}
              type="button"
              onClick={() => dispatch({ type: 'notifications/read', id: n.id })}
              className="block w-full text-left"
            >
              {content}
            </button>
          )
        })}

        {state.notifications.length === 0 && (
          <EmptyState icon={<BellOff size={28} />} title="No notifications" body="You're all caught up." />
        )}
      </div>
    </div>
  )
}

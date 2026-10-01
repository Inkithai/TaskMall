import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Medal,
  Receipt,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card } from '../../components/ui/primitives'
import { Badge } from '../../components/ui/Badge'
import { useApp, useUnreadCount, useWalletTotals } from '../../store/AppContext'
import { useLang } from '../../lib/i18n'
import { lkr } from '../../lib/format'
import { TierBadge } from '../../components/membership/TierBadge'
import { tierFor } from '../../data/membership'

const MENU = [
  { to: '/profile/personal', labelKey: 'my.personal', Icon: UserRound },
  { to: '/membership', labelKey: 'my.membership', Icon: Medal },
  { to: '/security', labelKey: 'my.security', Icon: ShieldCheck },
  { to: '/profile/payment-methods', labelKey: 'my.paymentMethods', Icon: CreditCard },
  { to: '/wallet/transactions', labelKey: 'my.transactions', Icon: Receipt },
  { to: '/profile/notifications', labelKey: 'my.notifications', Icon: Bell },
  { to: '/profile/language', labelKey: 'my.language', Icon: Globe },
  { to: '/support', labelKey: 'my.help', Icon: HelpCircle },
  { to: '/about', labelKey: 'my.about', Icon: Info },
]

export default function Profile() {
  const { state, dispatch, toast } = useApp()
  const { t } = useLang()
  const totals = useWalletTotals()
  const unread = useUnreadCount()
  const navigate = useNavigate()

  const completed = state.orders.filter((o) => o.status === 'completed').length
  const tier = tierFor(state.lifetimeCompleted)

  return (
    <div className="pb-24">
      <ScreenHeader
        title={
          <span className="flex items-center justify-center gap-1.5">
            {t('my.title')}
            <span className="text-[10px] font-semibold tracking-wide text-faint uppercase">My</span>
          </span>
        }
        sticky={false}
      />

      {/* User card */}
      <div className="tm-gradient px-4 pt-2 pb-16">
        <div className="flex flex-col items-center text-white">
          <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white/20 text-[22px] font-extrabold ring-4 ring-white/15">
            {state.user.avatarInitials}
          </span>
          <p className="mt-2.5 text-[17px] font-extrabold">{state.user.name}</p>
          <p className="text-[11.5px] text-brand-100">{state.user.email}</p>
          <Link to="/membership" className="mt-2">
            <TierBadge tier={tier} />
          </Link>
        </div>
      </div>

      <div className="-mt-12 space-y-3 px-4">
        <Card>
          <div className="grid grid-cols-2 divide-x divide-hairline">
            <div className="px-2 text-center">
              <p className="text-[10.5px] font-medium text-muted">{t('my.id')}</p>
              <p className="mt-0.5 text-[13.5px] font-bold tnum text-navy">{state.user.id}</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-[10.5px] font-medium text-muted">{t('my.status')}</p>
              <div className="mt-1 flex justify-center">
                <Badge tone="ok" dot>
                  {state.user.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
            <div className="text-center">
              <p className="text-[15px] font-extrabold tnum text-navy">{completed}</p>
              <p className="text-[10px] text-muted">{t('my.completed')}</p>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-extrabold tnum text-reward">{lkr(totals.total)}</p>
              <p className="text-[10px] text-muted">{t('my.simBalance')}</p>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-extrabold tnum text-navy">{state.team.length}</p>
              <p className="text-[10px] text-muted">{t('my.team')}</p>
            </div>
          </div>
        </Card>

        <Card className="!p-0">
          <ul className="divide-y divide-hairline">
            {MENU.map(({ to, labelKey, Icon }) => (
              <li key={to}>
                <Link to={to} className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-canvas">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-brand-600">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-[13.5px] font-semibold text-navy">{t(labelKey, labelKey)}</span>
                  {to === '/profile/notifications' && unread > 0 && (
                    <Badge tone="danger" className="!px-1.5 !text-[9px]">
                      {unread}
                    </Badge>
                  )}
                  <ChevronRight size={16} className="shrink-0 text-faint" />
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'auth/logout' })
                  toast({ title: 'Signed out', tone: 'info' })
                  navigate('/login', { replace: true })
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-canvas"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-danger-soft text-danger">
                  <LogOut size={16} />
                </span>
                <span className="flex-1 text-[13.5px] font-semibold text-danger">{t('my.logout')}</span>
                <ChevronRight size={16} className="shrink-0 text-faint" />
              </button>
            </li>
          </ul>
        </Card>

        <p className="pb-2 text-center text-[10.5px] leading-relaxed text-faint">
          TaskMall demo build v1.0 · {t('my.memberSince')} {new Date(state.user.joined).getFullYear()}
          <br />
          {t('my.simNote')}
        </p>
      </div>
    </div>
  )
}

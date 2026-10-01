import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Gift,
  Headset,
  Home,
  Info,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { BottomNav } from './BottomNav'
import { SupportFab } from './SupportFab'
import { LogoMark, Wordmark } from './Logo'
import { useApp, useUnreadCount } from '../../store/AppContext'
import { Toasts } from '../ui/Toasts'
import { cx } from '../ui/primitives'
import { Badge } from '../ui/Badge'

interface ShellValue {
  openMenu: () => void
}
const ShellContext = createContext<ShellValue>({ openMenu: () => {} })
export const useShell = () => useContext(ShellContext)

const MENU_GROUPS: { title: string; items: { to: string; label: string; Icon: typeof Home }[] }[] = [
  {
    title: 'Main',
    items: [
      { to: '/home', label: 'Home', Icon: Home },
      { to: '/orders', label: 'Orders', Icon: Package },
      { to: '/products', label: 'Product List', Icon: ShoppingBag },
      { to: '/packages', label: 'My Packages', Icon: Truck },
    ],
  },
  {
    title: 'Wallet',
    items: [
      { to: '/wallet', label: 'Wallet', Icon: Wallet },
      { to: '/wallet/recharge', label: 'Recharge Simulation', Icon: LayoutGrid },
      { to: '/wallet/withdraw', label: 'Withdrawal Simulation', Icon: LayoutGrid },
      { to: '/wallet/transactions', label: 'Transaction History', Icon: LayoutGrid },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/team', label: 'My Team', Icon: Users },
      { to: '/rewards', label: 'Rewards', Icon: Gift },
      { to: '/notifications', label: 'Notifications', Icon: Bell },
      { to: '/profile', label: 'Profile', Icon: User },
      { to: '/security', label: 'Security', Icon: ShieldCheck },
      { to: '/support', label: 'Help & Support', Icon: Headset },
      { to: '/about', label: 'About TaskMall', Icon: Info },
    ],
  },
]

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const unread = useUnreadCount()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[80]">
      <div className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside
        className="absolute inset-y-0 left-0 flex w-[278px] flex-col bg-white shadow-[8px_0_30px_rgba(15,31,61,0.2)]"
        style={{ animation: 'tm-rise .22s ease-out both' }}
      >
        <div className="tm-gradient px-4 pt-4 pb-5 text-white">
          <div className="flex items-start justify-between">
            <Wordmark tone="white" size="sm" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[13px] font-bold">
              {state.user.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold">{state.user.name}</p>
              <p className="text-[11px] text-brand-100 tnum">{state.user.id}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {MENU_GROUPS.map((group) => (
            <div key={group.title} className="mb-3">
              <p className="px-2.5 pb-1 text-[10px] font-bold tracking-[0.09em] text-faint uppercase">{group.title}</p>
              <ul>
                {group.items.map(({ to, label, Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={onClose}
                      className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Icon size={17} className="shrink-0 text-muted" />
                      <span className="flex-1">{label}</span>
                      {to === '/notifications' && unread > 0 && (
                        <Badge tone="danger" className="!px-1.5 !text-[9px]">
                          {unread}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mb-2 border-t border-hairline pt-3">
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <Settings size={17} className="shrink-0 text-muted" />
              Admin Console
            </Link>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'auth/logout' })
                onClose()
                navigate('/login')
              }}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut size={17} className="shrink-0" />
              Logout
            </button>
          </div>
        </nav>

        <p className="border-t border-hairline px-4 py-3 text-[10.5px] leading-snug text-faint">
          TaskMall demo build · all monetary values are simulated.
        </p>
      </aside>
    </div>
  )
}

export function DemoRibbon() {
  return (
    <div className="relative z-40 shrink-0 bg-navy px-3 py-[5px] text-center">
      <p className="text-[9.5px] leading-tight font-bold tracking-[0.1em] text-brand-200 uppercase">
        Demo / Simulation — No Real Money
      </p>
    </div>
  )
}

/** Phone-width app column, centred on desktop with a contextual backdrop. */
export function MobileShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <ShellContext.Provider value={{ openMenu: () => setMenuOpen(true) }}>
      <div className="flex min-h-[100dvh] justify-center bg-[#e6eaf2]">
        {/* Desktop context panel */}
        <aside className="hidden w-[300px] shrink-0 flex-col justify-center py-10 pr-10 pl-8 xl:flex">
          <Wordmark size="lg" />
          <p className="mt-3 text-[13.5px] leading-relaxed font-medium text-muted">
            Complete Tasks. Manage Orders. Track Rewards.
          </p>
          <div className="tm-card mt-5 p-4">
            <p className="text-[11px] font-bold tracking-[0.08em] text-brand-700 uppercase">Demo notice</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              Every balance, reward and transaction in this build is generated for demonstration. No payment rails
              are connected, no deposit is ever required, and nothing here is withdrawable.
            </p>
          </div>
          <Link
            to="/admin"
            className="tm-card mt-3 flex items-center gap-2.5 p-3.5 transition-shadow hover:shadow-[var(--shadow-float)]"
          >
            <LogoMark size={28} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-navy">Admin Console</span>
              <span className="block text-[11.5px] text-muted">Desktop management interface</span>
            </span>
          </Link>
        </aside>

        {/* App column */}
        <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-canvas shadow-[0_0_60px_rgba(15,31,61,0.12)]">
          <DemoRibbon />
          <div ref={mainRef} className={cx('flex-1 overflow-x-hidden overflow-y-auto overscroll-contain')}>
            <Outlet />
          </div>
          <SupportFab />
          <BottomNav />
          <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
          <Toasts />
        </div>

        <div className="hidden w-[300px] shrink-0 xl:block" />
      </div>
    </ShellContext.Provider>
  )
}

/** Shell variant without bottom navigation (auth screens). */
export function PlainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] justify-center bg-[#e6eaf2]">
      <div className="relative flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-[0_0_60px_rgba(15,31,61,0.12)]">
        <DemoRibbon />
        <div className="flex-1 overflow-y-auto">{children}</div>
        <Toasts />
      </div>
    </div>
  )
}

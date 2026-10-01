import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Box,
  ClipboardList,
  Gift,
  Headset,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Smartphone,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { LogoMark } from '../layout/Logo'
import { Toasts } from '../ui/Toasts'
import { cx } from '../ui/primitives'
import { useApp } from '../../store/AppContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', Icon: Users },
  { to: '/admin/products', label: 'Products', Icon: ShoppingBag },
  { to: '/admin/orders', label: 'Orders', Icon: Package },
  { to: '/admin/packages', label: 'Packages', Icon: Truck },
  { to: '/admin/tasks', label: 'Tasks', Icon: ClipboardList },
  { to: '/admin/transactions', label: 'Transactions', Icon: Receipt },
  { to: '/admin/rewards', label: 'Rewards', Icon: Gift },
  { to: '/admin/withdrawals', label: 'Withdrawals', Icon: Wallet },
  { to: '/admin/notifications', label: 'Notifications', Icon: Bell },
  { to: '/admin/support', label: 'Support', Icon: Headset },
  { to: '/admin/reports', label: 'Reports', Icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
]

export function AdminShell() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))

  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      {/* Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col bg-navy text-white transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 px-4 py-4">
          <LogoMark size={30} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-tight font-extrabold tracking-[0.04em]">TASKMALL</p>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-brand-300 uppercase">Admin</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      'flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium transition-colors',
                      isActive ? 'bg-brand-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]' : 'text-white/65 hover:bg-white/8 hover:text-white',
                    )
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-2.5">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Smartphone size={16} /> Open User App
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'admin/logout' })
              navigate('/admin/login', { replace: true })
            }}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-navy/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-white/95 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy hover:bg-canvas lg:hidden"
          >
            <Menu size={19} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold text-navy">{current?.label ?? 'Admin'}</h1>
          </div>
          <span className="hidden rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-brand-700 uppercase sm:inline-flex">
            Simulated data
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
            AD
          </span>
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>

        <footer className="border-t border-hairline px-4 py-3 text-[11px] text-faint lg:px-6">
          TaskMall Admin · demo build. All figures are simulated — no payment rails are connected.
        </footer>
      </div>

      <Toasts />
    </div>
  )
}

/** Shared page heading for admin screens. */
export function AdminPageHeader({
  title,
  description,
  actions,
  icon: Icon = Box,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  icon?: typeof Box
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="tm-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-white">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[19px] leading-tight font-extrabold tracking-[-0.01em] text-navy">{title}</h2>
          {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

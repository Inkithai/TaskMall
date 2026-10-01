import { NavLink, useLocation } from 'react-router-dom'
import { Home, Package, Wallet, Users, User } from 'lucide-react'
import { cx } from '../ui/primitives'

const ITEMS = [
  { to: '/home', label: 'Home', Icon: Home, match: ['/home'] },
  { to: '/orders', label: 'Orders', Icon: Package, match: ['/orders', '/packages', '/products'] },
  { to: '/wallet', label: 'Wallet', Icon: Wallet, match: ['/wallet'] },
  { to: '/team', label: 'Team', Icon: Users, match: ['/team', '/rewards'] },
  { to: '/profile', label: 'Me', Icon: User, match: ['/profile', '/security', '/support', '/about'] },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="relative z-30 shrink-0 border-t border-hairline bg-white/95 backdrop-blur"
      style={{ boxShadow: 'var(--shadow-nav)' }}
      aria-label="Primary"
    >
      <ul className="flex items-stretch pb-[max(0px,env(safe-area-inset-bottom))]">
        {ITEMS.map(({ to, label, Icon, match }) => {
          const active = match.some((m) => pathname === m || pathname.startsWith(`${m}/`))
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className="flex flex-col items-center gap-[3px] px-1 pt-2 pb-1.5 transition-colors"
                aria-current={active ? 'page' : undefined}
              >
                <span className={cx('transition-transform duration-200', active && '-translate-y-px scale-110')}>
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? 'text-brand-600' : 'text-faint'}
                  />
                </span>
                <span
                  className={cx(
                    'text-[10.5px] leading-none font-semibold',
                    active ? 'text-brand-600' : 'text-faint',
                  )}
                >
                  {label}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

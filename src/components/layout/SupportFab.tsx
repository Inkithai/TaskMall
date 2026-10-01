import { Link, useLocation } from 'react-router-dom'
import { Headset } from 'lucide-react'

/**
 * Floating support button.
 *
 * Deliberately routes to TaskMall's own Help Centre rather than an external
 * messaging handle — an anonymous off-platform "agent" is a documented
 * task-scam pattern, so the demo keeps support in-product.
 */
export function SupportFab() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/support')) return null

  return (
    <Link
      to="/support"
      aria-label="Contact TaskMall Support"
      className="group absolute right-4 bottom-[76px] z-40 flex flex-col items-center gap-1"
    >
      <span className="tm-gradient tm-pulse-ring flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(37,99,235,0.42)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <Headset size={23} strokeWidth={2.2} />
      </span>
      <span className="rounded-full bg-white/95 px-2 py-[2px] text-[10px] font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
        Support
      </span>
    </Link>
  )
}

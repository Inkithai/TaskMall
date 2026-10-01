import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cx } from '../ui/primitives'

/**
 * Auto-rotating promo carousel, reproducing the banner stack the reference
 * platform shows at the top of its home tab. Two of the five slides carry
 * the demo's actual message (recruitment pays nothing; no real money) so the
 * carousel reads like the genre while telling the truth.
 */

interface Banner {
  key: string
  href: string
  glyph: string
  headlineSi: string
  headlineEn: string
  bodySi: string
  bodyEn: string
  gradient: string
}

const BANNERS: Banner[] = [
  {
    key: 'tasks',
    href: '/rent',
    glyph: '✅',
    headlineSi: 'කාර්ය සම්පූර්ණ කර ත්‍යාග ලබා ගන්න',
    headlineEn: 'Complete tasks. Track rewards.',
    bodySi: 'දිනපතා කාර්ය ස්ථාන විවෘත වේ',
    bodyEn: 'Daily task slots open',
    gradient: 'linear-gradient(120deg, #2563eb 0%, #1d4ed8 55%, #1b3a94 100%)',
  },
  {
    key: 'checkin',
    href: '/rewards',
    glyph: '🎁',
    headlineSi: 'දිනපතා පිවිසීමෙන් ත්‍යාග',
    headlineEn: 'Daily check-in streak',
    bodySi: 'දින 7ක ක්‍රියාකාරකම් ධාරාව',
    bodyEn: '7-day activity streak',
    gradient: 'linear-gradient(120deg, #f59e0b 0%, #ea8c00 55%, #c26a00 100%)',
  },
  {
    key: 'rent',
    href: '/rent',
    glyph: '🛍️',
    headlineSi: 'භාණ්ඩ කුලී ගෙවා ඇණවුම් ඉහළ නංවන්න',
    headlineEn: 'Rent products to boost orders',
    bodySi: 'අනුකරණයි — සැබෑ මුදල් නොමැත',
    bodyEn: 'Simulated — no real money',
    gradient: 'linear-gradient(120deg, #6366f1 0%, #4f46e5 55%, #3730a3 100%)',
  },
  {
    key: 'team',
    href: '/team',
    glyph: '👥',
    headlineSi: 'යාළුවන්ව කැඳවන්න — කිසිදු කොමිස් නැත',
    headlineEn: 'Invite friends — recruitment pays nothing',
    bodySi: 'බඳවා ගැනීමෙන් ආදායමක් නොලැබේ',
    bodyEn: 'Income from recruitment is a scam hallmark',
    gradient: 'linear-gradient(120deg, #0ea5e9 0%, #0284c7 55%, #075985 100%)',
  },
  {
    key: 'demo',
    href: '/about',
    glyph: '🛡️',
    headlineSi: 'මෙය ආදර්ශනයක් පමණි',
    headlineEn: 'This is a demo build',
    bodySi: 'සැබෑ මුදල් කිසිවිටෙක නොමැත',
    bodyEn: 'No real money, ever',
    gradient: 'linear-gradient(120deg, #334155 0%, #1e293b 55%, #0f172a 100%)',
  },
]

const AUTO_ADVANCE_MS = 4500

export function BannerCarousel() {
  const [index, setIndex] = useState(0)
  const paused = useRef(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % BANNERS.length)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="relative"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      role="region"
      aria-label="Promotions"
    >
      <div className="overflow-hidden rounded-2xl shadow-[0_10px_28px_rgba(9,18,42,0.35)] ring-1 ring-white/10">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {BANNERS.map((banner) => (
            <Link
              key={banner.key}
              to={banner.href}
              className="relative flex h-[128px] w-full shrink-0 flex-col justify-center px-4 active:brightness-95"
              style={{ backgroundImage: banner.gradient }}
              aria-label={`${banner.headlineEn} — ${banner.bodyEn}`}
            >
              {/* Soft decorative circles */}
              <span
                className="pointer-events-none absolute -top-10 -right-8 h-36 w-36 rounded-full bg-white/10"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -right-16 -bottom-14 h-40 w-40 rounded-full bg-white/5"
                aria-hidden
              />

              <div className="relative flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                  {banner.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15.5px] leading-snug font-extrabold text-white">{banner.headlineSi}</p>
                  <p className="mt-0.5 truncate text-[11.5px] font-semibold text-white/75">{banner.bodySi}</p>
                  <p className="mt-1 truncate text-[10.5px] font-medium tracking-wide text-white/55 uppercase">
                    {banner.headlineEn} · {banner.bodyEn}
                  </p>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                  <ChevronRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {BANNERS.map((banner, i) => (
          <button
            key={banner.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to banner ${i + 1}`}
            aria-current={i === index}
            className={cx(
              'h-[6px] rounded-full transition-all duration-300',
              i === index ? 'w-5 bg-white' : 'w-[6px] bg-white/40 hover:bg-white/60',
            )}
          />
        ))}
      </div>
    </div>
  )
}

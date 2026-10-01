import { useMemo } from 'react'
import { Megaphone } from 'lucide-react'
import { useLang } from '../../lib/i18n'
import { lkr } from '../../lib/format'

/**
 * Scrolling notice bar with an embedded withdrawal ticker — the marquee of
 * masked-name withdrawals is a signature design tell of the task-platform
 * genre (see docs/task-scam-red-flags.md, "Manufactured social proof").
 *
 * Here every ticker entry is explicitly tagged as simulated, and one of the
 * rotating announcements is the reminder that recruitment pays nothing. The
 * component reproduces the *look* while refusing to deceive.
 */

const TICKER_ENTRIES: { name: string; amount: number }[] = [
  { name: 'U***8821', amount: 12500 },
  { name: 'N***0932', amount: 4800 },
  { name: 'K***7710', amount: 26400 },
  { name: 'S***2284', amount: 7250 },
  { name: 'A***6653', amount: 68100 },
  { name: 'D***1178', amount: 3300 },
  { name: 'R***5540', amount: 15750 },
  { name: 'M***3396', amount: 9200 },
]

export function NoticeBar() {
  const { t, lang } = useLang()

  const items = useMemo(() => {
    const notices = [t('notice.a1'), t('notice.a2'), t('notice.a3')]
    const ticker = TICKER_ENTRIES.map(
      (e) => `${e.name} ${t('notice.withdrew')} ${lkr(e.amount)} · ${t('common.simulated')}`,
    )
    // Interleave announcements with ticker entries, then repeat the run so
    // the CSS marquee loop (-50% translate) is seamless.
    const run: string[] = []
    for (let i = 0; i < Math.max(notices.length, ticker.length); i++) {
      if (notices[i]) run.push(notices[i])
      if (ticker[i]) run.push(ticker[i])
    }
    return [...run, ...run]
  }, [t, lang])

  return (
    <div className="tm-card flex items-center gap-2.5 !rounded-full py-2 pr-4 pl-2.5">
      <span className="tm-gradient flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold text-white">
        <Megaphone size={12} />
        {t('notice.label')}
      </span>
      <div className="min-w-0 flex-1 overflow-hidden" aria-label={t('notice.label')}>
        <div className="tm-marquee">
          {items.map((text, i) => (
            <span key={i} className="flex items-center gap-2 px-3.5 text-[11.5px] font-medium text-muted">
              {text}
              <span className="h-1 w-1 rounded-full bg-faint" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

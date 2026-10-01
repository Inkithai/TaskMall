import { Check, Lock, ShieldCheck, Sparkles, X } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, SectionTitle, cx } from '../../components/ui/primitives'
import { Badge, DemoNotice } from '../../components/ui/Badge'
import { TierBadge } from '../../components/membership/TierBadge'
import { useApp } from '../../store/AppContext'
import { MEMBERSHIP_NEVER, MEMBERSHIP_TIERS, tierProgress } from '../../data/membership'
import { count } from '../../lib/format'

export default function Membership() {
  const { state } = useApp()
  const completed = state.lifetimeCompleted
  const progress = tierProgress(completed)
  const { current, next } = progress

  return (
    <div className="pb-24">
      <ScreenHeader title="Membership" />

      <div className="space-y-3 px-4 pt-3">
        {/* Current level */}
        <div
          className="relative overflow-hidden rounded-[16px] p-4 shadow-[var(--shadow-card)]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${current.gradient[0]}, ${current.gradient[1]})`,
            color: current.ink,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/10"
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase opacity-80">
                  Your level
                </p>
                <p className="mt-1 text-[26px] leading-none font-extrabold">{current.name}</p>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-bold">
                {progress.position} of {MEMBERSHIP_TIERS.length}
              </span>
            </div>

            <p className="mt-2.5 text-[11.5px] leading-relaxed opacity-90">{current.blurb}</p>

            <div className="mt-3.5 rounded-xl bg-white/15 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11.5px] font-semibold">
                  {count(completed)} completed orders
                </span>
                {next ? (
                  <span className="text-[11.5px] font-bold tnum">
                    {count(progress.remaining)} to {next.name}
                  </span>
                ) : (
                  <span className="text-[11.5px] font-bold">Top level reached</span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.round(progress.ratio * 100)}%` }}
                />
              </div>
              {next && (
                <p className="mt-1.5 text-[10.5px] opacity-80 tnum">
                  {count(progress.into)} / {count(progress.span)} orders into this level
                </p>
              )}
            </div>
          </div>
        </div>

        {/* How levels work */}
        <Card>
          <SectionTitle>How levels work</SectionTitle>
          <p className="text-[12.5px] leading-relaxed text-muted">
            Your level is calculated from one number: how many orders you have completed. It updates by
            itself. There is no application, no upgrade button and no payment — because there is nothing
            to pay for.
          </p>

          <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-extrabold text-brand-800">
              <ShieldCheck size={14} className="shrink-0" />A level never
            </p>
            <ul className="mt-1.5 space-y-1">
              {MEMBERSHIP_NEVER.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-brand-800">
                  <X size={12} className="mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Ladder */}
        <div>
          <SectionTitle>All levels</SectionTitle>
          <div className="space-y-2.5">
            {MEMBERSHIP_TIERS.map((tier) => {
              const unlocked = completed >= tier.threshold
              const isCurrent = tier.key === current.key
              return (
                <Card
                  key={tier.key}
                  className={cx(
                    '!p-0 overflow-hidden transition-shadow',
                    isCurrent && 'ring-2 ring-brand-500',
                  )}
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-2.5"
                    style={{
                      backgroundImage: unlocked
                        ? `linear-gradient(135deg, ${tier.gradient[0]}, ${tier.gradient[1]})`
                        : undefined,
                      color: unlocked ? tier.ink : undefined,
                    }}
                  >
                    <span
                      className={cx(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        unlocked ? 'bg-white/20' : 'bg-canvas text-faint',
                      )}
                    >
                      {unlocked ? <Check size={14} /> : <Lock size={13} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cx('text-[14px] font-extrabold', !unlocked && 'text-navy')}>
                        {tier.name}
                      </p>
                      <p className={cx('text-[10.5px]', unlocked ? 'opacity-85' : 'text-muted')}>
                        {tier.threshold === 0
                          ? 'From your first day'
                          : `${count(tier.threshold)} completed orders`}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[9.5px] font-bold">
                        Current
                      </span>
                    )}
                    {!unlocked && (
                      <Badge tone="muted" className="shrink-0">
                        Locked
                      </Badge>
                    )}
                  </div>

                  <ul className="divide-y divide-hairline">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 px-4 py-2.5">
                        <Sparkles
                          size={13}
                          className={cx('mt-0.5 shrink-0', unlocked ? 'text-brand-600' : 'text-faint')}
                        />
                        <span className={cx('text-[12px] leading-relaxed', unlocked ? 'text-navy' : 'text-muted')}>
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>

        <Card>
          <SectionTitle>Your badge</SectionTitle>
          <p className="text-[12.5px] leading-relaxed text-muted">
            This is what other members see next to your name on the team list.
          </p>
          <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-canvas px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-[12px] font-extrabold text-white">
              {state.user.avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-navy">{state.user.name}</p>
              <p className="truncate text-[11px] tnum text-muted">{state.user.id}</p>
            </div>
            <TierBadge tier={current} />
          </div>
        </Card>

        <DemoNotice>
          Levels, perks and order counts here are simulated. Nothing on this screen involves money, and
          no level can be purchased.
        </DemoNotice>
      </div>
    </div>
  )
}

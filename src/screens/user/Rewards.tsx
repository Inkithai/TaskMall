import { Check, ChevronRight, Flame, Gift, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, SectionTitle, cx } from '../../components/ui/primitives'
import { Badge, DemoNotice } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/Progress'
import { useApp } from '../../store/AppContext'
import { lkr } from '../../lib/format'
import { TierBadge } from '../../components/membership/TierBadge'
import { tierFor, tierProgress } from '../../data/membership'

export default function Rewards() {
  const { state, dispatch, toast } = useApp()
  const claimedDays = state.dailyCheckIn.filter((d) => d.claimed).length
  const nextDay = state.dailyCheckIn.find((d) => !d.claimed)
  const tier = tierFor(state.lifetimeCompleted)
  const tierInfo = tierProgress(state.lifetimeCompleted)

  function claim(day: number, label: string) {
    dispatch({ type: 'rewards/claim', day })
    toast({ title: `Day ${day} claimed`, body: `Simulated bonus of ${lkr(Number(label.replace('+', '')))}.`, tone: 'ok' })
  }

  return (
    <div className="pb-24">
      <ScreenHeader title="Rewards" />

      <div className="space-y-3 px-4 pt-3">
        {/* Membership level */}
        <Link to="/membership" className="block">
          <Card className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${tier.gradient[0]}, ${tier.gradient[1]})` }}
            >
              {tier.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[13.5px] font-extrabold text-navy">{tier.name} member</p>
                <TierBadge tier={tier} size="sm" />
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                {tierInfo.next
                  ? `${tierInfo.remaining} more completed orders to reach ${tierInfo.next.name}`
                  : 'Top level reached'}
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-faint" />
          </Card>
        </Link>

        {/* Daily activity */}
        <Card>
          <SectionTitle action={<Badge tone="info">{claimedDays}/7 days</Badge>}>Daily Activity</SectionTitle>

          <div className="grid grid-cols-4 gap-2">
            {state.dailyCheckIn.map((day) => {
              const isNext = nextDay?.day === day.day
              return (
                <div
                  key={day.day}
                  className={cx(
                    'relative rounded-xl border py-2.5 text-center transition-all',
                    day.claimed
                      ? 'border-ok/30 bg-ok-soft'
                      : isNext
                        ? 'border-brand-400 bg-brand-50 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                        : 'border-hairline bg-white',
                  )}
                >
                  <span
                    className={cx(
                      'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                      day.claimed ? 'bg-ok text-white' : isNext ? 'bg-brand-600 text-white' : 'bg-[#eef1f6] text-faint',
                    )}
                  >
                    {day.claimed ? <Check size={14} strokeWidth={3} /> : isNext ? <Gift size={13} /> : <Lock size={12} />}
                  </span>
                  <p
                    className={cx(
                      'mt-1.5 text-[11px] font-bold',
                      day.claimed ? 'text-ok' : isNext ? 'text-brand-700' : 'text-muted',
                    )}
                  >
                    Day {day.day}
                  </p>
                  <p className="text-[10px] tnum text-faint">{day.rewardLabel}</p>
                </div>
              )
            })}
          </div>

          {nextDay ? (
            <Button
              block
              className="mt-3.5"
              onClick={() => claim(nextDay.day, nextDay.rewardLabel)}
              icon={<Gift size={16} />}
            >
              Claim Day {nextDay.day} · {nextDay.rewardLabel} simulated
            </Button>
          ) : (
            <p className="mt-3.5 rounded-xl bg-ok-soft py-2.5 text-center text-[12.5px] font-semibold text-ok">
              All seven days claimed — the cycle resets tomorrow.
            </p>
          )}

          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            Daily bonuses are small simulated credits. They are not income, and they cannot be withdrawn.
          </p>
        </Card>

        {/* Achievements */}
        <div>
          <SectionTitle>Achievements</SectionTitle>
          <div className="space-y-2.5">
            {state.achievements.map((a) => {
              const unlocked = a.progress >= a.target
              const ratio = Math.min(1, a.progress / a.target)
              return (
                <Card key={a.id} className="!p-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cx(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-[22px]',
                        unlocked ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]' : 'bg-canvas grayscale',
                      )}
                    >
                      {a.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13.5px] font-bold text-navy">{a.title}</p>
                        {unlocked && <Badge tone="ok">Unlocked</Badge>}
                      </div>
                      <p className="truncate text-[11.5px] text-muted">{a.description}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar
                          value={Math.min(a.progress, a.target)}
                          max={a.target}
                          height={6}
                          tone={unlocked ? 'ok' : 'brand'}
                          className="flex-1"
                        />
                        <span className="shrink-0 text-[10.5px] font-bold tnum text-muted">
                          {Math.min(a.progress, a.target)}/{a.target}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!unlocked && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-faint">
                      <Flame size={12} />
                      {a.target - a.progress} more {a.target - a.progress === 1 ? 'task' : 'tasks'} to unlock ·{' '}
                      {(ratio * 100).toFixed(0)}% complete
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        <Card>
          <SectionTitle>Lifetime Activity</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-canvas py-3 text-center">
              <p className="text-[20px] leading-none font-extrabold tnum text-navy">{state.lifetimeCompleted}</p>
              <p className="mt-1 text-[10.5px] font-semibold text-muted">Tasks completed</p>
            </div>
            <div className="rounded-xl bg-canvas py-3 text-center">
              <p className="text-[20px] leading-none font-extrabold tnum text-reward">
                {lkr(state.transactions.filter((t) => t.type === 'reward').reduce((s, t) => s + t.amount, 0))}
              </p>
              <p className="mt-1 text-[10.5px] font-semibold text-muted">Simulated rewards</p>
            </div>
          </div>
        </Card>

        <DemoNotice>
          Streaks, levels and achievement badges are gamification patterns commonly used by fraudulent task platforms
          to drive engagement. They are reproduced here, clearly labelled, for demonstration and research only.
        </DemoNotice>
      </div>
    </div>
  )
}

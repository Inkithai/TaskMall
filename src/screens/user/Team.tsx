import { useMemo, useState } from 'react'
import { Check, Copy, Share2, ShieldAlert, Users } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Card, SectionTitle, cx } from '../../components/ui/primitives'
import { Badge } from '../../components/ui/Badge'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import { dateShort } from '../../lib/format'

type Filter = 'all' | 'active' | 'inactive' | 'l1' | 'l2' | 'l3'

export default function Team() {
  const { state, toast } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [copied, setCopied] = useState(false)

  const summary = useMemo(
    () => ({
      total: state.team.length,
      active: state.team.filter((m) => m.status === 'active').length,
      inactive: state.team.filter((m) => m.status === 'inactive').length,
    }),
    [state.team],
  )

  const visible = useMemo(
    () =>
      state.team.filter((m) => {
        if (filter === 'all') return true
        if (filter === 'active' || filter === 'inactive') return m.status === filter
        return m.level === Number(filter.slice(1))
      }),
    [state.team, filter],
  )

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(state.user.invitationCode)
    } catch {
      /* clipboard unavailable — the code is visible on screen anyway */
    }
    setCopied(true)
    toast({ title: 'Invitation code copied', tone: 'ok' })
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function share() {
    const text = `Join me on TaskMall (demo) with invitation code ${state.user.invitationCode}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TaskMall', text })
        return
      } catch {
        /* user dismissed the share sheet */
      }
    }
    toast({ title: 'Sharing simulated', body: 'No invitation was actually sent.', tone: 'info' })
  }

  return (
    <div className="pb-24">
      <ScreenHeader title="My Team" />

      <div className="space-y-3 px-4 pt-3">
        {/* Summary */}
        <Card>
          <SectionTitle>Team Members</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Team Members', value: summary.total, tone: 'navy' },
              { label: 'Active', value: summary.active, tone: 'ok' },
              { label: 'Inactive', value: summary.inactive, tone: 'muted' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-canvas py-3 text-center">
                <p
                  className={cx(
                    'text-[22px] leading-none font-extrabold tnum',
                    s.tone === 'ok' && 'text-ok',
                    s.tone === 'muted' && 'text-muted',
                    s.tone === 'navy' && 'text-navy',
                  )}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-[10.5px] font-semibold text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Invitation */}
        <div className="tm-gradient relative overflow-hidden rounded-[18px] p-4 text-white">
          <div className="pointer-events-none absolute -right-8 -bottom-10 h-32 w-32 rounded-full bg-white/10" aria-hidden />
          <div className="relative">
            <p className="text-[10.5px] font-bold tracking-[0.1em] text-brand-100 uppercase">Your Invitation Code</p>
            <p className="mt-1.5 text-[26px] leading-none font-extrabold tracking-[0.06em] tnum">
              {state.user.invitationCode}
            </p>
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white text-[13px] font-bold text-brand-700 transition-transform active:scale-[0.98]"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={share}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white/15 text-[13px] font-bold text-white backdrop-blur-sm transition-transform active:scale-[0.98]"
              >
                <Share2 size={15} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Honest framing */}
        <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
          <ShieldAlert size={15} className="mt-px shrink-0 text-brand-700" />
          <p className="text-[11px] leading-relaxed text-brand-800">
            <strong className="font-extrabold">No recruitment earnings.</strong> Inviting people does not pay you a
            commission, a percentage of their activity, or any guaranteed return. Team structure here is organisational
            only — promises of income from recruitment are a hallmark of task scams.
          </p>
        </div>

        {/* Members */}
        <div>
          <SectionTitle>Members</SectionTitle>
          <ChipRail
            className="mb-2.5"
            value={filter}
            onChange={setFilter}
            items={[
              { key: 'all' as Filter, label: `All ${summary.total}` },
              { key: 'active' as Filter, label: `Active ${summary.active}` },
              { key: 'inactive' as Filter, label: `Inactive ${summary.inactive}` },
              { key: 'l1' as Filter, label: 'Level 1' },
              { key: 'l2' as Filter, label: 'Level 2' },
              { key: 'l3' as Filter, label: 'Level 3' },
            ]}
          />

          <Card className="!p-0">
            <ul className="divide-y divide-hairline">
              {visible.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                    {member.name.replace('User ', '')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-navy">{member.name}</p>
                    <p className="text-[11px] text-muted">
                      Level {member.level} · joined {dateShort(member.joined)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={member.status === 'active' ? 'ok' : 'muted'} dot>
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <p className="mt-1 text-[10px] tnum text-faint">{member.tasksCompleted} tasks</p>
                  </div>
                </li>
              ))}
              {visible.length === 0 && (
                <li className="px-4 py-8 text-center text-[13px] text-muted">
                  <Users size={22} className="mx-auto mb-2 text-faint" />
                  No members match this filter.
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

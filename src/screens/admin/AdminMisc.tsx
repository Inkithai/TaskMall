import { useState } from 'react'
import { Bell, Gift, RotateCcw, Save, Send, Settings as SettingsIcon, ShieldAlert } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { Panel, StatCard } from '../../components/admin/DataTable'
import { Button, Card, DataRow, Field, SectionTitle, SelectField, Toggle, cx } from '../../components/ui/primitives'
import { Badge, DemoNotice, SimulatedTag } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/Progress'
import { useApp } from '../../store/AppContext'
import { count, dateTimeFull, lkr, relative } from '../../lib/format'
import { demoNow } from '../../lib/clock'

/* --------------------------------- Rewards -------------------------------- */

export function AdminRewards() {
  const { state } = useApp()
  const rewardTx = state.transactions.filter((t) => t.type === 'reward')
  const totalRewards = rewardTx.reduce((s, t) => s + t.amount, 0)
  const claimedDays = state.dailyCheckIn.filter((d) => d.claimed).length

  return (
    <div>
      <AdminPageHeader
        icon={Gift}
        title="Rewards"
        description="Daily activity programme, achievements and issued simulated rewards"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Reward entries" value={count(rewardTx.length)} tone="brand" icon={<Gift size={18} />} />
        <StatCard label="Total issued" value={lkr(totalRewards)} tone="ok" />
        <StatCard label="Daily streak" value={`${claimedDays}/7`} tone="pending" />
        <StatCard label="Achievements" value={count(state.achievements.length)} tone="navy" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Daily activity programme">
          <div className="grid grid-cols-7 gap-1.5">
            {state.dailyCheckIn.map((d) => (
              <div
                key={d.day}
                className={cx(
                  'rounded-lg py-2.5 text-center',
                  d.claimed ? 'bg-ok-soft text-ok' : 'bg-canvas text-muted',
                )}
              >
                <p className="text-[10px] font-bold">D{d.day}</p>
                <p className="mt-0.5 text-[11px] font-bold tnum">{d.rewardLabel}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
            Streak programmes drive repeat engagement. In a production system this must never be tied to a deposit
            requirement or an escalating "unlock" tier.
          </p>
        </Panel>

        <Panel title="Achievements">
          <ul className="space-y-3">
            {state.achievements.map((a) => (
              <li key={a.id}>
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="font-semibold text-navy">
                    {a.icon} {a.title}
                  </span>
                  <span className="tnum text-muted">
                    {Math.min(a.progress, a.target)}/{a.target}
                  </span>
                </div>
                <ProgressBar
                  className="mt-1.5"
                  height={6}
                  value={Math.min(a.progress, a.target)}
                  max={a.target}
                  tone={a.progress >= a.target ? 'ok' : 'brand'}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title="Recent reward entries">
          <ul className="divide-y divide-hairline">
            {rewardTx.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-soft text-brand-700">
                  <Gift size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-navy">{t.title}</p>
                  {t.reference && <p className="truncate text-[11px] tnum text-muted">#{t.reference}</p>}
                </div>
                <span className="shrink-0 text-[12.5px] font-bold tnum text-reward">{lkr(t.amount)}</span>
                <span className="hidden shrink-0 text-[11px] tnum text-faint sm:block">{dateTimeFull(t.at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

/* ------------------------------ Notifications ----------------------------- */

export function AdminNotifications() {
  const { state, toast } = useApp()
  const [form, setForm] = useState({ title: '', body: '', audience: 'All users' })

  return (
    <div>
      <AdminPageHeader icon={Bell} title="Notifications" description="Broadcasts and the live notification feed" />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_380px]">
        <Panel title="Notification feed" action={<Badge tone="info">{state.notifications.length} items</Badge>}>
          <ul className="divide-y divide-hairline">
            {state.notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-3">
                <span
                  className={cx(
                    'mt-1 h-2 w-2 shrink-0 rounded-full',
                    n.read ? 'bg-[#d6dde8]' : 'bg-brand-600',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-navy">{n.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{n.body}</p>
                  <p className="mt-1 text-[10.5px] text-faint">
                    {n.kind} · {relative(n.at, demoNow())}
                  </p>
                </div>
                <Badge tone={n.read ? 'muted' : 'info'}>{n.read ? 'Read' : 'Unread'}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-3">
          <Panel title="Send a broadcast">
            <div className="space-y-3">
              <Field
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Scheduled maintenance"
              />
              <div>
                <label className="tm-label" htmlFor="broadcast-body">
                  Message
                </label>
                <textarea
                  id="broadcast-body"
                  rows={4}
                  className="tm-field resize-none"
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="What should users know?"
                />
              </div>
              <SelectField
                label="Audience"
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
              >
                <option>All users</option>
                <option>Active users</option>
                <option>Users with pending tasks</option>
                <option>Level 2 and above</option>
              </SelectField>
              <Button
                block
                icon={<Send size={15} />}
                onClick={() => {
                  toast({
                    title: 'Broadcast simulated',
                    body: 'No message was delivered — this console has no backend.',
                    tone: 'info',
                  })
                  setForm({ title: '', body: '', audience: 'All users' })
                }}
              >
                Send broadcast
              </Button>
            </div>
          </Panel>

          <DemoNotice>
            Broadcasts are not delivered. A live deployment must never use notifications to pressure users into
            deposits or time-limited "unlock" offers.
          </DemoNotice>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Settings -------------------------------- */

export function AdminSettings() {
  const { state, dispatch, toast } = useApp()
  const [settings, setSettings] = useState({
    platformName: 'TaskMall',
    currency: 'LKR',
    dailyTarget: 15,
    effectiveHours: 24,
    maxRecharge: 500000,
    simulationBanner: true,
    requireDeposit: false,
    externalSupport: false,
    recruitmentCommission: false,
  })

  return (
    <div>
      <AdminPageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Platform configuration and safety controls"
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="General">
          <div className="space-y-3">
            <Field
              label="Platform name"
              value={settings.platformName}
              onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
            />
            <SelectField
              label="Display currency"
              value={settings.currency}
              onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
            >
              <option>LKR</option>
              <option>USD</option>
              <option>EUR</option>
            </SelectField>
            <Field
              label="Daily task target"
              type="number"
              value={settings.dailyTarget}
              onChange={(e) => setSettings((s) => ({ ...s, dailyTarget: Number(e.target.value) }))}
            />
            <Field
              label="Default effective time (hours)"
              type="number"
              value={settings.effectiveHours}
              onChange={(e) => setSettings((s) => ({ ...s, effectiveHours: Number(e.target.value) }))}
            />
            <Field
              label="Maximum simulated recharge"
              type="number"
              value={settings.maxRecharge}
              onChange={(e) => setSettings((s) => ({ ...s, maxRecharge: Number(e.target.value) }))}
            />
            <Button
              block
              icon={<Save size={15} />}
              onClick={() => toast({ title: 'Settings saved', body: 'Stored locally for this demo.', tone: 'ok' })}
            >
              Save settings
            </Button>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Safety controls">
            <ul className="divide-y divide-hairline">
              {[
                {
                  key: 'simulationBanner' as const,
                  label: 'Show simulation banner',
                  description: 'Display the DEMO / SIMULATION strip across the user app.',
                  locked: false,
                },
                {
                  key: 'requireDeposit' as const,
                  label: 'Require deposit to unlock tasks',
                  description: 'Permanently disabled — this is a documented task-scam mechanism.',
                  locked: true,
                },
                {
                  key: 'externalSupport' as const,
                  label: 'Route support to an external handler',
                  description: 'Permanently disabled — support stays in-app.',
                  locked: true,
                },
                {
                  key: 'recruitmentCommission' as const,
                  label: 'Pay commission for recruitment',
                  description: 'Permanently disabled — no earnings from inviting people.',
                  locked: true,
                },
              ].map((row) => (
                <li key={row.key} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-navy">
                      {row.label}
                      {row.locked && (
                        <Badge tone="danger" className="!px-1.5 !text-[9px]">
                          Locked off
                        </Badge>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{row.description}</p>
                  </div>
                  <Toggle
                    checked={settings[row.key]}
                    label={row.label}
                    onChange={(v) => {
                      if (row.locked) {
                        toast({
                          title: 'Blocked by design',
                          body: 'This control is intentionally hard-disabled in TaskMall.',
                          tone: 'danger',
                        })
                        return
                      }
                      setSettings((s) => ({ ...s, [row.key]: v }))
                    }}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
              <ShieldAlert size={14} className="mt-px shrink-0 text-brand-700" />
              <p className="text-[11px] leading-relaxed text-brand-800">
                These three switches exist to make the design position explicit: the mechanics most associated with
                task-scam fraud are not implementable in this build.
              </p>
            </div>
          </Panel>

          <Card>
            <SectionTitle>Dataset</SectionTitle>
            <div className="divide-y divide-hairline">
              <DataRow label="Orders" value={count(state.orders.length)} />
              <DataRow label="Products" value={count(state.products.length)} />
              <DataRow label="Ledger entries" value={count(state.transactions.length)} />
              <DataRow label="Users (table)" value={count(state.adminUsers.length)} />
              <DataRow label="Storage" value="Browser localStorage" />
            </div>
            <Button
              variant="outline"
              block
              className="mt-3"
              icon={<RotateCcw size={15} />}
              onClick={() => {
                dispatch({ type: 'demo/reset' })
                toast({ title: 'Demo data regenerated', tone: 'ok' })
              }}
            >
              Reset demo data
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

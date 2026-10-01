import { useState } from 'react'
import { KeyRound, Laptop, LogIn, Monitor, Shield, Smartphone, Tablet, XCircle } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, Field, SectionTitle, Toggle, cx } from '../../components/ui/primitives'
import { Badge } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { useApp } from '../../store/AppContext'
import { dateTimeFull, relative } from '../../lib/format'
import { demoNow } from '../../lib/clock'

function deviceIcon(device: string) {
  const d = device.toLowerCase()
  if (d.includes('android') || d.includes('iphone') || d.includes('mobile')) return Smartphone
  if (d.includes('ipad') || d.includes('tablet')) return Tablet
  if (d.includes('mac') || d.includes('windows') || d.includes('pc')) return Monitor
  return Laptop
}

export default function Security() {
  const { state, dispatch, toast } = useApp()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')

  const daysSincePassword = Math.max(
    0,
    Math.round((demoNow().getTime() - new Date(state.user.passwordChangedAt).getTime()) / 86_400_000),
  )

  function changePassword() {
    if (form.next.length < 6) return setError('New password must be at least 6 characters')
    if (form.next !== form.confirm) return setError('Passwords do not match')
    setError('')
    dispatch({ type: 'profile/changePassword' })
    setPasswordOpen(false)
    setForm({ current: '', next: '', confirm: '' })
    toast({ title: 'Password updated', body: 'Simulated — nothing was sent anywhere.', tone: 'ok' })
  }

  return (
    <div className="pb-24">
      <ScreenHeader title="Security" />

      <div className="space-y-3 px-4 pt-3">
        {/* Password */}
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-brand-50 text-brand-600">
              <KeyRound size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-navy">Password</p>
              <p className="text-[11.5px] text-muted">
                Last changed {daysSincePassword} {daysSincePassword === 1 ? 'day' : 'days'} ago
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setPasswordOpen(true)}>
              Change
            </Button>
          </div>
        </Card>

        {/* 2FA */}
        <Card>
          <div className="flex items-center gap-3">
            <span
              className={cx(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]',
                state.user.twoFactor ? 'bg-ok-soft text-ok' : 'bg-[#eef1f6] text-muted',
              )}
            >
              <Shield size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-navy">Two-Factor Authentication</p>
              <p className="text-[11.5px] text-muted">
                {state.user.twoFactor ? 'Enabled — code required at sign-in' : 'Disabled'}
              </p>
            </div>
            <Toggle
              checked={state.user.twoFactor}
              label="Two-factor authentication"
              onChange={() => {
                dispatch({ type: 'profile/toggle2fa' })
                toast({
                  title: state.user.twoFactor ? '2FA disabled' : '2FA enabled',
                  tone: state.user.twoFactor ? 'info' : 'ok',
                })
              }}
            />
          </div>
        </Card>

        {/* Sessions */}
        <div>
          <SectionTitle>Active Sessions</SectionTitle>
          <Card className="!p-0">
            <ul className="divide-y divide-hairline">
              {state.sessions.map((s) => {
                const Icon = deviceIcon(s.device)
                return (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-canvas text-muted">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-navy">
                        {s.browser} / {s.device}
                      </p>
                      <p className="truncate text-[11px] text-muted">{s.location}</p>
                      <p className="text-[10.5px] text-faint">
                        {s.current ? 'Current session' : `Last active ${relative(s.lastActive, demoNow())}`}
                      </p>
                    </div>
                    {s.current ? (
                      <Badge tone="ok" dot>
                        Current
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'profile/revokeSession', id: s.id })
                          toast({ title: 'Session revoked', tone: 'info' })
                        }}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-semibold text-danger transition-colors hover:bg-danger-soft"
                      >
                        <XCircle size={13} /> Revoke
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>

        {/* Login history */}
        <div>
          <SectionTitle>Login History</SectionTitle>
          <Card className="!p-0">
            <ul className="divide-y divide-hairline">
              {state.loginHistory.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={cx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      e.result === 'success' ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger',
                    )}
                  >
                    <LogIn size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-navy">{e.device}</p>
                    <p className="truncate text-[11px] text-muted">
                      {e.location} · <span className="tnum">{e.ip}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={e.result === 'success' ? 'ok' : 'danger'}>
                      {e.result === 'success' ? 'Success' : 'Blocked'}
                    </Badge>
                    <p className="mt-0.5 text-[10px] tnum text-faint">{dateTimeFull(e.at).split(',')[0]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Device management */}
        <Card>
          <SectionTitle>Device Management</SectionTitle>
          <p className="text-[12px] leading-relaxed text-muted">
            Devices that have signed in to this account appear above. Revoking a session signs that device out
            immediately. In this demo the action only updates local state.
          </p>
          <Button
            variant="outline"
            block
            className="mt-3"
            onClick={() => {
              state.sessions.filter((s) => !s.current).forEach((s) => dispatch({ type: 'profile/revokeSession', id: s.id }))
              toast({ title: 'All other devices signed out', tone: 'info' })
            }}
            disabled={state.sessions.filter((s) => !s.current).length === 0}
          >
            Sign out all other devices
          </Button>
        </Card>

        <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-[11px] leading-relaxed text-brand-800">
          <strong className="font-extrabold">Security reminder.</strong> TaskMall support will never ask for your
          password, a one-time code, or a payment to unlock your account or release a balance.
        </div>
      </div>

      <Sheet
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={changePassword}>Update</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field
            label="Current password"
            type="password"
            name="current"
            value={form.current}
            onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
            placeholder="••••••••"
          />
          <Field
            label="New password"
            type="password"
            name="next"
            value={form.next}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
            placeholder="At least 6 characters"
          />
          <Field
            label="Confirm new password"
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            placeholder="Re-enter the new password"
            error={error || undefined}
          />
        </div>
      </Sheet>
    </div>
  )
}

import { useState } from 'react'
import { Banknote, Check, Globe, Plus, Smartphone, Star } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, Field, SectionTitle, Toggle, cx } from '../../components/ui/primitives'
import { Badge, DemoNotice } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'
import type { UserProfile } from '../../data/types'
import { dateShort } from '../../lib/format'

/* ----------------------------- Personal info ---------------------------- */

export function PersonalInformation() {
  const { state, dispatch, toast } = useApp()
  const [form, setForm] = useState({
    name: state.user.name,
    email: state.user.email,
    phone: state.user.phone,
  })

  return (
    <div className="pb-24">
      <ScreenHeader title="Personal Information" />
      <div className="space-y-3 px-4 pt-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="tm-gradient flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white">
              {state.user.avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-bold text-navy">{state.user.name}</p>
              <p className="text-[11.5px] tnum text-muted">{state.user.id}</p>
              <div className="mt-1">
                <Badge tone="ok" dot>
                  {state.user.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Details</SectionTitle>
          <div className="space-y-3">
            <Field
              label="Full name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Field
              label="Mobile number"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <Button
            block
            className="mt-4"
            onClick={() => {
              dispatch({
                type: 'profile/update',
                patch: {
                  ...form,
                  avatarInitials:
                    form.name
                      .split(' ')
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'TM',
                },
              })
              toast({ title: 'Profile updated', tone: 'ok' })
            }}
          >
            Save changes
          </Button>
        </Card>

        <Card>
          <SectionTitle>Account</SectionTitle>
          <div className="divide-y divide-hairline text-[13px]">
            <div className="flex justify-between py-2">
              <span className="text-muted">Member since</span>
              <span className="font-semibold tnum text-navy">{dateShort(state.user.joined)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted">Level</span>
              <span className="font-semibold tnum text-navy">Level {state.user.level}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted">Invited by</span>
              <span className="font-semibold tnum text-navy">{state.user.invitedBy ?? '—'}</span>
            </div>
          </div>
        </Card>

        <DemoNotice>Profile changes are stored only in this browser.</DemoNotice>
      </div>
    </div>
  )
}

/* ---------------------------- Payment methods --------------------------- */

export function PaymentMethods() {
  const { state, toast } = useApp()

  return (
    <div className="pb-24">
      <ScreenHeader title="Payment Methods" />
      <div className="space-y-3 px-4 pt-3">
        <DemoNotice>
          These entries are placeholders used by the withdrawal simulation. No payment credentials are collected,
          stored or transmitted — and TaskMall never requires a deposit.
        </DemoNotice>

        <div className="space-y-2.5">
          {state.paymentMethods.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-3">
                <span
                  className={cx(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]',
                    m.kind === 'bank' ? 'bg-brand-50 text-brand-600' : 'bg-ok-soft text-ok',
                  )}
                >
                  {m.kind === 'bank' ? <Banknote size={19} /> : <Smartphone size={19} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13.5px] font-bold text-navy">{m.label}</p>
                    {m.primary && (
                      <Badge tone="info" className="!px-1.5">
                        <Star size={9} className="fill-current" /> Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-[12px] tnum text-muted">{m.account}</p>
                  <p className="text-[11px] text-faint">{m.holder}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          block
          icon={<Plus size={16} />}
          onClick={() => toast({ title: 'Disabled in demo', body: 'No payment credentials are collected.', tone: 'info' })}
        >
          Add payment method
        </Button>
      </div>
    </div>
  )
}

/* -------------------------- Notification settings ------------------------ */

type PrefKey = keyof UserProfile['notificationPrefs']

const PREFS: { key: PrefKey; label: string; description: string }[] = [
  { key: 'newTasks', label: 'New tasks', description: 'When a new simulated order becomes available' },
  { key: 'orderUpdates', label: 'Order updates', description: 'Status changes on your orders' },
  { key: 'packageUpdates', label: 'Package updates', description: 'Tracking events for your packages' },
  { key: 'walletActivity', label: 'Wallet activity', description: 'Rewards, recharges and withdrawals' },
  { key: 'teamActivity', label: 'Team activity', description: 'When a team member joins or becomes active' },
  { key: 'productNews', label: 'Product news', description: 'Catalogue additions and announcements' },
]

export function NotificationSettings() {
  const { state, dispatch } = useApp()
  const prefs = state.user.notificationPrefs

  return (
    <div className="pb-24">
      <ScreenHeader title="Notifications" />
      <div className="space-y-3 px-4 pt-3">
        <Card className="!p-0">
          <ul className="divide-y divide-hairline">
            {PREFS.map((p) => (
              <li key={p.key} className="flex items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-navy">{p.label}</p>
                  <p className="text-[11.5px] text-muted">{p.description}</p>
                </div>
                <Toggle
                  checked={prefs[p.key]}
                  label={p.label}
                  onChange={(v) =>
                    dispatch({ type: 'profile/update', patch: { notificationPrefs: { ...prefs, [p.key]: v } } })
                  }
                />
              </li>
            ))}
          </ul>
        </Card>
        <p className="px-1 text-[11px] leading-relaxed text-faint">
          Preferences affect the in-app notification feed only. No push notifications or emails are sent.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------- Language ------------------------------- */

const LANGUAGES = ['English', 'සිංහල (Sinhala)', 'தமிழ் (Tamil)', 'Bahasa Indonesia', 'Español']

export function Language() {
  const { state, dispatch, toast } = useApp()

  return (
    <div className="pb-24">
      <ScreenHeader title="Language" />
      <div className="space-y-3 px-4 pt-3">
        <Card className="!p-0">
          <ul className="divide-y divide-hairline">
            {LANGUAGES.map((lang) => {
              const active = state.user.language === lang
              return (
                <li key={lang}>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'profile/update', patch: { language: lang } })
                      toast({
                        title: 'Language preference saved',
                        body: 'The demo interface remains in English.',
                        tone: 'info',
                      })
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-canvas"
                  >
                    <Globe size={16} className={active ? 'text-brand-600' : 'text-faint'} />
                    <span className={cx('flex-1 text-[13.5px]', active ? 'font-bold text-navy' : 'text-ink')}>
                      {lang}
                    </span>
                    {active && <Check size={17} className="text-brand-600" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
        <p className="px-1 text-[11px] text-faint">Only English copy is bundled in this prototype.</p>
      </div>
    </div>
  )
}

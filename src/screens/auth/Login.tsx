import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Globe, Lock, ShieldCheck } from 'lucide-react'
import { PlainShell } from '../../components/layout/MobileShell'
import { Wordmark } from '../../components/layout/Logo'
import { Button, Field } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'
import { useLang } from '../../lib/i18n'

const DEMO_PHONE = '071 234 2938'
const DEMO_PASSWORD = 'taskmall'

/**
 * Phone-number login, mirroring the reference platform: a fixed +94 country
 * code, Sinhala-first field copy, "Log in now" CTA and a "No account?
 * Register" link. Any values sign you in — nothing is validated anywhere.
 */
export default function Login() {
  const { state, dispatch, toast } = useApp()
  const { t, lang, setLang } = useLang()
  const navigate = useNavigate()
  const [phone, setPhone] = useState(state.auth.remembered ?? DEMO_PHONE)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [remember, setRemember] = useState(Boolean(state.auth.remembered))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return setError(t('login.errorPhone'))
    if (password.length < 4) return setError(t('login.errorPassword'))
    setError('')
    dispatch({ type: 'auth/login', identifier: phone.trim(), remember })
    toast({ title: t('login.toastTitle'), body: t('login.toastBody'), tone: 'ok' })
    navigate('/home', { replace: true })
  }

  return (
    <PlainShell>
      <div className="relative flex min-h-full flex-col px-6 pt-8 pb-8">
        {/* Decorative blue wash */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
          style={{
            background:
              'radial-gradient(120% 70% at 50% 0%, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.06) 45%, rgba(255,255,255,0) 72%)',
          }}
          aria-hidden
        />

        {/* Language toggle — Sinhala first, like the reference audience */}
        <div className="relative flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === 'si' ? 'en' : 'si')}
            className="flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-[12px] font-bold text-muted shadow-sm transition-colors hover:text-brand-700"
          >
            <Globe size={13} />
            {t('lang.toggle')}
          </button>
        </div>

        <div className="relative mt-2 flex flex-col items-center">
          <Wordmark size="lg" />
          <p className="mt-2 text-center text-[12.5px] font-medium text-muted">
            {lang === 'si' ? (
              <>කාර්ය සම්පූර්ණ කරන්න · ඇණවුම් කළමනාකරණය කරන්න · ත්‍යාග ලබා ගන්න</>
            ) : (
              <>Complete Tasks. Manage Orders. Track Rewards.</>
            )}
          </p>
        </div>

        <div className="relative mt-7 rounded-[20px] bg-white p-5 shadow-[0_4px_30px_rgba(15,31,61,0.1)] ring-1 ring-black/[0.03]">
          <h1 className="text-[20px] font-extrabold tracking-[-0.01em] text-navy">{t('login.welcome')}</h1>
          <p className="mt-1 text-[13px] text-muted">{t('login.sub')}</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
            {/* Phone with fixed +94 country code, like the reference */}
            <Field
              label={t('login.phone')}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t('login.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ paddingLeft: 64 }}
              leading={
                <span className="flex items-center gap-1 text-[13px] font-bold text-ink">
                  🇱🇰 <span className="tnum">+94</span>
                </span>
              }
            />
            <Field
              label={t('login.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leading={<Lock size={16} />}
              error={error || undefined}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:text-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#2563eb]"
                />
                {t('login.remember')}
              </label>
              <Link to="/forgot-password" className="text-[12.5px] font-semibold text-brand-700 hover:underline">
                {t('login.forgot')}
              </Link>
            </div>

            <Button type="submit" size="lg" block className="!mt-5">
              {t('login.submit')}
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-muted">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:underline">
              {t('login.register')}
            </Link>
          </p>
        </div>

        <div className="relative mt-5 space-y-3">
          <DemoNotice>
            <strong className="font-extrabold">DEMO / SIMULATION — NO REAL MONEY · ආදර්ශනයක් — සැබෑ මුදල් නොමැත.</strong>{' '}
            {lang === 'si' ? (
              <>ඕනෑම දුරකථන අංකයක් සහ අකුරු 4+ මුරපදයක් ඇතුළත් කිරීමෙන් පිවිසිය හැකිය. TaskMall කිසිවිටෙක තැම්බුමක් ඉල්ලන්නේ නැත.</>
            ) : (
              <>Any phone number and a password of 4+ characters will sign you in. TaskMall never asks for a deposit.</>
            )}
          </DemoNotice>

          <Link
            to="/admin/login"
            className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-brand-700"
          >
            <ShieldCheck size={14} />
            {t('login.adminLink')}
          </Link>
        </div>

        <div className="relative mt-auto pt-8">
          <p className="text-center text-[10.5px] leading-relaxed text-faint">{t('login.footnote')}</p>
        </div>
      </div>
    </PlainShell>
  )
}

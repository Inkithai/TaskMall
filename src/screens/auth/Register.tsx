import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, Globe, Lock, Ticket, User } from 'lucide-react'
import { PlainShell } from '../../components/layout/MobileShell'
import { Wordmark } from '../../components/layout/Logo'
import { Button, Field } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'
import { useLang } from '../../lib/i18n'

/**
 * Phone-number registration mirroring the reference flow: name, +94 mobile,
 * password, and a prominent invitation code — the recruitment hook real task
 * platforms lead with. Here the code demonstrably grants nothing.
 */
export default function Register() {
  const { dispatch, toast } = useApp()
  const { t, lang, setLang } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    invite: 'TASK10027',
  })
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = t('register.errorName')
    if (!form.phone.trim()) next.phone = t('login.errorPhone')
    if (form.password.length < 6) next.password = t('register.errorPassword')
    if (form.confirm !== form.password) next.confirm = t('register.errorConfirm')
    if (!agree) next.agree = t('register.errorAgree')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    dispatch({
      type: 'auth/register',
      name: form.name.trim(),
      email: form.email.trim() || 'demo.user@example.com',
      phone: form.phone.trim(),
      invitedBy: form.invite.trim() || undefined,
    })
    toast({
      title: t('register.toastTitle'),
      body: t('register.toastBody'),
      tone: 'ok',
    })
    navigate('/home', { replace: true })
  }

  return (
    <PlainShell>
      <div className="flex min-h-full flex-col px-6 pt-8 pb-8">
        <div className="flex items-center justify-between">
          <Link to="/login" className="text-[12.5px] font-semibold text-muted transition-colors hover:text-brand-700">
            ← {t('register.login')}
          </Link>
          <button
            type="button"
            onClick={() => setLang(lang === 'si' ? 'en' : 'si')}
            className="flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-[12px] font-bold text-muted shadow-sm transition-colors hover:text-brand-700"
          >
            <Globe size={13} />
            {t('lang.toggle')}
          </button>
        </div>

        <div className="mt-3 flex flex-col items-center">
          <Wordmark size="md" />
        </div>

        <h1 className="mt-6 text-[22px] font-extrabold tracking-[-0.01em] text-navy">{t('register.title')}</h1>
        <p className="mt-1 text-[13px] text-muted">{t('register.sub')}</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
          <Field
            label={t('register.name')}
            name="name"
            placeholder={t('register.namePlaceholder')}
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            leading={<User size={16} />}
          />
          <Field
            label={t('login.phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder={t('login.phonePlaceholder')}
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            style={{ paddingLeft: 64 }}
            leading={
              <span className="flex items-center gap-1 text-[13px] font-bold text-ink">
                🇱🇰 <span className="tnum">+94</span>
              </span>
            }
          />
          <Field
            label={t('register.email')}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            hint={t('register.emailHint')}
            leading={<AtSign size={16} />}
          />
          <Field
            label={t('register.password')}
            name="password"
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            leading={<Lock size={16} />}
          />
          <Field
            label={t('register.confirm')}
            name="confirm"
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            leading={<Lock size={16} />}
          />
          <Field
            label={t('register.invite')}
            name="invite"
            placeholder="TASK48291"
            value={form.invite}
            onChange={set('invite')}
            hint={t('register.inviteHint')}
            leading={<Ticket size={16} />}
          />

          <div className="pt-1">
            <label className="flex cursor-pointer items-start gap-2 text-[12.5px] leading-snug font-medium text-muted">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#2563eb]"
              />
              <span>
                {t('register.agree')}{' '}
                <Link to="/about" className="font-semibold text-brand-700 hover:underline">
                  {t('register.terms')}
                </Link>
              </span>
            </label>
            {errors.agree && <p className="mt-1.5 text-xs font-medium text-danger">{errors.agree}</p>}
          </div>

          <Button type="submit" size="lg" block className="!mt-5">
            {t('register.submit')}
          </Button>
        </form>

        <DemoNotice className="mt-5">
          {lang === 'si' ? (
            <>
              ලියාපදිංචිය අනුකරණය වන අතර එය ගබඩා වන්නේ මෙම බ්‍රව්සරයේ පමණි. ගිණුම සක්‍රිය කිරීමට හෝ කාර්යයන් අගුලු
              හැරීමට TaskMall කිසිවිටෙක ගෙවීමක් ඉල්ලන්නේ නැත.
            </>
          ) : (
            <>
              Registration is simulated and stored only in this browser. TaskMall never requires a payment to
              activate an account or unlock tasks.
            </>
          )}
        </DemoNotice>

        <p className="mt-5 text-center text-[13px] text-muted">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:underline">
            {t('register.login')}
          </Link>
        </p>
      </div>
    </PlainShell>
  )
}

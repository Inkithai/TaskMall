import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, Lock, Phone, Ticket, User } from 'lucide-react'
import { PlainShell } from '../../components/layout/MobileShell'
import { Wordmark } from '../../components/layout/Logo'
import { Button, Checkbox, Field } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'

export default function Register() {
  const { dispatch, toast } = useApp()
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
    if (!form.name.trim()) next.name = 'Enter your full name'
    if (!form.phone.trim()) next.phone = 'Enter your mobile number'
    if (!/.+@.+\..+/.test(form.email)) next.email = 'Enter a valid email address'
    if (form.password.length < 6) next.password = 'Use at least 6 characters'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match'
    if (!agree) next.agree = 'Please accept the terms to continue'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    dispatch({
      type: 'auth/register',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      invitedBy: form.invite.trim() || undefined,
    })
    toast({ title: 'Account created', body: 'This is a simulated account — no data leaves your browser.', tone: 'ok' })
    navigate('/home', { replace: true })
  }

  return (
    <PlainShell>
      <div className="flex min-h-full flex-col px-6 pt-8 pb-8">
        <div className="flex flex-col items-center">
          <Wordmark size="md" />
        </div>

        <h1 className="mt-6 text-[22px] font-extrabold tracking-[-0.01em] text-navy">Create Account</h1>
        <p className="mt-1 text-[13px] text-muted">Join TaskMall and start processing simulated orders.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
          <Field
            label="Full Name"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            leading={<User size={16} />}
          />
          <Field
            label="Mobile Number"
            name="phone"
            type="tel"
            placeholder="+94 7X XXX XXXX"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            leading={<Phone size={16} />}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            leading={<AtSign size={16} />}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            leading={<Lock size={16} />}
          />
          <Field
            label="Confirm Password"
            name="confirm"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            leading={<Lock size={16} />}
          />
          <Field
            label="Invitation Code"
            name="invite"
            placeholder="Optional"
            value={form.invite}
            onChange={set('invite')}
            hint="Optional. Invitation codes do not grant any financial return in TaskMall."
            leading={<Ticket size={16} />}
          />

          <div className="pt-1">
            <Checkbox
              id="agree"
              checked={agree}
              onChange={setAgree}
              label={
                <span>
                  I agree to the{' '}
                  <Link to="/about" className="font-semibold text-brand-700 hover:underline">
                    Terms
                  </Link>
                </span>
              }
            />
            {errors.agree && <p className="mt-1.5 text-xs font-medium text-danger">{errors.agree}</p>}
          </div>

          <Button type="submit" size="lg" block className="!mt-5">
            Create Account
          </Button>
        </form>

        <DemoNotice className="mt-5">
          Registration is simulated and stored only in this browser. TaskMall never requires a payment to activate an
          account or unlock tasks.
        </DemoNotice>

        <p className="mt-5 text-center text-[13px] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </PlainShell>
  )
}

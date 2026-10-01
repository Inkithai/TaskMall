import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { PlainShell } from '../../components/layout/MobileShell'
import { Wordmark } from '../../components/layout/Logo'
import { Button, Checkbox, Field } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/Badge'
import { useApp } from '../../store/AppContext'

const DEMO_IDENTIFIER = 'demo.user@example.com'
const DEMO_PASSWORD = 'taskmall'

export default function Login() {
  const { state, dispatch, toast } = useApp()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState(state.auth.remembered ?? DEMO_IDENTIFIER)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [remember, setRemember] = useState(Boolean(state.auth.remembered))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!identifier.trim()) return setError('Enter your phone number or email address')
    if (password.length < 4) return setError('Enter your password (demo password: taskmall)')
    setError('')
    dispatch({ type: 'auth/login', identifier: identifier.trim(), remember })
    toast({ title: 'Signed in', body: 'Demo session started — all values are simulated.', tone: 'ok' })
    navigate('/home', { replace: true })
  }

  return (
    <PlainShell>
      <div className="relative flex min-h-full flex-col px-6 pt-10 pb-8">
        {/* Decorative blue wash */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
          style={{
            background:
              'radial-gradient(120% 70% at 50% 0%, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.06) 45%, rgba(255,255,255,0) 72%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center">
          <Wordmark size="lg" />
          <p className="mt-2 text-center text-[12.5px] font-medium text-muted">
            Complete Tasks. Manage Orders. Track Rewards.
          </p>
        </div>

        <div className="relative mt-8 rounded-[20px] bg-white p-5 shadow-[0_4px_30px_rgba(15,31,61,0.1)] ring-1 ring-black/[0.03]">
          <h1 className="text-[20px] font-extrabold tracking-[-0.01em] text-navy">Welcome Back</h1>
          <p className="mt-1 text-[13px] text-muted">Sign in to your TaskMall account</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
            <Field
              label="Phone / Email"
              name="identifier"
              autoComplete="username"
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leading={<Mail size={16} />}
            />
            <Field
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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
              <Checkbox id="remember" checked={remember} onChange={setRemember} label="Remember me" />
              <Link to="/forgot-password" className="text-[12.5px] font-semibold text-brand-700 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" size="lg" block className="!mt-5">
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        <div className="relative mt-5 space-y-3">
          <DemoNotice>
            <strong className="font-extrabold">DEMO / SIMULATION — NO REAL MONEY.</strong> Any email and a password of
            4+ characters will sign you in. TaskMall never asks for a deposit.
          </DemoNotice>

          <Link
            to="/admin/login"
            className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-brand-700"
          >
            <ShieldCheck size={14} />
            Open the Admin Console
          </Link>
        </div>

        <div className="relative mt-auto pt-8">
          <p className="text-center text-[10.5px] leading-relaxed text-faint">
            TaskMall is a research/demo build. Simulated commissions are not withdrawable funds and no payment is
            ever required to unlock tasks.
          </p>
        </div>
      </div>
    </PlainShell>
  )
}

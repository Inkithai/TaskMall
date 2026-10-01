import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck, User } from 'lucide-react'
import { LogoMark } from '../../components/layout/Logo'
import { Button, Checkbox, Field } from '../../components/ui/primitives'
import { useApp } from '../../store/AppContext'

export default function AdminLogin() {
  const { dispatch, toast } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('taskmall')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || password.length < 4) {
      setError('Enter the demo credentials: admin / taskmall')
      return
    }
    dispatch({ type: 'admin/login' })
    toast({ title: 'Admin session started', body: 'All console data is simulated.', tone: 'ok' })
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-navy px-5 py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(37,99,235,0.35) 0%, rgba(15,31,61,0) 70%), radial-gradient(40% 40% at 90% 100%, rgba(59,130,246,0.22) 0%, rgba(15,31,61,0) 70%)',
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark size={44} />
          <p className="mt-3 text-[15px] font-extrabold tracking-[0.1em] text-white">TASKMALL ADMIN</p>
          <p className="mt-1 text-[12px] text-white/55">Management console · demo build</p>
        </div>

        <div className="rounded-[20px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h1 className="text-[19px] font-extrabold text-navy">Administrator Login</h1>
          <p className="mt-1 text-[12.5px] text-muted">Sign in to manage users, orders, packages and reports.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
            <Field
              label="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leading={<User size={16} />}
              autoComplete="username"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leading={<Lock size={16} />}
              error={error || undefined}
              autoComplete="current-password"
            />
            <Checkbox id="adminRemember" checked={remember} onChange={setRemember} label="Keep me signed in" />
            <Button type="submit" size="lg" block className="!mt-5">
              Sign in to Console
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
            <ShieldCheck size={14} className="mt-px shrink-0 text-brand-700" />
            <p className="text-[11px] leading-relaxed text-brand-800">
              Demo credentials <strong className="tnum">admin / taskmall</strong>. There is no backend — the console
              reads the same locally generated dataset as the user app.
            </p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link to="/login" className="text-[12.5px] font-semibold text-white/60 hover:text-white">
            ← Back to the user app
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Mail } from 'lucide-react'
import { PlainShell } from '../../components/layout/MobileShell'
import { Wordmark } from '../../components/layout/Logo'
import { Button, Field } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/Badge'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PlainShell>
      <div className="flex min-h-full flex-col px-6 pt-10 pb-8">
        <div className="flex flex-col items-center">
          <Wordmark size="md" />
        </div>

        {sent ? (
          <div className="mt-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok">
              <CheckCircle2 size={30} />
            </div>
            <h1 className="mt-4 text-[20px] font-extrabold text-navy">Reset Link Simulated</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              In a live deployment a reset link would be emailed to{' '}
              <strong className="text-navy">{email || 'your address'}</strong>. No email is sent in this demo.
            </p>
            <Link to="/login" className="mt-6 inline-block">
              <Button size="lg">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-8 text-[22px] font-extrabold tracking-[-0.01em] text-navy">Forgot Password?</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Enter the email address linked to your TaskMall account and we&apos;ll simulate sending a reset link.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leading={<Mail size={16} />}
              />
              <Button type="submit" size="lg" block>
                Send Reset Link
              </Button>
            </form>

            <DemoNotice className="mt-5">
              Password recovery is simulated. TaskMall support will never ask for your password, one-time code or a
              payment to restore access.
            </DemoNotice>

            <p className="mt-6 text-center text-[13px] text-muted">
              Remembered it?{' '}
              <Link to="/login" className="font-bold text-brand-700 hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </PlainShell>
  )
}

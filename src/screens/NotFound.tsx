import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Wordmark } from '../components/layout/Logo'
import { Button } from '../components/ui/primitives'

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-[360px] text-center">
        <Wordmark size="md" className="justify-center" />
        <div className="tm-card mt-6 p-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <Compass size={28} />
          </div>
          <h1 className="mt-4 text-[19px] font-extrabold text-navy">Page not found</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            That screen doesn&apos;t exist in this build. Head back to your dashboard.
          </p>
          <div className="mt-5 grid gap-2">
            <Link to="/home">
              <Button block>Go to Home</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" block>
                Open Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

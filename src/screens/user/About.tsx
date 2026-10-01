import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, DataRow, SectionTitle } from '../../components/ui/primitives'
import { Sheet } from '../../components/ui/Modal'
import { Wordmark } from '../../components/layout/Logo'
import { useApp } from '../../store/AppContext'

const WARNING_SIGNS = [
  'Being asked to deposit your own money before you can work, withdraw, or "unlock" a higher task tier.',
  'Commissions that are only numbers on a dashboard and cannot actually be withdrawn.',
  'Recruitment framed as income — "earn a percentage of everyone you invite".',
  'Support that moves you to an anonymous messaging account or a private financial handler.',
  'Pressure from streaks, countdowns, levels and repetitive task sets that push you to keep paying in.',
]

const COMMITMENTS = [
  'No payment processor is connected. Recharge and withdrawal are simulations only.',
  'No deposit is ever required to use any part of this build.',
  'Every monetary figure carries a SIMULATED marker.',
  'Support stays in-app — never an off-platform handler.',
  'Invitation codes grant no financial return of any kind.',
]

export default function About() {
  const { state, dispatch, toast } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="pb-24">
      <ScreenHeader title="About TaskMall" />

      <div className="space-y-3 px-4 pt-4">
        <div className="flex flex-col items-center py-2">
          <Wordmark size="lg" />
          <p className="mt-2 text-center text-[12.5px] font-medium text-muted">
            Complete Tasks. Manage Orders. Track Rewards.
          </p>
          <p className="mt-1 text-[11px] text-faint">Demo build v1.0 · research / prototype</p>
        </div>

        <Card>
          <SectionTitle>What this is</SectionTitle>
          <p className="text-[12.5px] leading-relaxed text-muted">
            TaskMall is a front-end prototype of a task-and-order management platform: product catalogue, order
            processing, reward calculation, package tracking, wallet and an admin console. It exists to demonstrate the
            interface patterns these platforms use — including the ones that are commonly abused.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
            All data is generated locally and stored in your browser. Nothing is transmitted anywhere.
          </p>
        </Card>

        <Card>
          <SectionTitle action={<ShieldCheck size={16} className="text-ok" />}>Our commitments in this build</SectionTitle>
          <ul className="space-y-2">
            {COMMITMENTS.map((c) => (
              <li key={c} className="flex gap-2 text-[12.5px] leading-relaxed text-ink">
                <CheckCircle2 size={15} className="mt-px shrink-0 text-ok" />
                {c}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="!bg-[#fff8f3] ring-1 ring-[#fbd9b8]">
          <SectionTitle action={<AlertTriangle size={16} className="text-pending" />}>
            Task-scam warning signs
          </SectionTitle>
          <p className="text-[12px] leading-relaxed text-muted">
            Real platforms that look like this one have been used to defraud people. The US Federal Trade Commission
            has documented the pattern. Treat these as red flags anywhere you see them:
          </p>
          <ul className="mt-2.5 space-y-2">
            {WARNING_SIGNS.map((w) => (
              <li key={w} className="flex gap-2 text-[12.5px] leading-relaxed text-ink">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-pending" />
                {w}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle>Account</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="TaskMall ID" value={state.user.id} mono />
            <DataRow label="Invitation code" value={state.user.invitationCode} mono />
            <DataRow label="Orders stored" value={state.orders.length} />
            <DataRow label="Transactions stored" value={state.transactions.length} />
            <DataRow label="Storage" value="Browser localStorage" />
          </div>
        </Card>

        <Card>
          <SectionTitle>Reset demo data</SectionTitle>
          <p className="text-[12px] leading-relaxed text-muted">
            Regenerate the seeded orders, packages, wallet and transactions. This clears anything you changed while
            exploring.
          </p>
          <Button variant="outline" block className="mt-3" onClick={() => setConfirmReset(true)} icon={<RotateCcw size={15} />}>
            Reset demo data
          </Button>
        </Card>

        <p className="pb-2 text-center text-[10.5px] leading-relaxed text-faint">
          TaskMall is a fictional product built for demonstration. Product names, couriers, tracking numbers and
          addresses are invented.
        </p>
      </div>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: 'demo/reset' })
                setConfirmReset(false)
                toast({ title: 'Demo data reset', tone: 'ok' })
                navigate('/home')
              }}
            >
              Reset
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">
          All locally stored orders, packages, transactions and settings will be regenerated from the original seed.
          You will stay signed in.
        </p>
      </Sheet>
    </div>
  )
}

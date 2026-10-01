import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Ban, Wallet as WalletIcon } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, DataRow, Field, SectionTitle, cx } from '../../components/ui/primitives'
import { DemoNotice, SimulatedTag } from '../../components/ui/Badge'
import { ResultDialog } from '../../components/ui/Modal'
import { useApp, useWalletTotals } from '../../store/AppContext'
import { lkr } from '../../lib/format'

const PRESETS = [1000, 2500, 5000, 10000]

export default function Recharge() {
  const { dispatch } = useApp()
  const { available } = useWalletTotals()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number | null>(2500)
  const [custom, setCustom] = useState('')
  const [done, setDone] = useState<number | null>(null)

  const amount = custom ? Number(custom.replace(/[^\d.]/g, '')) || 0 : (selected ?? 0)
  const valid = amount > 0 && amount <= 500000

  function submit() {
    if (!valid) return
    dispatch({ type: 'wallet/recharge', amount })
    setDone(amount)
  }

  return (
    <div className="pb-24">
      <ScreenHeader title="Recharge Simulation" />

      <div className="space-y-3 px-4 pt-3">
        <Card>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">
              Current Simulated Balance
            </span>
            <SimulatedTag compact />
          </div>
          <p className="mt-1 text-[28px] leading-none font-extrabold tracking-[-0.02em] tnum text-navy">
            {lkr(available)}
          </p>
        </Card>

        <Card>
          <SectionTitle>Select Amount</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESETS.map((value) => {
              const active = !custom && selected === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelected(value)
                    setCustom('')
                  }}
                  className={cx(
                    'rounded-[14px] border py-3.5 text-[15px] font-bold tnum transition-all',
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
                      : 'border-hairline bg-white text-navy hover:border-brand-200',
                  )}
                >
                  {lkr(value)}
                </button>
              )
            })}
          </div>

          <Field
            label="Custom Amount"
            className="mt-4"
            name="custom"
            inputMode="decimal"
            placeholder="Enter an amount"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value)
              setSelected(null)
            }}
            leading={<span className="text-[12px] font-bold">LKR</span>}
            hint="Maximum LKR 500,000.00 per simulated recharge."
          />
        </Card>

        <Card>
          <SectionTitle>Summary</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Recharge amount" value={lkr(amount)} accent="reward" />
            <DataRow label="Processing fee" value={lkr(0)} />
            <DataRow label="New simulated balance" value={lkr(available + amount)} accent="ok" />
          </div>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-hairline bg-white px-3 py-2.5">
          <Ban size={15} className="mt-px shrink-0 text-danger" />
          <p className="text-[11.5px] leading-relaxed text-muted">
            <strong className="text-navy">No payment methods are connected.</strong> This screen credits a number in
            your browser. A platform that requires you to deposit money before you can work or withdraw is exhibiting a
            documented task-scam pattern — TaskMall deliberately does not implement one.
          </p>
        </div>

        <Button size="lg" block disabled={!valid} onClick={submit} icon={<WalletIcon size={17} />}>
          Simulate Recharge
        </Button>

        <DemoNotice />
      </div>

      <ResultDialog
        open={done !== null}
        onClose={() => setDone(null)}
        icon={<BadgeCheck size={30} />}
        title="Simulation Complete"
        action={
          <div className="grid gap-2">
            <Button
              block
              onClick={() => {
                setDone(null)
                navigate('/wallet')
              }}
            >
              Back to Wallet
            </Button>
            <Button variant="ghost" block onClick={() => setDone(null)}>
              Simulate another
            </Button>
          </div>
        }
      >
        <p>
          <strong className="text-navy tnum">{lkr(done ?? 0)}</strong> added to your simulated balance.
        </p>
        <p className="mt-2 font-semibold text-ok">No real money was transferred.</p>
        <p className="mt-1">Simulated balance updated to {lkr(available)}.</p>
      </ResultDialog>
    </div>
  )
}

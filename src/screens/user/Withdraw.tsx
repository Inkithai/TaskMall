import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, Receipt, Smartphone } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, DataRow, Field, Radio, SectionTitle } from '../../components/ui/primitives'
import { Badge, DemoNotice, SimulatedTag } from '../../components/ui/Badge'
import { ResultDialog } from '../../components/ui/Modal'
import { makeWithdrawalId, useApp, useWalletTotals } from '../../store/AppContext'
import { lkr } from '../../lib/format'

export default function Withdraw() {
  const { state, dispatch } = useApp()
  const { available } = useWalletTotals()
  const navigate = useNavigate()

  const [amount, setAmount] = useState('5000')
  const [method, setMethod] = useState<'bank' | 'ewallet'>('bank')
  const [account, setAccount] = useState('8841 2290')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<{ id: string; amount: number } | null>(null)

  const value = Number(amount.replace(/[^\d.]/g, '')) || 0

  function submit() {
    if (value <= 0) return setError('Enter an amount to simulate')
    if (value > available) return setError(`Amount exceeds the available simulated balance of ${lkr(available)}`)
    if (!account.trim()) return setError('Enter a destination account reference')
    setError('')

    const id = makeWithdrawalId(state.withdrawals.length)
    dispatch({
      type: 'wallet/withdraw',
      id,
      amount: value,
      method,
      account: account.trim(),
      accountName: state.user.name,
    })
    setReceipt({ id, amount: value })
  }

  return (
    <div className="pb-24">
      <ScreenHeader title="Withdraw Simulation" />

      <div className="space-y-3 px-4 pt-3">
        <Card>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted uppercase">
              Available Simulated Balance
            </span>
            <SimulatedTag compact />
          </div>
          <p className="mt-1 text-[28px] leading-none font-extrabold tracking-[-0.02em] tnum text-navy">
            {lkr(available)}
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted">
            Pending (held by open tasks): <strong className="tnum text-pending">{lkr(state.wallet.pending)}</strong>
          </p>
        </Card>

        <Card>
          <SectionTitle>Amount</SectionTitle>
          <Field
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leading={<span className="text-[12px] font-bold">LKR</span>}
            error={error || undefined}
          />
          <div className="mt-2.5 flex gap-2">
            {[1000, 5000, Math.floor(available)].map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="flex-1 rounded-lg border border-hairline py-1.5 text-[11.5px] font-semibold tnum text-ink transition-colors hover:border-brand-200 hover:text-brand-700"
              >
                {i === 2 ? 'Max' : lkr(preset)}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Method</SectionTitle>
          <div className="space-y-2">
            <Radio
              checked={method === 'bank'}
              onChange={() => setMethod('bank')}
              label="Bank Account"
              description="Simulated bank transfer"
              icon={<Banknote size={17} />}
            />
            <Radio
              checked={method === 'ewallet'}
              onChange={() => setMethod('ewallet')}
              label="E-Wallet"
              description="Simulated wallet transfer"
              icon={<Smartphone size={17} />}
            />
          </div>

          <Field
            label="Account"
            className="mt-3.5"
            name="account"
            placeholder={method === 'bank' ? 'Account number' : 'Wallet number'}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            hint="Use any placeholder value — nothing is sent anywhere."
          />
        </Card>

        <Card>
          <SectionTitle>Summary</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Withdrawal amount" value={lkr(value)} accent="amount" />
            <DataRow label="Processing fee" value={lkr(0)} />
            <DataRow label="Destination" value={method === 'bank' ? 'Bank Account' : 'E-Wallet'} />
            <DataRow label="Remaining balance" value={lkr(Math.max(0, available - value))} />
          </div>
        </Card>

        <Button size="lg" block onClick={submit} icon={<Receipt size={17} />}>
          Simulate Withdrawal
        </Button>

        <DemoNotice>
          Withdrawals are recorded as simulation entries only. No payout rail is connected and no funds leave or enter
          any account.
        </DemoNotice>
      </div>

      <ResultDialog
        open={receipt !== null}
        onClose={() => setReceipt(null)}
        icon={<Receipt size={28} />}
        title="Withdrawal Simulation"
        action={
          <div className="grid gap-2">
            <Button
              block
              onClick={() => {
                setReceipt(null)
                navigate('/wallet/transactions')
              }}
            >
              View Transactions
            </Button>
            <Button variant="ghost" block onClick={() => setReceipt(null)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="divide-y divide-hairline text-left">
          <DataRow label="Request ID" value={receipt?.id ?? ''} mono />
          <DataRow label="Amount" value={lkr(receipt?.amount ?? 0)} accent="amount" />
          <DataRow label="Status" value={<Badge tone="info">SIMULATED</Badge>} />
        </div>
        <p className="mt-3 font-semibold text-ok">No real funds were transferred.</p>
      </ResultDialog>
    </div>
  )
}

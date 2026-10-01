import { useMemo, useState } from 'react'
import { ChevronDown, Headset, MessageSquare, Search, Send, ShieldAlert } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, Field, SectionTitle, SelectField, cx } from '../../components/ui/primitives'
import { Badge } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { useApp } from '../../store/AppContext'
import { dateTimeFull, relative } from '../../lib/format'
import { demoNow } from '../../lib/clock'

const ARTICLES = [
  {
    q: 'How do orders work?',
    a: 'Pick a product from the Product List and start a task. TaskMall creates an order with a number, an amount, a reward rate and a 24-hour effective window. While the task is open, its simulated capital is held in your wallet\'s Pending bucket. Completing the task returns the capital in full and credits the reward.',
  },
  {
    q: 'How are rewards calculated?',
    a: 'Reward = order amount × the product\'s reward rate, rounded to two decimals. A LKR 2,388.00 order at 3.00% produces a simulated reward of LKR 71.64. Rates vary by product and are always shown before you start a task.',
  },
  {
    q: 'How do I view transactions?',
    a: 'Open Wallet → Transaction History. Entries are grouped by day and can be filtered by Rewards, Orders, Recharge and Withdrawal. Every completed task writes three entries: the order debit, the return of held capital, and the reward credit.',
  },
  {
    q: 'What does the package status mean?',
    a: 'Order status and package status are tracked separately. An order can be Completed while its package is still In Transit — the task reward does not depend on delivery. Package states run Preparing → Ready for Pickup → Picked Up → In Transit → Out for Delivery → Delivered.',
  },
  {
    q: 'Is any of this real money?',
    a: 'No. Every balance, reward, recharge and withdrawal in TaskMall is simulated and stored only in your browser. No payment processor is connected, nothing is withdrawable, and you will never be asked to deposit to unlock tasks.',
  },
  {
    q: 'How do I close my account?',
    a: 'Go to Profile → About TaskMall → Reset demo data to clear everything stored locally. In a live deployment this screen would start an account closure request with identity verification.',
  },
]

const CATEGORIES = ['Orders', 'Packages', 'Rewards', 'Wallet', 'Account', 'Other']

export default function Support() {
  const { state, dispatch, toast } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(0)
  const [composeOpen, setComposeOpen] = useState(false)
  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [form, setForm] = useState({ subject: '', category: 'Orders', body: '' })

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ARTICLES
    return ARTICLES.filter((a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q))
  }, [query])

  function submitTicket() {
    if (!form.subject.trim() || !form.body.trim()) {
      toast({ title: 'Add a subject and message', tone: 'danger' })
      return
    }
    dispatch({ type: 'support/create', subject: form.subject.trim(), category: form.category, body: form.body.trim() })
    setComposeOpen(false)
    setForm({ subject: '', category: 'Orders', body: '' })
    toast({ title: 'Ticket created', body: 'A TaskMall agent will respond inside the app.', tone: 'ok' })
  }

  const ticket = state.tickets.find((t) => t.id === activeTicket)

  return (
    <div className="pb-24">
      <ScreenHeader title="Help & Support" />

      <div className="space-y-3 px-4 pt-3">
        <div className="tm-gradient rounded-[18px] p-4 text-white">
          <h2 className="text-[18px] font-extrabold">How can we help?</h2>
          <p className="mt-0.5 text-[12px] text-brand-100">Search the help centre or open a ticket.</p>
          <div className="relative mt-3">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles..."
              aria-label="Search help articles"
              className="tm-field !border-transparent !bg-white pl-9"
            />
          </div>
        </div>

        <div>
          <SectionTitle>Popular Questions</SectionTitle>
          <Card className="!p-0">
            <ul className="divide-y divide-hairline">
              {results.map((article, i) => (
                <li key={article.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(open === i ? null : i)}
                    className="flex w-full items-center gap-2 px-4 py-3.5 text-left"
                    aria-expanded={open === i}
                  >
                    <span className="flex-1 text-[13px] font-semibold text-navy">{article.q}</span>
                    <ChevronDown
                      size={16}
                      className={cx('shrink-0 text-faint transition-transform', open === i && 'rotate-180')}
                    />
                  </button>
                  {open === i && (
                    <p className="px-4 pb-3.5 text-[12.5px] leading-relaxed text-muted">{article.a}</p>
                  )}
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-[13px] text-muted">No articles match “{query}”.</li>
              )}
            </ul>
          </Card>
        </div>

        <Button size="lg" block onClick={() => setComposeOpen(true)} icon={<Headset size={17} />}>
          Contact Support
        </Button>

        <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
          <ShieldAlert size={15} className="mt-px shrink-0 text-brand-700" />
          <p className="text-[11px] leading-relaxed text-brand-800">
            Support stays inside TaskMall. We will never move you to an anonymous messaging account, and no agent will
            ever request a payment, a one-time code, or remote access to your device.
          </p>
        </div>

        {/* Tickets */}
        <div>
          <SectionTitle>My Tickets</SectionTitle>
          <div className="space-y-2.5">
            {state.tickets.map((t) => (
              <Card key={t.id} className="!p-3.5">
                <button type="button" onClick={() => setActiveTicket(t.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-bold text-navy">{t.subject}</p>
                      <p className="text-[11px] tnum text-muted">
                        Ticket #{t.id} · {t.category}
                      </p>
                    </div>
                    <Badge tone={t.status === 'open' ? 'info' : t.status === 'pending' ? 'pending' : 'muted'} dot>
                      {t.status === 'open' ? 'Open' : t.status === 'pending' ? 'Awaiting you' : 'Closed'}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">
                    {t.messages[t.messages.length - 1]?.body}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-faint">
                    <MessageSquare size={11} /> {t.messages.length} messages · updated{' '}
                    {relative(t.updatedAt, demoNow())}
                  </p>
                </button>
              </Card>
            ))}
            {state.tickets.length === 0 && (
              <Card>
                <p className="py-3 text-center text-[13px] text-muted">No tickets yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compose */}
      <Sheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Contact Support"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTicket} icon={<Send size={15} />}>
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field
            label="Subject"
            name="subject"
            placeholder="Briefly describe the issue"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <SelectField
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
          <div>
            <label className="tm-label" htmlFor="body">
              Message
            </label>
            <textarea
              id="body"
              rows={4}
              className="tm-field resize-none"
              placeholder="Tell us what happened..."
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Replies appear in this app. Average first response in the demo is instant.
          </p>
        </div>
      </Sheet>

      {/* Ticket thread */}
      <Sheet
        open={ticket !== undefined}
        onClose={() => {
          setActiveTicket(null)
          setReply('')
        }}
        title={ticket ? `Ticket #${ticket.id}` : ''}
        footer={
          ticket && ticket.status !== 'closed' ? (
            <div className="flex gap-2">
            <input
              className="tm-field flex-1"
              aria-label="Write a reply"
              placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && reply.trim()) {
                    dispatch({ type: 'support/reply', id: ticket.id, body: reply.trim(), from: 'user' })
                    setReply('')
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!reply.trim()) return
                  dispatch({ type: 'support/reply', id: ticket.id, body: reply.trim(), from: 'user' })
                  setReply('')
                }}
                icon={<Send size={15} />}
              >
                Send
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              block
              onClick={() => ticket && dispatch({ type: 'support/reopen', id: ticket.id })}
            >
              Reopen ticket
            </Button>
          )
        }
      >
        {ticket && (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[13.5px] font-bold text-navy">{ticket.subject}</p>
              <Badge tone={ticket.status === 'closed' ? 'muted' : 'info'}>{ticket.status}</Badge>
            </div>
            <ul className="space-y-2.5">
              {ticket.messages.map((m, i) => (
                <li
                  key={i}
                  className={cx(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed',
                    m.from === 'user'
                      ? 'ml-auto rounded-br-md bg-brand-600 text-white'
                      : 'mr-auto rounded-bl-md bg-canvas text-ink',
                  )}
                >
                  {m.body}
                  <span
                    className={cx(
                      'mt-1 block text-[9.5px]',
                      m.from === 'user' ? 'text-brand-100' : 'text-faint',
                    )}
                  >
                    {m.from === 'user' ? 'You' : 'TaskMall Support'} · {dateTimeFull(m.at)}
                  </span>
                </li>
              ))}
            </ul>
            {ticket.status !== 'closed' && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'support/close', id: ticket.id })}
                className="mt-3 w-full text-center text-[12px] font-semibold text-muted hover:text-danger"
              >
                Close this ticket
              </button>
            )}
          </>
        )}
      </Sheet>
    </div>
  )
}

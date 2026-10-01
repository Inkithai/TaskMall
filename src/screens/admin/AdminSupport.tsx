import { useMemo, useState } from 'react'
import { Headset, MessageSquare, Send } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { StatCard } from '../../components/admin/DataTable'
import { Button, Card, cx } from '../../components/ui/primitives'
import { Badge } from '../../components/ui/Badge'
import { ChipRail } from '../../components/ui/Tabs'
import { useApp } from '../../store/AppContext'
import type { SupportTicket } from '../../data/types'
import { count, dateTimeFull, relative } from '../../lib/format'
import { demoNow } from '../../lib/clock'

type Filter = 'all' | SupportTicket['status']

export default function AdminSupport() {
  const { state, dispatch, toast } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [activeId, setActiveId] = useState<string | null>(state.tickets[0]?.id ?? null)
  const [reply, setReply] = useState('')

  const tickets = useMemo(
    () => state.tickets.filter((t) => filter === 'all' || t.status === filter),
    [state.tickets, filter],
  )

  const active = state.tickets.find((t) => t.id === activeId) ?? tickets[0] ?? null

  const summary = useMemo(
    () => ({
      total: state.tickets.length,
      open: state.tickets.filter((t) => t.status === 'open').length,
      pending: state.tickets.filter((t) => t.status === 'pending').length,
      closed: state.tickets.filter((t) => t.status === 'closed').length,
    }),
    [state.tickets],
  )

  function send() {
    if (!active || !reply.trim()) return
    dispatch({ type: 'support/reply', id: active.id, body: reply.trim(), from: 'support' })
    setReply('')
    toast({ title: 'Reply sent', tone: 'ok' })
  }

  return (
    <div>
      <AdminPageHeader icon={Headset} title="Support" description="In-app ticket queue" />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tickets" value={count(summary.total)} tone="brand" icon={<Headset size={18} />} />
        <StatCard label="Open" value={count(summary.open)} tone="pending" />
        <StatCard label="Awaiting user" value={count(summary.pending)} tone="navy" />
        <StatCard label="Closed" value={count(summary.closed)} tone="ok" />
      </div>

      <div className="mb-3">
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'all' as Filter, label: 'All' },
            { key: 'open' as Filter, label: 'Open' },
            { key: 'pending' as Filter, label: 'Awaiting user' },
            { key: 'closed' as Filter, label: 'Closed' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_1fr]">
        {/* Ticket list */}
        <Card className="!p-0">
          <ul className="divide-y divide-hairline">
            {tickets.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cx(
                    'w-full px-3.5 py-3 text-left transition-colors',
                    active?.id === t.id ? 'bg-brand-50' : 'hover:bg-canvas',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-[13px] font-bold text-navy">{t.subject}</p>
                    <Badge tone={t.status === 'open' ? 'info' : t.status === 'pending' ? 'pending' : 'muted'}>
                      {t.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] tnum text-muted">
                    #{t.id} · {t.userLabel}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11.5px] text-muted">
                    {t.messages[t.messages.length - 1]?.body}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[10.5px] text-faint">
                    <MessageSquare size={10} /> {t.messages.length} · {relative(t.updatedAt, demoNow())}
                  </p>
                </button>
              </li>
            ))}
            {tickets.length === 0 && (
              <li className="px-4 py-8 text-center text-[13px] text-muted">No tickets in this view.</li>
            )}
          </ul>
        </Card>

        {/* Thread */}
        {active ? (
          <Card className="flex min-h-[420px] flex-col">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-hairline pb-3">
              <div className="min-w-0">
                <p className="text-[14.5px] font-extrabold text-navy">Ticket #{active.id}</p>
                <p className="text-[12px] text-muted">
                  {active.userLabel} · {active.category} · opened {dateTimeFull(active.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={active.status === 'closed' ? 'muted' : 'info'} dot>
                  {active.status}
                </Badge>
                {active.status !== 'closed' ? (
                  <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'support/close', id: active.id })}>
                    Close
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'support/reopen', id: active.id })}>
                    Reopen
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-1 min-h-0 flex-1 space-y-2.5 overflow-y-auto py-3">
              <p className="text-[13px] font-bold text-navy">{active.subject}</p>
              {active.messages.map((m, i) => (
                <div
                  key={i}
                  className={cx(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed',
                    m.from === 'support'
                      ? 'ml-auto rounded-br-md bg-brand-600 text-white'
                      : 'mr-auto rounded-bl-md bg-canvas text-ink',
                  )}
                >
                  {m.body}
                  <span className={cx('mt-1 block text-[9.5px]', m.from === 'support' ? 'text-brand-100' : 'text-faint')}>
                    {m.from === 'support' ? 'Support agent' : 'User'} · {dateTimeFull(m.at)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-hairline pt-3">
              <input
                className="tm-field flex-1"
                placeholder="Reply to the user..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                disabled={active.status === 'closed'}
              />
              <Button onClick={send} disabled={active.status === 'closed'} icon={<Send size={15} />}>
                Reply
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="flex min-h-[320px] items-center justify-center">
            <p className="text-[13px] text-muted">Select a ticket to view the conversation.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

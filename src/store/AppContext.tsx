import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createSeed, DAILY_TARGET, USER_ID } from '../data/seed'
import { PRODUCTS } from '../data/products'
import { buildPackage, buildTimeline } from '../data/packages'
import type {
  AdminUserRow,
  AppNotification,
  Order,
  OrderStatus,
  PackageStatus,
  Product,
  SupportTicket,
  Transaction,
  UserProfile,
  Wallet,
  WithdrawalRequest,
  AdminTask,
  AdminStats,
  AdminCharts,
  TeamMember,
  Achievement,
  DailyCheckIn,
  DeviceSession,
  LoginEvent,
  PaymentMethod,
} from '../data/types'
import { addDays, addHours, demoNow } from '../lib/clock'
import { compactDate, dateLong } from '../lib/format'
import { createRng, hashString } from '../lib/rng'

const STORAGE_KEY = 'taskmall.state.v3'

const round2 = (n: number) => Math.round(n * 100) / 100

export interface AppState {
  auth: { user: boolean; admin: boolean; remembered: string | null }
  user: UserProfile
  wallet: Wallet
  openingBalance: number
  products: Product[]
  orders: Order[]
  transactions: Transaction[]
  withdrawals: WithdrawalRequest[]
  team: TeamMember[]
  notifications: AppNotification[]
  achievements: Achievement[]
  dailyCheckIn: DailyCheckIn[]
  tickets: SupportTicket[]
  sessions: DeviceSession[]
  loginHistory: LoginEvent[]
  paymentMethods: PaymentMethod[]
  adminUsers: AdminUserRow[]
  adminTasks: AdminTask[]
  adminStats: AdminStats
  adminCharts: AdminCharts
  lifetimeCompleted: number
}

export function freshState(): AppState {
  const seed = createSeed(demoNow())
  return {
    auth: { user: false, admin: false, remembered: null },
    products: PRODUCTS.map((p) => ({ ...p })),
    ...seed,
  }
}

export type Action =
  | { type: 'auth/login'; identifier: string; remember: boolean }
  | { type: 'auth/register'; name: string; email: string; phone: string; invitedBy?: string }
  | { type: 'auth/logout' }
  | { type: 'admin/login' }
  | { type: 'admin/logout' }
  | { type: 'order/accept'; productId: string; quantity: number }
  | { type: 'order/complete'; orderNumber: string }
  | { type: 'order/expire'; orderNumbers: string[] }
  | { type: 'wallet/recharge'; amount: number }
  | {
      type: 'wallet/withdraw'
      id: string
      amount: number
      method: 'bank' | 'ewallet'
      account: string
      accountName: string
    }
  | { type: 'notifications/read'; id: string }
  | { type: 'notifications/readAll' }
  | { type: 'rewards/claim'; day: number }
  | { type: 'support/create'; subject: string; category: string; body: string }
  | { type: 'support/reply'; id: string; body: string; from: 'user' | 'support' }
  | { type: 'support/close'; id: string }
  | { type: 'support/reopen'; id: string }
  | { type: 'profile/update'; patch: Partial<UserProfile> }
  | { type: 'profile/toggle2fa' }
  | { type: 'profile/changePassword' }
  | { type: 'profile/revokeSession'; id: string }
  | { type: 'admin/userStatus'; id: string; status: AdminUserRow['status'] }
  | { type: 'admin/productPatch'; id: string; patch: Partial<Product> }
  | { type: 'admin/orderStatus'; orderNumber: string; status: OrderStatus }
  | { type: 'admin/packageStatus'; packageId: string; status: PackageStatus }
  | { type: 'admin/packagePatch'; packageId: string; patch: { courier?: string; trackingNumber?: string; estimatedDelivery?: string } }
  | { type: 'admin/withdrawal'; id: string; status: WithdrawalRequest['status'] }
  | { type: 'demo/reset' }

/** Next withdrawal request id, e.g. WD-20261001-00195. */
export function makeWithdrawalId(existingCount: number, at: Date = demoNow()): string {
  return `WD-${compactDate(at)}-${String(existingCount + 193).padStart(5, '0')}`
}

function makeOrderNumber(at: Date, seedKey: string): string {
  const rng = createRng(hashString(seedKey))
  const d2 = (n: number) => String(n).padStart(2, '0')
  return `${compactDate(at)}${d2(at.getHours())}${d2(at.getMinutes())}${d2(at.getSeconds())}${rng.digits(4)}`
}

function notify(state: AppState, n: Omit<AppNotification, 'id' | 'at' | 'read'>): AppNotification[] {
  return [
    { id: `NT-${Date.now()}-${Math.round(Math.random() * 1e4)}`, at: demoNow().toISOString(), read: false, ...n },
    ...state.notifications,
  ]
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'auth/login':
      return {
        ...state,
        auth: { ...state.auth, user: true, remembered: action.remember ? action.identifier : null },
      }

    case 'auth/register':
      return {
        ...state,
        auth: { ...state.auth, user: true },
        user: {
          ...state.user,
          name: action.name || state.user.name,
          email: action.email || state.user.email,
          phone: action.phone || state.user.phone,
          invitedBy: action.invitedBy || state.user.invitedBy,
          avatarInitials:
            (action.name || state.user.name)
              .split(' ')
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'TM',
        },
      }

    case 'auth/logout':
      return { ...state, auth: { ...state.auth, user: false } }

    case 'admin/login':
      return { ...state, auth: { ...state.auth, admin: true } }

    case 'admin/logout':
      return { ...state, auth: { ...state.auth, admin: false } }

    /* ---------------- Tasks & orders ---------------- */

    case 'order/accept': {
      const product = state.products.find((p) => p.id === action.productId)
      if (!product) return state
      const amount = round2(product.price * action.quantity)
      if (amount > state.wallet.available) return state

      const now = demoNow()
      const orderNumber = makeOrderNumber(now, `${product.id}-${now.getTime()}`)
      const rng = createRng(hashString(orderNumber))
      const reward = round2(amount * product.rewardRate)

      const order: Order = {
        orderNumber,
        userId: USER_ID,
        productId: product.id,
        quantity: action.quantity,
        amount,
        rewardRate: product.rewardRate,
        reward,
        status: 'pending',
        orderTime: now.toISOString(),
        processingTime: null,
        completedAt: null,
        effectiveHours: 24,
        expiresAt: addHours(now, 24).toISOString(),
        pkg: buildPackage({
          orderTime: now,
          product,
          quantity: action.quantity,
          status: 'preparing',
          rng,
          estimatedDelivery: addDays(now, 3),
          estimatedWindow: `${String(addDays(now, 2).getDate()).padStart(2, '0')}–${dateLong(addDays(now, 4))}`,
        }),
      }

      const tx: Transaction = {
        id: `TX-ORD-${orderNumber}`,
        type: 'order',
        title: 'Order Simulation',
        reference: orderNumber,
        amount: -amount,
        status: 'processing',
        at: now.toISOString(),
        note: `${product.name} — simulated task capital held`,
      }

      return {
        ...state,
        orders: [order, ...state.orders],
        transactions: [tx, ...state.transactions],
        wallet: {
          available: round2(state.wallet.available - amount),
          pending: round2(state.wallet.pending + amount),
        },
        notifications: notify(state, {
          kind: 'task',
          title: 'Task Accepted',
          body: `Order #${orderNumber} is now processing. Simulated capital of LKR ${amount.toFixed(2)} is held.`,
          link: `/orders/${orderNumber}`,
        }),
      }
    }

    /**
     * Effective time elapsed on one or more pending tasks. Held capital is
     * refunded in full and no reward is issued — the same shape the seed uses
     * for historic timeouts, so the ledger stays consistent either way.
     */
    case 'order/expire': {
      const expiring = state.orders.filter(
        (o) => o.status === 'pending' && action.orderNumbers.includes(o.orderNumber),
      )
      if (expiring.length === 0) return state
      const now = demoNow()
      const expiringNumbers = new Set(expiring.map((o) => o.orderNumber))
      const refundTotal = expiring.reduce((sum, o) => sum + o.amount, 0)

      const refunds: Transaction[] = expiring.map((o) => ({
        id: `TX-RFD-${o.orderNumber}`,
        type: 'order',
        title: 'Task Capital Refunded',
        reference: o.orderNumber,
        amount: o.amount,
        status: 'completed',
        at: now.toISOString(),
        note: 'Effective time elapsed — no reward issued, simulated capital returned in full',
      }))

      let notifications = state.notifications
      for (const o of expiring) {
        notifications = notify(
          { ...state, notifications },
          {
            kind: 'expiring',
            title: 'Task Timed Out',
            body: `Order #${o.orderNumber} passed its effective time. Simulated capital was returned in full and no reward was issued.`,
            link: `/orders/${o.orderNumber}`,
          },
        )
      }

      return {
        ...state,
        orders: state.orders.map((o) =>
          expiringNumbers.has(o.orderNumber)
            ? {
                ...o,
                status: 'timeout' as const,
                pkg: {
                  ...o.pkg,
                  status: 'cancelled' as PackageStatus,
                  timeline: buildTimeline(new Date(o.orderTime), 'cancelled'),
                },
              }
            : o,
        ),
        transactions: [
          ...refunds,
          ...state.transactions.map((t) =>
            t.reference && expiringNumbers.has(t.reference) && t.id === `TX-ORD-${t.reference}`
              ? {
                  ...t,
                  status: 'completed' as const,
                  note: t.note?.replace('held', 'debited'),
                }
              : t,
          ),
        ],
        wallet: {
          available: round2(state.wallet.available + refundTotal),
          pending: round2(Math.max(0, state.wallet.pending - refundTotal)),
        },
        notifications,
      }
    }

    case 'order/complete': {
      const order = state.orders.find((o) => o.orderNumber === action.orderNumber)
      if (!order || order.status !== 'pending') return state
      const now = demoNow()

      const nextPackage: PackageStatus = 'ready'
      const updated: Order = {
        ...order,
        status: 'completed',
        completedAt: now.toISOString(),
        processingTime: now.toISOString(),
        pkg: {
          ...order.pkg,
          status: nextPackage,
          timeline: buildTimeline(new Date(order.orderTime), nextPackage),
        },
      }

      const returned: Transaction = {
        id: `TX-RET-${order.orderNumber}`,
        type: 'order',
        title: 'Task Capital Returned',
        reference: order.orderNumber,
        amount: order.amount,
        status: 'completed',
        at: now.toISOString(),
        note: 'Held simulated capital released back to the available balance',
      }
      const rewarded: Transaction = {
        id: `TX-RWD-${order.orderNumber}`,
        type: 'reward',
        title: 'Order Reward',
        reference: order.orderNumber,
        amount: order.reward,
        status: 'completed',
        at: now.toISOString(),
        note: `${(order.rewardRate * 100).toFixed(2)}% of the simulated order amount`,
      }

      return {
        ...state,
        orders: state.orders.map((o) => (o.orderNumber === order.orderNumber ? updated : o)),
        transactions: [
          rewarded,
          returned,
          ...state.transactions.map((t) =>
            t.id === `TX-ORD-${order.orderNumber}`
              ? { ...t, status: 'completed' as const, note: t.note?.replace('held', 'debited') }
              : t,
          ),
        ],
        wallet: {
          available: round2(state.wallet.available + order.amount + order.reward),
          pending: round2(Math.max(0, state.wallet.pending - order.amount)),
        },
        lifetimeCompleted: state.lifetimeCompleted + 1,
        achievements: state.achievements.map((a) => ({ ...a, progress: a.progress + 1 })),
        notifications: notify(state, {
          kind: 'completed',
          title: 'Task Completed',
          body: `Order #${order.orderNumber} has been completed. Simulated reward credited.`,
          link: `/orders/${order.orderNumber}`,
        }),
      }
    }

    /* ---------------- Wallet ---------------- */

    case 'wallet/recharge': {
      const now = demoNow()
      const tx: Transaction = {
        id: `TX-RCH-${now.getTime()}`,
        type: 'recharge',
        title: 'Simulated Recharge',
        amount: action.amount,
        status: 'completed',
        at: now.toISOString(),
        method: 'Demo credit (no payment processed)',
        note: 'No real money was transferred',
      }
      return {
        ...state,
        wallet: { ...state.wallet, available: round2(state.wallet.available + action.amount) },
        transactions: [tx, ...state.transactions],
        notifications: notify(state, {
          kind: 'wallet',
          title: 'Recharge Simulated',
          body: `LKR ${action.amount.toFixed(2)} added to the simulated balance. No real money was transferred.`,
          link: '/wallet/transactions',
        }),
      }
    }

    case 'wallet/withdraw': {
      const now = demoNow()
      if (action.amount > state.wallet.available) return state
      const id = action.id
      const request: WithdrawalRequest = {
        id,
        userId: USER_ID,
        amount: action.amount,
        method: action.method,
        account: action.account,
        accountName: action.accountName,
        status: 'simulated',
        at: now.toISOString(),
      }
      const tx: Transaction = {
        id: `TX-WDR-${id}`,
        type: 'withdrawal',
        title: 'Simulated Withdrawal',
        reference: id,
        amount: -action.amount,
        status: 'processing',
        at: now.toISOString(),
        method: `${action.method === 'bank' ? 'Bank Account' : 'E-Wallet'} · ${action.account}`,
        note: 'No real funds were transferred',
      }
      return {
        ...state,
        wallet: { ...state.wallet, available: round2(state.wallet.available - action.amount) },
        withdrawals: [request, ...state.withdrawals],
        transactions: [tx, ...state.transactions],
        notifications: notify(state, {
          kind: 'wallet',
          title: 'Withdrawal Simulated',
          body: `Request ${id} for LKR ${action.amount.toFixed(2)} recorded. No real funds were transferred.`,
          link: '/wallet/transactions',
        }),
      }
    }

    /* ---------------- Notifications & rewards ---------------- */

    case 'notifications/read':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      }

    case 'notifications/readAll':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }

    case 'rewards/claim': {
      const target = state.dailyCheckIn.find((d) => d.day === action.day)
      if (!target || target.claimed) return state
      const bonus = Number(target.rewardLabel.replace('+', ''))
      const now = demoNow()
      return {
        ...state,
        dailyCheckIn: state.dailyCheckIn.map((d) => (d.day === action.day ? { ...d, claimed: true } : d)),
        wallet: { ...state.wallet, available: round2(state.wallet.available + bonus) },
        transactions: [
          {
            id: `TX-DAY-${action.day}-${now.getTime()}`,
            type: 'reward',
            title: `Daily Activity Bonus · Day ${action.day}`,
            amount: bonus,
            status: 'completed',
            at: now.toISOString(),
            note: 'Simulated activity bonus',
          },
          ...state.transactions,
        ],
      }
    }

    /* ---------------- Support ---------------- */

    case 'support/create': {
      const now = demoNow()
      const id = `TM-${93000 + state.tickets.length}`
      const ticket: SupportTicket = {
        id,
        userId: state.user.id,
        userLabel: `User · ${state.user.id}`,
        subject: action.subject,
        category: action.category,
        status: 'open',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        messages: [{ from: 'user', body: action.body, at: now.toISOString() }],
      }
      return { ...state, tickets: [ticket, ...state.tickets] }
    }

    case 'support/reply': {
      const now = demoNow().toISOString()
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.id
            ? {
                ...t,
                status: action.from === 'support' ? 'pending' : 'open',
                updatedAt: now,
                messages: [...t.messages, { from: action.from, body: action.body, at: now }],
              }
            : t,
        ),
      }
    }

    case 'support/close':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.id ? { ...t, status: 'closed', updatedAt: demoNow().toISOString() } : t,
        ),
      }

    case 'support/reopen':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.id ? { ...t, status: 'open', updatedAt: demoNow().toISOString() } : t,
        ),
      }

    /* ---------------- Profile & security ---------------- */

    case 'profile/update':
      return { ...state, user: { ...state.user, ...action.patch } }

    case 'profile/toggle2fa':
      return { ...state, user: { ...state.user, twoFactor: !state.user.twoFactor } }

    case 'profile/changePassword':
      return { ...state, user: { ...state.user, passwordChangedAt: demoNow().toISOString() } }

    case 'profile/revokeSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id || s.current) }

    /* ---------------- Admin ---------------- */

    case 'admin/userStatus':
      return {
        ...state,
        adminUsers: state.adminUsers.map((u) => (u.id === action.id ? { ...u, status: action.status } : u)),
      }

    case 'admin/productPatch':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      }

    case 'admin/orderStatus': {
      const now = demoNow()
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.orderNumber === action.orderNumber
            ? {
                ...o,
                status: action.status,
                completedAt: action.status === 'completed' ? (o.completedAt ?? now.toISOString()) : null,
              }
            : o,
        ),
        adminTasks: state.adminTasks.map((t) =>
          t.orderNumber === action.orderNumber ? { ...t, status: action.status } : t,
        ),
      }
    }

    case 'admin/packageStatus':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.pkg.packageId === action.packageId
            ? {
                ...o,
                pkg: {
                  ...o.pkg,
                  status: action.status,
                  timeline: buildTimeline(new Date(o.orderTime), action.status),
                },
              }
            : o,
        ),
      }

    case 'admin/packagePatch':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.pkg.packageId === action.packageId ? { ...o, pkg: { ...o.pkg, ...action.patch } } : o,
        ),
      }

    case 'admin/withdrawal':
      return {
        ...state,
        withdrawals: state.withdrawals.map((w) => (w.id === action.id ? { ...w, status: action.status } : w)),
        transactions: state.transactions.map((t) =>
          t.reference === action.id
            ? {
                ...t,
                status:
                  action.status === 'rejected' ? 'failed' : action.status === 'approved' ? 'completed' : 'processing',
              }
            : t,
        ),
      }

    case 'demo/reset':
      return { ...freshState(), auth: state.auth }

    default:
      return state
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return freshState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as AppState
    if (!parsed?.user?.id || !Array.isArray(parsed.orders)) return freshState()
    return parsed
  } catch {
    return freshState()
  }
}

export interface Toast {
  id: number
  title: string
  body?: string
  tone?: 'ok' | 'info' | 'danger'
}

interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
  dailyTarget: number
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextToastId = useRef(1)

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        /* storage full or unavailable — the demo still works in-memory */
      }
    }, 150)
    return () => window.clearTimeout(id)
  }, [state])

  /**
   * Sweep for pending tasks whose effective time has elapsed. The virtual
   * clock keeps ticking while the tab is open, so a countdown that reaches
   * zero has to actually settle the order rather than sit at "Expired".
   */
  useEffect(() => {
    const sweep = () => {
      const now = demoNow().getTime()
      const due = state.orders
        .filter((o) => o.status === 'pending' && new Date(o.expiresAt).getTime() <= now)
        .map((o) => o.orderNumber)
      if (due.length > 0) dispatch({ type: 'order/expire', orderNumbers: due })
    }
    sweep()
    const id = window.setInterval(sweep, 15_000)
    return () => window.clearInterval(id)
  }, [state.orders])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = nextToastId.current++
      setToasts((prev) => [...prev, { ...t, id }])
      window.setTimeout(() => dismissToast(id), 4200)
    },
    [dismissToast],
  )

  const value = useMemo<AppContextValue>(
    () => ({ state, dispatch, toasts, toast, dismissToast, dailyTarget: DAILY_TARGET }),
    [state, toasts, toast, dismissToast],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

/* ------------------------------------------------------------------ *
 * Derived selectors
 * ------------------------------------------------------------------ */

export function useOrders() {
  const { state } = useApp()
  return state.orders
}

export function useProduct(id: string | undefined) {
  const { state } = useApp()
  return useMemo(() => state.products.find((p) => p.id === id), [state.products, id])
}

export function useOrder(orderNumber: string | undefined) {
  const { state } = useApp()
  return useMemo(() => state.orders.find((o) => o.orderNumber === orderNumber), [state.orders, orderNumber])
}

export function useOrderByPackage(packageId: string | undefined) {
  const { state } = useApp()
  return useMemo(() => state.orders.find((o) => o.pkg.packageId === packageId), [state.orders, packageId])
}

export function useUnreadCount() {
  const { state } = useApp()
  return state.notifications.filter((n) => !n.read).length
}

export function useWalletTotals() {
  const { state } = useApp()
  return useMemo(
    () => ({
      available: state.wallet.available,
      pending: state.wallet.pending,
      total: round2(state.wallet.available + state.wallet.pending),
    }),
    [state.wallet],
  )
}

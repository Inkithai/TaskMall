import { addDays, addHours, addMinutes, DEMO_EPOCH } from '../lib/clock'
import { compactDate, dateLong } from '../lib/format'
import { createRng, hashString } from '../lib/rng'
import { buildPackage, SAMPLE_ADDRESS } from './packages'
import { getProduct, TASKABLE_PRODUCTS } from './products'
import type {
  Achievement,
  AdminCharts,
  AdminStats,
  AdminTask,
  AdminUserRow,
  AppNotification,
  DailyCheckIn,
  DeviceSession,
  LoginEvent,
  Order,
  OrderStatus,
  PackageStatus,
  PaymentMethod,
  Product,
  SupportTicket,
  TeamMember,
  Transaction,
  UserProfile,
  Wallet,
  WithdrawalRequest,
} from './types'

export const DAILY_TARGET = 15
export const INVITATION_CODE = 'TASK48291'
export const USER_ID = 'TM-102938'

/** Historic tasks completed before the visible 7-day window. */
const ARCHIVED_COMPLETED = 18

const round2 = (n: number) => Math.round(n * 100) / 100

function orderNumberFor(at: Date, suffix: string): string {
  const d2 = (n: number) => String(n).padStart(2, '0')
  return `${compactDate(at)}${d2(at.getHours())}${d2(at.getMinutes())}${d2(at.getSeconds())}${suffix}`
}

interface OrderSpec {
  product: Product
  quantity: number
  status: OrderStatus
  orderTime: Date
  completedAt?: Date | null
  effectiveHours?: number
  orderNumber?: string
  packageId?: string
  trackingNumber?: string
  packageStatus?: PackageStatus
}

function pickPackageStatus(spec: OrderSpec, now: Date): PackageStatus {
  if (spec.packageStatus) return spec.packageStatus
  if (spec.status === 'timeout') return 'cancelled'
  if (spec.status === 'pending') return 'preparing'
  const ageHours = (now.getTime() - spec.orderTime.getTime()) / 3_600_000
  if (ageHours > 72) return 'delivered'
  if (ageHours > 44) return 'out_for_delivery'
  if (ageHours > 20) return 'in_transit'
  if (ageHours > 3) return 'picked_up'
  if (ageHours > 2) return 'ready'
  return 'preparing'
}

function buildOrder(spec: OrderSpec, now: Date): Order {
  const { product, quantity, status, orderTime } = spec
  const amount = round2(product.price * quantity)
  const reward = round2(amount * product.rewardRate)
  const rng = createRng(hashString(`${product.id}:${orderTime.toISOString()}:${quantity}`))
  const effectiveHours = spec.effectiveHours ?? 24
  const orderNumber = spec.orderNumber ?? orderNumberFor(orderTime, rng.digits(4))
  const completedAt = status === 'completed' ? (spec.completedAt ?? addMinutes(orderTime, rng.int(22, 88))) : null
  const packageStatus = pickPackageStatus(spec, now)
  const estimatedDelivery = addDays(orderTime, 3)

  return {
    orderNumber,
    userId: USER_ID,
    productId: product.id,
    quantity,
    amount,
    rewardRate: product.rewardRate,
    reward,
    status,
    orderTime: orderTime.toISOString(),
    processingTime: status === 'pending' ? null : (completedAt ?? addHours(orderTime, effectiveHours)).toISOString(),
    completedAt: completedAt ? completedAt.toISOString() : null,
    effectiveHours,
    expiresAt: addHours(orderTime, effectiveHours).toISOString(),
    pkg: buildPackage({
      orderTime,
      product,
      quantity,
      status: packageStatus,
      packageId: spec.packageId,
      trackingNumber: spec.trackingNumber,
      rng,
      estimatedDelivery,
      estimatedWindow: `${String(addDays(orderTime, 2).getDate()).padStart(2, '0')}–${dateLong(addDays(orderTime, 4))}`,
    }),
  }
}

const P = (id: string): Product => {
  const product = getProduct(id)
  if (!product) throw new Error(`Unknown product ${id}`)
  return product
}

/* ------------------------------------------------------------------ *
 * Today's task set
 *
 * 12 completed + 2 open. The twelve completed rewards sum to exactly
 * LKR 1,245.60 — the "Today's Reward" figure on the Home balance card.
 * ------------------------------------------------------------------ */
function todayOrders(now: Date): Order[] {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const at = (h: number, m: number, s = 0) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, s)

  const completed: OrderSpec[] = [
    { product: P('TM-PROD-00193'), quantity: 1, status: 'completed', orderTime: at(8, 5, 12) },
    { product: P('TM-PROD-00422'), quantity: 1, status: 'completed', orderTime: at(8, 42, 38) },
    { product: P('TM-PROD-00510'), quantity: 1, status: 'completed', orderTime: at(9, 14, 2) },
    { product: P('TM-PROD-00422'), quantity: 1, status: 'completed', orderTime: at(9, 48, 51) },
    {
      // The order used throughout the specification.
      product: P('TM-PROD-00192'),
      quantity: 1,
      status: 'completed',
      orderTime: at(10, 25, 34),
      completedAt: at(12, 50, 6),
      orderNumber: '202610011253449390',
      packageId: 'TM-PKG-829341',
      trackingNumber: 'TMX20261001293841',
      packageStatus: 'in_transit',
    },
    { product: P('TM-PROD-00232'), quantity: 1, status: 'completed', orderTime: at(10, 58, 19) },
    { product: P('TM-PROD-00511'), quantity: 1, status: 'completed', orderTime: at(11, 20, 44) },
    { product: P('TM-PROD-00193'), quantity: 1, status: 'completed', orderTime: at(11, 44, 7) },
    { product: P('TM-PROD-00422'), quantity: 1, status: 'completed', orderTime: at(12, 2, 25) },
    { product: P('TM-PROD-00310'), quantity: 1, status: 'completed', orderTime: at(12, 21, 9) },
    { product: P('TM-PROD-00232'), quantity: 1, status: 'completed', orderTime: at(12, 40, 55) },
    {
      product: P('TM-PROD-00233'),
      quantity: 1,
      status: 'completed',
      orderTime: at(12, 53, 44),
      completedAt: at(12, 58, 20),
      orderNumber: '202610011253449421',
      packageStatus: 'preparing',
    },
  ]

  const open: OrderSpec[] = [
    {
      // Approaching its effective-time deadline — drives the "Task Expiring" alert.
      product: P('TM-PROD-00231'),
      quantity: 1,
      status: 'pending',
      orderTime: new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 14, 20, 11),
      orderNumber: '202610011253449420',
      effectiveHours: 24,
    },
    { product: P('TM-PROD-00233'), quantity: 1, status: 'pending', orderTime: at(12, 58, 3), effectiveHours: 24 },
  ]

  return [...completed, ...open].map((spec) => buildOrder(spec, now))
}

/** Six days of history behind today, including two timed-out tasks. */
function historyOrders(now: Date): Order[] {
  const rng = createRng(90210)
  const specs: OrderSpec[] = []
  const pool = TASKABLE_PRODUCTS.filter((p) => p.id !== 'TM-PROD-00311')

  for (let dayBack = 1; dayBack <= 6; dayBack++) {
    const perDay = dayBack % 2 === 0 ? 2 : 3
    for (let i = 0; i < perDay; i++) {
      const product = rng.pick(pool)
      const base = addDays(now, -dayBack)
      const orderTime = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        rng.int(8, 18),
        rng.int(0, 59),
        rng.int(0, 59),
      )
      const timeout = (dayBack === 2 && i === 1) || (dayBack === 5 && i === 0)
      specs.push({
        product,
        quantity: rng.bool(0.82) ? 1 : 2,
        status: timeout ? 'timeout' : 'completed',
        orderTime,
        packageStatus: timeout ? (dayBack === 5 ? 'exception' : 'cancelled') : undefined,
      })
    }
  }

  return specs.map((spec) => buildOrder(spec, now)).sort((a, b) => +new Date(b.orderTime) - +new Date(a.orderTime))
}

/* ------------------------------------------------------------------ *
 * Ledger
 *
 * Every completed task books three entries: the simulated order debit, the
 * return of that held capital, and the reward credit. Net effect = + reward.
 * Open tasks hold their capital (that is the wallet's "Pending" bucket) and
 * timed-out tasks have their capital refunded with no reward.
 *
 * The ledger reconciles exactly to the available balance via a single
 * "Opening Simulated Balance" entry.
 * ------------------------------------------------------------------ */
function buildLedger(orders: Order[], now: Date): { transactions: Transaction[]; withdrawals: WithdrawalRequest[] } {
  const tx: Transaction[] = []
  const push = (t: Transaction) => tx.push(t)

  for (const order of orders) {
    const product = getProduct(order.productId)
    const label = product?.name ?? 'Task product'

    push({
      id: `TX-ORD-${order.orderNumber}`,
      type: 'order',
      title: 'Order Simulation',
      reference: order.orderNumber,
      amount: -order.amount,
      status: order.status === 'pending' ? 'processing' : 'completed',
      at: order.orderTime,
      note: `${label} — simulated task capital ${order.status === 'pending' ? 'held' : 'debited'}`,
    })

    if (order.status === 'completed' && order.completedAt) {
      push({
        id: `TX-RET-${order.orderNumber}`,
        type: 'order',
        title: 'Task Capital Returned',
        reference: order.orderNumber,
        amount: order.amount,
        status: 'completed',
        at: order.completedAt,
        note: 'Held simulated capital released back to the available balance',
      })
      push({
        id: `TX-RWD-${order.orderNumber}`,
        type: 'reward',
        title: 'Order Reward',
        reference: order.orderNumber,
        amount: order.reward,
        status: 'completed',
        at: order.completedAt,
        note: `${(order.rewardRate * 100).toFixed(2)}% of the simulated order amount`,
      })
    }

    if (order.status === 'timeout') {
      push({
        id: `TX-RFD-${order.orderNumber}`,
        type: 'order',
        title: 'Task Capital Refunded',
        reference: order.orderNumber,
        amount: order.amount,
        status: 'completed',
        at: order.expiresAt,
        note: 'Effective time elapsed — no reward issued, simulated capital returned in full',
      })
    }
  }

  push({
    id: 'TX-RCH-20260928-0001',
    type: 'recharge',
    title: 'Simulated Recharge',
    amount: 10000,
    status: 'completed',
    at: addDays(now, -3).toISOString(),
    method: 'Demo credit (no payment processed)',
  })

  const withdrawalAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 12, 0)
  const withdrawals: WithdrawalRequest[] = [
    {
      id: `WD-${compactDate(withdrawalAt)}-00192`,
      userId: USER_ID,
      amount: 5000,
      method: 'bank',
      account: '8841 •••• 2290',
      accountName: 'Sample Account Holder',
      status: 'processing',
      at: withdrawalAt.toISOString(),
    },
    {
      id: `WD-${compactDate(addDays(now, -5))}-00147`,
      userId: USER_ID,
      amount: 3500,
      method: 'ewallet',
      account: '07X XXX 4410',
      accountName: 'Sample Wallet',
      status: 'approved',
      at: addDays(now, -5).toISOString(),
    },
  ]

  push({
    id: `TX-WDR-${withdrawals[0].id}`,
    type: 'withdrawal',
    title: 'Simulated Withdrawal',
    reference: withdrawals[0].id,
    amount: -5000,
    status: 'processing',
    at: withdrawals[0].at,
    method: 'Bank Account · 8841 •••• 2290',
    note: 'No real funds were transferred',
  })

  push({
    id: `TX-WDR-${withdrawals[1].id}`,
    type: 'withdrawal',
    title: 'Simulated Withdrawal',
    reference: withdrawals[1].id,
    amount: -3500,
    status: 'completed',
    at: withdrawals[1].at,
    method: 'E-Wallet · 07X XXX 4410',
    note: 'No real funds were transferred',
  })

  return { transactions: tx, withdrawals }
}

function buildTeam(now: Date): TeamMember[] {
  const rng = createRng(4821)
  return Array.from({ length: 24 }, (_, i) => {
    const level = (i < 12 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3
    return {
      id: `TM-${String(200 + i)}`,
      name: `User ${String(i + 1).padStart(3, '0')}`,
      level,
      // 18 active / 6 inactive
      status: i < 18 ? 'active' : 'inactive',
      joined: addDays(now, -rng.int(2, 180)).toISOString(),
      tasksCompleted: rng.int(0, 160),
    }
  })
}

function buildNotifications(now: Date, orders: Order[]): AppNotification[] {
  const completedToday = orders.find((o) => o.orderNumber === '202610011253449390')
  const expiring = orders.find((o) => o.orderNumber === '202610011253449420')

  return [
    {
      id: 'NT-0001',
      kind: 'task',
      title: 'New Task',
      body: 'A new simulated order is available in the Product List.',
      at: addMinutes(now, -2).toISOString(),
      read: false,
      link: '/products',
    },
    {
      id: 'NT-0002',
      kind: 'completed',
      title: 'Task Completed',
      body: `Order #${completedToday?.orderNumber ?? ''} has been completed. Simulated reward credited.`,
      at: addMinutes(now, -15).toISOString(),
      read: false,
      link: `/orders/${completedToday?.orderNumber ?? ''}`,
    },
    {
      id: 'NT-0003',
      kind: 'expiring',
      title: 'Task Expiring',
      body: `Order #${expiring?.orderNumber ?? ''} is approaching its simulated deadline.`,
      at: addMinutes(now, -60).toISOString(),
      read: false,
      link: `/orders/${expiring?.orderNumber ?? ''}`,
    },
    {
      id: 'NT-0004',
      kind: 'system',
      title: 'Package In Transit',
      body: 'Package TM-PKG-829341 is moving toward its destination. Estimated delivery 04 October 2026.',
      at: addMinutes(now, -125).toISOString(),
      read: true,
      link: '/packages/TM-PKG-829341',
    },
    {
      id: 'NT-0005',
      kind: 'wallet',
      title: 'Withdrawal Simulation Received',
      body: 'Request WD-20261001-00192 for LKR 5,000.00 is being processed. No real funds move in this demo.',
      at: addHours(now, -4).toISOString(),
      read: true,
      link: '/wallet/transactions',
    },
    {
      id: 'NT-0006',
      kind: 'system',
      title: 'Demo Notice',
      body: 'TaskMall is a simulation. No deposit is ever required and no balance here is withdrawable.',
      at: addDays(now, -1).toISOString(),
      read: true,
      link: '/about',
    },
  ]
}

function buildTickets(now: Date): SupportTicket[] {
  return [
    {
      id: 'TM-92821',
      userId: USER_ID,
      userLabel: 'User · TM-102938',
      subject: 'Order question',
      category: 'Orders',
      status: 'open',
      createdAt: addHours(now, -5).toISOString(),
      updatedAt: addHours(now, -3).toISOString(),
      messages: [
        {
          from: 'user',
          body: 'Order #202610011253449390 shows as completed but the package still says In Transit. Is that expected?',
          at: addHours(now, -5).toISOString(),
        },
        {
          from: 'support',
          body: 'Yes — order status and package status are tracked separately. The task is complete and the simulated reward is credited; the package timeline continues independently until delivery.',
          at: addHours(now, -3).toISOString(),
        },
      ],
    },
    {
      id: 'TM-92744',
      userId: USER_ID,
      userLabel: 'User · TM-102938',
      subject: 'How is the reward rate calculated?',
      category: 'Rewards',
      status: 'closed',
      createdAt: addDays(now, -4).toISOString(),
      updatedAt: addDays(now, -4).toISOString(),
      messages: [
        { from: 'user', body: 'Where does the 3.00% come from?', at: addDays(now, -4).toISOString() },
        {
          from: 'support',
          body: 'Each product carries its own simulated reward rate. Reward = order amount × reward rate, rounded to two decimals.',
          at: addDays(now, -4).toISOString(),
        },
      ],
    },
  ]
}

function buildAdminUsers(now: Date): AdminUserRow[] {
  const rng = createRng(1337)
  const rows: AdminUserRow[] = [
    {
      id: 'TM001',
      name: 'User 001',
      email: 'user001@example.com',
      phone: '+94 7X XXX 1001',
      status: 'active',
      orders: 42,
      balance: 8240,
      joined: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
      level: 2,
      lastActive: addMinutes(now, -8).toISOString(),
    },
    {
      id: 'TM002',
      name: 'User 002',
      email: 'user002@example.com',
      phone: '+94 7X XXX 1002',
      status: 'active',
      orders: 18,
      balance: 4120,
      joined: addDays(now, -2).toISOString(),
      level: 1,
      lastActive: addMinutes(now, -42).toISOString(),
    },
  ]

  for (let i = 3; i <= 24; i++) {
    const status = i % 9 === 0 ? 'suspended' : i % 7 === 0 ? 'pending' : 'active'
    rows.push({
      id: `TM${String(i).padStart(3, '0')}`,
      name: `User ${String(i).padStart(3, '0')}`,
      email: `user${String(i).padStart(3, '0')}@example.com`,
      phone: `+94 7X XXX ${1000 + i}`,
      status,
      orders: rng.int(0, 96),
      balance: rng.int(0, 42) * 310,
      joined: addDays(now, -rng.int(1, 210)).toISOString(),
      level: rng.int(1, 3),
      lastActive: addMinutes(now, -rng.int(3, 8000)).toISOString(),
    })
  }
  return rows
}

function buildAdminTasks(orders: Order[], now: Date): AdminTask[] {
  const rng = createRng(777)
  const own: AdminTask[] = orders.slice(0, 14).map((o, i) => ({
    id: `TM-TASK-${4800 + i}`,
    orderNumber: o.orderNumber,
    userId: USER_ID,
    userLabel: 'User · TM-102938',
    productId: o.productId,
    assignedAt: o.orderTime,
    dueAt: o.expiresAt,
    status: o.status,
    reward: o.reward,
  }))

  const others: AdminTask[] = Array.from({ length: 16 }, (_, i) => {
    const product = rng.pick(TASKABLE_PRODUCTS)
    const assigned = addMinutes(now, -rng.int(30, 4000))
    const status: OrderStatus = rng.bool(0.72) ? 'completed' : rng.bool(0.7) ? 'pending' : 'timeout'
    return {
      id: `TM-TASK-${4900 + i}`,
      orderNumber: orderNumberFor(assigned, String(2000 + i * 7)),
      userId: `TM${String(rng.int(1, 24)).padStart(3, '0')}`,
      userLabel: `User ${String(rng.int(1, 24)).padStart(3, '0')}`,
      productId: product.id,
      assignedAt: assigned.toISOString(),
      dueAt: addHours(assigned, 24).toISOString(),
      status,
      reward: round2(product.price * product.rewardRate),
    }
  })

  return [...own, ...others].sort((a, b) => +new Date(b.assignedAt) - +new Date(a.assignedAt))
}

function buildCharts(now: Date): AdminCharts {
  const rng = createRng(2026)
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, -(6 - i))
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
  })

  return {
    dailyUsers: labels.map((label) => ({ label, value: rng.int(3200, 5400) })),
    ordersPerDay: labels.map((label) => ({ label, value: rng.int(9200, 14800) })),
    completedVsPending: [
      { label: 'Completed', value: 71820 },
      { label: 'Pending', value: 8291 },
      { label: 'Time Out', value: 2301 },
    ],
    taskActivity: labels.map((label) => ({ label, value: rng.int(5400, 11200) })),
    simulatedRewards: labels.map((label) => ({ label, value: rng.int(180000, 420000) })),
    withdrawalSimulations: labels.map((label) => ({ label, value: rng.int(40, 180) })),
  }
}

export interface SeedData {
  user: UserProfile
  wallet: Wallet
  openingBalance: number
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

export function createSeed(now: Date = DEMO_EPOCH): SeedData {
  const orders = [...todayOrders(now), ...historyOrders(now)].sort(
    (a, b) => +new Date(b.orderTime) - +new Date(a.orderTime),
  )

  const { transactions, withdrawals } = buildLedger(orders, now)

  // Available balance is the spec figure; derive the opening entry so the
  // ledger adds up to it exactly.
  //
  // Every row counts, including the "processing" debits of open tasks — that
  // capital really has left the available balance (it is shown again under
  // Pending, because it still belongs to the user). Keeping the sum total
  // means accept / complete / timeout each move the ledger and the balance by
  // the same amount, so `available === sum(transactions)` always holds.
  const AVAILABLE = 18450
  const settled = transactions.reduce((sum, t) => sum + t.amount, 0)
  const openingBalance = round2(AVAILABLE - settled)

  transactions.push({
    id: 'TX-OPEN-0000',
    type: 'recharge',
    title: 'Opening Simulated Balance',
    amount: openingBalance,
    status: 'completed',
    at: addDays(now, -7).toISOString(),
    note: 'Starting figure for this demo account',
  })

  transactions.sort((a, b) => +new Date(b.at) - +new Date(a.at))

  // Pending = simulated task capital currently held by open orders.
  const pending = round2(orders.filter((o) => o.status === 'pending').reduce((sum, o) => sum + o.amount, 0))

  const completedCount = orders.filter((o) => o.status === 'completed').length
  const lifetimeCompleted = completedCount + ARCHIVED_COMPLETED

  const achievements: Achievement[] = [
    {
      id: 'ACH-1',
      icon: '🏆',
      title: 'First Order',
      description: 'Complete your first task',
      target: 1,
      progress: lifetimeCompleted,
    },
    {
      id: 'ACH-10',
      icon: '🔥',
      title: '10 Orders',
      description: 'Complete 10 tasks',
      target: 10,
      progress: lifetimeCompleted,
    },
    {
      id: 'ACH-50',
      icon: '⭐',
      title: '50 Orders',
      description: 'Complete 50 tasks',
      target: 50,
      progress: lifetimeCompleted,
    },
    {
      id: 'ACH-100',
      icon: '💎',
      title: '100 Orders',
      description: 'Complete 100 tasks',
      target: 100,
      progress: lifetimeCompleted,
    },
  ]

  const dailyCheckIn: DailyCheckIn[] = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    claimed: i < 4,
    rewardLabel: ['+5', '+10', '+15', '+20', '+30', '+40', '+75'][i],
  }))

  const user: UserProfile = {
    id: USER_ID,
    name: 'Demo User',
    email: 'demo.user@example.com',
    phone: '+94 7X XXX 2938',
    avatarInitials: 'DU',
    status: 'Verified',
    invitationCode: INVITATION_CODE,
    invitedBy: 'TASK10027',
    joined: addDays(now, -214).toISOString(),
    level: 2,
    language: 'English',
    twoFactor: true,
    passwordChangedAt: addDays(now, -24).toISOString(),
    address: SAMPLE_ADDRESS,
    notificationPrefs: {
      newTasks: true,
      orderUpdates: true,
      packageUpdates: true,
      walletActivity: true,
      teamActivity: false,
      productNews: false,
    },
  }

  const sessions: DeviceSession[] = [
    {
      id: 'SES-1',
      device: 'Windows PC',
      browser: 'Chrome 129',
      location: 'Colombo, LK (sample)',
      lastActive: now.toISOString(),
      current: true,
    },
    {
      id: 'SES-2',
      device: 'Android',
      browser: 'TaskMall App 2.4',
      location: 'Colombo, LK (sample)',
      lastActive: addHours(now, -2).toISOString(),
      current: false,
    },
    {
      id: 'SES-3',
      device: 'iPad',
      browser: 'Safari 18',
      location: 'Kandy, LK (sample)',
      lastActive: addDays(now, -6).toISOString(),
      current: false,
    },
  ]

  const loginHistory: LoginEvent[] = [
    {
      id: 'LG-1',
      device: 'Chrome / Windows',
      location: 'Colombo, LK (sample)',
      ip: '203.0.113.24',
      at: addMinutes(now, -46).toISOString(),
      result: 'success',
    },
    {
      id: 'LG-2',
      device: 'TaskMall App / Android',
      location: 'Colombo, LK (sample)',
      ip: '203.0.113.88',
      at: addHours(now, -2).toISOString(),
      result: 'success',
    },
    {
      id: 'LG-3',
      device: 'Unknown browser',
      location: 'Unrecognised location (sample)',
      ip: '198.51.100.7',
      at: addDays(now, -2).toISOString(),
      result: 'blocked',
    },
    {
      id: 'LG-4',
      device: 'Safari / iPad',
      location: 'Kandy, LK (sample)',
      ip: '203.0.113.150',
      at: addDays(now, -6).toISOString(),
      result: 'success',
    },
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'PM-1',
      kind: 'bank',
      label: 'Example Bank — Savings',
      account: '8841 •••• 2290',
      holder: 'Sample Account Holder',
      primary: true,
    },
    {
      id: 'PM-2',
      kind: 'ewallet',
      label: 'Sample E-Wallet',
      account: '07X XXX 4410',
      holder: 'Sample Account Holder',
      primary: false,
    },
  ]

  const adminStats: AdminStats = {
    totalUsers: 12482,
    activeUsers: 4821,
    orders: 82412,
    completed: 71820,
    pending: 8291,
    supportTickets: 184,
  }

  return {
    user,
    wallet: { available: AVAILABLE, pending },
    openingBalance,
    orders,
    transactions,
    withdrawals,
    team: buildTeam(now),
    notifications: buildNotifications(now, orders),
    achievements,
    dailyCheckIn,
    tickets: buildTickets(now),
    sessions,
    loginHistory,
    paymentMethods,
    adminUsers: buildAdminUsers(now),
    adminTasks: buildAdminTasks(orders, now),
    adminStats,
    adminCharts: buildCharts(now),
    lifetimeCompleted,
  }
}

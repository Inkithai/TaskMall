/* ------------------------------------------------------------------ *
 * TaskMall domain model
 *
 * ORDER
 *  ├── Order Number / User / Product / Amount
 *  ├── Reward Rate / Simulated Reward / Order Status
 *  └── PACKAGE
 *        ├── Package ID / Tracking Number / Courier / Status
 *        ├── Weight / Dimensions / Shipping Method
 *        └── Delivery Address / Estimated Delivery / Timeline
 *
 * Order processing and physical package tracking stay logically separate.
 * ------------------------------------------------------------------ */

export type Category = 'Food' | 'Beauty' | 'Electronics' | 'Household' | 'Lifestyle'

export const CATEGORIES: Category[] = ['Food', 'Beauty', 'Electronics', 'Household', 'Lifestyle']

export type OrderStatus = 'pending' | 'completed' | 'timeout'

export type PackageStatus =
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled'

export type TimelineState = 'done' | 'current' | 'upcoming' | 'exception'

export type TransactionType = 'reward' | 'order' | 'recharge' | 'withdrawal'

export type TransactionStatus = 'completed' | 'processing' | 'failed'

export interface Dimensions {
  length: number
  width: number
  height: number
}

export interface Product {
  id: string // TM-PROD-00192
  slug: string
  name: string
  subtitle: string
  brand: string
  category: Category
  price: number
  rewardRate: number // 0.03 -> 3.00%
  rating: number
  reviews: number
  weightKg: number
  packageType: 'Standard' | 'Express' | 'Fragile' | 'Bulk'
  dimensions: Dimensions
  inStock: boolean
  stock: number
  active: boolean
  taskSlots: number
  image?: string
  emoji: string
  accent: string
  description: string
  highlights: string[]
}

export interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  country: string
  postal: string
}

export interface PackageEvent {
  key: string
  label: string
  at: string | null
  state: TimelineState
  note?: string
}

export interface PackageContent {
  productId: string
  name: string
  quantity: number
  weightKg: number
}

export interface PackageInfo {
  packageId: string // TM-PKG-829341
  trackingNumber: string // TMX20261001293841
  courier: string
  courierPhone: string
  service: string
  status: PackageStatus
  packageType: Product['packageType']
  weightKg: number
  dimensions: Dimensions
  shippingMethod: string
  shippingFee: number
  address: Address
  destination: string
  estimatedDelivery: string
  estimatedWindow: string
  timeline: PackageEvent[]
  contents: PackageContent[]
}

export interface OrderTimelineStep {
  key: 'created' | 'assigned' | 'processing' | 'completed'
  label: string
  at: string | null
  state: TimelineState
}

export interface Order {
  orderNumber: string // 202610011253449390
  userId: string
  productId: string
  quantity: number
  amount: number
  rewardRate: number
  reward: number
  status: OrderStatus
  orderTime: string
  processingTime: string | null
  completedAt: string | null
  effectiveHours: number
  expiresAt: string
  pkg: PackageInfo
}

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  reference?: string
  amount: number // signed
  status: TransactionStatus
  at: string
  method?: string
  note?: string
}

export interface WithdrawalRequest {
  id: string // WD-20261001-00192
  userId: string
  amount: number
  method: 'bank' | 'ewallet'
  account: string
  accountName: string
  status: 'simulated' | 'processing' | 'approved' | 'rejected'
  at: string
}

export interface TeamMember {
  id: string
  name: string
  level: 1 | 2 | 3
  status: 'active' | 'inactive'
  joined: string
  tasksCompleted: number
}

export type NotificationKind = 'task' | 'completed' | 'expiring' | 'wallet' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  at: string
  read: boolean
  link?: string
}

export interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  target: number
  progress: number
}

export interface DailyCheckIn {
  day: number
  claimed: boolean
  rewardLabel: string
}

export interface SupportMessage {
  from: 'user' | 'support'
  body: string
  at: string
}

export interface SupportTicket {
  id: string // TM-92821
  userId: string
  userLabel: string
  subject: string
  category: string
  status: 'open' | 'pending' | 'closed'
  createdAt: string
  updatedAt: string
  messages: SupportMessage[]
}

export interface DeviceSession {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  current: boolean
}

export interface LoginEvent {
  id: string
  device: string
  location: string
  ip: string
  at: string
  result: 'success' | 'blocked'
}

export interface PaymentMethod {
  id: string
  kind: 'bank' | 'ewallet'
  label: string
  account: string
  holder: string
  primary: boolean
}

export interface Wallet {
  available: number
  pending: number
}

export interface UserProfile {
  id: string // TM-102938
  name: string
  email: string
  phone: string
  avatarInitials: string
  status: 'Verified' | 'Unverified'
  invitationCode: string
  invitedBy?: string
  joined: string
  level: number
  language: string
  twoFactor: boolean
  passwordChangedAt: string
  address: Address
  notificationPrefs: {
    newTasks: boolean
    orderUpdates: boolean
    packageUpdates: boolean
    walletActivity: boolean
    teamActivity: boolean
    productNews: boolean
  }
}

export interface AdminUserRow {
  id: string // TM001
  name: string
  email: string
  phone: string
  status: 'active' | 'suspended' | 'pending'
  orders: number
  balance: number
  joined: string
  level: number
  lastActive: string
}

export interface AdminTask {
  id: string // TM-TASK-4821
  orderNumber: string
  userId: string
  userLabel: string
  productId: string
  assignedAt: string
  dueAt: string
  status: OrderStatus
  reward: number
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  orders: number
  completed: number
  pending: number
  supportTickets: number
}

export interface SeriesPoint {
  label: string
  value: number
}

export interface AdminCharts {
  dailyUsers: SeriesPoint[]
  ordersPerDay: SeriesPoint[]
  completedVsPending: SeriesPoint[]
  taskActivity: SeriesPoint[]
  simulatedRewards: SeriesPoint[]
  withdrawalSimulations: SeriesPoint[]
}

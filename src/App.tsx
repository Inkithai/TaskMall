import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useApp } from './store/AppContext'
import { MobileShell } from './components/layout/MobileShell'
import { AdminShell } from './components/admin/AdminShell'

/* Auth */
import Login from './screens/auth/Login'
import Register from './screens/auth/Register'
import ForgotPassword from './screens/auth/ForgotPassword'

/* User app */
import Home from './screens/user/Home'
import Orders from './screens/user/Orders'
import OrderDetails from './screens/user/OrderDetails'
import ProductList from './screens/user/ProductList'
import ProductDetails from './screens/user/ProductDetails'
import ProductPackageInfo from './screens/user/ProductPackageInfo'
import Packages from './screens/user/Packages'
import PackageDetails from './screens/user/PackageDetails'
import Wallet from './screens/user/Wallet'
import Recharge from './screens/user/Recharge'
import Withdraw from './screens/user/Withdraw'
import Transactions from './screens/user/Transactions'
import Team from './screens/user/Team'
import Rewards from './screens/user/Rewards'
import Notifications from './screens/user/Notifications'
import Profile from './screens/user/Profile'
import Security from './screens/user/Security'
import Support from './screens/user/Support'
import About from './screens/user/About'
import { Language, NotificationSettings, PaymentMethods, PersonalInformation } from './screens/user/AccountScreens'

/* Admin */
import AdminLogin from './screens/admin/AdminLogin'
import AdminDashboard from './screens/admin/Dashboard'
import AdminUsers from './screens/admin/AdminUsers'
import AdminProducts from './screens/admin/AdminProducts'
import AdminOrders from './screens/admin/AdminOrders'
import AdminPackages from './screens/admin/AdminPackages'
import AdminTasks from './screens/admin/AdminTasks'
import AdminTransactions from './screens/admin/AdminTransactions'
import AdminWithdrawals from './screens/admin/AdminWithdrawals'
import AdminSupport from './screens/admin/AdminSupport'
import AdminReports from './screens/admin/AdminReports'
import { AdminNotifications, AdminRewards, AdminSettings } from './screens/admin/AdminMisc'

import NotFound from './screens/NotFound'

function RequireUser({ children }: { children: ReactNode }) {
  const { state } = useApp()
  const location = useLocation()
  if (!state.auth.user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { state } = useApp()
  if (!state.auth.admin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { state } = useApp()
  if (state.auth.user) return <Navigate to="/home" replace />
  return <>{children}</>
}

export default function App() {
  const { state } = useApp()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={state.auth.user ? '/home' : '/login'} replace />} />

      {/* Authentication */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthed>
            <Register />
          </RedirectIfAuthed>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* User application */}
      <Route
        element={
          <RequireUser>
            <MobileShell />
          </RequireUser>
        }
      >
        <Route path="/home" element={<Home />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderNumber" element={<OrderDetails />} />

        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/products/:productId/package" element={<ProductPackageInfo />} />

        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:packageId" element={<PackageDetails />} />

        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet/recharge" element={<Recharge />} />
        <Route path="/wallet/withdraw" element={<Withdraw />} />
        <Route path="/wallet/transactions" element={<Transactions />} />

        <Route path="/team" element={<Team />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/notifications" element={<Notifications />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/personal" element={<PersonalInformation />} />
        <Route path="/profile/payment-methods" element={<PaymentMethods />} />
        <Route path="/profile/notifications" element={<NotificationSettings />} />
        <Route path="/profile/language" element={<Language />} />
        <Route path="/security" element={<Security />} />
        <Route path="/support" element={<Support />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Admin application */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminShell />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="rewards" element={<AdminRewards />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * Bilingual interface layer.
 *
 * The reference platform this demo studies (see docs/task-scam-red-flags.md)
 * targets Sri Lankan users with a Sinhala-first interface and English chrome
 * (tab labels, IDs). This module reproduces that split: Sinhala body copy,
 * English structural labels, English fallback for anything untranslated.
 *
 * Safety copy (demo notices, simulation warnings) is ALWAYS rendered in both
 * languages — it is never reduced to one language, so the framing of this
 * build as a simulation survives every language choice.
 */

export type Lang = 'si' | 'en'

const STORAGE_KEY = 'taskmall.lang.v1'

export const LANG_NAMES: Record<Lang, string> = {
  si: 'සිංහල (Sinhala)',
  en: 'English',
}

/** Profile-language strings stored on the user record. */
export const PROFILE_LANG: Record<Lang, string> = {
  si: 'සිංහල (Sinhala)',
  en: 'English',
}

interface Entry {
  en: string
  si: string
}

const DICT: Record<string, Entry> = {
  /* ---------------------------------------------------------------- */
  /* Shared / chrome                                                   */
  /* ---------------------------------------------------------------- */
  'common.viewAll': { en: 'View all', si: 'සියල්ල බලන්න' },
  'common.all': { en: 'All', si: 'සියල්ල' },
  'common.simulated': { en: 'Simulated', si: 'අනුකරණය' },
  'common.today': { en: 'Today', si: 'අද' },
  'common.hours': { en: 'hours', si: 'පැය' },
  'common.tasks': { en: 'tasks', si: 'කාර්යයන්' },
  'common.cancel': { en: 'Cancel', si: 'අවලංගු කරන්න' },
  'common.ok': { en: 'OK', si: 'හරි' },

  /* Demo ribbon — deliberately bilingual in BOTH languages */
  'ribbon.demo': {
    en: 'DEMO / SIMULATION — NO REAL MONEY · ආදර්ශනයක් — සැබෑ මුදල් නොමැත',
    si: 'ආදර්ශනයක් — සැබෑ මුදල් නොමැත · DEMO / SIMULATION — NO REAL MONEY',
  },

  /* Greetings */
  'greet.morning': { en: 'Good morning', si: 'සුබ උදෑසනක්' },
  'greet.afternoon': { en: 'Good afternoon', si: 'සුබ දහවලක්' },
  'greet.evening': { en: 'Good evening', si: 'සුබ සැන්දෑවක්' },
  'greet.night': { en: 'Good night', si: 'සුබ රාත්‍රියක්' },

  /* ---------------------------------------------------------------- */
  /* Login — mirrors the reference site's phrasing                    */
  /* ---------------------------------------------------------------- */
  'login.welcome': { en: 'Welcome Back', si: 'නැවත සාදරයෙන් පිළිගනිමු' },
  'login.sub': {
    en: 'Sign in to your TaskMall demo account',
    si: 'ඔබගේ TaskMall ආදර්ශන ගිණුමට පිවිසෙන්න',
  },
  'login.phone': { en: 'Phone Number', si: 'දුරකථන අංකය' },
  'login.phonePlaceholder': {
    en: 'Please enter your phone number.',
    si: 'කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.',
  },
  'login.password': { en: 'Password', si: 'මුරපදය' },
  'login.passwordPlaceholder': {
    en: 'Please enter your login password.',
    si: 'කරුණාකර ඔබගේ පිවිසුම් මුරපදය ඇතුළත් කරන්න.',
  },
  'login.submit': { en: 'Log in now', si: 'දැන් ලොග් වන්න' },
  'login.remember': { en: 'Remember me', si: 'මතක තබා ගන්න' },
  'login.forgot': { en: 'Forgot Password?', si: 'මුරපදය අමතක වුණාද?' },
  'login.noAccount': { en: "Don't have an account?", si: 'ගිණුමක් නැද්ද?' },
  'login.register': { en: 'Register', si: 'ලියාපදිංචි කරන්න' },
  'login.errorPhone': { en: 'Enter your phone number', si: 'ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න' },
  'login.errorPassword': {
    en: 'Enter your password (demo password: taskmall)',
    si: 'මුරපදය ඇතුළත් කරන්න (ආදර්ශන මුරපදය: taskmall)',
  },
  'login.toastTitle': { en: 'Signed in', si: 'පිවිසුම සාර්ථකයි' },
  'login.toastBody': {
    en: 'Demo session started — all values are simulated.',
    si: 'ආදර්ශන සැසිය ආරම්භ විය — සියලු අගයන් අනුකරණය වේ.',
  },
  'login.adminLink': { en: 'Open the Admin Console', si: 'පරිපාලක කොන්සෝලය විවෘත කරන්න' },
  'login.footnote': {
    en: 'TaskMall is a research/demo build. Simulated commissions are not withdrawable funds and no payment is ever required to unlock tasks.',
    si: 'TaskMall යනු පර්යේෂණ/ආදර්ශන නිර්මාණයකි. අනුකරණ කොමිස් මුදල් ආපසු ගත නොහැකි අතර, කාර්යයන් අගුලු හැරීමට කිසිදු ගෙවීමක් අවශ්‍ය නොවේ.',
  },

  /* ---------------------------------------------------------------- */
  /* Register                                                          */
  /* ---------------------------------------------------------------- */
  'register.title': { en: 'Create Account', si: 'ගිණුමක් සාදන්න' },
  'register.sub': {
    en: 'Join TaskMall and start processing simulated orders.',
    si: 'TaskMall වෙත එක්වී අනුකරණ ඇණවුම් සැකසීම ආරම්භ කරන්න.',
  },
  'register.name': { en: 'Full Name', si: 'සම්පූර්ණ නම' },
  'register.namePlaceholder': { en: 'Your name', si: 'ඔබගේ නම' },
  'register.password': { en: 'Password', si: 'මුරපදය' },
  'register.confirm': { en: 'Confirm Password', si: 'මුරපදය නැවත ඇතුළත් කරන්න' },
  'register.invite': { en: 'Invitation Code', si: 'ආරාධනා කේතය' },
  'register.inviteHint': {
    en: 'Optional. Invitation codes do not grant any financial return in TaskMall.',
    si: 'විකල්පයි. TaskMall හි ආරාධනා කේත කිසිදු මූල්‍ය ප්‍රතිලාභයක් ලබා නොදෙයි.',
  },
  'register.email': { en: 'Email (optional)', si: 'විද්‍යුත් තැපෑල (විකල්ප)' },
  'register.emailHint': {
    en: 'Optional. Stored locally in this browser only.',
    si: 'විකල්පයි. මෙම බ්‍රව්සරයේ පමණක් ගබඩා වේ.',
  },
  'register.passwordPlaceholder': {
    en: 'At least 6 characters',
    si: 'අවම අකුරු 6ක්',
  },
  'register.errorName': { en: 'Enter your full name', si: 'ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න' },
  'register.errorPassword': { en: 'Use at least 6 characters', si: 'අවම අකුරු 6ක් භාවිත කරන්න' },
  'register.errorConfirm': { en: 'Passwords do not match', si: 'මුරපද නොගැලපේ' },
  'register.errorAgree': { en: 'Please accept the terms to continue', si: 'ඉදිරියට යාමට කොන්දේසි පිළිගන්න' },
  'register.agree': { en: 'I agree to the', si: 'මම එකඟ වන්නේ' },
  'register.terms': { en: 'Terms', si: 'කොන්දේසිවලට' },
  'register.toastTitle': { en: 'Account created', si: 'ගිණුම සාදන ලදී' },
  'register.toastBody': {
    en: 'This is a simulated account — no data leaves your browser.',
    si: 'මෙය අනුකරණ ගිණුමකි — දත්ත ඔබගේ බ්‍රව්සරයෙන් පිටතට නොයයි.',
  },
  'register.submit': { en: 'Create Account', si: 'ගිණුම සාදන්න' },
  'register.haveAccount': { en: 'Already have an account?', si: 'ගිණුමක් තිබේද?' },
  'register.login': { en: 'Log in now', si: 'දැන් ලොග් වන්න' },

  /* ---------------------------------------------------------------- */
  /* Home                                                              */
  /* ---------------------------------------------------------------- */
  'home.balance': { en: 'Simulated Balance', si: 'අනුකරණ ශේෂය' },
  'home.todayReward': { en: "Today's Reward", si: 'අද ත්‍යාගය' },
  'home.availablePending': { en: 'Available / Pending', si: 'භාවිතයට ඇත / අපේක්ෂිත' },
  'home.recharge': { en: 'Recharge', si: 'රීචාජ්' },
  'home.withdraw': { en: 'Withdraw', si: 'අරා ගන්න' },
  'home.todaysTasks': { en: "Today's Tasks", si: 'අද කාර්යයන්' },
  'home.completed': { en: 'Completed', si: 'සම්පූර්ණ' },
  'home.pending': { en: 'Pending', si: 'අපේක්ෂිත' },
  'home.timeout': { en: 'Time Out', si: 'කල් ඉක්මවිය' },
  'home.todaysProgress': { en: "Today's Progress", si: 'අද ප්‍රගතිය' },
  'home.progressNote': {
    en: '{done} of {total} simulated tasks completed',
    si: 'අනුකරණ කාර්යයන් {done} / {total} සම්පූර්ණයි',
  },
  'home.progressRemaining': { en: '{count} remaining today', si: 'අද තව {count}ක් ඉතිරිව ඇත' },
  'home.rent': { en: 'Rent', si: 'කුලී භාණ්ඩ' },
  'home.revenue': { en: 'Revenue', si: 'ආදායම' },
  'home.wallet': { en: 'Wallet', si: 'මුදල් පසුම්බිය' },
  'home.team': { en: 'Team', si: 'කණ්ඩායම' },
  'home.packages': { en: 'Packages on the Move', si: 'ගමන් කරන පැකේජ' },
  'home.allPackages': { en: 'All packages', si: 'සියලු පැකේජ' },
  'home.recentActivity': { en: 'Recent Activity', si: 'මෑත ක්‍රියාකාරකම්' },
  'home.history': { en: 'History', si: 'ඉතිහාසය' },
  'home.orderCompleted': { en: 'Order completed', si: 'ඇණවුම සම්පූර්ණයි' },
  'home.noCompleted': { en: 'No completed tasks yet.', si: 'තවම සම්පූර්ණ කළ කාර්යයන් නොමැත.' },
  'home.dailyActivity': { en: 'Daily Activity', si: 'දිනපතා ක්‍රියාකාරකම' },
  'home.checkedIn': { en: 'of 7 days checked in', si: 'දින 7න් පිවිසුණු දින' },
  'home.notice': { en: 'Notice', si: 'නිවේදන' },

  /* ---------------------------------------------------------------- */
  /* Rent (the store tab — where "grab order" lives on the reference) */
  /* ---------------------------------------------------------------- */
  'rent.title': { en: 'Rent', si: 'කුලී භාණ්ඩ' },
  'rent.search': { en: 'Search products...', si: 'භාණ්ඩ සොයන්න...' },
  'rent.infoTitle': { en: 'How renting works', si: 'කුලී ගැනීම ක්‍රියා කරන ආකාරය' },
  'rent.infoBody': {
    en: 'Renting holds simulated capital, the task credits the capital back plus a simulated reward. No real money is ever held — this mirrors the mechanics real task platforms use, without the cash flow.',
    si: 'කුලී ගැනීමේදී අනුකරණ ප්‍රාග්ධනයක් රඳවා ගන්නා අතර, කාර්යය සම්පූර්ණ වූ විට එය සමඟ අනුකරණ ත්‍යාගයක් ලැබේ. සැබෑ මුදලක් කිසිවිටෙක රඳවා ගන්නේ නැත.',
  },
  'rent.grab': { en: 'Grab Task', si: 'කාර්යය ලබා ගන්න' },
  'rent.rentFee': { en: 'Rent fee', si: 'කුලී ගාස්තුව' },
  'rent.noTasks': { en: 'No tasks', si: 'කාර්යයන් නැත' },
  'rent.outOfStock': { en: 'Out of stock', si: 'ගබඩාවේ නැත' },
  'rent.catalogue': { en: 'simulated catalogue', si: 'අනුකරණ නාමාවලිය' },
  'rent.products': { en: 'products', si: 'භාණ්ඩ' },
  'rent.empty': { en: 'No products found', si: 'භාණ්ඩ හමු නොවීය' },
  'rent.emptyBody': {
    en: 'Try a different search term or category filter.',
    si: 'වෙනත් සෙවුම් පදයක් හෝ ප්‍රවර්ග පෙරහනක් උත්සාහ කරන්න.',
  },

  /* Category chips */
  'cat.All': { en: 'All', si: 'සියල්ල' },
  'cat.Food': { en: 'Food', si: 'ආහාර' },
  'cat.Beauty': { en: 'Beauty', si: 'රූපලාවණ්‍ය' },
  'cat.Electronics': { en: 'Electronics', si: 'ඉලෙක්ට්‍රොනික' },
  'cat.Household': { en: 'Household', si: 'ගෘහ භාණ්ඩ' },
  'cat.Lifestyle': { en: 'Lifestyle', si: 'ජීවන රටා' },

  /* ---------------------------------------------------------------- */
  /* Revenue (the orders / earnings tab)                               */
  /* ---------------------------------------------------------------- */
  'revenue.title': { en: 'Revenue', si: 'ආදායම' },
  'revenue.todayEarned': { en: "Today's Earnings", si: 'අද උපයා ගත් ආදායම' },
  'revenue.totalEarned': { en: 'Total Simulated Earnings', si: 'මුළු අනුකරණ ආදායම' },
  'revenue.completedTasks': { en: 'Completed Tasks', si: 'සම්පූර්ණ කාර්යයන්' },
  'revenue.pendingTasks': { en: 'Open Tasks', si: 'විවෘත කාර්යයන්' },
  'revenue.showing': { en: 'Showing', si: 'පෙන්වන්නේ' },
  'revenue.orders': { en: 'orders', si: 'ඇණවුම්' },
  'revenue.order': { en: 'order', si: 'ඇණවුම' },
  'revenue.todayReward': { en: "Today's reward", si: 'අද ත්‍යාගය' },
  'revenue.browseRent': { en: 'Browse Rent', si: 'කුලී භාණ්ඩ බලන්න' },
  'revenue.emptyAll': { en: 'No orders yet', si: 'තවම ඇණවුම් නොමැත' },
  'revenue.emptyPending': { en: 'No pending orders', si: 'අපේක්ෂිත ඇණවුම් නොමැත' },
  'revenue.emptyCompleted': { en: 'No completed orders yet', si: 'සම්පූර්ණ ඇණවුම් තවම නොමැත' },
  'revenue.emptyTimeout': { en: 'No timed-out orders', si: 'කල් ඉක්මවූ ඇණවුම් නොමැත' },
  'revenue.emptyBody': {
    en: 'Pick a product from the Rent tab to generate a new simulated order.',
    si: 'නව අනුකරණ ඇණවුමක් සෑදීමට කුලී භාණ්ඩ තෝරන්න.',
  },
  'revenue.taskDone': { en: 'Task completed', si: 'කාර්යය සම්පූර්ණයි' },
  'revenue.taskDoneBody': {
    en: 'Simulated reward of {amount} credited.',
    si: 'අනුකරණ ත්‍යාගය {amount} බැර කර ඇත.',
  },

  /* Product details / grab order */
  'product.grabTitle': { en: 'Grab a Simulated Order', si: 'අනුකරණ ඇණවුමක් ලබා ගන්න' },
  'product.quantity': { en: 'Quantity', si: 'ප්‍රමාණය' },
  'product.rewardRate': { en: 'Reward rate', si: 'ත්‍යාග අනුපාතය' },
  'product.availableBalance': { en: 'Available balance', si: 'භාවිතයට ඇති ශේෂය' },
  'product.grab': { en: 'Grab Order', si: 'ඇණවුම ලබා ගන්න' },
  'product.grabUnavailable': { en: 'Task unavailable', si: 'කාර්යය ලබා ගත නොහැක' },
  'product.grabInsufficient': { en: 'Insufficient simulated balance', si: 'අනුකරණ ශේෂය ප්‍රමාණවත් නැත' },
  'product.grabNote': {
    en: 'Grabbing an order holds simulated capital only. It is returned in full the moment the task completes or its effective time expires — no real payment is taken at any point.',
    si: 'ඇණවුමක් ලබා ගැනීමේදී රඳවා ගන්නේ අනුකරණ ප්‍රාග්ධනයක් පමණි. කාර්යය සම්පූර්ණ වූ විට හෝ ක්‍රියාත්මක වේලාව ඉක්මවූ විට එය සම්පූර්ණයෙන් ආපසු ලැබේ — කිසිවිටෙක සැබෑ ගෙවීමක් සිදු නොවේ.',
  },
  'product.confirmTitle': { en: 'Confirm simulated order', si: 'අනුකරණ ඇණවුම තහවුරු කරන්න' },
  'product.createOrder': { en: 'Create Order', si: 'ඇණවුම සාදන්න' },

  /* Order card */
  'order.number': { en: 'Order number:', si: 'ඇණවුම් අංකය:' },
  'order.amount': { en: 'Order amount', si: 'ඇණවුම් මුදල' },
  'order.incomeRatio': { en: 'Income ratio', si: 'ආදායම් අනුපාතය' },
  'order.expectedReward': { en: 'Expected reward', si: 'අපේක්ෂිත ත්‍යාගය' },
  'order.simulatedReward': { en: 'Simulated reward', si: 'අනුකරණ ත්‍යාගය' },
  'order.orderTime': { en: 'Order time:', si: 'ඇණවුම් වේලාව:' },
  'order.effectiveTime': { en: 'Effective time:', si: 'ක්‍රියාත්මක වේලාව:' },
  'order.timeRemaining': { en: 'Time remaining ·', si: 'ඉතිරි වේලාව ·' },
  'order.expiringSoon': { en: 'Expiring soon ·', si: 'වේලාව ඉක්මවෙමින් ·' },
  'order.complete': { en: 'Complete Task', si: 'කාර්යය සම්පූර්ණ කරන්න' },
  'order.details': { en: 'Order Details', si: 'ඇණවුම් විස්තර' },

  /* ---------------------------------------------------------------- */
  /* My / profile                                                      */
  /* ---------------------------------------------------------------- */
  'my.title': { en: 'My', si: 'මගේ' },
  'my.id': { en: 'TaskMall ID', si: 'TaskMall හැඳුනුම' },
  'my.status': { en: 'Account Status', si: 'ගිණුමේ තත්ත්වය' },
  'my.completed': { en: 'Completed', si: 'සම්පූර්ණ' },
  'my.simBalance': { en: 'Simulated balance', si: 'අනුකරණ ශේෂය' },
  'my.team': { en: 'Team', si: 'කණ්ඩායම' },
  'my.personal': { en: 'Personal Information', si: 'පුද්ගලික තොරතුරු' },
  'my.membership': { en: 'Membership', si: 'සාමාජිකත්වය' },
  'my.security': { en: 'Security', si: 'ආරක්ෂණය' },
  'my.paymentMethods': { en: 'Payment Methods', si: 'ගෙවීම් ක්‍රම' },
  'my.transactions': { en: 'Transaction History', si: 'ගනුදෙනු ඉතිහාසය' },
  'my.notifications': { en: 'Notifications', si: 'දැනුම්දීම්' },
  'my.language': { en: 'Language', si: 'භාෂාව' },
  'my.help': { en: 'Help Center', si: 'උපකාරක මධ්‍යස්ථානය' },
  'my.about': { en: 'About TaskMall', si: 'TaskMall ගැන' },
  'my.logout': { en: 'Logout', si: 'පිටවීම' },
  'my.memberSince': { en: 'Member since', si: 'සාමාජිකව සිටින්නේ' },
  'my.simNote': {
    en: 'All balances and rewards shown in this app are simulated.',
    si: 'මෙම යෙදුමේ පෙන්වන සියලු ශේෂ සහ ත්‍යාග අනුකරණය වේ.',
  },

  /* Drawer */
  'drawer.main': { en: 'Main', si: 'ප්‍රධාන' },
  'drawer.mainHome': { en: 'Home', si: 'මුල් පිටුව' },
  'drawer.wallet': { en: 'Wallet', si: 'මුදල් පසුම්බිය' },
  'drawer.account': { en: 'Account', si: 'ගිණුම' },
  'drawer.orders': { en: 'Orders', si: 'ඇණවුම්' },
  'drawer.rentList': { en: 'Rent Items', si: 'කුලී භාණ්ඩ' },
  'drawer.myPackages': { en: 'My Packages', si: 'මගේ පැකේජ' },
  'drawer.rechargeSim': { en: 'Recharge Simulation', si: 'රීචාජ් අනුකරණය' },
  'drawer.withdrawSim': { en: 'Withdrawal Simulation', si: 'අරා ගැනීම් අනුකරණය' },
  'drawer.txHistory': { en: 'Transaction History', si: 'ගනුදෙනු ඉතිහාසය' },
  'drawer.myTeam': { en: 'My Team', si: 'මගේ කණ්ඩායම' },
  'drawer.rewards': { en: 'Rewards', si: 'ත්‍යාග' },
  'drawer.notifications': { en: 'Notifications', si: 'දැනුම්දීම්' },
  'drawer.profile': { en: 'Profile', si: 'පැතිකඩ' },
  'drawer.security': { en: 'Security', si: 'ආරක්ෂණය' },
  'drawer.about': { en: 'About TaskMall', si: 'TaskMall ගැන' },
  'drawer.support': { en: 'Help & Support', si: 'උපකාර සහ සහාය' },
  'drawer.admin': { en: 'Admin Console', si: 'පරිපාලක කොන්සෝලය' },
  'drawer.logout': { en: 'Logout', si: 'පිටවීම' },
  'drawer.footnote': {
    en: 'TaskMall demo build · all monetary values are simulated.',
    si: 'TaskMall ආදර්ශන නිර්මාණය · සියලු මූල්‍ය අගයන් අනුකරණය වේ.',
  },

  /* Banner carousel */
  'banner.renters': { en: 'Daily task slots open', si: 'දිනපතා කාර්ය ස්ථාන විවෘත වේ' },

  /* Notice bar / ticker */
  'notice.label': { en: 'Notice', si: 'නිවේදන' },
  'notice.a1': {
    en: 'Task system updated — grab orders from the Rent tab.',
    si: 'කාර්ය පද්ධතිය යාවත්කාලීන වී ඇත — කුලී භාණ්ඩ පිටුවෙන් ඇණවුම් ලබා ගන්න.',
  },
  'notice.a2': {
    en: 'All monetary values in this build are simulated.',
    si: 'මෙම නිර්මාණයේ සියලු මූල්‍ය අගයන් අනුකරණය වේ.',
  },
  'notice.a3': {
    en: 'Recruitment pays nothing here — inviting never earns a commission.',
    si: 'මෙහි බඳවා ගැනීමට කිසිවක් නොගෙවයි — කැඳවීමෙන් කොමිස් ලැබෙන්නේ නැත.',
  },
  'notice.withdrew': { en: 'withdrew', si: 'අරා ගත්තේය' },

  /* Language switch pill */
  'lang.toggle': { en: 'සිංහල', si: 'English' },
}

/* ------------------------------------------------------------------ */

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Translate a key; falls back to English copy, then the key itself. */
  t: (key: string, fallback?: string) => string
  /** Interpolate `{placeholder}` tokens. */
  fmt: (template: string, vars: Record<string, string>) => string
}

const LangContext = createContext<LangContextValue | null>(null)

function detectInitial(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'si' || saved === 'en') return saved
  } catch {
    /* storage unavailable — fall through to the default */
  }
  // Sinhala-first, mirroring the reference platform's audience.
  return 'si'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial)

  useEffect(() => {
    document.documentElement.lang = lang === 'si' ? 'si' : 'en'
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, [])

  const t = useCallback(
    (key: string, fallback?: string) => {
      const entry = DICT[key]
      if (!entry) return fallback ?? key
      return (lang === 'si' ? entry.si : entry.en) || entry.en || (fallback ?? key)
    },
    [lang],
  )

  const fmt = useCallback((template: string, vars: Record<string, string>) => {
    return template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? `{${name}}`)
  }, [])

  const value = useMemo<LangContextValue>(() => ({ lang, setLang, t, fmt }), [lang, setLang, t, fmt])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}

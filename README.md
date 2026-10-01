# TaskMall

**Complete Tasks. Manage Orders. Track Rewards.**

A mobile-first task/order management and e‑commerce frontend with a separate desktop admin console.

> ### ⚠️ DEMO / SIMULATION — NO REAL MONEY
>
> TaskMall is an **interface demonstration**. There is no backend, no payment processor and no bank or
> crypto integration. Every balance, order, reward, recharge and withdrawal is simulated data held in your
> browser. No funds move, and nothing shown here can be cashed out.

---

## Table of contents

- [Running it](#running-it)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Demo credentials](#demo-credentials)
- [What's in the build](#whats-in-the-build)
- [Screens](#screens)
- [The package / shipping module](#the-package--shipping-module)
- [Design system](#design-system)
- [Data model & simulation](#data-model--simulation)
- [Safety posture](#safety-posture)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Known limitations](#known-limitations)

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |

Requires Node 18+.

## Deploying to GitHub Pages

The repo ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the app and publishes `dist/` to GitHub Pages. One-time setup:

1. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` (or run the workflow manually from the **Actions** tab — "Deploy to GitHub Pages" → **Run workflow**)

The site goes live at **https://inkithai.github.io/TaskMall/**.

Notes on Pages-specific configuration already in place:

- `vite.config.ts` sets `base: '/TaskMall/'` so assets resolve under the repo subpath. If you rename the repo or use a custom domain, update `base` accordingly (`'/'` for a custom domain or `user.github.io` repo).
- Routing uses `HashRouter` (e.g. `/#/orders`) because Pages only serves a static `index.html` — deep links and refreshes would otherwise 404.
- Product images in `src/data/products.ts` are prefixed with `import.meta.env.BASE_URL` for the same reason.


## Demo credentials

Any non-empty values are accepted — the login forms are prefilled.

| App | Route | Credentials |
| --- | --- | --- |
| User app | `/login` | `071 234 2938` (any phone) / `taskmall` (any 4+ characters) |
| Admin console | `/admin/login` | `admin` / `taskmall` |

The admin sidebar has an **Open User App** link, and the user Profile screen links back to the console, so
you can move between the two without logging out.

To wipe all local changes and regenerate the dataset: **Profile → Reset demo data**, or
**Admin → Settings → Reset demo data**.

## What's in the build

- **Sinhala-first bilingual interface** — the user app defaults to Sinhala (සිංහල) with an instant
  English toggle on the login screen and in **My → Language**. Tab labels stay in English, exactly as the
  studied reference platform renders them. Safety copy (demo ribbons, simulation notices) is always shown
  in **both** languages.
- **Tab bar mirrors the reference platform**: **Home / Rent / Team / Revenue / My** — see
  [Layout mirroring](#layout-mirroring-the-reference-platform) below.
- **20 user screens** in a `430px` mobile shell — fixed bottom nav and a blue circular **Support** FAB
  floating above it.
- **13 admin screens** in a desktop layout with a collapsible dark-navy sidebar.
- **Full state machine** — grabbing a task debits capital, completing it returns capital plus the reward,
  a timeout refunds capital with no reward. Wallet, orders, ledger, notifications and the admin tables all
  read from the same store, so an action in one place shows up everywhere.
- **Deterministic seed data** — a seeded PRNG and a fixed demo clock (`2026‑10‑01 13:05`) mean the numbers
  are the same on every load and reconcile exactly.
- **Hand-rolled SVG charts** (area, bar, donut, split bar, sparkline) — no charting dependency.

## Layout mirroring: the reference platform

The user app deliberately reproduces the structure of a real Sri Lankan task platform
(`smatowl6.com`, studied in [docs/task-scam-red-flags.md](docs/task-scam-red-flags.md)) so that the
interface grammar of the genre can be recognised on sight:

| Reference element | In TaskMall |
| --- | --- |
| `+94` phone-number login, Sinhala field copy, "Log in now" CTA | `/login` — same layout and phrasing |
| Tab bar: Home / Rent / Team / Revenue / My | Same five tabs, same English labels |
| Rent store tab with rentable merchandise | `/rent` — the catalogue, with rent fees and "Grab Task" pills |
| Revenue tab (earnings + orders) | `/revenue` — earnings summary over the order list |
| Promo banner carousel on Home | `<BannerCarousel />` — 5 auto-rotating bilingual slides |
| Scrolling notice bar / withdrawal ticker | `<NoticeBar />` — every ticker entry tagged **simulated** |

Two Home banners and one marquee announcement carry the demo's counter-message (recruitment pays nothing;
no real money) so the familiar chrome tells the truth. What is **not** reproduced: deposits to unlock
tasks, purchasable VIP tiers, negative balances, withdrawal fees, recruitment commission, or any external
"handler" — the cash-flow inversion that defines the fraud (see **Safety posture** below).

Legacy routes still work: `/products` redirects to `/rent`, `/orders` to `/revenue`; deep links such as
`/orders/:orderNumber` and `/products/:productId` are unchanged.

## Screens

### User app

| Screen | Route | Notes |
| --- | --- | --- |
| Login | `/login` | Phone (`+94`) + password, Sinhala-first copy, language toggle, simulation ribbon |
| Register | `/register` | Name, phone, password, optional email, prominent invite code (grants nothing) |
| Forgot Password | `/forgot-password` | Simulated reset link, no email sent |
| Home | `/home` | Banner carousel, notice marquee + simulated withdrawal ticker, balance, task progress, quick actions, active packages |
| **Rent** | `/rent` | The store tab — category rail, catalogue grid, rent fee + reward rate, orange "Grab Task" pills |
| Revenue | `/revenue` | Earnings summary + orders. Tabs: All / Pending / Completed / Time Out (`/orders` redirects here) |
| Order Details | `/orders/:orderNumber` | Amount, income ratio, reward, status timeline, linked package |
| Product Details | `/products/:productId` | Full product view — orange **Grab Order** CTA, confirming never takes real payment |
| Product Package Info | `/products/:productId/package` | Weight, dimensions, handling, shipping fee |
| Packages | `/packages` | All shipments with live status |
| **Package Details** | `/packages/:packageId` | Status card, package info, courier, tracking timeline, address, contents, dimensions |
| Wallet | `/wallet` | Available / pending / total, recent ledger entries |
| Recharge | `/wallet/recharge` | **Simulation only** |
| Withdraw | `/wallet/withdraw` | **Simulation only** |
| Transaction History | `/wallet/transactions` | Filterable ledger |
| Team | `/team` | 24 members across 3 levels, invite code — explicitly pays nothing |
| Rewards | `/rewards` | 7-day activity streak + First/10/50/100 Orders achievements |
| Membership | `/membership` | Free / Silver / Gold / Platinum, earned by completed orders — never purchased |
| Notifications | `/notifications` | Unread badge, deep links |
| Profile ("My") | `/profile` | Personal info, payment methods, notification prefs, language (switches UI to si/en) |
| Security | `/security` | Password, 2FA, active sessions, login history |
| Help & Support | `/support` | **Internal** help centre + ticket thread |
| About | `/about` | What's simulated and why — including the reference-mirroring note |

### Admin console

| Screen | Route |
| --- | --- |
| Dashboard | `/admin` |
| Users | `/admin/users` |
| Products | `/admin/products` |
| Orders | `/admin/orders` |
| **Package Management** | `/admin/packages` |
| Tasks | `/admin/tasks` |
| Transactions | `/admin/transactions` |
| Rewards | `/admin/rewards` |
| Withdrawals | `/admin/withdrawals` |
| Notifications | `/admin/notifications` |
| Support | `/admin/support` |
| Reports | `/admin/reports` |
| Settings | `/admin/settings` |

## The package / shipping module

Orders and packages are kept **logically separate** — an order is the commercial record, a package is the
physical shipment it produced. The package carries its own ID, tracking number, courier, weight,
dimensions, delivery window and status history.

**Eight statuses:** Preparing → Ready for Pickup → Picked Up → In Transit → Out for Delivery → Delivered,
plus Delivery Exception and Cancelled.

Timeline colours: **green** completed · **blue** current · **gray** upcoming · **red** exception.

Admin → Package Management lists Package ID / Order / Customer / Courier / Tracking / Status and supports
view, update status, add tracking, assign courier, update delivery date and view timeline.

## Design system

| Token | Value | Used for |
| --- | --- | --- |
| Brand blue | `#1D4ED8` → `#3B82F6` | Primary actions, gradients, rewards |
| Background | `#F5F7FA` | App canvas |
| Card | `#FFFFFF` | Surfaces, 16px radius, soft shadow |
| Navy | `#0F172A` | Primary text |
| Muted | `#64748B` | Secondary text |
| **Amount red** | `#DC2626` | Order amounts |
| **Reward blue** | `#2563EB` | Reward values |
| Completed | light blue / green | Status badges |
| Pending | orange | Status badges |
| Time out | red | Status badges |

Currency renders as `LKR 2,388.00` throughout, with tabular figures so columns align.

**ID formats**

| Entity | Example |
| --- | --- |
| Order | `202610011253449390` (`YYYYMMDDHHMMSS` + 4 digits) |
| Package | `TM-PKG-829341` |
| Tracking | `TMX20261001293841` |
| Product | `TM-PROD-00192` |
| User | `TM-102938` |
| Withdrawal | `WD-20261001-00192` |
| Ticket | `TM-92821` |
| Invite code | `TASK48291` |

## Data model & simulation

State lives in a `useReducer` store (`src/store/AppContext.tsx`) persisted to `localStorage` under
`taskmall.state.v3`. The seed is generated deterministically from a fixed epoch, so the headline figures
always reconcile:

```
Available  LKR 18,450.00   ← every settled ledger entry sums to exactly this
Pending    LKR  7,390.00   ← capital held by the 2 open orders, to the cent
Total      LKR 25,840.00

Today      12 completed · 2 pending · 0 timed out   (target 15)
Today's reward  LKR 1,245.60   ← sum of the 12 completed orders' rewards
```

Each completed order writes three ledger rows — capital out, capital returned, reward credited — so the
wallet is auditable rather than a hard-coded number.

**Two invariants hold after every action**, not just at seed time:

```
available === sum(every ledger row)
pending   === capital held by orders still in `pending`
```

Accepting a task moves capital from available into pending; completing it returns the capital and credits
the reward; a timeout returns the capital and credits nothing. Total wealth only ever changes by rewards,
recharges and withdrawals.

**Tasks expire on their own.** A pending order whose effective time runs out is swept into `timeout`, its
capital refunded in full, its package cancelled and a notification raised — so the countdown on a task
card actually resolves instead of resting at "Expired".

## Safety posture

Task-based "earn money" platforms are a well-documented fraud pattern, so this demo is deliberately built
so it **cannot** be mistaken for, or repurposed into, one:

- Every monetary value is labelled **simulated**, and a demo notice appears on Login, Wallet, Recharge,
  Withdraw, Team and About. The scrolling withdrawal ticker on Home tags every entry **simulated**, and the
  demo ribbon is permanently bilingual (English + Sinhala) so the framing survives every language choice.
- **Recharge and withdrawal are simulations.** Both end on a receipt that states no real funds were
  transferred. There is no bank, card or crypto integration anywhere in the codebase.
- **Simulated rewards are never presented as withdrawable earnings**, and the app never asks a user to
  deposit money to unlock a task, a tier or a payout.
- **Membership levels are earned, never sold.** Your level is a pure function of completed orders. No
  level can be bought, and the screen states in plain language that a level never changes a reward rate,
  a withdrawal limit, or unlocks earnings — the paid "VIP tier" ladder is the core monetisation of real
  task-scam platforms.
- **The Team screen pays nothing.** It states plainly that inviting people earns no commission, no
  percentage and no guaranteed return, and notes that income-from-recruitment promises are a hallmark of
  task scams.
- **Support is internal** — a help centre plus a ticket thread handled in-app. There is no Telegram,
  WhatsApp or external "agent" anywhere.
- **Couriers, addresses and phone numbers are visibly fake** — `TaskMall Express`,
  `No. XX, Example Street, Colombo`, `+94 XX XXX XXXX`, `@example.com` — so no real shipment is implied.
- Admin → Settings exposes "require deposit to unlock tasks", "route support to an external handler" and
  "pay commission for recruitment" as **permanently locked-off** switches, documenting the position in the
  product itself.

📄 **[docs/task-scam-red-flags.md](docs/task-scam-red-flags.md)** — a field guide to how real task-scam
platforms operate: the six-stage lifecycle, red flags by severity, the design and infrastructure tells,
what to do if you are caught in one, and where to report it in Sri Lanka and internationally.

## Project structure

```
src/
├── App.tsx                  # Routing, auth guards
├── main.tsx                 # BrowserRouter + AppProvider
├── index.css                # Tailwind v4 @theme tokens + utilities
├── lib/                     # format (LKR, dates, IDs), rng, clock, i18n (si/en)
├── data/                    # types, products, packages, seed
├── store/AppContext.tsx     # Reducer, persistence, selectors
├── components/
│   ├── ui/                  # primitives, Badge, Tabs, Progress, Timeline, Modal, Toasts
│   ├── layout/              # Logo, MobileShell, BottomNav, SupportFab, Headers
│   ├── home/                # BannerCarousel, NoticeBar (marquee + ticker)
│   ├── admin/               # AdminShell, DataTable, StatCard, Panel
│   ├── charts/              # SVG AreaChart, BarChart, DonutChart, SplitBar, Sparkline
│   ├── product/ order/ wallet/
└── screens/
    ├── auth/                # Login, Register, ForgotPassword
    ├── user/                # 20 user screens
    └── admin/               # 13 admin screens
```

## Tech stack

React 18 · TypeScript 5.6 (strict, `noUnusedLocals`, `noUnusedParameters`) · Vite 6 ·
Tailwind CSS 4 · React Router 6 · lucide-react.

No backend, no API client, no state library, no chart library.

## Known limitations

- **Frontend only.** Every mutation is local; clearing site data resets everything.
- The demo clock starts at `2026‑10‑01 13:05` and then ticks in real time, so relative timestamps drift
  the longer a tab stays open. Reload to re-pin it.
- Bilingual, not fully translated: Sinhala and English cover the login, register, home, rent, revenue,
  order cards and "My" surfaces; deeper screens (wallet, packages, team, admin console) fall back to
  English. Tamil / Bahasa / Español store a profile preference only.
- Product imagery is AI-generated and the brands on the packaging are invented.

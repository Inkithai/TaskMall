# Anatomy of an E-Commerce Task Scam

**A field guide for recognising, documenting and reporting "task" platforms.**

Companion document to the TaskMall demo. TaskMall deliberately reproduces the *look* of a task/order
platform while refusing to implement the mechanics described below — this file explains what those
mechanics are, why they work, and what to do when you encounter them.

Last reviewed: October 2026.

---

## Contents

1. [What a task scam is](#1-what-a-task-scam-is)
2. [The scale](#2-the-scale)
3. [The lifecycle](#3-the-lifecycle)
4. [Red flags, by severity](#4-red-flags-by-severity)
5. [Design tells — what the interface itself gives away](#5-design-tells--what-the-interface-itself-gives-away)
6. [Infrastructure tells](#6-infrastructure-tells)
7. [If you are already in one](#7-if-you-are-already-in-one)
8. [Where to report](#8-where-to-report)
9. [The second scam: fake recovery services](#9-the-second-scam-fake-recovery-services)
10. [Sources](#10-sources)

---

## 1. What a task scam is

A task scam is an **investment fraud wearing the costume of a job**.

You are recruited to perform trivial repetitive work — "boosting" products, rating listings, liking
videos, submitting orders — inside an app or web platform. The platform displays a commission balance
that climbs with every action. That balance is a number in a database the operator controls. It is not
money, it was never money, and no mechanism exists by which it could become money.

The FTC classifies these as **gamified job scams** and notes the structure deliberately mimics gambling:
small intermittent payouts condition the victim to keep going and to deposit more
[1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).

The defining feature is **inversion of cash flow**. In real employment, money flows employer → worker. In
a task scam, the "worker" must send money to the "employer" before they can be paid. Everything else —
the catalogue, the order IDs, the courier tracking, the VIP tiers — exists to make that inversion feel
reasonable.

---

## 2. The scale

| Measure | Figure | Source |
|---|---|---|
| Task scam reports to the FTC | 0 (2020) → ~5,000 (2023) → ~20,000 (H1 2024 alone) | [1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses) |
| Share of all job-scam reports that were task scams | 38.8% in H1 2024, up from 0.6% in 2021 | [1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses) |
| US job-scam losses | $90M (2020) → $501M (2024) | [4](https://www.wknofm.org/show/protecting-your-money/2026-08-11/ftc-warns-job-scams-are-on-the-rise) |
| US job-scam losses, Q4 2025 | $150.4M across 25,002 reports; median loss $2,000 | [2](https://cw33.com/news/local/job-scams-result-in-150-4-million-losses-ftc-reports/amp/) |
| Crypto losses to job scams | ~$21M (all 2023) → ~$41M (H1 2024) | [1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses) |
| Job-scam losses among adults 60+ | up ~300% vs 2023, driven by task scams | [10](https://www.ftc.gov/system/files/ftc_gov/pdf/P144400-OlderAdultsReportDec2025.pdf) |
| Share of mass-market fraud victims who ever report | **4.8%** | [9](https://www.ftc.gov/system/files/ftc_gov/pdf/ftc-testimony-jec-hearing-on-the-rising-scam-economy.pdf) |

Every figure above is therefore a floor, not a ceiling.

### Sri Lanka

| Measure | Figure | Source |
|---|---|---|
| Complaints to Sri Lanka CERT, 2025 | 12,650+ | [4](https://www.newswire.lk/2026/01/01/cert-reports-surge-in-cybersecurity-complaints-in-2025/) |
| Cybercrimes logged by Sri Lanka Police, 2025 | ~2,000, with 318 arrests | [1](https://thesrilanka.lk/online-scams-in-sri-lanka/) |
| Trend | Sri Lanka increasingly used as an operating base by transnational scam networks | [5](https://www.sundayobserver.lk/2026/05/24/opinion/78021/why-sri-lanka-is-attracting-cybercrime-syndicates/) |

Sri Lanka CERT's own CISO has described the picture as only beginning to be understood, with foreign
operators setting up locally
[5](https://www.sundayobserver.lk/2026/05/24/opinion/78021/why-sri-lanka-is-attracting-cybercrime-syndicates/).
Reporting pathways are also criticised as fragmented — victims get passed between agencies — which is
part of why documenting your case well (section 7) matters so much
[7](https://www.lankanewspapers.com/2026/07/07/inside-sri-lanka-s-cybersecurity-crisis-victims-hacked-scammed-and-left-without-help).

---

## 3. The lifecycle

These operations run a consistent six-stage script.

### Stage 1 — Contact

An unsolicited message on WhatsApp, Telegram, SMS, TikTok or Facebook. Vague, upbeat, no company
specifics: *"Part-time online work, 2–3 hours daily, LKR 5,000–15,000 per day."* The FTC notes the
unexpected message with no specifics is the single most consistent opening move
[1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).

Often the sender claims to be from a recruitment agency, or an employee of a real, well-known
e-commerce brand. The brand association is fabricated.

### Stage 2 — Onboarding

You are moved to a private chat with a "trainer", "mentor" or "receptionist" who walks you through
registration. You get an account on a slick mobile web app. You are added to a Telegram or WhatsApp
group with dozens of other "workers".

**Most of that group is staff.** The group exists to manufacture social proof and, later, to apply peer
pressure at the exact moment you hesitate.

### Stage 3 — The hook: small, real payouts

You complete a set of tasks — the FTC notes they are frequently batched in **sets of around 40** — and
you are paid. For real. A small amount, to your real bank account or wallet
[1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).

This is the entire con in miniature. A few thousand rupees of genuine payout buys the operator your
trust, your belief that withdrawal works, and your willingness to scale up. It is a customer
acquisition cost.

### Stage 4 — The illusion: a balance that climbs

Commissions accrue visibly. Progress bars fill. A daily target sits just out of reach. You level up.
You receive a **"lucky" or "double" task** worth several times the normal commission
[1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).

The balance is now large enough that walking away feels like abandoning money you earned. That feeling
is the product.

### Stage 5 — The trap: negative balance / deposit to unlock

The mechanism that converts the illusion into loss. It typically arrives as one of:

- **"Merchant order" / "combination order".** A task lands that costs more than your balance. Your
  account goes *negative*. You must top up to clear it and release your commission.
- **"Account upgrade".** Your earnings exceed your tier's withdrawal ceiling. Upgrade to VIP 2 for a
  deposit of LKR X.
- **"Task set incomplete".** You are 3 tasks from completing a set of 40. Those 3 require capital.
  Complete the set or forfeit everything accrued.

The framing is always *your money is already there, you just need to free it*. The deposit is almost
always demanded in **cryptocurrency (USDT/TRC-20 is typical)** or by transfer to a rotating cast of
personal bank accounts — mule accounts, often belonging to other victims
[1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).

If you hesitate, the group chat activates: "experienced workers" post screenshots of their withdrawals
and urge you on. The FTC documents this specific tactic
[1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).

### Stage 6 — The squeeze, then silence

You deposit. The commission does not release. Instead a new obstacle appears — a withholding tax, an
"anti-money-laundering verification fee", a credit-score penalty for the negative balance, a final
deposit to match your withdrawal. Each one is framed as the last.

This is the stage that turns a LKR 50,000 loss into a LKR 2,000,000 loss. It continues until you stop
paying, at which point the account is frozen, the handler stops replying, and the group removes you.

Average reported loss in 2025 BBB Scam Tracker data: **$9,456**, with roughly 7% of victims losing more
than $50,000 [6](https://www.cyberjustice.law/learn/what-are-task-scams).

---

## 4. Red flags, by severity

### Critical — these are definitional. One is enough.

- **You are asked to pay, deposit, or "top up" for any reason.** No legitimate employer requires money to
  release wages. The FTC's guidance is unambiguous: *never pay to get paid*
  [3](https://neworleanscitybusiness.com/blog/2025/07/09/job-task-scams-2024-ftc-warning/).
- **Your account can go negative.** No employment relationship puts the worker into debt to the employer
  for doing their job.
- **Earnings are gated behind a tier you must purchase.** "VIP levels" bought with deposits are the core
  monetisation of the fraud.
- **You are paid to like, rate or review products you have not used.** Beyond being a scam signal, the
  FTC notes paid fake reviews are themselves prohibited
  [3](https://neworleanscitybusiness.com/blog/2025/07/09/job-task-scams-2024-ftc-warning/).
- **Withdrawal requires an upfront fee, tax, or matching deposit.**

### High

- Unsolicited first contact via WhatsApp / Telegram / SMS with no company specifics
  [1](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses).
- No interview, no contract, no verifiable employer entity, no registered address.
- All communication funnelled into Telegram or WhatsApp; no company email domain.
- Deposits requested in crypto, or to **personal** bank accounts whose names keep changing.
- A group chat full of strangers posting withdrawal screenshots and encouragement.
- Pay quoted per-click or per-task at rates far above local market rates for the effort involved.
- Pressure framed around time: a countdown, a daily deadline, an expiring tier.

### Medium

- The "company" name appears nowhere in corporate registries, and the site has no verifiable
  registration number, VAT number or physical office.
- Terms of service, privacy policy and About page are boilerplate, contradictory, or absent.
- Support exists only as a chat widget or a Telegram handle — never a named entity you could serve
  notice on.
- Product catalogue images are scraped from real retailers; prices are implausible or arbitrary.
- The domain is weeks or months old (section 6).

---

## 5. Design tells — what the interface itself gives away

These platforms share a visual grammar because many are built from the same resold template kits. Learn
the grammar and you can recognise one in about fifteen seconds.

**Numbers that are designed to be believed rather than audited**
- A large balance displayed prominently, with no transaction ledger that reconciles to it — or a ledger
  that shows only credits.
- "Today's earnings", "total earnings" and "frozen amount" shown as separate figures that do not add up
  to a coherent account state.
- No statement, no export, no reference number you could take to a bank.

**Manufactured urgency and scarcity**
- A countdown on each task.
- A daily target with a progress bar that resets at midnight.
- "Only N slots left at this tier."

**Manufactured social proof**
- A live-scrolling ticker of other users' withdrawals, usually with masked names (`U***8821`) and
  implausibly round numbers. It is a `setInterval` over a random array.
- Testimonials with stock-photo avatars.

**Gamification lifted from gambling**
- Daily check-in streaks with escalating rewards.
- "Lucky order" / "double commission" events that fire on a schedule designed to arrive right before a
  deposit prompt.
- Tier ladders (VIP1…VIP6) with the upgrade price always a little above your current balance.

**The recruitment layer**
- An invite code and a team tree showing Level 1 / 2 / 3 downlines.
- Commission quoted as a percentage of what people you recruit "earn".
- This converts victims into recruiters and is what makes these operations spread. If a platform pays
  for recruitment, nothing else about it needs investigating.

**The tells that something is deliberately unaccountable**
- No company name in the footer, or a name that matches no registry.
- Support that is a Telegram link to an anonymous handle.
- No way to close your account or delete your data.
- Payment instructions delivered as an image or a chat message, never as a stable page — because the
  receiving accounts rotate as they get frozen.

> **Compare:** TaskMall implements the first four categories *cosmetically* — streaks, tiers, progress
> bars, status badges — while every monetary value is labelled simulated, the ledger reconciles to the
> cent, support is an internal ticket thread with a named owner, and the Team screen states in plain
> language that recruitment pays nothing. The admin console exposes deposit-to-unlock, external support
> handlers and recruitment commission as permanently locked-off switches. The visual language is not
> the fraud; the cash-flow inversion is.

---

## 6. Infrastructure tells

You can learn a lot about one of these sites without logging in, and none of it requires you to interact
with the operator.

### Worked example

The two domains that prompted this document, resolved passively on 2026-10-01:

```
smatowl6.com   → 172.67.161.124, 104.21.66.152        (Cloudflare proxy ranges)
nicemktlk.com  → CNAME d3knx7ze1cq6r8.cloudfront.net
                 → 143.204.160.53/.66/.67/.89          (AWS CloudFront)
```

What that tells you:

- **Both hide their origin server behind a CDN.** Normal for real businesses too — but it means the
  hosting country tells you nothing, and it means the **CDN is a reporting channel** (section 8).
  Cloudflare and AWS both act on abuse reports and can unmask or terminate.
- **`nicemktlk`** parses as *nice · mkt · lk* — "market, Sri Lanka". Country-targeted naming is common;
  operators run one domain per market off the same codebase.
- **`smatowl6`** carries a **numeric suffix**. That is a strong signal of a rotating domain series
  (`…1`, `…2`, … `…6`): when a domain gets blacklisted, reported, or burned, the operation moves to the
  next number and pushes the new link out through the group chats. A platform that needs disposable
  domains is telling you what it is.

### Checks worth running yourself

| Check | How | What you are looking for |
|---|---|---|
| Domain age | `whois <domain>`, or any WHOIS web lookup | Created weeks/months ago. Legitimate retailers are years old. |
| Registrant | WHOIS | Privacy-shielded *and* no company identity anywhere on the site. |
| Hosting / CDN | `dig <domain>`, `nslookup` | Identifies who to send an abuse report to. |
| Certificate history | crt.sh | Sibling domains on the same cert or same registration batch — reveals the whole domain series. |
| Reputation | VirusTotal, URLScan, Google Safe Browsing | Existing detections; URLScan also archives a screenshot for your report. |
| Corporate identity | Sri Lanka Dept. of the Registrar of Companies | Does the trading name exist at all? |

Record everything with timestamps. A report that includes the domain, the receiving bank account or
wallet address, the handler's phone number and dated screenshots is materially more actionable than one
that does not.

> **Safety note:** inspect from a device you do not bank on, do not install any APK they send, and do not
> upload identity documents. Several of these operations harvest NIC photos and selfies for secondary
> identity fraud.

---

## 7. If you are already in one

**Stop paying. Immediately.** There is no deposit that unlocks the balance. The balance is not real. Every
additional payment is a pure loss, and the escalation is designed to exploit your reluctance to accept
the losses already taken.

Then, in order:

1. **Call your bank's fraud line now.** Speed is the only real lever on recovery. Ask them to attempt a
   recall on the transfer and to flag the receiving account. Sri Lankan banks have been under a Central
   Bank directive since May 2025 to report scam and cyber incidents within two hours of detection
   [1](https://thesrilanka.lk/online-scams-in-sri-lanka/) — invoke it.
2. **Preserve evidence before you are removed.** Screenshot: your account page and balance, the task
   history, the deposit instructions, the receiving account numbers or wallet addresses, the full chat
   thread with the handler, the group chat, and the URL bar showing the domain. Export the chat if the
   app allows it. You will lose access without warning.
3. **Write a timeline.** Dates, amounts, account numbers, names used, phone numbers, domains. One page.
   Every agency will ask for the same facts.
4. **Report** — see below. File with CERT *and* the police; they do different jobs.
5. **Secure yourself.** Change any password you reused. If you sent NIC or passport images, assume they
   will be used for identity fraud and tell your bank. Revoke any app permissions or remote-access tools
   they had you install.
6. **Tell someone.** The group chat was engineered to isolate you. Shame is the mechanism that keeps the
   reporting rate at 4.8%
   [9](https://www.ftc.gov/system/files/ftc_gov/pdf/ftc-testimony-jec-hearing-on-the-rising-scam-economy.pdf).
   Being deceived by a professional operation running a tested psychological script is not a character
   flaw.

---

## 8. Where to report

### Sri Lanka

| Body | Contact | Handles |
|---|---|---|
| **Sri Lanka CERT \| CC** | Hotline **101** · +94 11 269 1692 · report portal at `cert.gov.lk/report_incident` | Incident response, platform/bank liaison, takedowns [2](https://ministryofcyberaffairs.com/news/how-to-report-a-scam-or-cybercrime-in-sri-lanka-and-recover-your-money-5c583f76-8940-4bd4-9a1d-d9b8998c60e4) |
| **Police CCID** (Computer Crime Investigation Division, CID) | **011 238 1045** · `dir.ccid@police.gov.lk` · or any police station | The criminal investigation [2](https://ministryofcyberaffairs.com/news/how-to-report-a-scam-or-cybercrime-in-sri-lanka-and-recover-your-money-5c583f76-8940-4bd4-9a1d-d9b8998c60e4) |
| CCID (alternate lines) | Deputy Director 011 230 0638 · OIC 011 238 1058 | [1](https://thesrilanka.lk/online-scams-in-sri-lanka/) |
| **Hithawathi** | `hithawathi.lk` | Free help desk that will guide you through the process if the above feels daunting [3](https://www.hithawathi.lk/how-to-get-help/what-you-should-do/) |
| Your bank | Fraud line on the back of your card | Recall attempt, account flagging |

Written complaints with evidence can also be posted to *The Director, Criminal Investigation Department,
Colombo 01* [3](https://www.hithawathi.lk/how-to-get-help/what-you-should-do/).

Note honestly: CERT coordinates and the CCID investigates, but **neither guarantees recovery**, and
operators are frequently offshore
[2](https://ministryofcyberaffairs.com/news/how-to-report-a-scam-or-cybercrime-in-sri-lanka-and-recover-your-money-5c583f76-8940-4bd4-9a1d-d9b8998c60e4).
Report anyway — pattern data across victims is what eventually produces arrests, and 318 were made in
2025 [1](https://thesrilanka.lk/online-scams-in-sri-lanka/).

### The infrastructure providers

Often the fastest route to taking a site offline, and routinely overlooked:

- **Cloudflare** — abuse report form at `cloudflare.com/abuse` (use for `smatowl6.com`-style Cloudflare-fronted sites).
- **AWS** — `abuse@amazonaws.com` or the AWS abuse form (use for CloudFront-fronted sites such as `nicemktlk.com`).
- **Domain registrar** — identified via WHOIS; registrars suspend domains for fraud.
- **Google Safe Browsing** — `safebrowsing.google.com/safebrowsing/report_phish/` flags the URL in Chrome,
  Firefox and Safari, which blunts recruitment fast.
- **Telegram** (`abuse@telegram.org`) / **WhatsApp** (in-app report) for the handler accounts and groups.

### International

- **FTC** — `reportfraud.ftc.gov` (feeds the Consumer Sentinel Network used by ~180 agencies).
- **FBI IC3** — `ic3.gov`, for any US nexus or crypto payments.
- If you paid in crypto, report the receiving wallet address to the exchange you sent from and to
  `chainabuse.com`.

---

## 9. The second scam: fake recovery services

Within days of being scammed — sometimes hours — you will be contacted by someone offering to recover
your money. "Blockchain forensics", "crypto recovery specialist", "licensed fund recovery agent",
occasionally impersonating a regulator or law firm.

These are the same ecosystem, frequently the same operators working from the victim list they already
have. The structure is identical: an upfront fee, then a second fee, then silence.

**No legitimate recovery service charges an advance fee.** Lawyers and regulators do not cold-call
victims. If someone contacts you unprompted about money you lost, they learned about it because they or
their colleagues took it.

---

## 10. Sources

- FTC Consumer Protection Data Spotlight, *Paying to get paid: gamified job scams drive record losses*, December 2024 — [ftc.gov](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses)
- FTC, *How to spot and avoid task scams* and related job-scam guidance — [consumer.ftc.gov/all-scams/job-scams](https://consumer.ftc.gov/all-scams/job-scams)
- FTC testimony to the Joint Economic Committee, *The Rising Scam Economy* — [ftc.gov (PDF)](https://www.ftc.gov/system/files/ftc_gov/pdf/ftc-testimony-jec-hearing-on-the-rising-scam-economy.pdf)
- FTC, *Protecting Older Consumers 2024–2025*, December 2025 — [ftc.gov (PDF)](https://www.ftc.gov/system/files/ftc_gov/pdf/P144400-OlderAdultsReportDec2025.pdf)
- AP via New Orleans CityBusiness, *FTC warns of rise in job task scams*, July 2025 — [neworleanscitybusiness.com](https://neworleanscitybusiness.com/blog/2025/07/09/job-task-scams-2024-ftc-warning/)
- *Job scams result in $150.4 million losses, FTC reports* (Q4 2025 data) — [cw33.com](https://cw33.com/news/local/job-scams-result-in-150-4-million-losses-ftc-reports/amp/)
- *FTC warns job scams are on the rise* — [wknofm.org](https://www.wknofm.org/show/protecting-your-money/2026-08-11/ftc-warns-job-scams-are-on-the-rise)
- CyberJustice Law, *What is a task scam?* (collates BBB Scam Tracker loss data) — [cyberjustice.law](https://www.cyberjustice.law/learn/what-are-task-scams)
- Newswire.lk, *CERT reports surge in cybersecurity complaints in 2025* — [newswire.lk](https://www.newswire.lk/2026/01/01/cert-reports-surge-in-cybersecurity-complaints-in-2025/)
- *Online Scams in Sri Lanka* (CERT / Police statistics, CCID contacts, CBSL directive) — [thesrilanka.lk](https://thesrilanka.lk/online-scams-in-sri-lanka/)
- Sunday Observer, *Why Sri Lanka is attracting cybercrime syndicates* (interview, Sri Lanka CERT CISO) — [sundayobserver.lk](https://www.sundayobserver.lk/2026/05/24/opinion/78021/why-sri-lanka-is-attracting-cybercrime-syndicates/)
- *How to Report a Scam or Cybercrime in Sri Lanka* (CERT and CCID reporting routes) — [ministryofcyberaffairs.com](https://ministryofcyberaffairs.com/news/how-to-report-a-scam-or-cybercrime-in-sri-lanka-and-recover-your-money-5c583f76-8940-4bd4-9a1d-d9b8998c60e4)
- Hithawathi, *What you should do?* — [hithawathi.lk](https://www.hithawathi.lk/how-to-get-help/what-you-should-do/)
- Lanka Newspapers, *Inside Sri Lanka's Cybersecurity Crisis* — [lankanewspapers.com](https://www.lankanewspapers.com/2026/07/07/inside-sri-lanka-s-cybersecurity-crisis-victims-hacked-scammed-and-left-without-help)

---

*This document is for recognition, prevention and reporting. It is not legal advice. Contact details were
accurate as of the review date above — verify hotline numbers against `cert.gov.lk` and `police.lk`
before relying on them.*

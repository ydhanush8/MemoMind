# Code Review — Findings (2026-09-27)

Full-repo review of `client/` and `server/` at commit `44c6edf`. Findings are ranked by severity.
Most server bugs also exist in the legacy Next.js API routes under `client/app/api/**`, because the Express server is a 1:1 port.

Severity: **Critical** = exploitable / data leak / revenue loss · **High** = wrong behaviour users will hit · **Medium** = reliability / ops · **Low** = polish, a11y, docs.

## Summary

**Fixed since review:** #1–#8, #10–#13 (USD toggle removed; legacy backend and the VAPID script deleted from `client/`; and the `/api/notifications/send` status check). #4 is handled by lazily re-checking Razorpay when the period ends; a webhook is still the long-term fix.

| # | Severity | Area | Problem |
|---|----------|------|---------|
| 1 | Critical (fixed) | Payments | Manual restore grants premium for any paid `sub_…` ID — no ownership check |
| 2 | Critical (fixed) | PWA / privacy | Service worker caches authenticated cross-origin API responses |
| 3 | High (fixed) | Payments | `verify` skips ownership check, trusts client `planType`, assumes `active` when Razorpay is unreachable |
| 4 | High (fixed) | Payments | Premium never expires — `currentPeriodEnd` ignored, no webhook |
| 5 | High (fixed) | Security | Cron endpoint unauthenticated unless `NODE_ENV=production` |
| 6 | High (fixed) | Privacy | React Query cache not cleared on sign-out; keys lack `userId` |
| 7 | High (fixed) | Payments / UX | USD price toggle is display-only; user is charged the INR plan |
| 8 | Medium (fixed) | Ops | Two schedulers (Vercel cron + GitHub Actions) — duplicate reminders |
| 9 | Medium | Data | `autoIndex: false` — schema indexes (unique, TTL) never created by server |
| 10 | Medium (fixed) | Architecture | Dead backend still deployed inside `client/`; silent same-origin fallback |
| 11 | Medium (fixed) | UX | Query errors render as "library empty" / "all caught up" |
| 12 | Medium (fixed) | UX | Failed delete leaves NoteCard invisible |
| 13 | Medium (fixed) | UX / quota | Analyze-then-save chain re-runs AI on save failure |
| 14 | Low | Various | Races, validation gaps, stale caches, a11y, stale docs (see below) |

---

## Critical

### 1. Restore accepts anyone's subscription ID
`server/src/services/subscription.service.ts:285-300` (also `client/app/api/subscription/restore/route.ts:112`)

`POST /api/subscription/restore { subscriptionId }` fetches the Razorpay subscription and, if its status is paid, activates premium for the caller. It never checks `fetched.notes.userId === userId`, and `razorpaySubscriptionId` is not unique across users.

- **Failure:** one user pays and shares the `sub_…` ID; every account that enters it gets premium.
- **Fix:** require `notes.userId === userId`; add a unique sparse index on `razorpaySubscriptionId`; validate format `^sub_[A-Za-z0-9]+$` before calling Razorpay.

### 2. Service worker caches authenticated API responses
`client/app/sw.ts:20` (`runtimeCaching: defaultCache`)

Serwist's `defaultCache` ends with a NetworkFirst rule for all cross-origin GETs (`cross-origin` cache). The API now lives on a different origin (Render), so `/api/notes`, `/api/subscription/status` etc. are cached keyed by URL only — the `Authorization` header is ignored.

- **Failure:** shared device — user A signs out, user B signs in; when offline or on a slow Render cold start (>10 s), B is served A's notes and premium state. A's data also remains in Cache Storage after sign-out.
- **Fix:** add a `NetworkOnly` rule matching `NEXT_PUBLIC_API_URL` **before** `...defaultCache`; delete the `cross-origin` cache on sign-out.

## High

### 3. `verify` trusts too much
`server/src/services/subscription.service.ts:116-147, 177-188`

- No `notes.userId === userId` check → a leaked `(payment_id, subscription_id, signature)` triplet can be replayed by another account.
- `planType` comes from the client and is stored as-is; when Razorpay's `current_end` is missing, the period is computed from it → pay monthly, send `"yearly"`, get a year.
- If the Razorpay fetch fails, the code substitutes `{ status: 'active' }` and activates on the signature alone.
- **Fix:** check ownership; derive plan type from `plan_id` (as `activateSubscription` already does); on fetch failure return 502 and direct the user to restore.

### 4. Premium never expires
`server/src/services/subscription.service.ts:22-28, 36`

`isUserPremium` / `getStatus` check only `plan === 'premium' && status === 'active'`. Nothing ever sets `expired`/`cancelled` — there is no Razorpay webhook.

- **Failure:** pay one month, cancel in Razorpay, keep premium forever.
- **Fix:** premium = `status === 'active' && currentPeriodEnd > now`; add a signature-verified Razorpay webhook handling `charged`, `halted`, `cancelled`, `completed`.

### 5. Cron endpoint open outside production
`server/src/controllers/cron.controller.ts:12`, `server/src/config/env.ts:13`

The `CRON_SECRET` check runs only when `isProd`, and `NODE_ENV` defaults to `development`. A native (non-Docker) Render deploy without `NODE_ENV` lets anyone trigger `GET /api/cron/daily-reminders` and spam all premium users. Comparison is plain `!==`, not timing-safe.

- **Fix:** always require the secret when set; fail closed when missing outside local dev; use `crypto.timingSafeEqual`.

### 6. Client cache leaks between users
`client/app/providers.tsx:7`, `client/app/hooks/useNotes.ts:17`, `client/app/hooks/useSubscription.ts:17`

The QueryClient is never cleared on sign-out and query keys don't include `userId`. With `staleTime` 60 s (notes) / 5 min (subscription), user B sees user A's notes and premium UI in the same SPA session.

- **Fix:** `queryClient.clear()` in a `useAuth` effect when `userId` changes.

### 7. USD pricing is cosmetic
`client/app/pricing/page.tsx:30, 45-47, 278-389`

The INR/USD toggle only changes displayed numbers. `/subscription/create` sends only `planType`; the server has one plan ID per interval. User sees "$1.99", is charged the INR plan.

- **Fix:** remove the toggle, or send currency and add USD plan IDs server-side.

## Medium

### 8. Duplicate daily reminders
`client/vercel.json:2-7` + `.github/workflows/daily-reminder.yml`

Vercel still runs the Next cron at 03:30 UTC; GitHub Actions hits Express at 01:30 UTC (+~2 h lag). If the Vercel project still has Mongo/VAPID/`CRON_SECRET`, users get two notifications; otherwise it logs a daily 401/500.

- **Fix:** delete `vercel.json` (and the `/api/cron`, `/api/webhooks` public-route entries in `client/middleware.ts:10-11`).

### 9. Indexes never built
`server/src/config/database.ts:15` (`autoIndex: false`)

The UsageLog unique index + 48 h TTL, PushSubscription `(userId, endpoint)` unique index and Subscription `userId` unique index are only declared in schemas. If they don't already exist in Atlas: parallel `/api/analyze` upserts create duplicate UsageLog docs (bypassing 50/day), UsageLog never expires, parallel `getStatus` can create duplicate Subscription docs.

- **Fix:** verify with `db.<collection>.getIndexes()`; run `Model.syncIndexes()` once or at boot behind a flag.

### 10. Dead backend still shipped in `client/`
`client/app/api/**`, `client/app/lib/models/**`, `lib/mongodb.ts`, `lib/checkPremium.ts`, `lib/paymentLogger.ts`, and `mongoose`/`razorpay`/`web-push` deps.

No frontend code imports these, but Next builds and serves them. `client/app/lib/api.ts:3` falls back to same-origin when `NEXT_PUBLIC_API_URL` is unset, silently routing traffic to this divergent copy.

- **Fix:** delete the legacy code and deps; throw in `api.ts` when `API_BASE` is empty in production.

### 11. Errors look like empty data
`client/app/dashboard/page.tsx:18, 91`, `client/app/dashboard/practice/page.tsx:241, 302`

`data = []` default + `retry: false` + no `isError` branch → a backend failure shows "Your library is empty" / "All caught up!".

- **Fix:** render an error state with a retry button.

### 12. Failed delete hides the card
`client/app/components/NoteCard.tsx:158-162, 183`

`isDeleting` is set before the request and never reset; `onDelete` returns void. On failure the card stays `opacity-0 pointer-events-none` until reload.

- **Fix:** make `onDelete` return a promise; reset in `catch`.

### 13. Analyze + save coupled
`client/app/dashboard/new/page.tsx:64-76`

If analysis succeeds but save fails, clicking Analyze again re-calls the AI (burning the 50/day quota).

- **Fix:** reuse the `analysis` already in state on retry.

## Low

| Location | Problem | Fix |
|----------|---------|-----|
| `.github/workflows/daily-reminder.yml:17` | `curl -f` with no retry — a Render cold start skips the day | `--retry 3 --retry-all-errors --retry-delay 30 --max-time 120` |
| `server/src/services/note.service.ts:29-37, 54`; `validators/note.validator.ts:14` | 100/day note limit is check-then-insert (racy); `PUT` accepts empty/whitespace title, no `runValidators` | trim + reject empty; `runValidators: true` |
| `server/src/controllers/subscription.controller.ts:20-21`; `utils/encryption.ts:20` | Non-string body fields throw → 500 instead of 400 | zod / `typeof` guards |
| `server/src/app.ts:28` | `CORS_ORIGINS=""` → `origin: true` with `credentials: true` (reflects any origin) | fail at boot in production when empty |
| `server/src/services/analysis.service.ts` | Usage counter increments before the AI call; failures still count | increment after success, or decrement on failure |
| `server/src/services/notification.service.ts:170, 195-202` | `preferredTime` stored but unused; "today" is UTC (resets 05:30 IST) | store timezone per user, or drop the setting |
| `/api/notifications/send` | Checks plan but not subscription status | reuse `isUserPremium` |
| `server/src/middlewares/rateLimit.middleware.ts` | In-memory store — per instance | fine for one instance; Redis store if scaled |
| `server/package.json` | `npm run lint` fails — eslint not installed | install or remove script |
| `client/app/hooks/useNotes.ts:61-63, 96-98` | `useMarkReviewed` doesn't invalidate `['notes']`; `useCreateNote` doesn't invalidate `['practiceStatus']` | add invalidations |
| `client/app/dashboard/settings/page.tsx:92-98`; `lib/push.ts:108-112` | `disableThisDevice` ignores `res.ok`; UI says "Turned off" on failure | check `res.ok`, toast error |
| `client/app/pricing/page.tsx:138-159` | Verify failure after payment leaves button on "Processing..." | `setIsProcessing(false)` in failure branches |
| `client/app/sw.ts:15-21`; `app/offline/page.tsx` | No Serwist `fallbacks`; `/offline` never served and is auth-protected | configure `fallbacks`, precache, make public |
| `components/PracticeCard.tsx`, `ui/dialog.tsx`, `NoteCard.tsx:196, 250-294` | Clickable divs without role/keyboard; dialogs lack `role="dialog"`/`aria-modal`/focus/Escape; delete button invisible on focus | semantic buttons, dialog a11y, `focus-visible:opacity-100` |
| `dashboard/page.tsx:16, 118`; `settings/page.tsx:59, 101-108` | Dead UI: `showPaywall` never true; `preferredTime` behind disabled controls | delete |
| `client/scripts/generate-vapid-keys.js` | Prints private key "for .env.local" — client no longer uses it | point to `server/.env` |
| `server/README.md` | Documents removed `node-cron`, `ENABLE_CRON`, `jobs/` | update: GitHub Actions is the scheduler |
| `client/README.md:89`; `client/SETUP.md` | `/welcome` link dead; env list is pre-migration (missing `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`) | rewrite |
| `client/public/manifest.json:8-9` | Old blue theme colours, not terracotta | update |

## Checked and fine

- All note queries scoped by `userId` — no IDOR.
- `notifications/send` blocks targeting other users.
- Analysis usage counter uses atomic `$inc`.
- Double `verify` is idempotent (upsert, no crediting).
- Razorpay signature compare is timing-safe in Express.
- No secrets behind `NEXT_PUBLIC_` (only Clerk publishable key, VAPID public key, API URL).
- Middleware protects `/dashboard/*`; checkout has no double-submit.
- Dockerfile + tsconfig build correctly.

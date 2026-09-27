# MemoMind — Architecture

MemoMind is a learning app. Users write down what they understood about a topic ("notes"). An LLM grades that understanding and flags gaps. Spaced daily practice and push reminders help users retain it. AI analysis, practice and reminders are premium features, paid through Razorpay subscriptions.

This document is the top-level map. Details live in:

- [server.md](server.md) — Express backend: API reference, middleware chain, env vars, every file.
- [client.md](client.md) — Next.js frontend: routes, data layer, PWA, design system, every file.
- [review.md](review.md) — known bugs and risks, ranked.

---

## 1. Repository layout

```
MemoMind/
├── client/                  Next.js 15 app (App Router) — deployed on Vercel
│   ├── app/                 pages, components, hooks, lib, service worker (sw.ts)
│   ├── app/api/**           LEGACY Next.js API routes (pre-migration backend, unused)
│   ├── middleware.ts        Clerk route protection
│   └── public/              manifest, icons, generated sw.js
├── server/                  Express + TypeScript backend — deployed on Render (Docker)
│   └── src/
│       ├── routes/          URL → controller wiring
│       ├── middlewares/     auth, validation, rate limit, logging, errors
│       ├── validators/      request body checks
│       ├── controllers/     HTTP adapters (thin)
│       ├── services/        business logic
│       ├── models/          Mongoose schemas
│       ├── config/          env, db, Clerk, Razorpay, OpenRouter
│       └── utils/ types/
├── .github/workflows/
│   └── daily-reminder.yml   scheduler for daily push reminders
└── docs/                    this documentation
```

## 2. System context

```mermaid
flowchart LR
    user(["User<br/>browser / installed PWA"])

    subgraph vercel["Vercel"]
        next["Next.js client<br/>client/"]
    end

    subgraph render["Render (Docker)"]
        api["Express API<br/>server/"]
    end

    gha["GitHub Actions<br/>daily-reminder.yml"]

    clerk[("Clerk<br/>auth")]
    mongo[("MongoDB Atlas")]
    openrouter["OpenRouter<br/>LLM API"]
    razorpay["Razorpay<br/>subscriptions"]
    push["Browser push services<br/>FCM / APNs / Mozilla"]

    user -- "HTML, JS, service worker" --> next
    user -- "sign-in UI" --> clerk
    user -- "fetch + Bearer token" --> api
    user -- "Checkout popup" --> razorpay

    api -- "verify session token" --> clerk
    api -- "Mongoose" --> mongo
    api -- "analyze note" --> openrouter
    api -- "create / fetch subscription" --> razorpay
    api -- "web-push VAPID" --> push
    push -- "push event" --> user

    gha -- "GET /api/cron/daily-reminders<br/>Bearer CRON_SECRET" --> api
```

Key points:

- **The browser calls the Express API directly** (cross-origin). The Next.js app serves only UI. It does no server-side data fetching.
- **Auth is Clerk end-to-end.** The client gets a session JWT from `window.Clerk.session.getToken()` and sends it as `Authorization: Bearer …`. Express verifies it with `@clerk/express`.
- **Every document is keyed by the Clerk `userId` string.** There is no users collection.
- **The server has no scheduler.** GitHub Actions triggers the reminder endpoint once a day.

## 3. Deployment view

```mermaid
flowchart TB
    subgraph gh["GitHub repo"]
        src["main branch"]
        wf["Actions: cron 30 1 * * *"]
    end

    subgraph vercelp["Vercel project — root: client/"]
        build1["next build + Serwist<br/>emits public/sw.js"]
        cdn["Edge / CDN"]
        vcron["vercel.json cron 30 3 * * *<br/>LEGACY — hits Next route"]
    end

    subgraph renderp["Render service — root: server/"]
        docker["Dockerfile<br/>node:20-alpine, 2-stage"]
        proc["node dist/server.js<br/>PORT 4000, /health check"]
    end

    atlas[("MongoDB Atlas")]

    src --> build1 --> cdn
    src --> docker --> proc
    wf -- "curl" --> proc
    proc --> atlas
    vcron -. "duplicate scheduler, see review #8" .-> cdn
```

| Piece | Host | Config source |
|-------|------|---------------|
| Frontend | Vercel | `client/next.config.mjs`, `client/vercel.json`, Vercel env |
| Backend | Render (`memomind-zqw3.onrender.com`) | `server/Dockerfile`, Render env (no `render.yaml` in repo) |
| Scheduler | GitHub Actions | `.github/workflows/daily-reminder.yml`, secret `CRON_SECRET` |
| Database | MongoDB Atlas | `MONGODB_URI` (server only) |

## 4. Backend request lifecycle

```mermaid
flowchart LR
    req["HTTP request"] --> helmet --> compression --> cors --> log["pino-http"] --> json["express.json 1mb"] --> clerkmw["clerkMiddleware<br/>populates req.auth"]
    clerkmw --> health{"/health?"}
    health -- yes --> hc["health controller"]
    health -- no --> rl["rate limiter<br/>300 req / 15 min on /api"]
    rl --> router["feature router"]
    router --> auth["requireAuth"] --> val["validate / validateObjectId"] --> ctrl["controller<br/>asyncHandler"] --> svc["service"] --> model["Mongoose model"]
    svc -. "throws AppError" .-> err["errorHandler"]
    router -. "no match" .-> nf["notFoundHandler"]
```

Layer rules: controllers only parse the request and shape the response. Services hold all business logic and throw `AppError(status, message)`. `errorHandler` converts errors to JSON. The response shapes match the old Next.js routes, so the client did not change during the migration.

## 5. Frontend architecture

```mermaid
flowchart TB
    subgraph pages["Pages — all 'use client'"]
        landing["/ landing"]
        pricing["/pricing"]
        dash["/dashboard"]
        newp["/dashboard/new"]
        prac["/dashboard/practice"]
        sett["/dashboard/settings"]
    end

    subgraph hooks["TanStack Query hooks"]
        useNotes["useNotes<br/>key: notes"]
        usePractice["usePractice<br/>key: practice, practiceStatus"]
        useSub["useSubscription<br/>key: subscription — isPremium"]
        useNotif["useNotifications"]
    end

    pushlib["lib/push.ts<br/>per-device subscribe"]
    apifetch["lib/api.ts apiFetch<br/>NEXT_PUBLIC_API_URL + Bearer"]
    sw["sw.ts service worker<br/>Serwist cache + push handler"]
    express["Express API"]

    dash --> useNotes
    newp --> useNotes
    prac --> usePractice
    dash --> useSub
    prac --> useSub
    sett --> useNotif
    sett --> pushlib
    pricing --> apifetch
    useNotes --> apifetch
    usePractice --> apifetch
    useSub --> apifetch
    useNotif --> apifetch
    pushlib --> apifetch
    pushlib -- "pushManager.subscribe" --> sw
    apifetch --> express
```

- `middleware.ts` (Clerk) protects every route except `/`, `/pricing`, `/sign-in`, `/sign-up`, `/manifest.json`, and the legacy `/api/webhooks` and `/api/cron` routes.
- `useSubscription` is the single source of `isPremium`. Premium-only queries are gated on it.
- Styling uses Tailwind plus HSL tokens in `globals.css`. The dark app scope is the default, `.light` switches to light, and `.theme-paper` is the marketing scope. The accent is terracotta. See [client.md](client.md#5-design-system-ink--ivory).

## 6. Data model

```mermaid
erDiagram
    CLERK_USER ||--o{ NOTE : "writes"
    CLERK_USER ||--|| SUBSCRIPTION : "has one"
    CLERK_USER ||--o{ PUSH_SUBSCRIPTION : "one per device"
    CLERK_USER ||--o{ USAGE_LOG : "daily counters"

    CLERK_USER {
        string userId "lives in Clerk, not Mongo"
    }
    NOTE {
        ObjectId _id
        string userId "indexed"
        string title
        string understanding
        mixed analysis "AI result or null"
        date lastReviewedAt
        number reviewCount
        date createdAt
        date updatedAt
    }
    SUBSCRIPTION {
        string userId "unique"
        string plan "free or premium"
        string planType "monthly or yearly"
        string status "active cancelled expired pending_payment"
        string razorpaySubscriptionId "sparse, not unique"
        string razorpayCustomerId "unused"
        string pendingPlanType
        date currentPeriodStart
        date currentPeriodEnd
    }
    PUSH_SUBSCRIPTION {
        string userId
        string endpoint "unique with userId"
        object subscription "keys p256dh auth"
        boolean enabled
        string preferredTime "default 19:00, unused"
        object notificationTypes "dailyReminder streakWarning"
    }
    USAGE_LOG {
        string userId
        string action "e.g. analyze"
        string date "YYYY-MM-DD UTC"
        number count
        date expiresAt "TTL"
    }
```

The server connects with `autoIndex: false`. The indexes above must already exist in Atlas, or be created manually. See [review.md #9](review.md#9-indexes-never-built).

## 7. Core flows

### 7.1 Authenticated API call

```mermaid
sequenceDiagram
    participant B as Browser
    participant C as Clerk JS
    participant A as Express API
    participant K as Clerk backend

    B->>C: session.getToken()
    C-->>B: short-lived JWT
    B->>A: GET /api/notes, Authorization Bearer JWT
    A->>K: clerkMiddleware verifies JWT, JWKS cached
    K-->>A: userId
    A->>A: requireAuth passes, service queries by userId
    A-->>B: 200 JSON
```

### 7.2 Write and analyze a note

```mermaid
sequenceDiagram
    participant U as User
    participant P as /dashboard/new
    participant A as Express API
    participant DB as MongoDB
    participant O as OpenRouter

    U->>P: title + understanding, click Analyze
    P->>A: POST /api/analyze
    A->>DB: isUserPremium(userId)
    A->>DB: UsageLog $inc analyze count, 50/day cap
    A->>O: chat completion, JSON grading prompt
    O-->>A: analysis JSON
    A-->>P: analysis
    P->>A: POST /api/notes with analysis
    A->>DB: daily cap check 100/day, insert Note
    A-->>P: 201 note
    P->>P: invalidate notes query
```

### 7.3 Upgrade to premium

```mermaid
sequenceDiagram
    participant U as User
    participant P as /pricing
    participant A as Express API
    participant R as Razorpay
    participant DB as MongoDB

    U->>P: choose monthly or yearly
    P->>A: POST /api/subscription/create planType
    A->>R: subscriptions.create plan_id, notes.userId
    A->>DB: Subscription status pending_payment
    A-->>P: subscriptionId, keyId
    P->>R: open Checkout
    R-->>P: payment_id, subscription_id, signature
    P->>A: POST /api/subscription/verify
    A->>A: HMAC signature check, timing-safe
    A->>R: fetch subscription status + period
    A->>DB: upsert plan premium, status active
    A-->>P: success
    Note over P,A: If verify fails, POST /api/subscription/restore<br/>searches Razorpay and re-activates
```

### 7.4 Daily reminder

```mermaid
sequenceDiagram
    participant G as GitHub Actions
    participant A as Express API
    participant DB as MongoDB
    participant PS as Push service
    participant SW as Service worker

    G->>A: GET /api/cron/daily-reminders, Bearer CRON_SECRET
    A->>DB: Subscription.find plan premium, status active
    A->>DB: Note.aggregate, skip users who met today's practice goal
    A->>DB: PushSubscription.find enabled, dailyReminder true
    loop each device
        A->>PS: web-push sendNotification, VAPID
        PS-->>A: 201, or 404/410 gone
        A->>DB: delete gone subscriptions
    end
    A-->>G: sent / failed counts
    PS->>SW: push event
    SW->>SW: showNotification
    SW->>SW: notificationclick focuses or opens payload url /dashboard/practice
```

## 8. Cross-cutting concerns

| Concern | How it's handled | Where |
|---------|------------------|-------|
| Authentication | Clerk JWT as Bearer header; Clerk middleware on both sides | `client/app/lib/api.ts`, `client/middleware.ts`, `server/src/config/clerk.ts`, `middlewares/auth.middleware.ts` |
| Authorization | Every query filtered by `userId`; premium gate via `isUserPremium` | `server/src/services/*` |
| Validation | Hand-written validators + `validateObjectId`; env via zod | `server/src/validators/`, `config/env.ts` |
| Rate limiting | `express-rate-limit` 300/15 min (in-memory); per-feature daily caps in Mongo | `middlewares/rateLimit.middleware.ts`, `UsageLog`, note service |
| Errors | `AppError` + `asyncHandler` + central `errorHandler` | `server/src/utils/`, `middlewares/error.middleware.ts` |
| Logging | pino / pino-http; structured payment events via `logPayment` | `server/src/utils/logger.ts` |
| Secrets | Server-only env; client only sees `NEXT_PUBLIC_*` (Clerk publishable key, VAPID public key, API URL) | `server/.env.example`, `client/.env.local.example` |
| Offline / PWA | Serwist precache + runtime cache; web push | `client/app/sw.ts`, `client/next.config.mjs` |
| Time | All day boundaries are UTC (`YYYY-MM-DD`) | `server/src/utils/date.ts` |

## 9. Known architectural debt

The full list is in [review.md](review.md). The structural items are:

1. **Legacy backend in `client/app/api/**`** is still built and deployed. `apiFetch` silently falls back to it when `NEXT_PUBLIC_API_URL` is unset.
2. **Two schedulers:** `client/vercel.json` cron and GitHub Actions.
3. **No Razorpay webhook**, so subscription state never changes after activation and premium never expires.
4. **Service worker caches cross-origin API responses** without regard to which user is signed in.
5. **Single-instance assumptions:** the in-memory rate limiter works per instance, and indexes are not auto-built.

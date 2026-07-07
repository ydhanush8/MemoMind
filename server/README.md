# MemoMind — Express Backend

Standalone Node.js + Express + TypeScript backend migrated from the Next.js API
routes. Same MongoDB, same Clerk auth, same business logic, and **identical
response shapes / status codes** — so the frontend only needs a base URL + auth
header change.

## Architecture

```
src/
  config/        env, database, clerk, openrouter, razorpay
  controllers/   thin request/response handlers (validate → call service → respond)
  services/      ALL business logic (DB, AI, payments, notifications, cron)
  models/        Mongoose schemas (same model names → same collections)
  routes/        endpoint definitions
  middlewares/   auth, error, validation, logger, rateLimit
  validators/    request validation (exact original messages)
  jobs/          node-cron daily reminder
  utils/         logger, response, constants, date, encryption, appError, asyncHandler
  types/         shared interfaces
  app.ts         express app (helmet, cors, compression, clerk, routes)
  server.ts      bootstrap (db connect, listen, cron, graceful shutdown)
```

## Run locally

```bash
npm install
cp .env.example .env      # fill in values (see mapping below)
npm run dev               # tsx watch, http://localhost:4000
# or
npm run build && npm start
```

Verify: `curl http://localhost:4000/health` → `{"status":"ok","db":"connected",...}`

## Environment variables

Reused from the app as-is: `CLERK_SECRET_KEY`, `MONGODB_URI`,
`OPENROUTER_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_PLAN_ID_MONTHLY`, `RAZORPAY_PLAN_ID_YEARLY`, `VAPID_PRIVATE_KEY`,
`VAPID_EMAIL`, `CRON_SECRET`.

Renamed (the `NEXT_PUBLIC_` prefix is Next.js-specific and doesn't apply here):

| Next.js (client)                    | Express (server)          | Same value |
| ----------------------------------- | ------------------------- | ---------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `CLERK_PUBLISHABLE_KEY`   | ✅         |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`      | `VAPID_PUBLIC_KEY`        | ✅         |
| `NEXT_PUBLIC_APP_URL`               | `APP_URL` (OpenRouter referer) | ✅   |

Server-only extras: `PORT`, `NODE_ENV`, `CORS_ORIGINS` (comma-separated allowed
frontend origins), `ENABLE_CRON`.

## Endpoints (paths unchanged)

| Method(s)            | Path                          | Auth              |
| -------------------- | ----------------------------- | ----------------- |
| GET                  | `/health`                     | public            |
| GET, POST            | `/api/notes`                  | Clerk             |
| GET,PUT,PATCH,DELETE | `/api/notes/:id`              | Clerk             |
| POST                 | `/api/analyze`                | Clerk + premium   |
| GET                  | `/api/practice/daily`         | Clerk + premium   |
| GET                  | `/api/practice/status`        | Clerk + premium   |
| POST                 | `/api/subscription/create`    | Clerk             |
| POST                 | `/api/subscription/verify`    | Clerk             |
| POST                 | `/api/subscription/restore`   | Clerk             |
| GET                  | `/api/subscription/status`    | Clerk             |
| GET,POST,PATCH,DELETE| `/api/notifications/subscribe`| Clerk             |
| POST                 | `/api/notifications/send`     | Clerk + premium   |
| GET                  | `/api/cron/daily-reminders`   | `CRON_SECRET` (prod) |

## Authentication (cross-origin)

Because the frontend and backend are now on different origins, the browser must
send the Clerk session token as a **Bearer header** (cookies don't cross
origins). `clerkMiddleware` reads it; `requireAuth` enforces it.

## Frontend integration (minimal)

Only two things change on the frontend — **base URL** and **auth header**. Add
`NEXT_PUBLIC_API_URL=http://localhost:4000` to `client/.env.local`, then route
fetches through a small helper:

```ts
// client/app/lib/api.ts
import { useAuth } from '@clerk/nextjs';

export function useApi() {
  const { getToken } = useAuth();
  return async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };
}
```

Then swap `fetch('/api/...')` for this helper in the TanStack Query hooks
(`useNotes`, `usePractice`, `useSubscription`, `useNotifications`) and the
pricing page. Paths and response handling stay the same.

> The original Next.js API routes under `client/app/api/*` are left intact.
> Switch the frontend over feature-by-feature; once everything points at the
> Express backend, the Next routes (and their legacy env vars) can be removed.

## Cron

`node-cron` runs the daily reminder at `30 3 * * *` UTC (= 9:00 AM IST),
identical to the old `vercel.json`. The protected HTTP endpoint remains for
manual/external triggers. Toggle in-process scheduling with `ENABLE_CRON`.

## Deploy

Works on Railway / Render / Fly.io / any Docker host.

```bash
docker build -t memomind-server .
docker run -p 4000:4000 --env-file .env memomind-server
```

Set `CORS_ORIGINS` to your deployed frontend origin, provide all env vars, and
(for scheduled reminders) set `CRON_SECRET` + `ENABLE_CRON=true`. Includes a
health endpoint, env validation on boot, and graceful shutdown.

# 🛠️ Developer Setup Guide

This guide is for developers who want to run MemoMind locally or contribute to the project.

MemoMind is a monorepo with two apps:

- `client/`: the Next.js frontend (this folder). It has no server-side data code of its own.
- `server/`: the Express backend. It owns MongoDB, OpenRouter, Razorpay, web push and the daily-reminder endpoint.

To run the full app locally, you need both of them running. See [../docs/architecture.md](../docs/architecture.md) for how the pieces fit together.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (client) and npm (server)
- Clerk account
- MongoDB Atlas account, OpenRouter API key, Razorpay account: these are all needed by the **server** only

### 1. Clone

```bash
git clone https://github.com/ydhanush8/MemoMind.git
cd MemoMind
```

### 2. Start the backend

```bash
cd server
npm install
cp .env.example .env   # fill in Clerk, MongoDB, OpenRouter, Razorpay, VAPID, CRON_SECRET
npm run dev            # http://localhost:4000
```

See [../server/README.md](../server/README.md) and [../docs/server.md](../docs/server.md) for every server variable.

### 3. Start the frontend

```bash
cd client
pnpm install
cp .env.local.example .env.local
pnpm dev               # http://localhost:3000
```

`client/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxx          # must pair with the server's VAPID_PRIVATE_KEY
NEXT_PUBLIC_API_URL=http://localhost:4000   # the Express backend
```

The server's `CORS_ORIGINS` must include `http://localhost:3000`.

---

## 🔧 Frontend environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ Yes |
| `CLERK_SECRET_KEY` | Clerk secret key (used by `middleware.ts`) | ✅ Yes |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express backend | ✅ Yes |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key for push notifications | ⚠️ Push only |

### Getting keys

#### Clerk (Authentication)
1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable and secret keys. The server uses the same pair.

#### VAPID (Push notifications)
```bash
cd server && npx web-push generate-vapid-keys
```
The public key goes in `client/.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. The private key goes in `server/.env` as `VAPID_PRIVATE_KEY`.

#### Server-only keys
MongoDB Atlas, OpenRouter and Razorpay keys go in `server/.env`, not here. Razorpay needs two subscription plans, monthly (₹99) and yearly (₹999). Pricing is INR only.

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Server state:** TanStack Query
- **PWA / push:** Serwist service worker + Web Push
- **Payments:** Razorpay Checkout (INR). Order creation and verification happen on the server
- **Backend:** Express + MongoDB, in `../server`
- **Deployment:** Vercel (client), Render (server)

---

## 📂 Project Structure

```
client/
├── app/
│   ├── components/       # UI components (ui/ = primitives)
│   ├── dashboard/        # notes library, new note, practice, settings
│   ├── hooks/            # TanStack Query hooks
│   ├── lib/              # api.ts (fetch wrapper), push.ts, types, utils
│   ├── pricing/          # pricing & checkout
│   ├── sign-in/ sign-up/ # Clerk pages
│   ├── offline/          # offline page
│   ├── sw.ts             # service worker source
│   └── page.tsx          # landing page
├── middleware.ts         # Clerk route protection
├── next.config.mjs       # Next.js + Serwist config
└── tailwind.config.ts
```

Full per-file reference: [../docs/client.md](../docs/client.md).

---

## 🚢 Deployment

### Frontend (Vercel)
1. Import the GitHub repository in Vercel with `client/` as the root directory.
2. Add the four frontend variables above, with `NEXT_PUBLIC_API_URL` set to the Render backend URL.
3. Add the Vercel domain to Clerk's allowed origins and redirect URLs, and to the server's `CORS_ORIGINS`.

### Backend (Render)
See [../server/README.md](../server/README.md). Daily reminders are triggered by GitHub Actions (`.github/workflows/daily-reminder.yml`). The workflow needs a `CRON_SECRET` repo secret with the same value as the one on Render.

---

## 🧪 Testing

```bash
pnpm dev      # development server (no service worker)
pnpm build    # production build
pnpm start    # run the production build (service worker + push work here)
```

### Test Cards (Razorpay)
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** 1234

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - free to use and modify

---

## 📧 Support

**Developer Issues:** [GitHub Issues](https://github.com/ydhanush8/MemoMind/issues)  
**Questions:** dhanushsaireddy@gmail.com

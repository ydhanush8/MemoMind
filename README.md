# MemoMind

Monorepo.

```
MemoMind/
├── client/   # Next.js 15 app (App Router, Tailwind, Clerk, TanStack Query, PWA)
└── server/   # Standalone Node.js + Express backend (TypeScript, Mongoose)
```

## client/
The full Next.js application (frontend + its original API routes remain intact).
```bash
cd client
pnpm install
pnpm dev
```
See [client/README.md](client/README.md) and [client/SETUP.md](client/SETUP.md).

## server/
The migrated standalone Express backend — same MongoDB, same Clerk auth, same
business logic, same response shapes as the Next.js API routes.
```bash
cd server
npm install
cp .env.example .env   # fill in values
npm run dev
```
See [server/README.md](server/README.md) for the migration notes and how to
point the frontend at it.

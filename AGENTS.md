# Shape Express — AI Agent Instructions

React 19 + TypeScript + Vite frontend, Express backend, Firebase, Stripe, Gemini AI.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite :5173 + Express :3000 |
| `npm run build` | Production build |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npx capacitor sync` | Sync to Android |

## Key Files

- [server.ts](server.ts) — Express backend (auth, Stripe, AI, WebSocket)
- [src/App.tsx](src/App.tsx) — Routing
- [src/firebase.ts](src/firebase.ts) — Firebase config
- [vite.config.ts](vite.config.ts) — Vite + Tailwind

## Architecture

FSD — see [ARCHITECTURE.md](src/ARCHITECTURE.md). Short version:
- New features go in `src/features/<name>/` with `index.ts` barrel export
- Import via `@/features/<name>`, never deep paths
- Features never import other features; use `@/shared` or `@/entities`

## Conventions

- UI strings: **Portuguese** · Code/comments: **English**
- Dark theme classes: `bg-dark-card`, `border-dark-border`
- Class merging: `cn()` from `@/shared/lib/cn`
- Imports: `@/` alias always

## Security Guidelines

- **Secrets**: all keys in `.env.local` (gitignored). `VITE_` prefix = public/client-side — never put `STRIPE_SECRET_KEY` or `GEMINI_API_KEY` there.
- **Auth**: every `/api/*` route (except `/api/health`) must use `authMiddleware`. Prefer `Authorization: Bearer <firebase-id-token>` over `x-user-email` fallback.
- **Input validation**: use `express-validator` on all request body fields before processing (see existing `validateProtocolId` pattern).
- **AI prompts**: only inject known typed fields — never raw user strings. Use `gemini-2.0-flash` to control costs.
- **Stripe**: verify payment server-side via `stripe.checkout.sessions.retrieve`; use webhook signature verification in production.
- **Firebase**: Admin SDK for privileged writes; enforce Firestore Security Rules (`request.auth.uid == resource.data.userId`).
- **Logging**: never log tokens, emails, or payment data.
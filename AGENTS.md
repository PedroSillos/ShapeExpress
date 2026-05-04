# Shape Express — AI Agent Instructions

React 19 + TypeScript + Vite frontend, Express backend, Firebase, Stripe, Gemini AI.

## Web App

| Command | Description |
|---------|-------------|
| `npm run dev` | Clean cache, start Vite dev server + Express |
| `npm run build` | Production build |
| `npm run lint` | TypeScript check |
| `npm run clean` | Remove `dist/` and Vite cache (`node_modules/.vite`) |

## Android / Capacitor (No Cache)

**Always use no-cache workflow** to ensure fresh builds:

```bash
# Option 1: npm script (recommended)
npm run android

# Option 2: Manual commands
npm run build
rm -Recurse -Force android/app/build
npx capacitor sync
npx capacitor open android
```

## Key Files

- [src/App.tsx]
- [src/presentation/screens]
- [src/presentation/hooks]
- [server.ts]
- [src/firebase.ts]
- [vite.config.ts]
- [capacitor.config.ts]

## Browser Automation with Playwright

Playwright is available (`npx playwright`) and should be used for validating UI changes against the running dev server (unless said otherwise). To run a quick headless check:

```js
// example: pw-check.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:5173');
// login, navigate, assert...
await browser.close();
```

Run with `node pw-check.mjs`. Delete the script after use — do not commit temporary Playwright scripts.

FSD (Feature-Sliced Design):
- New features go in `src/features/<name>/` with `index.ts` barrel export
- Import via `@/features/<name>`, never deep paths
- Features never import other features; use `@/shared` or `@/entities`

### Feature Structure

```
src/features/your-feature/
├── index.ts       # barrel export (required)
├── types.ts
└── ui/
    └── YourView.tsx
```

### Layer Responsibilities

| Layer | Owns | Never |
|-------|------|-------|
| `app` | Routing, providers, feature composition | Business logic |
| `features` | Domain UI, feature hooks, local state | Cross-feature imports |
| `entities` | Shared types/contracts | Logic, components |
| `shared` | Generic UI, hooks, utils | Feature-specific code |
| `services` | API calls, Firebase ops | React components |

## Cross-Platform Requirement

Always consider both the **web app** and **Android app** when making changes. UI, routing, API calls, and feature behavior must work correctly on both platforms. Test or verify changes against both targets before considering a task complete.

## Conventions

- UI strings: **Portuguese** · Code/comments: **English**
- Dark theme classes: `bg-dark-card`, `border-dark-border`
- Class merging: `cn()` from `@/shared/lib/cn`
- Imports: `@/` alias always
- TypeScript strict — no implicit `any`
- Naming: `PascalCase` components/types, `camelCase` functions, `UPPER_SNAKE_CASE` constants

## API Endpoints

Express backend on port **3000**. All routes except `/api/health` require `authMiddleware`.

### Authentication

Preferred: `Authorization: Bearer <firebase-id-token>`  
Fallback: `x-user-email: user@example.com` (legacy)

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/checkout/session` | POST | Create Stripe checkout session |
| `/api/checkout/verify` | POST | Verify payment completion |
| `/api/ai/coach-advice` | POST | AI coaching advice |
| `/api/ai/recommend-communities` | POST | AI community recommendations |

### Chat (Firestore)

Chat is implemented directly via Firestore — **no WebSocket**. Messages are stored at:

```
messages/{roomId}/msgs/{msgId}
```

### Stripe Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure |

## Security Guidelines

- **Secrets**: all keys in `.env.local` (gitignored). `VITE_` prefix = public/client-side — never put `STRIPE_SECRET_KEY` or `GEMINI_API_KEY` there.
- **Auth**: every `/api/*` route (except `/api/health`) must use `authMiddleware`. Prefer `Authorization: Bearer <firebase-id-token>` over `x-user-email` fallback.
- **Input validation**: use `express-validator` on all request body fields before processing.
- **AI prompts**: only inject known typed fields — never raw user strings. Use `gemini-2.0-flash` to control costs.
- **Stripe**: verify payment server-side via `stripe.checkout.sessions.retrieve`; use webhook signature verification in production.
- **Firebase**: Admin SDK for privileged writes; enforce Firestore Security Rules.
- **Logging**: never log tokens, emails, or payment data.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Module not found | Check `@/` alias, run `npm install` |
| Firebase auth failing | Verify `.env.local` keys, check Firebase Console auth methods |
| Stripe error | Confirm `STRIPE_SECRET_KEY=sk_test_...`, server on `:3000` |
| Chat messages not appearing | Check Firestore rules allow read/write on `messages/{roomId}/msgs`; verify both users share the same `roomId` (emails sorted alphabetically) |

## Firebase Emulator (optional)

```bash
npm install -g firebase-tools
firebase emulators:start
```

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
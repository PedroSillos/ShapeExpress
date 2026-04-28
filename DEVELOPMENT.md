# Development Guide

## Prerequisites

- Node.js 18+, npm 9+
- Firebase project (Auth + Firestore)
- Stripe account (optional)
- Gemini API key (optional)

## Setup

```bash
git clone <repo-url>
cd ShapeExpress
npm install
cp .env.example .env.local
```

`.env.local` required keys:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
GEMINI_API_KEY=
APP_URL=http://localhost:3000
NODE_ENV=development
```

Firebase: enable Email/Password + Google auth, create Firestore DB (test mode for dev).

## Workflow

### New feature

```
src/features/your-feature/
├── index.ts       # barrel export
├── types.ts
└── ui/YourView.tsx
```

See [ARCHITECTURE.md](src/ARCHITECTURE.md) for FSD rules.

### New API endpoint

Add to [server.ts](server.ts) with `authMiddleware` + `express-validator`. See [API.md](API.md).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Module not found | Check `@/` alias, run `npm install` |
| Firebase auth failing | Verify `.env.local` keys, check Firebase Console auth methods |
| Stripe error | Confirm `STRIPE_SECRET_KEY=sk_test_...`, server on `:3000` |
| WebSocket fails | Ensure server on `:3000`, check firewall |

## Firebase Emulator (optional)

```bash
npm install -g firebase-tools
firebase emulators:start
```

## Android / Capacitor

```bash
npx capacitor sync
npx capacitor run android
npx capacitor open android
cd android && ./gradlew assembleDebug
```

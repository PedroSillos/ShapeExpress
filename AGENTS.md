# Shape Express - AI Agent Instructions

> Shape Express is a premium fitness tracking platform built with React 19, TypeScript, Vite, and Firebase. This file helps AI coding agents understand the codebase and be immediately productive.

---

## 🚀 Quick Commands

### Web Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development (Vite on :5173 + Express on :3000) |
| `npm run build` | Production build with Vite |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |

### Android / Capacitor
| Command | Description |
|---------|-------------|
| `npx capacitor sync` | Sync web assets to Android project |
| `npx capacitor run android` | Build and run on device/emulator |
| `npx capacitor open android` | Open Android Studio project |
| `cd android && ./gradlew assembleDebug` | Build debug APK directly |

---

## 🏗️ Architecture

Shape Express follows **Feature-Sliced Design (FSD)**:

```
src/
├── app/              # Application entry point
├── features/         # Isolated business features
├── entities/         # Shared domain types (read-only)
├── shared/           # Reusable components & utilities
├── services/         # Feature-agnostic services
└── presentation/     # Legacy (being migrated to features)
```

### Key Principles
- **Feature Isolation**: Each feature in `src/features/` is self-contained
- **Dependency Flow**: App → Features → Entities → Shared (no reverse dependencies)
- **Barrel Exports**: Each feature has `index.ts` for clean imports

---

## 📁 Key Files

- [src/main.tsx](src/main.tsx) - React 19 entry point
- [src/App.tsx](src/App.tsx) - Main routing component
- [server.ts](server.ts) - Express backend (Stripe, auth, health)
- [src/firebase.ts](src/firebase.ts) - Firebase configuration
- [vite.config.ts](vite.config.ts) - Vite + TailwindCSS config
- [capacitor.config.ts](capacitor.config.ts) - Capacitor mobile config
- [android/](android/) - Android native project

---

## 🎨 Conventions

### Components
- Use `cn()` utility from [src/shared/lib/cn.ts](src/shared/lib/cn.ts) for Tailwind class merging
- Dark mode design (`bg-dark-card`, `border-dark-border`)
- Use existing UI components in [src/shared/ui/](src/shared/ui/)

### Imports
- Use `@/` alias for root imports (e.g., `@/features/auth`)
- Prefer barrel exports (`import { LoginView } from '@/features/auth'`)

### Language
- **UI strings in Portuguese**: treino=workout, usuário=user, entrenador=trainer
- **Code in English**: TypeScript, variable names, comments

---

## 📚 Documentation

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Commit guidelines
- [src/ARCHITECTURE.md](src/ARCHITECTURE.md) - FSD details
- [API.md](API.md) - Backend API reference

---

## 🔐 Security Guidelines

### Environment Variables
- **Never hardcode secrets** — all keys must live in `.env.local` (gitignored)
- Required secrets: `STRIPE_SECRET_KEY`, `GEMINI_API_KEY`, Firebase config vars
- Never expose `STRIPE_SECRET_KEY` or `GEMINI_API_KEY` to the frontend (`VITE_` prefix = public)

### Authentication
- All `/api/*` routes (except `/api/health`) must use `authMiddleware` in [server.ts](server.ts)
- Prefer Firebase ID token (`Authorization: Bearer <token>`) over the `x-user-email` fallback header
- Never trust user-supplied identity without server-side verification

### Input Validation
- Validate and sanitize all request body fields using `express-validator` before processing
- Use the existing `validateProtocolId` / `validateSessionId` patterns for new endpoints
- Reject unexpected or oversized payloads early

### AI Endpoints
- Never include raw user-controlled strings directly in Gemini prompts without sanitization
- Limit prompt-injected data to known, typed fields (name, objective, level, etc.)
- Always cap AI response usage to avoid runaway costs (model: `gemini-2.0-flash`)

### Stripe
- Verify payment status server-side via `stripe.checkout.sessions.retrieve` — never trust client claims
- Use Stripe webhooks (with signature verification) for production purchase fulfillment
- `protocolId` in metadata must be validated before use

### Firebase
- Use Firebase Admin SDK (server-side) for privileged Firestore writes
- Client SDK is acceptable for reads/writes scoped to the authenticated user
- Apply Firestore Security Rules to enforce ownership (`request.auth.uid == resource.data.userId`)

### General
- No `console.log` of sensitive data (tokens, emails, payment info) in production
- Keep dependencies up to date; run `npm audit` regularly

---

## ⚠️ Current Limitations

- **No test framework** configured (no vitest/jest)
- **Firebase required** for full functionality
- **Stripe optional** for payments

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS 4, Motion |
| Backend | Express.js, WebSockets |
| Database | Firebase (Firestore, Auth, Storage) |
| Payments | Stripe |
| AI | Google Gemini API |
| Mobile | Capacitor 8 |
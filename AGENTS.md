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
- [src/presentation/components]
- [src/features/community]
- [src/features/register]
- [src/domain/use-cases]
- [src/data/services/aiService.ts]
- [server.ts]
- [src/firebase.ts]
- [vite.config.ts]
- [capacitor.config.ts]

## Do / Don't

| Do | Don't |
|----|-------|
| Use `@/` alias for all imports | Use relative `../../` imports outside of features |
| Use `cn()` for class merging | Concatenate class strings manually |
| Put business logic in hooks or domain use-cases | Put logic inline in screen components |
| Use `gemini-2.0-flash` for AI calls | Use other Gemini models (cost control) |
| Validate all API inputs with `express-validator` | Trust raw request body fields |
| Use `Authorization: Bearer <token>` | Rely on `x-user-email` for new routes |
| Keep files under 500 lines | Let files grow without splitting |
| Run `npm run test:e2e` before finishing any task | Consider a change complete without passing E2E tests |

## E2E Tests

Before considering any change complete, **always** run:

```bash
npm run test:e2e
```

The test covers: logout if a session is active → login. It must pass before committing.

Test credentials go in `.env.local` (never hardcoded):

```
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

Tests also run automatically on every push/PR to `main` or `develop` via GitHub Actions.

## Architecture

### FSD (Feature-Sliced Design)

- New features go in `src/features/<name>/` with `index.ts` barrel export
- Import via relative paths from `src/presentation/screens` (e.g. `../../features/community`)
- Features never import other features; use shared utils or entities

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
- **Git commits**: **Portuguese (pt-BR)** — all commit messages must be in Brazilian Portuguese
- Dark theme classes: `bg-dark-card`, `border-dark-border`
- Class merging: `cn()` from `@/shared/lib/cn`
- Imports: `@/` alias always
- TypeScript strict — no implicit `any`
- Naming: `PascalCase` components/types, `camelCase` functions, `UPPER_SNAKE_CASE` constants
- **SRP**: each file has one responsibility — one component, one hook, one service. Screens only orchestrate; business logic belongs in hooks or domain use-cases. Split any file that does more than one thing.

### Commit Conventions (PT-BR)

All commit messages must follow the Conventional Commits standard in **Brazilian Portuguese**.

Format: `<tipo>(<escopo>): <descrição>`

#### Main Types

| Type | Usage |
|------|-------|
| `funcionalidade:` | New feature |
| `correção:` | Bug fix |
| `documentação:` | Documentation changes |
| `refatoração:` | Code refactoring |
| `segurança:` | Security fixes |
| `tarefa:` | Maintenance/configuration |
| `desempenho:` | Performance improvements |
| `teste:` | Add/fix tests |
| `estilo:` | Formatting, whitespace (no code change) |
| `build:` | Build system or dependencies |
| `cicd:` | CI/CD configuration |

#### Examples

```bash
funcionalidade(auth): adiciona login com Google
correção(chat): corrige envio de mensagens duplicadas
refatoração(App): aplica princípio de responsabilidade única
```

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
- **Input validation**: use `express-validator` on all request body fields before processing (see existing `validateProtocolId` pattern).
- **AI prompts**: only inject known typed fields — never raw user strings. Use `gemini-2.0-flash` to control costs.
- **Stripe**: verify payment server-side via `stripe.checkout.sessions.retrieve`; use webhook signature verification in production.
- **Firebase**: Admin SDK for privileged writes; enforce Firestore Security Rules (`request.auth.token.email == email`).
- **Logging**: never log tokens, emails, or payment data.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Module not found | Check relative import paths, run `npm install` |
| Firebase auth failing | Verify `.env.local` keys, check Firebase Console auth methods |
| Stripe error | Confirm `STRIPE_SECRET_KEY=sk_test_...`, server on `:3000` |
| Android assets stale | Run `npm run android` (clears `android/app/build` before sync) |
| Capacitor changes not reflected | Always `npm run build` before `npx capacitor sync` |
| White screen on Android | Check `webDir` in `capacitor.config.ts` points to `dist` |

## Dependencies Note

- `better-sqlite3` and `multer` are installed but not actively used in current routes — do not add new features depending on them without confirming they are still needed.

## Firebase Emulator (optional)

```bash
npm install -g firebase-tools
firebase emulators:start
```

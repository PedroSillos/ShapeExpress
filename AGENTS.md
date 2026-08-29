# Shape Express — AI Agent Instructions

React 19 + TypeScript + Vite 6 frontend, Express backend, Firebase, Stripe, Gemini AI, Capacitor 8 (Android). Deploy via Railway.

> **Antes de qualquer mudança**: leia este arquivo inteiro.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Clean cache, start Vite (5173) + Express (3000) |
| `npm run build` | Production build |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/`, Vite cache, logs, Android build |
| `npm run android` | Clean → build → capacitor sync → open Android |
| `npm run start` | Production server (Railway) |
| `npm run test:build` | Verifica se o projeto builda sem erros |

## Architecture

### FSD (Feature-Sliced Design)

```
src/
├── features/<name>/     # Domain UI, feature hooks, local state
│   ├── index.ts         # barrel export (required)
│   ├── types.ts
│   └── ui/
├── presentation/
│   ├── screens/         # Orchestration only — no business logic
│   ├── hooks/           # Shared presentation hooks
│   └── components/      # Shared UI components
├── domain/
│   ├── entities/        # Shared types/contracts
│   └── use-cases/       # Pure business logic
├── data/services/       # API calls, Firebase ops
├── shared/lib/          # Generic utils (cn, sportAvatars)
└── utils/               # Helpers (cn, firebaseErrors, validation, youtube)
```

Layer rules:
- Features never import other features — use `shared` or `entities`
- Screens only orchestrate; logic belongs in hooks or use-cases
- `data/services` never imports React components

### Key Files

- `src/App.tsx` — root composition, routing state, modal orchestration
- `src/presentation/AppRouter.tsx` — tab-based routing
- `src/presentation/hooks/useAppState.ts` — global app state
- `src/data/services/aiService.ts` — Gemini client calls
- `server.ts` — Express backend (auth, Stripe, Gemini, health)
- `src/firebase.ts` — Firebase client initialization
- `vite.config.ts` / `capacitor.config.ts`

## Do / Don't

| Do | Don't |
|----|-------|
| Use `@/` alias for all imports | Use relative `../../` imports outside features |
| Use `cn()` from `@/utils/cn` for class merging | Concatenate class strings manually |
| Put business logic in hooks or domain use-cases | Put logic inline in screen components |
| Use `gemini-2.0-flash` for AI calls | Use other Gemini models |
| Validate all API inputs with `express-validator` | Trust raw request body fields |
| Use `Authorization: Bearer <firebase-id-token>` | Rely on `x-user-email` for new routes |
| Keep files under 500 lines | Let files grow without splitting |
| Consider both web and Android when making changes | Test only one platform |

## API Endpoints

Express on port **3000**. All routes except `/api/health` require `authMiddleware`.

Auth: `Authorization: Bearer <firebase-id-token>` (preferred) or `x-user-email` (legacy fallback).

| Endpoint | Method | Auth | Rate limit | Description |
|----------|--------|------|------------|-------------|
| `/api/health` | GET | None | globalLimiter (skip) | Health check |
| `/api/ai/generate-first-workout` | POST | None | aiGuestLimiter (5/min) | AI workout for guests |
| `/api/store/items` | GET | None | globalLimiter (200/15min) | Published store items |
| `/api/store/publish` | POST | authMiddleware | globalLimiter | Trainer publishes item |
| `/api/store/unpublish/:id` | POST | authMiddleware | globalLimiter | Trainer unpublishes item |

> **Stripe / checkout**: disabled. Free item claiming is handled client-side via Firestore SDK. Do not re-add Stripe to `server.ts` without also adding webhook signature verification (`stripe.webhooks.constructEvent`).

Chat is Firestore-only — no WebSocket. Messages at `messages/{roomId}/msgs/{msgId}`.

## Conventions

- UI strings: **Portuguese (pt-BR)** · Code/comments: **English**
- Git commits: **Portuguese (pt-BR)**, Conventional Commits format
- Dark theme classes: `bg-dark-card`, `border-dark-border`
- TypeScript strict — no implicit `any`
- Naming: `PascalCase` components/types, `camelCase` functions, `UPPER_SNAKE_CASE` constants
- SRP: one component/hook/service per file

### Icon Template

Use this pattern for icon cards (onboarding, selections, lists):

- Icon source: prefer `src/assets/icons/*.svg` with `brightness-0 invert` (white on colored bg). If does not exist, use lucide.dev/
- Background: prefer solid hex color per item (`bg` prop), not Tailwind bg classes
- Container: prefer `w-12 h-12 rounded-xl overflow-hidden p-1.5`
- Fallback (no bg): prefer `bg-white/5` via `cn(!bg && 'bg-white/5')`

### Commit Types

| Type | Usage |
|------|-------|
| `funcionalidade:` | New feature |
| `correção:` | Bug fix |
| `refatoração:` | Refactoring |
| `documentação:` | Docs |
| `segurança:` | Security |
| `tarefa:` | Maintenance |
| `desempenho:` | Performance |
| `teste:` | Tests |
| `estilo:` | Formatting only |
| `build:` | Build/deps |
| `cicd:` | CI/CD |

## Security Guidelines

### Secrets e credenciais

- All keys in `.env.local` (gitignored). `VITE_` prefix = client-side — never put `STRIPE_SECRET_KEY` or `GEMINI_API_KEY` there.
- Never commit `.env*`, `*.json` service account files, or keystores to Git.
- On Railway: use `FIREBASE_SERVICE_ACCOUNT` env var (JSON string). On Cloud Run: Application Default Credentials.
- Never store Firebase service account JSON files inside the project directory — use env vars only.

### Autenticação e autorização

- Every `/api/*` route (except `/api/health`) must use `authMiddleware`. Prefer Bearer token over `x-user-email`.
- **Firestore Security Rules: ownership is mandatory.** Every collection that stores per-user data MUST verify `request.auth.token.email == resource.data.userEmail` (or equivalent uid check). Being authenticated is never sufficient — users must only read/write their own data.
  - ✅ `allow read: if isOwner(resource.data.userEmail);`
  - ❌ `allow read: if isAuthenticated();` — any logged-in user reads everyone's data
- Sensitive fields (birthDate, height, weight, health metrics) belong in the private subcollection `users/{id}/private/data`, not in the public `users/{id}` document.
- `isAdmin()` must rely exclusively on `role == 'admin'` in the user's Firestore document — never hardcode email addresses in Security Rules.
- Phone-auth users: store `phoneNumber` (not `uid`) in the `email` field of their Firestore document so display and connection logic stays consistent.

### Inputs e validação

- Use `express-validator` on all request body fields — see `validateProtocolId` / `validateCoachAdvice` patterns in `server.ts`.
- Sanitize or escape all string inputs that will be stored or displayed.
- AI prompts: inject only known typed fields — never raw user strings.

### Servidor Express

- CORS is configured with an explicit origin whitelist (`server.ts`). When adding a new origin (e.g. a new domain or staging environment), add it to the `allowedOrigins` array or the `ALLOWED_ORIGINS` env var — never open it with `origin: '*'` or remove the check.
- Global rate limiting (200 req/15 min per IP) is applied via `app.use(globalLimiter)` before all routes. Do not register new routes before this middleware.
- Helmet is active (CSP, HSTS, X-Frame-Options, etc.). Extend CSP `connectSrc` when adding new external service calls.
- Never expose internal identifiers (userId, email, provider info) in error messages returned to the client. Use generic user-facing messages; log details in DEV only.

### Stripe

- **Stripe is currently disabled.** Free item claiming is handled client-side via Firestore SDK.
- Do not re-add Stripe without also adding webhook signature verification (`stripe.webhooks.constructEvent`). Never trust `STRIPE_SECRET_KEY` on the client side.

### Firebase

- Admin SDK for privileged writes only — never ship service account credentials in the app bundle.
- Enforce Firestore Security Rules; use the Firebase Rules Simulator to verify that user A cannot read user B's data before deploying.
- **Logging**: never log tokens, emails, phone numbers, or health data.

### Android

- `android:allowBackup="false"` must remain set in `AndroidManifest.xml`. Do not revert this — Android backup would expose localStorage and IndexedDB (Firebase sessions, workout data) via `adb backup`.
- FileProvider paths in `file_paths.xml` must point to specific subdirectories, not `path="."`.
- Release builds must use a signing config driven by environment variables (`KEYSTORE_PATH`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) — never commit the keystore file.
- WebView access origins in `res/xml/config.xml` must list explicit domains — never use `<access origin="*" />`.

## Data Layer

Dois modos: **guest** (localStorage) e **logado** (Firestore). Transição gerenciada por `useAuthState` → `useSyncState` → `useProfileState` / `useWorkoutState`.

**Guest** — todas as leituras e escritas vão para localStorage (`LOCAL_USER_PROFILE`, `LOCAL_STATS`, `LOCAL_SESSIONS`, `PENDING_TEMPLATES`, etc.). `WELCOME_ANSWERS` é a fonte de modalidade, objective e experience para features de IA.

**Logado** — no boot, `useSyncState` busca tudo do Firestore em paralelo (profile, stats, templates, sessions, connections) e aplica via batching em um único re-render. App fica no splash até `dataReady = true`. Escritas são otimistas (memória + Firestore simultaneamente). Sem re-sync automático durante a sessão.

**Transições:**
- Login conta existente → `clearLocalGuestData()` limpa todo localStorage guest → sync do Firestore.
- Registro / nova conta Google/Phone → `uploadLocalDataToFirestore()` migra dados locais para o Firestore → `clearLocalGuestData()`.
- Logout → `resetWorkoutStates()` + `resetProfileStates()` limpam localStorage e zeram memória.

**Exceções importantes:**
- `activeWorkout` sempre vai para localStorage, independente de login (sobrevive reloads).
- Sessions: sync faz merge com `LOCAL_SESSIONS` pendentes para cobrir race condition de treino concluído durante o login.
- `userTrainingProfile`, `userCalorieProfile` e `exerciseUserStats` **nunca são sincronizados com o Firestore** — ficam em DEFAULT_* para logados e são recalculados das sessions.

**Campos do UserProfile no Firestore:** `firstName`, `lastName`, `email`, `userType`, `birthDate`, `height`, `initialWeight`, `objective`, `experienceLevel`, `specialties` (array — modalidade do usuário), `hasPersonal`, `weeklyGoal`. Campo `location` **não existe** no banco.

**Regra:** para usuários logados, sempre usar `userProfile.*`. `WELCOME_ANSWERS` só é válido para guests (`!isLoggedIn`).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Module not found | Check import paths, run `npm install` |
| Firebase auth failing | Verify `.env.local` keys, check Firebase Console auth methods |
| Stripe error | Confirm `STRIPE_SECRET_KEY=sk_test_...`, server on `:3000` — note: Stripe is currently disabled |
| Android assets stale | Run `npm run android` (clears build before sync) |
| White screen on Android | Check `webDir` in `capacitor.config.ts` points to `dist` |
| Capacitor changes not reflected | Always `npm run build` before `npx capacitor sync` |

## Notes

- `better-sqlite3` and `multer` are installed but unused — do not build features on them without confirming they are still needed.
- Firebase Emulator: `npm install -g firebase-tools && firebase emulators:start`

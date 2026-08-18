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

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/checkout/session` | POST | Create Stripe checkout session |
| `/api/checkout/verify` | POST | Verify payment completion |
| `/api/ai/coach-advice` | POST | AI coaching advice |
| `/api/ai/recommend-communities` | POST | AI community recommendations |

Chat is Firestore-only — no WebSocket. Messages at `messages/{roomId}/msgs/{msgId}`.

### Stripe Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure |

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

- **Secrets**: all keys in `.env.local` (gitignored). `VITE_` prefix = client-side — never put `STRIPE_SECRET_KEY` or `GEMINI_API_KEY` there.
- **Auth**: every `/api/*` route (except `/api/health`) must use `authMiddleware`. Prefer Bearer token over `x-user-email`.
- **Input validation**: use `express-validator` on all request body fields (see `validateProtocolId` / `validateCoachAdvice` patterns in `server.ts`).
- **AI prompts**: inject only known typed fields — never raw user strings.
- **Stripe**: verify payment server-side via `stripe.checkout.sessions.retrieve`; use webhook signature verification in production.
- **Firebase**: Admin SDK for privileged writes; enforce Firestore Security Rules (`request.auth.token.email == email`). On Railway: `FIREBASE_SERVICE_ACCOUNT` env var. On Cloud Run: Application Default Credentials.
- **Logging**: never log tokens, emails, or payment data.

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

## Store / Loja

**Separação entre Templates e Anúncios:**

Quando um treinador publica um treino na loja, o sistema cria um **anúncio** (`StoreItem`) que é **independente** do template de treino original (`WorkoutTemplate`). São entidades separadas no Firestore:

- **Template de treino** (`templates/` collection) — usado pelo próprio treinador e seus alunos
- **Anúncio na loja** (`store_items/` collection) — contém `templateId` para referenciar o treino, mas tem seus próprios dados (preço, descrição, imagem, etc.)

**Regras importantes:**
- Alterações no template de treino **NÃO afetam** o anúncio na loja
- Alterações no anúncio (título, preço, descrição) **NÃO afetam** o template original
- Quando um atleta compra um treino, uma **cópia do template** é criada para ele via `StorePurchase` → cópia do template para `templates/{buyerEmail}/...`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Module not found | Check import paths, run `npm install` |
| Firebase auth failing | Verify `.env.local` keys, check Firebase Console auth methods |
| Stripe error | Confirm `STRIPE_SECRET_KEY=sk_test_...`, server on `:3000` |
| Android assets stale | Run `npm run android` (clears build before sync) |
| White screen on Android | Check `webDir` in `capacitor.config.ts` points to `dist` |
| Capacitor changes not reflected | Always `npm run build` before `npx capacitor sync` |

## Notes

- `better-sqlite3` and `multer` are installed but unused — do not build features on them without confirming they are still needed.
- Firebase Emulator: `npm install -g firebase-tools && firebase emulators:start`

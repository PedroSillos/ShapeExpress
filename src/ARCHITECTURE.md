# Architecture — Feature-Sliced Design (FSD)

## Structure

```
src/
├── app/          # Entry point, routing, providers
├── features/     # Isolated business domains
├── entities/     # Shared domain types (read-only)
├── shared/       # Reusable UI, hooks, utilities (no business logic)
├── services/     # Feature-agnostic services (Firebase, AI, etc.)
└── presentation/ # LEGACY — being migrated to features/
```

## Dependency Flow

```
app → features → entities → shared
                ↘ shared
services (imported by features, not by shared/entities)
```

**Rules:**
- Features never import other features
- Shared/entities never import features
- Always import via barrel `index.ts`, never deep paths

## Feature Structure

```
src/features/your-feature/
├── index.ts       # barrel export (required)
├── types.ts
├── ui/
│   └── YourView.tsx
└── hooks/         # optional
    └── useYourHook.ts
```

```ts
// index.ts
export { YourView } from './ui/YourView';
export type { YourState } from './types';
```

## Layer Responsibilities

| Layer | Owns | Never |
|-------|------|-------|
| `app` | Routing, providers, feature composition | Business logic |
| `features` | Domain UI, feature hooks, local state | Cross-feature imports |
| `entities` | Shared types/contracts | Logic, components |
| `shared` | Generic UI, hooks, utils | Feature-specific code |
| `services` | API calls, Firebase ops | React components |

## State Management

- Local: `useState`
- Feature-level: custom hook in `features/*/hooks/`
- Global: `useAppState` from `@/shared/hooks`

## Firebase

Use `services/` for all Firestore operations — features never call Firebase directly.

```ts
// ✅ features/stats/ui/StatsView.tsx
import { getProgressScore } from '@/services';
```

## Migration Status

`presentation/screens/` → `features/*/ui/` (in progress)  
`utils/` → `shared/lib/` (in progress)

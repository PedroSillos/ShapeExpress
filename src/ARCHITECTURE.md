# 🏗️ Architecture - Feature-Sliced Design (FSD)

Shape Express follows **Feature-Sliced Design (FSD)**, a modern architecture pattern that organizes code by business features rather than technical layers.

---

## 📁 Project Structure

```
src/
├── app/                    # Application layer (entry point)
│   └── index.ts            # Main App component export
│
├── features/               # Business features (isolated domains)
│   ├── auth/               # Authentication and authorization
│   │   ├── index.ts        # Barrel export
│   │   ├── ui/
│   │   │   ├── LoginView.tsx
│   │   │   ├── RegisterView.tsx
│   │   │   └── ForgotPasswordView.tsx
│   │   ├── hooks/          # Feature-specific hooks (optional)
│   │   │   └── useAuth.ts
│   │   └── types.ts        # Feature types
│   │
│   ├── dashboard/          # Athlete main dashboard
│   ├── workout/            # Workout management & tracking
│   ├── stats/              # Analytics and progress tracking
│   ├── calendar/           # Workout calendar
│   ├── leaderboard/        # Rankings and competitions
│   ├── profile/            # User profile management
│   ├── students/           # Trainer management tools
│   ├── express/            # Premium protocol store
│   ├── chat/               # Trainer-athlete messaging
│   └── notifications/      # Alert center
│
├── entities/               # Shared domain types (read-only)
│   ├── index.ts            # Re-exports all types
│   ├── user.ts             # User-related types
│   ├── workout.ts          # Workout-related types
│   └── protocol.ts         # Protocol-related types
│
├── shared/                 # Reusable code without business logic
│   ├── ui/                 # UI components
│   │   ├── Card.tsx        # Reusable card component
│   │   ├── Badge.tsx       # Badge component
│   │   ├── Button.tsx      # Button variants
│   │   └── index.ts        # Barrel export
│   │
│   ├── hooks/              # Generic hooks
│   │   ├── useAppState.ts  # Global app state
│   │   └── index.ts
│   │
│   └── lib/                # Utilities
│       ├── cn.ts           # Classname merge utility
│       ├── validation.ts   # Form validation
│       ├── youtube.ts      # YouTube utilities
│       └── index.ts
│
├── services/               # Feature-agnostic services
│   ├── aiService.ts        # Google GenAI integration
│   ├── progressScoreService.ts
│   ├── stagnationService.ts
│   └── workoutEstimation.ts
│
├── utils/                  # Legacy utilities (gradually deprecating)
│   ├── firebaseErrors.ts
│   ├── validation.ts
│   └── youtube.ts
│
├── presentation/           # LEGACY - Being migrated to features
│   ├── screens/            # Screen components (old location)
│   ├── components/         # UI components (old location)
│   └── hooks/              # Hooks (old location)
│
├── App.tsx                 # Main App component
├── main.tsx                # React entry point
├── firebase.ts             # Firebase configuration
├── constants.ts            # App constants
├── types.ts                # Global types
└── vite-env.d.ts           # Vite environment types
```

---

## 🎯 Core Principles

### 1. **Feature Isolation**
Each feature is self-contained and can be developed independently.

```typescript
// ✅ Features are independent domains
src/features/
  ├── workout/      # Completely separate from chat
  └── chat/         # Completely separate from workout
```

### 2. **Clear Dependency Flow**
Dependencies flow downward only:

```
app
  ↓
features
  ↓
entities
  ↓
shared
```

**Never allow:**
- Features importing other features
- Shared importing from features
- Entities importing from features

### 3. **Barrel Exports**
Always export from `index.ts`:

```typescript
// src/features/auth/index.ts
export { LoginView } from './ui/LoginView';
export { RegisterView } from './ui/RegisterView';
export type { AuthState } from './types';
export { useAuth } from './hooks/useAuth';
```

---

## 📋 Import Rules (CRITICAL)

### ✅ ALLOWED Patterns

```typescript
// App can import from anywhere
import { WorkoutCard } from '@/features/workout';
import { useAppState } from '@/shared/hooks';

// Features import from entities and shared
import { Card } from '@/shared/ui';
import type { User } from '@/entities';

// Shared imports only from shared
import { cn } from '@/shared/lib';

// Entities imports only from shared
import type { BaseEntity } from '@/shared/types';
```

### ❌ FORBIDDEN Patterns

```typescript
// ❌ Feature importing feature
import { ChatView } from '@/features/chat';  // BAD in workout feature

// ❌ Shared importing feature
import { WorkoutCard } from '@/features/workout';  // BAD in shared

// ❌ Bypassing barrel exports
import { LoginView } from '@/features/auth/ui/LoginView';  // BAD

// ❌ Deep imports
import { useAuth } from '@/services/auth/hooks/useAuth';  // BAD
```

---

## 🔧 Creating a New Feature

### Step 1: Create Feature Structure

```bash
mkdir -p src/features/your-feature/ui
mkdir -p src/features/your-feature/hooks
touch src/features/your-feature/index.ts
touch src/features/your-feature/types.ts
```

### Step 2: Create Component

```typescript
// src/features/your-feature/ui/YourView.tsx
import React from 'react';
import { Card } from '@/shared/ui';

interface YourViewProps {
  title: string;
}

export const YourView: React.FC<YourViewProps> = ({ title }) => {
  return (
    <Card>
      <h1>{title}</h1>
    </Card>
  );
};
```

### Step 3: Create Types (if needed)

```typescript
// src/features/your-feature/types.ts
export interface YourState {
  id: string;
  name: string;
  active: boolean;
}

export interface YourInputProps {
  title: string;
  description?: string;
}
```

### Step 4: Create Barrel Export

```typescript
// src/features/your-feature/index.ts
export { YourView } from './ui/YourView';
export type { YourState, YourInputProps } from './types';
```

### Step 5: Use in App

```typescript
// src/App.tsx
import { YourView } from '@/features/your-feature';

export const App = () => {
  return <YourView title="Welcome" />;
};
```

---

## 🧩 Feature Structure Patterns

### Minimal Feature (UI only)

```
src/features/badge/
├── index.ts
└── ui/
    └── BadgeView.tsx
```

### Medium Feature (with hooks)

```
src/features/profile/
├── index.ts
├── types.ts
├── ui/
│   ├── ProfileView.tsx
│   └── EditProfileView.tsx
└── hooks/
    └── useProfile.ts
```

### Complex Feature (with services and hooks)

```
src/features/workout/
├── index.ts
├── types.ts
├── ui/
│   ├── WorkoutView.tsx
│   ├── WorkoutCard.tsx
│   └── WorkoutForm.tsx
├── hooks/
│   ├── useWorkout.ts
│   ├── useWorkoutForm.ts
│   └── useWorkoutTimer.ts
└── services/
    └── workoutService.ts
```

---

## 📊 Layer Responsibilities

### **App Layer**
- Main application component
- Global routing
- Provider setup (Firebase, Context)
- Feature composition
- **Never**: Business logic, data fetching

### **Features Layer**
- Isolated business domains
- Feature components and views
- Feature-specific hooks
- Feature types
- Local state management
- **Never**: Cross-feature dependencies

### **Entities Layer**
- Shared domain types
- Type definitions
- Read-only data contracts
- **Never**: Business logic, components

### **Shared Layer**
- Reusable UI components
- Generic hooks (not feature-specific)
- Utilities and helpers
- **Never**: Feature-specific code

### **Services Layer**
- Business logic not tied to UI
- API integrations
- Firebase operations
- External service integrations
- **Never**: React components, hooks

---

## 🔄 State Management Patterns

### Local Component State
```typescript
const [count, setCount] = useState(0);
```

### Feature-Level State (Hooks)
```typescript
// src/features/workout/hooks/useWorkout.ts
export const useWorkout = () => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  
  return { workout, loading };
};
```

### Global State (useAppState hook)
```typescript
const { user, preferences } = useAppState();
```

---

## 🔌 Firebase Integration

Firebase operations are in `src/firebase.ts` and used via services:

```typescript
// src/services/progressScoreService.ts
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export const getProgressScore = async (userId: string) => {
  const q = query(collection(db, 'users', userId, 'workouts'));
  const snapshot = await getDocs(q);
  // ... calculate and return score
};
```

**Features use services, not Firebase directly:**
```typescript
// src/features/stats/ui/StatsView.tsx
import { getProgressScore } from '@/services';

export const StatsView = () => {
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    getProgressScore(userId).then(setScore);
  }, [userId]);
  
  return <div>{score}</div>;
};
```

---

## 🔄 Migration Status

### ✅ Completed
- Feature structure defined
- Barrel exports implemented
- FSD patterns established

### 🔄 In Progress
- Moving `presentation/screens/` → `features/*/ui/`
- Updating import paths
- Consolidating utilities

### 📋 TODO
- Complete migration of all screens
- Consolidate `utils/` and `shared/lib/`
- Add comprehensive tests
- Document all services

### Migration Checklist
```
For each screen in presentation/screens/:
[ ] Create feature folder
[ ] Move component to features/*/ui/
[ ] Update internal imports to use @/
[ ] Create barrel export
[ ] Update app imports
[ ] Test functionality
[ ] Remove from presentation/
```

---

## 🎓 Examples

### ❌ Bad: Cross-Feature Import
```typescript
// src/features/chat/ui/ChatView.tsx
import { WorkoutCard } from '@/features/workout';  // ❌ DON'T DO THIS

export const ChatView = () => {
  return <WorkoutCard />;  // Wrong layer
};
```

### ✅ Good: Shared Component
```typescript
// src/features/chat/ui/ChatView.tsx
import { Card } from '@/shared/ui';  // ✅ Use shared

export const ChatView = () => {
  return <Card>Chat content</Card>;  // Right layer
};
```

### ❌ Bad: Shared Importing Feature
```typescript
// src/shared/hooks/useData.ts
import { WorkoutCard } from '@/features/workout';  // ❌ DON'T DO THIS

export const useData = () => {
  return <WorkoutCard />;  // Wrong! Shared can't use features
};
```

### ✅ Good: Shared Generic Hook
```typescript
// src/shared/hooks/useAppState.ts
export const useAppState = () => {
  const [state, setState] = useState(null);
  return { state, setState };
};
```

---

## 🚀 Best Practices

1. **Keep features small** - One responsibility per feature
2. **Use barrel exports** - Never bypass `index.ts`
3. **Type everything** - Explicit types in `types.ts`
4. **Avoid circular dependencies** - Respect layer hierarchy
5. **Document complex features** - Add JSDoc comments
6. **Test at feature level** - Mock external dependencies
7. **Use absolute imports** - Always use `@/` prefix
8. **Collocate related code** - Keep feature files together

---

## 🔗 Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Code guidelines
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Setup and workflow
- [API.md](../API.md) - Backend API reference
- [Feature-Sliced Design Docs](https://feature-sliced.design/)

---

## ❓ FAQ

**Q: Can I have a feature import another feature?**
A: No. Use shared components instead or restructure as a single feature.

**Q: Where should I put a utility used by multiple features?**
A: In `shared/lib/` with a clear, generic name.

**Q: What if my feature needs cross-feature data?**
A: Use entities types for data contracts, or lift state to app layer.

**Q: Can entities import from entities?**
A: Yes, entities can import other entities.

**Q: Where do I put Firebase operations?**
A: In `services/` that features can import.

---

**Ready to build? Start by creating a feature! 🚀**

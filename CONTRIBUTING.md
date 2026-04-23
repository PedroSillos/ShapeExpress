# 👥 Contributing to Shape Express

Thank you for your interest in contributing to Shape Express! This guide helps you contribute effectively to our project.

---

## 🎯 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/ShapeExpress.git
   cd ShapeExpress
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up development environment** (see [DEVELOPMENT.md](DEVELOPMENT.md))

---

## 📝 Commit Guidelines

### Format
```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Build, dependencies, or tooling changes

### Subject
- Use imperative mood ("add feature" not "added feature")
- Don't capitalize first letter
- No period at the end
- Max 50 characters

### Body (optional)
- Explain what and why, not how
- Max 72 characters per line
- Separate from subject with blank line

### Examples
```
feat: add workout history filtering

Allow users to filter workout history by date range and exercise type.
Implements filtering UI and backend query optimization.

Closes #123
```

```
fix: resolve chat message loading delay

Remove unnecessary re-renders in ChatView component.
Memoize chat list to prevent unnecessary updates.

Fixes #456
```

---

## 🏗️ Code Style

### TypeScript/React

```typescript
// ✅ Good
const handleWorkoutSubmit = (workoutData: WorkoutInput): void => {
  // Implementation
};

// ❌ Avoid
const handleWorkoutSubmit = (w) => {
  // Implementation
};
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `WorkoutCard`, `DashboardView` |
| **Functions** | camelCase | `calculateProgress`, `handleSubmit` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_WORKOUT_DURATION` |
| **Types/Interfaces** | PascalCase | `UserProfile`, `WorkoutInput` |
| **Files** | kebab-case or PascalCase | `workout-card.tsx` or `WorkoutCard.tsx` |

### Component Structure

```typescript
import React, { useCallback } from 'react';
import { Card } from '@/shared/ui';

interface WorkoutCardProps {
  title: string;
  onStart: () => void;
}

/**
 * Displays a workout card with exercise details.
 * @param title - The workout title
 * @param onStart - Callback when user starts workout
 */
export const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  title, 
  onStart 
}) => {
  const handleClick = useCallback(() => {
    onStart();
  }, [onStart]);

  return (
    <Card onClick={handleClick}>
      {title}
    </Card>
  );
};
```

### Imports

```typescript
// Order: React → Libraries → Local modules
import React from 'react';
import { useCallback } from 'react';
import { Card } from '@/shared/ui';
import { useAppState } from '@/shared/hooks';
import { calculateProgress } from '@/services';
```

---

## 🏛️ Architecture Rules (Feature-Sliced Design)

### Import Rules
- ✅ Features import from: `entities`, `shared`
- ✅ App layer imports from: anywhere
- ❌ Features never import from other features
- ❌ Shared never imports from features

### Feature Structure
```
src/features/your-feature/
├── index.ts           # Barrel exports
├── ui/                # React components
│   ├── YourView.tsx
│   └── YourComponent.tsx
├── hooks/             # Feature-specific hooks
│   └── useYourHook.ts
└── types.ts           # Feature types
```

### Creating New Features
```typescript
// src/features/your-feature/index.ts
export { YourView } from './ui/YourView';
export type { YourProps } from './types';
```

---

## 🎨 UI/Component Guidelines

- Use components from `@/shared/ui` for consistency
- Leverage TailwindCSS utilities
- Keep components focused and reusable
- Add JSDoc comments for complex components
- Prefer functional components with hooks

```typescript
import { Card, Badge } from '@/shared/ui';

/**
 * Displays a user achievement with badge.
 */
export const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  icon,
  unlocked,
}) => {
  return (
    <Card className="p-4">
      {icon}
      <h3 className="mt-2 font-bold">{title}</h3>
      {unlocked && <Badge>Unlocked</Badge>}
    </Card>
  );
};
```

---

## 🔄 Pull Request Process

1. **Before submitting:**
   - Run `npm run lint` (TypeScript check)
   - Test your changes locally with `npm run dev`
   - Update documentation if needed
   - Ensure `.env.example` updated if adding new env vars

2. **Create PR with:**
   - Clear title following commit conventions
   - Description of changes and motivation
   - Reference related issues with `Closes #123`
   - Screenshots/GIFs if UI changes

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test these changes

   ## Screenshots (if applicable)
   Add any relevant images

   Closes #123
   ```

4. **PR Review:**
   - Respond to feedback promptly
   - Make requested changes in new commits
   - Rebase on main if needed

---

## 🧪 Testing Standards

While full test coverage isn't implemented yet, follow these principles:

- **Unit Tests**: Test utility functions and services
- **Component Tests**: Test key UI interactions
- **Integration Tests**: Test feature workflows
- **Edge Cases**: Handle null, undefined, empty states

---

## 📚 Documentation

When contributing, update:
- Code comments for complex logic
- JSDoc for exported functions/components
- `README.md` if adding major features
- `DEVELOPMENT.md` if changing setup process
- `.env.example` if adding env variables

---

## 🚀 Release Process

1. Main branch is always production-ready
2. Features merged to main via PR review
3. Version bumps follow semantic versioning
4. Changelog maintained for releases

---

## ❓ Common Questions

### How do I report a bug?
Open an issue with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment info

### How do I request a feature?
Open an issue with:
- Motivation and use case
- Proposed solution (if any)
- Alternatives considered

### I'm stuck, where do I ask?
1. Check existing issues/PRs
2. Read [DEVELOPMENT.md](DEVELOPMENT.md)
3. Review [ARCHITECTURE.md](src/ARCHITECTURE.md)
4. Ask in discussions or team channels

---

## 📋 Checklist Before Submitting PR

- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Changes tested locally
- [ ] `.env.example` updated (if needed)
- [ ] Commit messages follow format
- [ ] No breaking changes (unless documented)

---

## 🙏 Thank You!

Your contributions make Shape Express better for everyone. We appreciate your time and effort!

**Questions?** Don't hesitate to ask in team channels or open a discussion.

---

**Happy coding! 💪**

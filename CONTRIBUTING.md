# Contributing

## Commit Format

```
<type>: <subject>
```

Types: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore`

Subject: imperative mood, max 50 chars, no period. Example: `feat: add workout history filtering`

## Code Style

- TypeScript strict — no implicit `any`
- Naming: `PascalCase` components/types, `camelCase` functions, `UPPER_SNAKE_CASE` constants
- Imports order: React → libraries → `@/` local
- Use `cn()` from `@/shared/lib/cn` for Tailwind class merging
- UI strings in **Portuguese**, code/comments in **English**
- Follow FSD rules — see [ARCHITECTURE.md](src/ARCHITECTURE.md)

## Pull Request Checklist

- [ ] `npm run lint` passes
- [ ] Tested locally with `npm run dev`
- [ ] `.env.example` updated if new env vars added
- [ ] Docs updated if behavior changed
- [ ] No `console.log` of sensitive data

## Reporting Issues

Include: steps to reproduce, expected vs actual behavior, environment info.

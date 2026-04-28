# 💪 Shape Express

Premium fitness tracking platform — React 19, TypeScript, Vite, Firebase, Express.

## Quick Start

```bash
npm install
cp .env.example .env.local  # fill in credentials
npm run dev                  # Vite :5173 + Express :3000
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for full setup.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS 4, Motion |
| Backend | Express.js, WebSockets |
| Database | Firebase (Firestore, Auth, Storage) |
| Payments | Stripe |
| AI | Google Gemini API |
| Mobile | Capacitor 8 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Vite + Express) |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | TypeScript check |
| `npm run clean` | Remove dist |

## Features

`auth` · `dashboard` · `workout` · `stats` · `calendar` · `leaderboard` · `chat` · `express` · `profile` · `students` · `notifications`

## Docs

- [DEVELOPMENT.md](DEVELOPMENT.md) — Setup & workflow
- [src/ARCHITECTURE.md](src/ARCHITECTURE.md) — FSD structure
- [API.md](API.md) — Backend endpoints
- [CONTRIBUTING.md](CONTRIBUTING.md) — Code standards
- [AGENTS.md](AGENTS.md) — AI agent instructions

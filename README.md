# Shape Express

Premium fitness tracking platform built with React 19, TypeScript, Vite, Firebase, Express, and Capacitor.

## What is Shape Express?

Shape Express is a comprehensive fitness tracking application that helps users monitor their workouts, track progress, and achieve their fitness goals. The platform includes features for workout management, progress tracking, social features, AI-powered coaching, and more.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS 4, Motion |
| Backend | Express.js |
| Database | Firebase (Firestore, Auth, Storage) |
| Payments | Stripe |
| AI | Google Gemini API (`gemini-2.0-flash`) |
| Mobile | Capacitor 8 |

## Prerequisites

- Node.js 20+
- JDK 17+ (Android builds only)
- Android Studio (Android builds only)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and fill in credentials
copy .env.example .env.local   # Windows
cp .env.example .env.local     # macOS/Linux

# Start development server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Web App

| Command | Description |
|---------|-------------|
| `npm run dev` | Clean cache, start Vite dev server + Express |
| `npm run build` | Production build |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run clean` | Remove all temporary files, logs, cache, and Android builds |

## Android / Capacitor

| Command | Description |
|---------|-------------|
| `npm run android` | Build + sync + open Android project |

## Features

- Authentication, Dashboard, Workouts, Stats, Calendar
- Leaderboard, Chat, Express (marketplace), Store
- Profile, Achievements, Body Assessment
- Notifications, Students, Communities

## Environment Variables

Create a `.env.local` file with the following keys:

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

## Documentation

For AI agent instructions and detailed development guidelines, see [AGENTS.md](AGENTS.md).

## Commit Conventions

This project uses **Conventional Commits in Brazilian Portuguese**.

Format: `<tipo>(<escopo>): <descrição>`

### Examples

```bash
funcionalidade(auth): adiciona login com Google
correção(chat): corrige envio de mensagens duplicadas
refatoração(hooks): extrai lógica de autenticação
```

## License

Private — All rights reserved.

# Shape Express

Premium fitness tracking platform built with React 19, TypeScript, Vite, Firebase, Express, and Capacitor.

## What is Shape Express?

Shape Express is a comprehensive fitness tracking application that helps users monitor their workouts, track progress, and achieve their fitness goals. The platform includes features for workout management, progress tracking, social features, AI-powered coaching, and more.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS 4, Motion |
| Backend | Express.js, WebSockets |
| Database | Firebase (Firestore, Auth, Storage) |
| Payments | Stripe |
| AI | Google Gemini API |
| Mobile | Capacitor 8 |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and fill in credentials
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite + Express) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript check |
| `npm run clean` | Remove dist folder |
| `npm run android` | Build Android without cache |

## Mobile (Android)

To build the Android app from the React app:

```bash
# Option 1: npm script (recommended)
npm run android

# Option 2: Manual commands
npm run build
rm -Recurse -Force android/app/build
npx capacitor sync
npx capacitor open android
```

This ensures a fresh build by:
1. Building the React app (`npm run build`)
2. Clearing Android build cache (`rm -Recurse -Force android/app/build`)
3. Syncing to Android project (`npx capacitor sync`)

## Features

- **Authentication** — Email/Password and Google sign-in via Firebase
- **Dashboard** — Overview of fitness progress and stats
- **Workouts** — Create and manage workout routines
- **Stats** — Track progress and calculate scores
- **Calendar** — View workout history by date
- **Leaderboard** — Compete with other users
- **Chat** — Real-time messaging via WebSocket
- **Express** — Quick workout mode
- **Profile** — User profile management
- **Notifications** — Push notifications for reminders

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

## License

Private — All rights reserved.
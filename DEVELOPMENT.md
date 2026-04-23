# 🛠️ Development Guide

Complete guide for setting up and developing Shape Express locally.

---

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** (for version control)
- **Firebase Account** (free tier available)
- **Stripe Account** (optional, for payments testing)
- **Google GenAI API Key** (for AI features)

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd ShapeExpress
npm install
```

### 2. Environment Setup

Copy the example file and configure your local environment:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Server
APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** (Email/Password, Google Sign-In)
4. Create a **Firestore Database** (start in test mode for development)
5. Copy credentials to `.env.local`

### 4. Start Development

```bash
npm run dev
```

This starts:
- **Vite Dev Server**: `http://localhost:5173`
- **Express Backend**: `http://localhost:3000`

---

## 📚 Project Structure

```
ShapeExpress/
├── src/
│   ├── app/              # App entry point
│   ├── features/         # Feature modules (FSD)
│   │   ├── auth/         # Authentication
│   │   ├── dashboard/    # Main dashboard
│   │   ├── workout/      # Workout management
│   │   ├── stats/        # Analytics
│   │   ├── chat/         # Messaging
│   │   ├── calendar/     # Calendar
│   │   ├── leaderboard/  # Rankings
│   │   ├── profile/      # User profile
│   │   ├── students/     # Trainer tools
│   │   ├── express/      # Store
│   │   └── notifications/# Alerts
│   ├── entities/         # Domain types
│   ├── shared/           # Shared utilities
│   │   ├── ui/           # UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
│   ├── services/         # API services
│   ├── App.tsx           # Main component
│   ├── main.tsx          # Entry point
│   └── firebase.ts       # Firebase config
│
├── public/               # Static assets
├── server.ts             # Express backend
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # TailwindCSS config
├── package.json          # Dependencies
└── README.md             # This file
```

---

## 🔧 Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Vite + Express) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove dist folder |
| `npm run lint` | Check TypeScript types |

---

## 🎯 Development Workflow

### Creating a New Feature

1. Create folder under `src/features/your-feature/`
2. Structure:
   ```
   src/features/your-feature/
   ├── index.ts          # Barrel export
   ├── ui/               # Components
   │   └── YourView.tsx
   ├── hooks/            # Feature hooks (if any)
   └── types.ts          # Feature types
   ```

3. Export from `src/features/your-feature/index.ts`:
   ```ts
   export { YourView } from './ui/YourView';
   export * from './types';
   ```

4. Use in app:
   ```ts
   import { YourView } from '@/features/your-feature';
   ```

### Adding Shared Components

1. Create in `src/shared/ui/`
2. Use across features:
   ```ts
   import { Card, Badge } from '@/shared/ui';
   ```

### Adding Services

1. Create in `src/services/`
2. Keep them feature-agnostic:
   ```ts
   import { aiService } from '@/services';
   ```

---

## 🔥 Firebase Rules (Development)

Current `firestore.rules` is in test mode. For production, configure security rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Public data
    match /protocols/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }
  }
}
```

---

## 💳 Stripe Testing

### Test Cards
- **Success**: 4242 4242 4242 4242
- **Fail**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Webhook Testing
```bash
# Listen for events
stripe listen --forward-to localhost:3000/webhooks
```

---

## 🧪 Testing

Currently no automated tests configured. Future recommendations:
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright or Cypress
- **API Testing**: Postman or Insomnia

---

## 🐛 Debugging

### Browser DevTools
- React DevTools: [Extension](https://react-devtools-tutorial.vercel.app/)
- TailwindCSS Inspector: `Ctrl+Shift+P` → "Tailwind" (if using Tailwind Intellisense)

### Server Logs
Check console output when running `npm run dev`

### Firebase Emulator (Optional)
```bash
npm install -g firebase-tools
firebase emulators:start
```

---

## 📦 Common Issues

### "Module not found" errors
- Check import paths use `@/` alias
- Verify file exists in correct location
- Run `npm install` again

### Firebase authentication not working
- Verify `.env.local` has correct Firebase keys
- Check Firestore rules aren't blocking access
- Ensure authentication method enabled in Firebase Console

### Stripe integration failing
- Confirm `STRIPE_SECRET_KEY` is set to test key (starts with `sk_test_`)
- Check server is running on `:3000`
- Verify CORS not blocking requests

### WebSocket connection issues
- Ensure server running on port 3000
- Check firewall isn't blocking connections
- Verify `APP_URL` matches your setup

---

## 🚀 Production Build

```bash
# Build
npm run build

# Preview production build locally
npm run preview

# Deploy to hosting (Firebase Hosting example)
firebase deploy
```

---

## 🔗 Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Docs](https://firebase.google.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

## 📞 Getting Help

1. Check this guide first
2. Search existing issues in repository
3. Consult [CONTRIBUTING.md](CONTRIBUTING.md)
4. Ask in team channels

---

**Happy coding! 🚀**

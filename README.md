# 💪 Shape Express

> A premium **fitness tracking platform** with intelligent progression tracking, achievements, community challenges, and trainer-athlete connections. Built with modern web technologies and Firebase backend.

---

## ✨ Key Features

- **🏋️ Smart Workout Management** - Create, track, and analyze personalized training protocols
- **📊 Advanced Analytics** - Track progress with detailed metrics, body assessments, and evolution analytics
- **🎯 Achievement System** - Unlock achievements and track milestones
- **📅 Calendar Integration** - Visual workout calendar with history
- **👥 Community Leaderboard** - Global rankings and league competitions
- **💬 Real-time Chat** - Direct messaging between athletes and trainers
- **🛍️ Integrated Store** - Purchase premium training protocols (Stripe payments)
- **📱 Mobile-Ready** - Fully responsive design with TailwindCSS
- **🔔 Notifications** - Real-time alerts for workouts, messages, and achievements

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (with npm)
- **Firebase Project** (credentials required)
- **Stripe Account** (optional, for payments)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file** (see [.env.example](.env.example)):
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Firebase:**
   - Add your Firebase config to `.env.local`
   - Set up Firestore database and authentication

4. **Run development server:**
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:5173` (Vite)
   The backend runs on `http://localhost:3000` (Express)

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📦 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | TailwindCSS 4, Motion (animations) |
| **Backend** | Express.js, WebSockets, Node.js |
| **Database** | Firebase (Firestore, Auth, Storage) |
| **Payments** | Stripe |
| **AI** | Google GenAI API |
| **UI Components** | Lucide React, Recharts |

---

## 🏗️ Architecture

Shape Express follows **Feature-Sliced Design (FSD)** architecture:

```
src/
├── app/              # Application entry point
├── features/         # Isolated features (auth, workout, chat, etc.)
├── entities/         # Domain types and models
├── shared/           # Reusable components and utilities
└── presentation/     # Legacy (being migrated to features)
```

**[Read full architecture details →](src/ARCHITECTURE.md)**

---

## 📖 Documentation

- **[Development Guide](DEVELOPMENT.md)** - Setup, scripts, and workflow
- **[Architecture](src/ARCHITECTURE.md)** - FSD design patterns and structure
- **[API Reference](API.md)** - Backend endpoints and Stripe integration
- **[Contributing](CONTRIBUTING.md)** - Code guidelines and standards

---

## 🎯 Core Modules

| Feature | Purpose |
|---------|---------|
| `auth` | User authentication and authorization |
| `dashboard` | Main athlete dashboard and overview |
| `workout` | Workout creation and active session tracking |
| `stats` | Progress analytics and body assessment |
| `calendar` | Workout scheduling and history |
| `leaderboard` | Rankings and competition leagues |
| `chat` | Trainer-athlete messaging |
| `express` | Premium protocol store and purchases |
| `profile` | User profile and settings |
| `students` | Trainer dashboard for managing athletes |
| `notifications` | Alert and notification center |

---

## 🚀 Available Scripts

```bash
npm run dev      # Start dev server (Vite + Express)
npm run build    # Build for production
npm run preview  # Preview production build
npm run clean    # Remove dist folder
npm run lint     # TypeScript type checking
```

---

## 🔐 Environment Variables

Create a `.env.local` file (see [.env.example](.env.example)):

```env
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# ... other Firebase config

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_PUBLIC_KEY=...

# AI
GEMINI_API_KEY=...

# Server
APP_URL=http://localhost:3000
```

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style and naming conventions
- Commit message format
- Pull request process
- Feature development workflow

---

## 📄 License

Proprietary - Shape Express © 2024

---

## 🆘 Support

For issues, questions, or suggestions:
1. Check [DEVELOPMENT.md](DEVELOPMENT.md) for common setup issues
2. Review [Architecture](src/ARCHITECTURE.md) for code structure questions
3. Open an issue with detailed information

---

**Happy Training! 💪**

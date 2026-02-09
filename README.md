# Re-Life Monorepo

A monorepo containing the Re-Life landing page and RAG-based addiction recovery system.

## 📝 Recent Changes

- **2026-02-09** - [#28](https://github.com/ReLife-SDGP-CS-79/Re-life-website/pull/28) Add CODEOWNERS to require owner approval on all PRs by [@Copilot](https://github.com/Copilot)
- **2026-02-09** - [#27](https://github.com/ReLife-SDGP-CS-79/Re-life-website/pull/27) Automate README updates on PR merge via GitHub Actions by [@Copilot](https://github.com/Copilot)
## 📦 Project Structure

```
re-life-monorepo/
├── packages/
│   ├── landing/                    # Marketing landing page (React)
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── recovery-system/
│       ├── backend/                # Node.js + Express API with RAG
│       │   ├── src/
│       │   └── package.json
│       └── frontend/               # React + Vite app
│           ├── src/
│           └── package.json
└── package.json                    # Root workspace config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (for backend)

### Installation

1. **Install all dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cd packages/recovery-system/backend
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

## 🎯 Available Scripts

### Run Individual Apps

```bash
# Landing page (runs on http://localhost:3000)
npm run landing:dev

# Recovery system backend (runs on http://localhost:5000)
npm run recovery:backend

# Recovery system frontend (runs on http://localhost:3001)
npm run recovery:frontend
```

### Run All Apps Simultaneously

```bash
npm run dev:all
```

### Build for Production

```bash
# Build landing page
npm run landing:build

# Build recovery frontend
npm run build --workspace=packages/recovery-system/frontend
```

## 📱 Applications

### 1. Landing Page
- **Tech Stack:** React, TailwindCSS, GSAP
- **Port:** 3000
- **Purpose:** Marketing and user acquisition
- **Features:** Video backgrounds, animations, glassmorphism design

### 2. Recovery System Backend
- **Tech Stack:** Node.js, Express, MongoDB, TypeScript, Better-Auth
- **Port:** 5000
- **Features:** 
  - 🔐 Authentication with Better-Auth (email/password, sessions)
  - 📊 Progress Tracking with timezone-aware streak calculation
  - 📝 Journal System with image uploads (Cloudinary)
  - ⏰ Smart Reminder System
  - 🌍 Timezone support for global users
  - 📈 Mood logging and analytics

### 3. Recovery System Frontend
- **Tech Stack:** React, Vite, TailwindCSS
- **Port:** 3001
- **Features:** AI chat interface, Progress tracking, User dashboard

## � Backend API Endpoints

### Authentication (Better-Auth)
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Progress Tracking (Protected)
- `POST /api/progress/checkin` - Daily check-in with mood logging
- `GET /api/progress/streak` - Get current and longest streak
- `GET /api/progress/mood-history` - Retrieve mood history

### Journal (Protected)
- `POST /api/journals` - Create journal entry (with optional image)
- `GET /api/journals` - Get all user journal entries
- `GET /api/journals/:id` - Get specific entry
- `PATCH /api/journals/:id` - Update entry
- `DELETE /api/journals/:id` - Delete entry

## �🛠️ Development

### Adding Dependencies

```bash
# To landing page
npm install <package> --workspace=packages/landing

# To backend
npm install <package> --workspace=packages/recovery-system/backend

# To frontend
npm install <package> --workspace=packages/recovery-system/frontend
```

### Workspace Benefits
- ✅ Shared dependencies and unified management
- ✅ Single `node_modules` at root (saves disk space)
- ✅ Run all apps with one command
- ✅ Easy code sharing between packages

## 🔧 Next Steps

1. ✅ ~~Configure MongoDB connection in backend~~ (Complete)
2. ✅ ~~Implement authentication with Better-Auth~~ (Complete)
3. ✅ ~~Build progress tracking system~~ (Complete)
4. ✅ ~~Implement journal system with image uploads~~ (Complete)
5. 🚧 Integrate RAG-based AI chat system
6. 🚧 Build recovery system frontend UI
7. 🚧 Connect landing page to recovery system

## 📊 Implemented Features

### Backend (Completed)
- ✅ Better-Auth authentication (sessions, email/password)
- ✅ User management with custom recovery fields
- ✅ Progress tracking with timezone-aware streaks
- ✅ Mood logging and history
- ✅ Journal system with Cloudinary image uploads
- ✅ Reminder system for addiction types (drugs, social_media, pornography)
- ✅ Protected API routes with authentication middleware

### Database Models
- **User** - Authentication + recovery profile (addiction types, recovery start date, timezone)
- **Progress** - Streak tracking, mood logs, milestones, relapse incidents
- **Journal** - Entries with mood, triggers, coping strategies, images
- **Reminder** - User reminders with frequency and addiction type
- **Session** - Better-Auth session management

## 🤖 Automation

### Automatic README Updates
This repository includes an automated workflow that updates the README file when pull requests are merged:

- **Trigger:** Runs automatically when a PR is approved and merged
- **Action:** Adds merged PR information to a "Recent Changes" section in the README
- **Information Tracked:** PR number, title, author, date, and link
- **Limit:** Keeps the last 10 merged PRs for reference
- **Location:** See `.github/workflows/update-readme-on-pr.yml` and `.github/scripts/update-readme.js`

This automation ensures that the README always reflects recent development activity and makes it easy for contributors and users to see what has changed in the project.

---

## Original Landing Page Features

- 🌑 Dark monochromatic theme with cyan, purple, and orange accents
- 📱 Fully responsive design
- 🎥 Video background with overlay effects
- 🎯 Comprehensive sections:
  - **Hero Section** - Immersive video background with animated CTA
  - **Chat Interface Demo** - Real-time typing animation showcase
  - **Problems Section** - Addiction challenges visualization
  - **Solution Section** - AI-powered recovery approach
  - **Features Section** - 6 key features with hover effects
  - **How It Works** - Step-by-step process with scroll animations
  - **Technology Section** - RAG AI technology explanation
  - **FAQ Section** - Expandable accordions for common questions
- ⚡ Smooth scroll-triggered animations
- 🎭 Interactive glassmorphism cards with hover effects
- 🔄 Modern futuristic UI with gradient overlays
- 🎨 Custom animations and transitions

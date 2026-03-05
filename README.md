# LemeOcus

> **A premium personal productivity app** — track tasks, build habits, and visualize your progress with a sleek, glassmorphism-inspired UI.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | Personalized greeting, daily summary, top focus tasks, and habit overview with animated progress bars |
| **Tasks** | Create, categorize (Work / Study / Health), prioritize (High / Medium / Low), and complete tasks |
| **Habits** | Daily habit checklist with streak tracking, longest-streak records, and circular progress indicators |
| **Statistics** | Visual charts of your task and habit completion over time |
| **Reports** | Historical logs of task and habit activity |
| **Settings** | Light / Dark theme toggle, notification preferences, and account management |
| **Authentication** | Secure sign-up / login powered by Supabase Auth |
| **Onboarding** | Guided first-time setup for new users |

---

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://react.dev/)** — UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[Vite 5](https://vitejs.dev/)** — Lightning-fast dev server & build tool
- **[Tailwind CSS v3](https://tailwindcss.com/)** — Utility-first styling with custom design tokens
- **[Framer Motion](https://www.framer.com/motion/)** — Smooth micro-animations and transitions
- **[Radix UI](https://www.radix-ui.com/)** — Accessible, unstyled component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** — Pre-built component library on top of Radix + Tailwind
- **[Lucide React](https://lucide.dev/)** — Icon set
- **[Recharts](https://recharts.org/)** — Charting library for statistics
- **[React Router v6](https://reactrouter.com/)** — Client-side routing
- **[TanStack Query v5](https://tanstack.com/query)** — Server-state management & data fetching
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — Form handling and validation
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications

### Backend
- **[Supabase](https://supabase.com/)** — Postgres database, authentication, and real-time APIs

---

## 📁 Project Structure

```
LemeOcus/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── layout/         # AppLayout, AppSidebar
│   │   ├── ui/             # shadcn/ui components (49 components)
│   │   ├── NavLink.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   ├── AuthContext.tsx  # Supabase auth state
│   │   └── ThemeContext.tsx # Light / dark theme state
│   ├── hooks/
│   │   ├── use-tasks.ts
│   │   ├── use-habits.ts
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/       # Supabase client & types
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── Habits.tsx
│   │   ├── Statistics.tsx
│   │   ├── Reports.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── Login.tsx
│   │   ├── Onboarding.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx             # Route definitions
│   ├── main.tsx
│   └── index.css           # Global styles & design tokens
├── supabase/               # Supabase config & migrations
├── .env                    # Environment variables (see below)
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18 or **Bun**
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/LemeOcus.git
cd LemeOcus
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-public-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

> You can find these values in your Supabase project dashboard under **Settings → API**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 🎨 Design System

LemeOcus uses a custom design system built on Tailwind CSS with:

- **Glassmorphism** — `glass-card`, `glass-strong` utility classes with backdrop blur
- **Glow effects** — `glow-purple`, `glow-blue`, `glow-green` ambient shadows
- **Gradient text** — `text-gradient-purple` for accent headings
- **Dark / Light themes** — Toggled via `ThemeContext`, persisted in `localStorage`
- **Animated orbs** — `AmbientBackground` component for the immersive background
- **Typography** — Display font for headings, clean sans-serif for body text

---

## 🗄️ Database

The app uses **Supabase (PostgreSQL)** with the following core tables:

| Table | Purpose |
|---|---|
| `tasks` | User tasks with title, priority, category, and completion status |
| `habits` | Daily habits with streak and longest streak tracking |
| `habit_logs` | Historical daily record of habit completions |
| `task_logs` | Historical daily record of task completions |

Row-level security (RLS) is enforced — users can only access their own data.

---

## 🔐 Authentication

Authentication is handled entirely by **Supabase Auth**:
- Email + password sign-up / login
- Session persistence managed by `AuthContext`
- All inner routes are protected via `ProtectedRoute`

---

## 🧪 Testing

Unit tests are written with **Vitest** and **Testing Library**:

```bash
npm run test
```

Tests live in `src/test/`.

---

## 📦 Deployment

The project includes a `vercel.json` for seamless deployment on **Vercel**:

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com/)
3. Add your environment variables in the Vercel dashboard
4. Deploy 🚀

---

## 📄 License

This project is private. All rights reserved.

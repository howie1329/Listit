# 📝 Listit

**Listit** is a blazing fast, AI-assisted productivity app for managing items and bookmarks with a focus on simplicity and speed. Organize tasks with "Today" and "Back Burner" focus states, create smart bookmark collections, and leverage AI for intelligent content extraction and item generation.

---

## 🎯 One-Line Pitch

A keyboard-driven productivity app that combines task management and bookmark organization with AI assistance, built for speed and focus.

---

## 🚀 Tech Stack

- **Next.js 16** - React app framework with App Router and server components
- **Convex** - Backend/database, serverless logic, real-time sync
- **Convex Auth** - Secure authentication flows
- **React 19** - Interactive UI with hooks and context
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible UI component library
- **TypeScript** - Type-safe development
- **Vercel AI SDK** - AI integration for item generation
- **OpenRouter** - Multi-model AI provider access
- **Firecrawl** - AI-powered web scraping for bookmarks
- **Sonner** - Toast notifications

---

## ✨ Core Features

### Item Management (`/view`)

- **Focus States:** Organize items into "Today" (active focus) and "Back Burner" (read later) views
- **Rich Item Properties:** Title, description, priority (low/medium/high), tags, notes, completion status
- **Quick Actions:** Archive, complete, move between focus states, cycle priority
- **Real-time Search:** Client-side filtering with instant results
- **Keyboard-Driven:** Full keyboard navigation with vim-style shortcuts (j/k, Enter, t/b/x/a/p/#)
- **AI Item Generation:** Generate structured items from natural language input

### Bookmarks (`/bookmarks`)

- **Smart Collections:** Organize bookmarks into custom collections
- **AI-Powered Scraping:** Automatically extract metadata (title, description, summary, favicon, thumbnail) using Firecrawl
- **Rich Metadata:** Reading time, extracted content, tags, read status, pinned/archived states
- **Full-Text Search:** Search across title, URL, description, summary, and tags
- **Keyboard Navigation:** Navigate and manage bookmarks entirely via keyboard

### User Experience

- **Keyboard Shortcuts:** Comprehensive keyboard navigation for power users
- **Theme Support:** Dark/light mode via next-themes
- **Responsive Design:** Works seamlessly on desktop and mobile
- **Real-Time Sync:** Instant updates across devices via Convex
- **Onboarding:** User setup flow for preferences and AI model selection

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- [Convex CLI](https://docs.convex.dev/cli/install)
- npm or yarn

### Installation

1. **Clone the repo:**

   ```bash
   git clone <your-repo-url>
   cd Listit
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Convex:**
   - Install Convex CLI (if not yet):
     ```bash
     npm install -g convex@latest
     ```
   - Init Convex and link your project:
     ```bash
     npx convex dev
     ```
   - Follow prompts to set up backend and `.env.local`

4. **Run the development servers:**

   ```bash
   npm run dev
   ```

   - Next.js client: [http://localhost:3000](http://localhost:3000)
   - Convex backend is auto-loaded in parallel

---

## 📁 Project Structure

```
Listit/
├── app/                            # Next.js app pages/routes
│   ├── (app)/                      # Authenticated/inner app pages
│   │   ├── bookmarks/              # Bookmarks page
│   │   ├── view/                   # Main items view page
│   │   └── layout.tsx              # App layout with sidebar
│   ├── onboarding/                 # User onboarding flow
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── components/
│   ├── features/
│   │   ├── bookmarks/              # Bookmark components
│   │   ├── landingPage/            # Landing/auth UI
│   │   ├── layout/                 # Sidebar, header
│   │   ├── settings/               # Settings modals
│   │   └── view/                   # Item view components
│   ├── ui/                         # shadcn/ui components
│   ├── ConvexClientProvider.tsx    # Convex client setup
│   └── ...
├── convex/                         # Convex backend
│   ├── ai/                         # AI actions and tools
│   │   ├── bookmarks/              # Bookmark AI actions
│   │   └── tools/                  # AI tools (Firecrawl)
│   ├── bookmarks/                  # Bookmark functions
│   ├── items/                      # Item queries/mutations
│   │   └── ai/                     # Item AI generation
│   ├── schema.ts                   # Database schema
│   ├── auth.ts, auth.config.ts     # Authentication
│   ├── userFunctions.ts            # User settings
│   ├── lib/modelMapping.ts         # AI model configuration
│   └── http.ts                     # HTTP endpoints
├── hooks/                          # Custom React hooks
│   ├── use-keyboard-navigation.tsx # Item keyboard nav
│   ├── use-bookmark-keyboard-navigation.tsx
│   ├── use-keyboard-shortcuts.ts
│   └── use-mobile.ts
├── lib/                            # Utilities
│   ├── utils.ts                    # General utilities
│   └── tools/                      # Tool components
├── providers/                      # Context providers
│   └── UserSettingsProvider.tsx
├── public/                         # Static assets
├── middleware.ts                   # Next.js middleware
├── package.json
└── README.md
```

---

## 🔧 Available Scripts

- `npm run dev` – Start frontend and Convex backend in parallel
- `npm run dev:frontend` – Start only Next.js dev server
- `npm run dev:backend` – Start only Convex dev server
- `npm run build` – Build Next.js app for production
- `npm run start` – Run production server
- `npm run lint` – Lint code using ESLint

---

## ⌨️ Keyboard Shortcuts

### Items View (`/view`)

- **Navigation:** `↓`/`j` (next), `↑`/`k` (previous)
- **Actions:** `Enter` (edit), `T` (move to Today), `B` (move to Back Burner), `X` (toggle complete), `A` (archive), `#` (add tag), `P` (cycle priority), `Shift+Delete` (delete)
- **Global:** `Cmd/Ctrl+N` (new item), `/` (focus search), `Esc` (clear selection)

### Bookmarks (`/bookmarks`)

- **Navigation:** `↓`/`j` (next), `↑`/`k` (previous)
- **Actions:** `Enter` (open), `E` (edit), `Shift+Delete` (delete)
- **Global:** `/` (focus search), `Esc` (clear selection)

---

## 🗂️ Key Files

### Backend

- **Schema:** `convex/schema.ts` - Database schema definitions
- **Items:** `convex/items/queries.ts`, `convex/items/mutations.ts`
- **Bookmarks:** `convex/bookmarks/bookmarkFunctions.ts`, `convex/bookmarks/bookmarkCollectionFunctions.ts`
- **AI:** `convex/ai/bookmarks/actions.ts`, `convex/items/ai/actions.ts`
- **Auth:** `convex/auth.ts`, `convex/auth.config.ts`

### Frontend

- **Pages:** `app/(app)/view/page.tsx`, `app/(app)/bookmarks/page.tsx`
- **Components:** `components/features/view/`, `components/features/bookmarks/`
- **Hooks:** `hooks/use-keyboard-navigation.tsx`, `hooks/use-bookmark-keyboard-navigation.tsx`

---

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
CONVEX_DEPLOYMENT=your-deployment-url
OPENROUTER_AI_KEY=your-openrouter-api-key  # Optional: for AI item generation
FIRECRAWL_API_KEY=your-firecrawl-api-key   # Required: for bookmark scraping
```

---

## 📚 Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth](https://labs.convex.dev/auth)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenRouter](https://openrouter.ai/docs)

---

## 🚧 Known Limitations & Future Improvements

- Server-side search for bookmarks (currently client-side only)
- Public sharing links for items/bookmarks
- Enhanced collaboration features
- Browser extension for bookmark capture
- Import/export functionality (CSV/JSON)

---

## 📝 License

This project is private and proprietary.

---

**Questions or contributions?** Open an issue or pull request!

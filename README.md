# 📝 Listit

**Listit** is a blazing fast, AI-assisted list and bookmark manager enabling you to create, share, and organize smart lists — plus generate intelligent "Today's List" suggestions with AI. Includes clean UI, real-time sync, and extensible features for productivity.

---

## 🎯 One-Line Pitch

Smart, social lists and bookmarks with AI-generated suggestions, built for speed and collaboration.

---

## 🚀 Tech Stack

- **Next.js** - React app framework for server components, routing, and performance
- **Convex** - Backend/database, serverless logic, real-time sync
- **Convex Auth** - Secure authentication flows
- **React** - Interactive UI
- **Tailwind CSS** - Styling and layout
- **shadcn/ui** - Modular, accessible UI components
- **TypeScript** - Static typing and safety

---

## ✨ Core Features

- **List & Item Management:** Create, view, edit, delete lists/items; mark items complete/incomplete.
- **Bookmark Collections:** Organize, tag, share bookmarks.
- **Real-Time Collaboration:** Multiple users can edit together live.
- **Public/Private Lists:** Toggle visibility, share unique URLs.
- **AI "Today's List":** One-click button for personalized or popular task ideas, editable.
- **Dashboard UI:** Minimal yet powerful list and bookmark management.
- **Responsive Design:** Mobile-ready, desktop-friendly.
- **Dark/Light Mode:** Visual theme toggle.

---

## 🚀 Stretch Features

- Inline editing, drag-and-drop, templates
- Tags & categories, filter/search by tag
- Collaboration, trending public lists, AI-powered list summaries/suggestions
- Analytics, push notifications (WIP)
- Offline support, advanced search

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
│   │   ├── bookmarks/              # Bookmarks features
│   │   ├── chat/                   # Chat features
│   │   ├── list/                   # List management
│   │   └── layout.tsx
│   ├── globals.css                 # Global styling
│   ├── layout.tsx                  # Root layout
│   └── server/                     # Server-side pages/utilities
├── components/
│   ├── features/
│   │   ├── layout/                 # Layout-related components
│   │   ├── landingPage/            # Landing page UI
│   │   ├── list/                   # List modals, etc.
│   │   └── settings/               # Settings modals
│   └── ui/                         # Button, card, sidebar, dialog, etc.
├── convex/                         # Convex backend src
│   ├── ai/                         # AI actions/tools
│   ├── bookmarks/                  # Bookmark-related functions
│   ├── thread/                     # Chat thread queries/mutations
│   ├── threadMessages/             # Thread messages logic
│   ├── schema.ts                   # Database schema
│   ├── auth.ts, auth.config.ts     # Authentication config
│   ├── itemFunctions.ts, listFunctions.ts, userFunctions.ts, myFunctions.ts
│   └── http.ts                     # HTTP endpoints for Convex
├── hooks/                          # Custom React hooks
├── lib/                            # App utilities
├── providers/                      # Settings/context providers
├── public/                         # Static assets
├── package.json                    # Project manifest
└── README.md
```

---

## 🔧 Available Scripts

- `npm run dev` – Start frontend/backend in development mode
- `npm run build` – Build Next.js app for production
- `npm run start` – Run built production server
- `npm run lint` – Lint using ESLint

---

## 🗂️ Key Files

- **Backend:** `convex/` (see above for organization)
- **Frontend:** `app/(app)/list/page.tsx`, `app/(app)/bookmarks/page.tsx`, etc.
- **UI Components:** `components/ui/`, `components/features/`
- **Schema:** `convex/schema.ts`
- **Auth:** `convex/auth.ts`, `convex/auth.config.ts`

---

## 📚 Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth](https://labs.convex.dev/auth)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 📝 License

This project is private and proprietary.

---

**Questions or contributions?** Open an issue or pull request!

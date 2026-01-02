# 📝 List It

**List It** is a fast, AI-assisted list app that helps you create, share, and generate smart lists — including an AI-powered "Today's List."

## 🎯 One-Line Pitch

List It is a fast, AI-assisted list app that helps you create, share, and generate smart lists — including an AI-powered "Today's List."

## 🚀 Tech Stack

- **[Next.js](https://nextjs.org/)** - React framework for optimized web hosting and page routing
- **[Convex](https://convex.dev/)** - Backend (database, server logic, real-time sync)
- **[Convex Auth](https://labs.convex.dev/auth)** - Authentication
- **[React](https://react.dev/)** - Frontend interactivity
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling and UI components
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library

## 🧠 Core MVP (Must-Have)

### 1. List & Item Management

- **List CRUD**: Create, view, rename, delete lists
- **Item CRUD**: Add, edit, delete items
- **Mark complete / incomplete**: Toggle item completion status

### 2. Clean Dashboard UI

- Show all lists in a minimal dashboard
- Click into a list to see items
- Fast, no clutter

### 3. Public vs Private Lists

- Toggle a list as:
  - **Private** (only you)
  - **Public** (shareable)

### 4. Shareable Links

- Unique URL for public lists
- Anyone with the link can view

### 5. 🤖 AI Feature (Signature Hackathon Moment)

- **AI-Generated "Today's List"**
- Button: "Generate Today's List"
- AI creates a list based on:
  - User's previous lists (if logged in)
  - OR popular public lists / common tasks
- Output is a real, editable list

This is your wow feature.

### 6. Responsive Design

- Works cleanly on desktop & mobile
- Simple layout > fancy animations

## 🚀 Stretch Features

### UX & Productivity

- **Inline Editing**: Click list title or item to edit
- **Drag-and-Drop Reordering**: Reorder items in a list
- **List Templates**: Save a list as a reusable template

### Organization

- **Tags / Categories**: Work, Personal, Grocery, etc.
- **Filter lists by tag**

### Light Auth

- Basic Authentication (Magic link or Convex auth)
- Enables:
  - Saved history
  - Personalized AI lists

### Extra AI

- **AI "Summarize List"**: Turn a long list into 3–5 key tasks

### Collaboration

- **Real-time Collaborative Lists**: Multiple users editing together
- Powered by Convex's realtime sync

### Intelligence & Discovery

- **Trending Public Lists**: "Most copied grocery lists"
- **AI Suggestions**:
  - "People often add milk to this list"
  - Recurring task suggestions

### Power Features

- **Search Across Lists & Items**
- **List Analytics**:
  - Completion rate
  - Daily/weekly streaks
- **Offline Mode**: Cached lists with background sync
- **Push Notifications**: Task reminders
- **Dark Mode**

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <your-repo-url>
   cd Listit
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Convex**:
   - If you haven't already, run:
     ```bash
     npx convex dev
     ```
   - This will guide you through Convex setup and create your `.env.local` file

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   This will start:
   - Next.js frontend on `http://localhost:3000`
   - Convex backend (automatically via `convex dev`)

### First Time Setup

If you just cloned this codebase and didn't use `npm create convex`, run:

```bash
npm install
npm run dev
```

## 📁 Project Structure

```
Listit/
├── app/                    # Next.js app directory
│   ├── (app)/             # Protected app routes
│   │   ├── list/         # List view page
│   │   └── settings/     # Settings page
│   ├── signin/           # Sign in page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ConvexClientProvider.tsx
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Authentication setup
│   └── myFunctions.ts    # Backend functions
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the Next.js app for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

### Key Files to Edit

- **Backend**: `convex/myFunctions.ts` - Add your Convex queries and mutations
- **Frontend**: `app/page.tsx` - Main page component
- **Schema**: `convex/schema.ts` - Define your database schema
- **Auth**: `convex/auth.ts` - Configure authentication

## 📚 Learn More

### Convex Resources

- [Tour of Convex](https://docs.convex.dev/get-started) - Thorough introduction to Convex principles
- [Convex Documentation](https://docs.convex.dev/) - Complete feature documentation
- [Stack](https://stack.convex.dev/) - In-depth articles on advanced topics
- [Convex Auth Docs](https://labs.convex.dev/auth) - Authentication documentation

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Next.js Learn](https://nextjs.org/learn) - Interactive Next.js tutorial

### Configuring Authentication

To configure different authentication methods, see [Configuration](https://labs.convex.dev/auth/config) in the Convex Auth docs.

## 📝 License

This project is private and proprietary.

---

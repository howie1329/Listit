# ListIt - Project Overview

**Type**: Full-stack productivity webapp (SaaS)

**Purpose**: Keyboard-driven productivity tool combining:
- Task/Item management with "Today" and "Back Burner" focus states
- AI-powered bookmark organization with auto-metadata extraction
- AI chat assistant with message summarization
- Onboarding flow for new users

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TypeScript |
| Backend | Convex (serverless DB, real-time sync, auth) |
| AI | Vercel AI SDK, OpenRouter (multi-model), Firecrawl, Mastra |
| Animation | Motion |
| UI | cmdk (command palette), Sonner (toasts) |

## Main Routes
- `/` - Landing/login
- `/item` - Task management (keyboard-driven: j/k, t/b/x/a/p)
- `/bookmarks` - Bookmark collections with AI scraping
- `/chat` - AI chat with threads
- `/onboarding` - User setup

## Architecture Highlights
- All backend logic in Convex functions
- Real-time sync across clients
- Comprehensive keyboard shortcuts (vim-style navigation)
- AI tools: Firecrawl (bookmark metadata), Tavily (web search), weather
- Auto-summarization of long conversations
- Working memory for persistent user context
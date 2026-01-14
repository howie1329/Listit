# Project Summary (ignoring chat)

**Listit** is a Next.js + Convex app for **managing lists/items** and **saving bookmarks into collections**, with **auth**, **real-time sync**, and **optional AI assistance**.

## Frontend

- **Landing/auth** at `/` (split screen: marketing + auth UI)
- **App shell** under `app/(app)/` uses a sidebar layout + global toaster
- **Lists** (`/list`)
  - Grid of lists → expand each list to view items
  - Create list/item; toggle item completion; edit/delete list
  - “Generate List” (AI)
- **Bookmarks** (`/bookmarks`)
  - Collection selector + search bar; list display
  - Create bookmark from a URL via AI scraping
  - Client-side filtering
- **Onboarding** (`/onboarding`)
  - Stores user settings (name, default AI model, AI enabled flag)

## Backend (Convex)

- **Tables**: `list`, `items`, `bookmarks`, `bookmarkCollections`, `userSettings` (plus auth tables)
- **Lists/items**
  - CRUD-ish mutations + queries
  - soft-delete/archive/pin flags exist in schema and functions
- **Bookmarks**
  - Rich metadata (title, description, favicon, summary, tags, read state, pinned/archived/public) + collections
- **AI**
  - `generateList`: uses OpenRouter via Vercel AI SDK to generate 2 items for a list, then bulk-inserts them
  - `createBookMark`: uses Firecrawl to scrape a URL and creates a bookmark from extracted metadata

---

## Biggest “things to implement” (high-impact gaps)

### Security/data isolation

- `itemFunctions.getItems` currently returns items by `listId` without verifying the list belongs to the logged-in user (or that items belong to them). This is the #1 backend fix.

### Scalability/search

- You already defined a Convex `searchIndex` for bookmarks (`search_bookmarks`), but the UI does **client-side filtering** of whatever it fetched. For many bookmarks, you’ll want **server-side search** using that index + pagination.

### Public sharing actually wired

- You have `isPublic` fields for lists/bookmarks, but no obvious public routes/queries for “view by share link” yet.

### Core UX completeness

- **Lists**: item edit/delete, priority editing, bulk complete/clear completed, sort/group, drag-and-drop ordering
- **Bookmarks**: archive/pin/read filters surfaced in UI, tag management UI, duplicate handling UX, import/export

---

## Potential features to add (good product bets)

### Lists

- **Due dates + reminders** (push/email), recurring items, “Today” view, calendar integration (ICS)
- **Templates** (daily routine, groceries, travel packing) + “duplicate list”
- **Collaboration**: list members/roles, invite links, comments/activity feed

### Bookmarks

- **Reading queue**: estimated reading time, “read later”, highlights/notes
- **Better organization**: nested collections, smart collections (rules), tag explorer
- **Browser extension** / share sheet for one-tap saving

### AI

- **AI cleanup**: “merge duplicates”, “auto-tag”, “summarize and extract key takeaways”
- **AI for lists**: convert pasted text into items, suggest next actions, daily planning

---

## Concrete implementation roadmap (suggested order)

### Week 1 (stability + correctness)

- Lock down item/list access control (especially `getItems`)
- Add server-side bookmark search using the existing Convex search index
- Add pagination for bookmarks/lists before data grows

### Week 2 (polish the main loops)

- Item edit/delete + priority UI; list pin/archive UI; “completed” section
- Bookmark tag UI + archive/pin/read filters

### Week 3+ (distribution + differentiation)

- Public share links + read-only views (and later: collaborative editing)
- Import/export (CSV/JSON) and browser extension
- AI enhancements (auto-tagging + smarter list generation tied to history)



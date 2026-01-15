# Listit — Focus-First Product Spec

> **One-sentence promise**
> Capture everything. Focus on what matters _today_. Forget the rest without guilt.

---

## Product Philosophy

Listit is an **opinionated, focus-first productivity system**.

It intentionally rejects traditional lists, projects, and folders in favor of **state-based focus views**.

Core principles:

- Zero friction capture
- Intentional focus
- Lightweight organization
- Keyboard-first speed
- Strong guardrails to prevent clutter

If a feature does **not** improve capture, focus, or revisiting — it does not belong.

---

## Core Mental Model (No Lists)

There are **no user-created lists**.

There are only **two system states**:

- **Today** → what the user is actively focusing on
- **Back Burner** → everything else (default capture state)

These are **views**, not containers.

All items move between these two states.

---

## Item Model (Single Source of Truth)

Items are first-class and unified.

```ts
Item {
  _id
  userId
  type: "task" | "bookmark"
  title: string
  completed: boolean
  focusState: "today" | "back_burner"
  priority?: "low" | "medium" | "high"
  tags?: string[]
  notes?: string
  url?: string            // bookmarks only
  metadata?: {
    favicon?: string
    description?: string
    summary?: string
    readingTime?: number
  }
  archived: boolean
  createdAt
  updatedAt
}
```

Rules:

- No nesting
- No listId
- No projects
- Flat structure only

---

## Core Views

### Today

- Small, intentional set of items
- Encouraged size: **3–7 items**
- Completing an item automatically removes it from Today

### Back Burner

- Default landing zone for all captured items
- Searchable, filterable, sortable
- Designed for review, not execution

### Archive

- Completed or intentionally dismissed items
- Out of sight, searchable if needed

---

## Capture (Zero Friction)

All capture paths send items to **Back Burner**.

### Capture Methods

- Quick add (single line)
- Multi-line paste (each line → item)
- Save URL (bookmark)

No organization decisions required at capture time.

---

## Light Item Details (Expandable)

Items are lightweight by default, expandable on demand.

Supported details:

- Notes (markdown-lite)
- Tags
- Priority
- URL metadata (bookmarks)

UX rules:

- Inline expand or lightweight drawer
- One expanded item at a time
- No full-page editors

---

## Tags (Unified)

Tags are the **only organization mechanism** besides focus state.

Rules:

- Same tag system for tasks + bookmarks
- Flat tags only
- Multiple tags allowed
- Autocomplete + create-on-type

Optional AI assist:

- Suggest tags
- Never auto-apply without confirmation

---

## Keyboard-First Interaction (Required)

Every visible action must be possible via keyboard.

### Global Shortcuts

- `Cmd + K` → Command palette
- `Cmd + N` → New item
- `/` → Search / filter

### Item Actions

- `Enter` → Edit title
- `T` → Move to Today
- `B` → Move to Back Burner
- `X` → Complete
- `A` → Archive
- `#` → Add tag
- `P` → Cycle priority

Mouse is optional. Keyboard is primary.

---

## Command Palette (Control Center)

The command palette is the primary power-user interface.

### Supported Commands

- Search items (title + tags)
- Jump to Today / Back Burner
- Create item
- Apply actions to items

Examples:

- "Add item: Fix login bug"
- "Move ‘Prep slides’ to Today"
- "Show unread bookmarks"
- "Archive completed"

Non-goals:

- No settings editor
- No AI chat

---

## Review Ritual (Guardrail)

Back Burner requires intentional review to prevent decay.

### Review Mode

- Triggered manually or via gentle prompt
- Keyboard shortcut: `R`
- One-by-one triage:
  - Move to Today
  - Archive
  - Leave in Back Burner

This is not a new screen — just a focused state.

---

## Today Capacity Guardrail

Today should feel **slightly constrained**.

Rules:

- Soft limit: 5–7 items
- Visual warning when exceeded
- No hard enforcement

AI may suggest removing items, never auto-remove.

This prevents Today from becoming “just another list.”

---

## Bookmarks (Unified Items)

Bookmarks are items with a URL.

Behavior:

- Saved → Back Burner (read later)
- Move to Today → read now
- Complete → mark as read
- Archive → reference

No separate bookmark system or UI section required.

---

## AI Usage (Restrained & Intentional)

AI assists **capture, cleanup, and suggestion** — not control.

### Allowed AI Capabilities

- Paste → structured items
- Suggest tags
- Suggest items to move to Today
- Detect duplicates

Rules:

- AI never auto-moves items
- AI suggestions are dismissible
- No chat interface

---

## Public Sharing (Read-Only)

Optional but supported.

Shareable views:

- Today (read-only)
- Filtered views (e.g. bookmarks)

Rules:

- No editing
- No comments
- No auth required
- Clean share URLs

---

## Explicit Non-Goals (Do Not Build)

These features are intentionally excluded:

- User-created lists
- Projects
- Multiple focus states
- Due dates as a primary mechanic
- Notifications
- Calendar sync
- Collaboration
- Nested structures
- Custom views

Their absence preserves clarity.

---

## Product Loop

1. Capture → Back Burner
2. Review → Promote to Today
3. Focus → Complete
4. Archive → Forget

Every feature must support this loop.

---

## Success Criteria

The product succeeds if:

- Users can capture without thinking
- Today never feels overwhelming
- Back Burner does not rot
- The system stays usable after 30+ days

---

## Guiding Rule

> Every new idea must either replace an existing feature or make one faster.

If it doesn’t — it doesn’t ship.

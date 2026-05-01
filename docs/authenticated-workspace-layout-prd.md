# Authenticated Workspace Layout PRD

## Summary

Create the first authenticated ListIt workspace at `/app` as a static layout prototype. The page should feel like a quiet, keyboard-friendly document desk: fast capture, scannable saved links, and a reader/note preview in one focused surface.

This pass is layout-only. It does not add bookmark persistence, Convex functions, route protection, or sign-in redirects.

## Goals

- Give signed-in users a clear default landing workspace.
- Establish the permanent app shell: top header, sidebar navigation, and workspace content.
- Support the MVP mental model: capture links, organize lightly, read saved content, and ask across bookmarks later.
- Use installed shadcn-svelte primitives first, especially the sidebar component.
- Keep the implementation small and easy to replace with real data.

## Layout Requirements

- `/app` opens to the Library inbox.
- The top header is persistent inside the app workspace and contains:
  - sidebar toggle
  - ListIt identity
  - global search/command input
  - compact utility actions
- The left sidebar uses the installed shadcn sidebar primitives:
  - primary navigation for Library, Ask, Notes, Settings
  - grouped collections and tags
  - footer utility item
- The main Library workspace contains:
  - quick-save URL input
  - bookmark list with title, source, enrichment status, and tags
  - reader/note preview panel
- Mobile behavior should rely on the shadcn sidebar mobile sheet behavior rather than a custom navigation system.

## Constraints

- Do not change `src/routes/layout.css` or global color tokens.
- Do not create new reusable app components for this pass.
- Compose the route directly with existing shadcn-svelte components and simple route-local data.
- Use semantic Tailwind tokens and existing component variants.
- Keep static demo data obvious and easy to replace.

## Acceptance Criteria

- `/app` renders a polished static authenticated workspace.
- The sidebar uses the installed shadcn sidebar component.
- The layout works at desktop and mobile widths without overlapping controls.
- Quick capture, bookmark list, and reader/note preview are visible on desktop.
- No Convex schema, API, or auth behavior is changed.
- `npm run check` and `npm run lint` pass.

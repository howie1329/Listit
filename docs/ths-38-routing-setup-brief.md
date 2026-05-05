# THS-38 Routing Setup Brief

## Problem

The app shell links to primary workspace pages that do not exist yet, so users hit missing routes when navigating beyond the Library.

## Scope

- Keep Library at `/app`.
- Add authenticated app routes for `/app/ask`, `/app/notes`, and `/app/settings`.
- Render each page inside the existing app shell with lightweight structured placeholder content.
- Make primary sidebar navigation use real links while preserving active states.

## Out of scope

- Convex schema or function changes.
- Auth behavior changes.
- Global theme or layout token changes.
- Full Ask, Notes, or Settings feature implementation.

## Acceptance criteria

- `/app`, `/app/ask`, `/app/notes`, and `/app/settings` render in the app shell.
- Sidebar primary nav links navigate to the real routes.
- Active sidebar state reflects the current route.
- Placeholder pages communicate MVP intent without fake backend behavior.
- `npm run check` and `npm run lint` pass.

## Implementation plan

- Add route-local pages for Ask, Notes, and Settings.
- Use existing UI primitives and Hugeicons already present in the app.
- Update the sidebar primary menu buttons to render anchors through the existing `child` snippet API.

## Files likely to change

- `src/routes/(app)/app/+layout.svelte`
- `src/routes/(app)/app/ask/+page.svelte`
- `src/routes/(app)/app/notes/+page.svelte`
- `src/routes/(app)/app/settings/+page.svelte`

## Risks

- Sidebar active matching should keep `/app` active only for Library, not for every child route.
- Placeholder pages should stay visually useful without implying working backend features.

## Manual QA

- Visit `/app`, `/app/ask`, `/app/notes`, and `/app/settings`.
- Click each sidebar primary nav item and confirm route navigation.
- Check desktop and mobile widths for obvious overlap.

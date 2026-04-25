# App Shell First Pass Plan

## Scope

Build the signed-in shell so users can immediately orient around saved bookmarks, with a stable layout foundation for later feature pages.

## Decisions Locked In

- Header is permanently fixed at top.
- Sidebar is fixed, flat, and collapsible.
- Main workspace supports an optional right panel for reader/notes.
- Mobile uses sidebar as sheet/drawer.
- Header contains a global-search placeholder input and profile area on the right.
- Sidebar items for this pass: `Bookmarks`, `Collections`, `Notes`, `Settings`.
- Keep `/app` as the current home shell route (no redirect to `/app/bookmarks` yet).
- Shell implementation is shadcn-first; missing shadcn components can be installed when required.

## Implementation Plan

- Use the existing authenticated route as the shell entry at [`/Users/howardthomas/Desktop/Listit/src/routes/app.tsx`](/Users/howardthomas/Desktop/Listit/src/routes/app.tsx), replacing the current placeholder content with shell regions:
  - fixed top header
  - fixed left sidebar
  - main content region
  - optional/collapsible right panel container
- Keep auth gating behavior already present in [`/Users/howardthomas/Desktop/Listit/src/routes/app.tsx`](/Users/howardthomas/Desktop/Listit/src/routes/app.tsx) so unauthenticated users still route to sign-in.
- Ensure route structure remains compatible with existing router wiring in [`/Users/howardthomas/Desktop/Listit/src/router.tsx`](/Users/howardthomas/Desktop/Listit/src/router.tsx) and generated route tree in [`/Users/howardthomas/Desktop/Listit/src/routeTree.gen.ts`](/Users/howardthomas/Desktop/Listit/src/routeTree.gen.ts).
- Compose shell UI with existing project primitives (e.g., [`/Users/howardthomas/Desktop/Listit/src/components/ui/button.tsx`](/Users/howardthomas/Desktop/Listit/src/components/ui/button.tsx)) and token-driven styles from the project design system (no hardcoded color values).
- Use shadcn components for shell structure and interactions whenever available (e.g., `Button`, `Input`, `Sheet`, `Separator`, and related primitives).
- If a required shadcn component is missing from the project, install it via the shadcn CLI before implementation instead of rebuilding equivalent custom primitives.
- Add placeholder interactions only for this pass:
  - sidebar collapse toggle
  - mobile drawer open/close
  - right panel show/hide toggle
  - static search input placeholder in header
  - static profile placeholder area
- Keep nav links initially shell-local (or non-navigating placeholders where routes do not exist yet) to avoid over-scoping beyond shell.

## Layout Behavior Details

- Header:
  - fixed top, full width, seam/border separation from body.
  - left: product/workspace label.
  - center/left-mid: global search placeholder input.
  - right: profile placeholder/control.
- Sidebar:
  - fixed under header, full height minus header.
  - flat list of nav items (`Bookmarks`, `Collections`, `Notes`, `Settings`).
  - collapsible on desktop; icon/label behavior adapts to collapsed state.
  - mobile variant appears as sheet/drawer.
- Main region:
  - primary content area represents `/app` home workspace.
  - optional right panel reserved for reader/notes preview and can be toggled.

## Out-of-Scope For This Pass

- Building real global search behavior.
- Implementing full page routes for each sidebar item.
- Wiring profile menu/auth account controls beyond placeholder UI.
- Reader/notes data integration (panel is structural shell only).

## Verification Plan

- Confirm `/app` still requires authentication and redirects unauthenticated users.
- Confirm header remains fixed while body content scrolls.
- Confirm desktop sidebar collapse/expand works.
- Confirm mobile sidebar opens as drawer/sheet.
- Confirm optional right panel toggles without breaking layout.
- Confirm styles follow tokenized design system and remain responsive.

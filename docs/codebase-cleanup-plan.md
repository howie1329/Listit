# Codebase Cleanup & Architecture Plan (TanStack Start)

## Goals

- Remove clearly dead code and stale scaffolding.
- Reduce route/page file size and duplicate UI logic.
- Create a cleaner app-shell architecture around `/app` route boundaries.
- Keep all existing shadcn UI primitives unchanged.

## Current-State Findings

### 1) Large route files and mixed concerns

- `src/routes/index.tsx` is a single large route component with inline content arrays and all sections embedded in one file.
- `src/routes/app.tsx` handles auth guard logic, shell layout composition, route navigation config, and local panel state in one file.

### 2) Repeated auth form logic

- `src/routes/signin.tsx` and `src/routes/signup.tsx` duplicate state management, form structure, submit lifecycle, and error handling.

### 3) Placeholder route duplication

- `src/routes/app.bookmarks.tsx`, `src/routes/app.collections.tsx`, `src/routes/app.notes.tsx`, and `src/routes/app.settings.tsx` repeat nearly identical placeholder page markup.

### 4) Stale/likely dead backend scaffolding

- Convex schema still includes `products` and `todos` tables that are not used in current frontend routes.
- `convex/todos.ts` appears to be scaffold code with no current usage from the app.

### 5) Dependency drift / likely unused packages

- `package.json` includes AI-related and store-related packages not referenced in current `src/` and active Convex usage.
- README still includes scaffold/tutorial content that no longer matches the current product surface.

## Cleanup Plan

## Phase 1 — Safe dead-code and drift cleanup

1. **Remove unused Convex scaffold domain**
   - Remove `todos` table and `convex/todos.ts` if confirmed unused by product roadmap.
   - Remove `products` table if also unowned.
   - Regenerate Convex types after schema cleanup.

2. **Prune unused dependencies**
   - Build an explicit dependency-usage audit (`rg` + lockfile/package review).
   - Remove unused AI/store packages only after `npm run build`, `npm run test`, and `npm run lint` remain green.

3. **Documentation alignment**
   - Replace scaffold README sections (chat/tutorial leftovers) with project-specific setup and architecture overview.

## Phase 2 — Route architecture decomposition

1. **Split `/app` shell into route-local modules**
   - Keep file route entry minimal in `src/routes/app.tsx`.
   - Move shell UI pieces into route-local component files, e.g.:
     - `src/features/app-shell/components/app-header.tsx`
     - `src/features/app-shell/components/app-sidebar.tsx`
     - `src/features/app-shell/components/reader-panel.tsx`
     - `src/features/app-shell/config/navigation.ts`
   - Keep auth guard in a dedicated wrapper component/hook (single responsibility).

2. **Create lightweight route-level state hooks**
   - Extract `isReaderOpen` logic into a focused `useReaderPanelState` hook.
   - Keep state local unless cross-route persistence is required.

3. **Stabilize route contracts**
   - Define a typed nav item model once and reuse in shell + page metadata.

## Phase 3 — Auth route consolidation

1. **Introduce shared auth form primitives (non-shadcn wrappers)**
   - Keep existing shadcn primitives untouched.
   - Add small shared components around repeated label/input/error blocks.

2. **Extract shared submit behavior**
   - Move common auth submit lifecycle (pending/error/reset) into a reusable hook.
   - Keep per-route differences explicit (`flow: signIn` vs `signUp`, password min length messaging).

## Phase 4 — Landing page modularization

1. **Break `src/routes/index.tsx` into composable sections**
   - Keep route file focused on assembly and data imports.
   - Move sections into focused components:
     - `landing-header`
     - `landing-hero`
     - `landing-features`
     - `landing-steps`
     - `landing-faq`
     - `landing-footer`

2. **Move static content arrays to route-local content module**
   - Export typed `features`, `steps`, and `faqs` from one module.
   - Reduce re-renders and improve readability by keeping constants outside component body.

## Phase 5 — Placeholder route simplification

1. **Create a reusable `AppSectionPlaceholder` component**
   - Replace repeated markup in four app subroutes with a single shared component.
   - Keep each route file as a thin route declaration + section-specific props.

2. **Optionally consolidate with a route factory only if readability improves**
   - Prefer explicit route files over over-abstracted dynamic generation.

## Execution Order (recommended)

1. Phase 1 (dead code/deps/docs)
2. Phase 2 (`/app` shell decomposition)
3. Phase 3 (auth consolidation)
4. Phase 4 (landing page split)
5. Phase 5 (placeholder simplification)

## Definition of Done

- Route files are small and single-purpose.
- No orphan tables/functions/dependencies remain.
- Shared auth and placeholder UI logic is deduplicated.
- README/docs reflect actual product and runtime requirements.
- `npm run lint`, `npm run test`, and `npm run build` pass after each phase.

## Guardrails

- Do not edit shadcn primitive component implementations under `src/components/ui/*`.
- Keep generated files (`src/routeTree.gen.ts`, `convex/_generated/*`) out of manual edits.
- Prefer explicit module boundaries over introducing global state early.

# LIT-34 Code Quality Baseline

Linear issue: LIT-34, "Code Quality Check - Baseline"

## Summary

This is a review-only baseline for the hand-written app and Convex code. No product code was changed.

This audit intentionally excludes shadcn-svelte component files and recommendations to change `src/lib/components/ui/**`.

## Verification

- `npm run check` passes with `0 errors` and `0 warnings`.
- `npm run lint` does not reach ESLint. Prettier scans `.agents/skills/**` and fails on invalid example syntax in `.agents/skills/svelte5-best-practices/references/events.md`; it also reports formatting drift across generated files, shadcn-svelte UI files, config files, and several app files.
- Static inspection covered `src/routes`, `src/lib`, `src/convex`, root config, and docs.
- `src/convex/_generated/**` was treated as generated code, not app code.

## Findings

### P1: Lint is blocked by local agent skill files

`npm run lint` runs `prettier --check .`, which includes `.agents/skills/**`, generated Convex files, and shadcn-svelte UI files. The agent skill directory contains local skill docs and examples, not product source. Prettier currently fails there before ESLint can check app code.

Impact: the project has no reliable one-command lint gate for the actual application.

Recommended follow-up: define the intended quality gate inputs with a `.prettierignore` and matching ESLint ignores. Exclude `.agents/`, `src/convex/_generated/`, and any intentionally vendored/generated component sources. Keep hand-written app, Convex, docs, and config files inside the normal gate.

### P2: Auth pages duplicate the same flow shape

`src/routes/(public)/login/+page.svelte` and `src/routes/(public)/signup/+page.svelte` repeat the same structure:

- `VITE_CONVEX_URL` client guard
- `useConvexClient()` setup
- `hasStoredAuthSession()` on mount
- `isSubmitting` and `errorMessage` state
- password auth submit flow
- nearly identical success/error handling and form layout

Impact: small changes to auth behavior are likely to require parallel edits in both pages.

Recommended follow-up: after the auth UX settles, extract the shared submit/session logic into a tiny helper or local auth form state module. Keep the page markup separate unless it starts repeating more heavily.

### P2: Enrichment mutations repeat status patch boilerplate

`src/convex/enrichment.ts` repeats the same pattern across success/failure mutations:

- fetch bookmark by `bookmarkId`
- throw `Bookmark not found`
- patch status fields
- set `updatedAt`
- return `bookmarkId`

Impact: adding more enrichment states will keep increasing repetition and make status field drift easier.

Recommended follow-up: extract a narrow helper in the same file for loading the bookmark and another tiny helper for timestamped patches only if this file grows. Do not introduce a broad enrichment abstraction yet.

### P3: `bookmarks.ts` is the main file to watch for growth

`src/convex/bookmarks.ts` is 270 lines, the largest hand-written source file in this baseline. It already owns capture, listing, detail reads, metadata updates, note updates, auto-note settings, tag joins, and deletion cleanup.

Impact: it is still readable today, but it is likely to become the first backend file that gets hard to scan as MVP bookmark behavior expands.

Recommended follow-up: when the next bookmark feature lands, split only along clear behavior boundaries, such as keeping capture/list/detail in `bookmarks.ts` and moving tag assignment or cleanup helpers into a small nearby module. Avoid splitting it preemptively.

### P3: Root barrel file appears unused

`src/lib/index.ts` is a one-line placeholder and no imports currently reference `$lib` as a barrel.

Impact: minimal, but empty barrels add noise and can invite unclear import patterns.

Recommended follow-up: delete it if the app does not need package-style `$lib` exports.

## File Size Baseline

Largest hand-written source files at the time of review:

- `src/convex/bookmarks.ts`: 270 lines
- `src/routes/(public)/+page.svelte`: 193 lines
- `src/convex/enrichment.ts`: 188 lines
- `src/routes/(app)/app/+page.svelte`: 186 lines
- `src/routes/(public)/signup/+page.svelte`: 168 lines
- `src/routes/(app)/app/+layout.svelte`: 155 lines

These sizes are acceptable for the current MVP. `bookmarks.ts` is the only file that needs active attention before it accumulates more responsibilities.

## Explicitly Out Of Scope

- No review of shadcn-svelte component correctness.
- No recommendations to edit `src/lib/components/ui/**`.
- No formatting, refactoring, or product behavior changes.

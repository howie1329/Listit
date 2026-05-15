# Codebase Cleanup Refactor Brief

## Problem

The current app branch has a few route files carrying mixed responsibilities, especially the library workspace. This makes the code harder to scan and safely extend even though the behavior is straightforward.

## Scope

- Preserve current product behavior, routes, data shapes, and UX.
- Reduce large Svelte route-file complexity by extracting existing UI into focused components.
- Move duplicated pure frontend formatting/normalization helpers into small client-safe utilities.
- Keep Convex functions explicit; only do obvious in-place simplification if it is low risk.
- Audit generated/copied UI primitives by usage only; do not refactor primitive internals.

## Out of scope

- Removing future-facing schema/features.
- Changing visual design or route structure.
- Pruning unfinished placeholder pages.
- Introducing service layers, generic CRUD factories, global state managers, or new app architecture.
- Editing generated Convex or SvelteKit files.

## Acceptance criteria

- `src/routes/(app)/app/+page.svelte` is smaller and easier to scan.
- Extracted Svelte components use Svelte 5 patterns: typed `$props`, callback props, modern event attributes, and no unnecessary `$effect`.
- Shared helpers are pure and client-safe.
- Behavior is equivalent: save URL, select bookmarks, assign collections, manage tags, retry extraction, and edit notes still work the same.
- Checks pass.

## Implementation plan

1. Extract pure bookmark/tag formatting helpers into `$lib/bookmark-utils.ts`.
2. Extract the library header/save form into a focused Svelte component.
3. Extract the bookmark table/list into a focused Svelte component.
4. Keep inspector logic in the route for this pass unless a low-risk extraction is obvious.
5. Run Svelte autofixer and project checks.

## Files likely to change

- `src/routes/(app)/app/+page.svelte`
- `src/lib/bookmark-utils.ts`
- `src/lib/components/library/library-header.svelte`
- `src/lib/components/library/bookmark-list.svelte`

## Risks

- Callback prop wiring could accidentally alter selection/save behavior.
- Type imports from Convex generated files need to stay type-only in frontend helpers/components.

## Manual QA

- Save a URL from the library page.
- Select bookmarks and verify inspector updates.
- Verify loading, empty, and error states still render.
- Assign/unassign a collection.
- Add/remove/save tags.
- Retry extraction on a failed bookmark.
- Edit and save a note.

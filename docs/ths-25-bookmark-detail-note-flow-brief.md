# THS-25 Bookmark Detail And Note Flow Brief

## Problem

The Library inspector still uses list-row data and a readonly note preview. Users need a real selected-bookmark detail surface that shows saved metadata, extracted reader content, and a single editable note that persists across reloads.

## Scope

- Load the selected bookmark detail through `api.bookmarks.get`.
- Show core bookmark metadata, source URL, extraction state, extracted content, tags, and collection context when present.
- Replace the readonly note preview with a simple editable note flow backed by `api.bookmarks.updateNote`.
- Keep the existing compact inspector layout and current collection/tag controls.
- Preserve clean loading, empty, error, and failed-extraction states.

## Out Of Scope

- Note history, annotations, highlights, or multiple notes.
- Auto-note generation or AI note controls.
- Reader route expansion beyond the current inspector.
- Schema changes or new Convex APIs unless an existing contract is insufficient.
- New reusable components.

## Acceptance Criteria

- Selecting a bookmark shows real detail data for that bookmark.
- Detail displays title, source, URL/metadata, extraction status, extracted text when available, and current note content.
- Users can edit one note per bookmark and save it.
- Saved note content persists across reloads and bookmark reselection.
- Empty note state is clear and usable.
- `npm run check` passes.

## Implementation Plan

1. Keep selection local to `src/routes/(app)/app/+page.svelte`, but derive selected detail from `api.bookmarks.get` using the selected bookmark ID.
2. Continue using `api.bookmarks.list` for the left list and sidebar context. Use detail query data for inspector content when available, with the row as a lightweight immediate fallback only while detail loads.
3. Add note draft state that resets when the selected bookmark changes or fresh detail note data arrives.
4. Add explicit note save behavior using `api.bookmarks.updateNote`, with saving, saved, and error states.
5. Expand the reader section from short preview to extracted content display when present, with pending/failed/empty messaging using the existing extraction status.
6. Keep collection assignment, tag editing, and extraction retry behavior in the inspector, wired to the selected bookmark ID.

## Files Likely To Change

- `src/routes/(app)/app/+page.svelte`
- `docs/ths-25-bookmark-detail-note-flow-brief.md`

## Risks

- Detail query state and row state can drift briefly after mutations; prefer the detail query for inspector rendering and keep mutation state explicit.
- Note draft reset must not clobber unsaved typing during unrelated live-query refreshes.
- The inspector is already large; keep changes route-local and avoid extracting components in this pass.

## Manual QA

- Save a bookmark, select it, and verify detail data appears in the inspector.
- Edit and save a note, reload `/app`, reselect the bookmark, and confirm the note persists.
- Select between two bookmarks and confirm note drafts reset to the selected bookmark.
- Verify empty note, pending extraction, enriched extraction, and failed extraction/retry states.
- Run `npm run check`.

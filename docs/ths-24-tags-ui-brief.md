# THS-24 Tags UI Brief

## Problem

Tags exist in Convex but the app still shows placeholder tags and has no real tag assignment UI. Users need to assign tags from bookmark detail, filter the library by tag, and manage tag names from the workspace.

## Scope

- Replace placeholder sidebar tags with real user tags.
- Support tag filtering with `?tag=<tagId>`, including collection + tag filtering.
- Add selected-bookmark tag editing with explicit save.
- Add simple sidebar rename/delete actions for tags.

## Out Of Scope

- Schema changes.
- New tag APIs.
- Bulk tag operations.
- A dedicated tag management page.

## Acceptance Criteria

- Users can add/remove tag tokens on the selected bookmark and save them.
- New tag names entered in the UI are created through `bookmarks.setTags`.
- Sidebar tag clicks filter the bookmark list.
- Tag rename/delete actions are available from the sidebar.
- Deleting a tag keeps bookmarks saved and only removes assignments.
- `npm run check` passes.

## Implementation Plan

- Use `api.tags.list` in the app layout instead of static placeholder tags.
- Use URL search params for active collection and tag filters.
- Pass both filters into `api.bookmarks.list` from the library page.
- Add a local token editor in the bookmark detail pane backed by `api.bookmarks.setTags`.
- Mirror collection dialog patterns for tag rename/delete.

## Files Likely To Change

- `src/routes/(app)/app/+layout.svelte`
- `src/routes/(app)/app/+page.svelte`
- `docs/ths-24-tags-ui-brief.md`

## Risks

- Token editor state must reset when the selected bookmark changes or live query data updates.
- URL filter updates must preserve collection/tag combinations intentionally.

## Manual QA

- Save a bookmark, assign existing and new tag names, and confirm row/sidebar updates.
- Filter by tag and by collection + tag.
- Rename and delete tags from the sidebar.

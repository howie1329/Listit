## Problem Statement

ListIt supports collections in the backend, but the app UI still shows placeholder collection data. Users need a real collection management flow inside the workspace so they can organize bookmarks without leaving the library view.

## Solution

Connect the existing Convex collection functions to the app shell. Users can create, list, rename, delete, and filter by collections from the sidebar. Users can assign the selected bookmark to a real collection from the bookmark details pane.

## User Stories

1. As a ListIt user, I want to see my real collections in the workspace sidebar, so that navigation reflects my saved organization.
2. As a ListIt user, I want to create a collection from the sidebar, so that I can organize bookmarks while staying in the library.
3. As a ListIt user, I want to rename a collection from the sidebar, so that I can correct or refine my organization.
4. As a ListIt user, I want to delete a collection from the sidebar, so that I can remove organization I no longer need.
5. As a ListIt user, I want deletion to keep bookmarks saved, so that removing a collection does not destroy my library.
6. As a ListIt user, I want deletion to clearly warn me that bookmarks will become unassigned, so that I understand the effect before confirming.
7. As a ListIt user, I want to filter the library by collection, so that I can focus on a specific set of bookmarks.
8. As a ListIt user, I want to assign the selected bookmark to a collection from the details pane, so that organization happens close to the bookmark context.
9. As a ListIt user, I want to clear a bookmark's collection assignment, so that bookmarks can return to an unassigned state.
10. As a ListIt user, I want collection assignment to use real collection IDs, so that UI state persists correctly across reloads.
11. As a ListIt user, I want empty collection states to feel clear and lightweight, so that a new workspace does not feel broken.

## Implementation Decisions

- Collection management lives inline in the existing sidebar Collections section.
- Bookmark collection assignment lives in the selected-bookmark details pane.
- Collection deletion requires a confirmation dialog.
- Deleting a collection leaves bookmarks saved and clears their collection assignments through the existing backend behavior.
- Filtering uses the selected collection ID and the existing bookmark list query.
- Assignment uses the existing bookmark update mutation with a real collection ID or `null` for unassigned.
- No schema changes are needed.
- No new backend APIs are needed.
- The UI should use existing shadcn-svelte components, current app shell patterns, and current design tokens.

## Testing Decisions

- Test external behavior through the app UI and existing Convex function contracts rather than implementation details.
- Run Svelte autofixer on changed Svelte files.
- Run `npm run check`.
- Manually verify collection create, list, rename, delete, filtering, assignment, and clearing assignment.
- Manually verify deleting a collection clears bookmark assignments while preserving bookmarks.

## Out of Scope

- Multi-collection bookmarks.
- Drag-and-drop collection assignment.
- Collection descriptions in the UI.
- Collection counts.
- Undo for collection deletion.
- New search behavior.
- Tag management changes.
- Backend schema or API changes.

## Further Notes

This is an MVP integration pass. The smallest production-ready solution is to connect the existing backend to the current app shell without adding new abstractions or dependencies.

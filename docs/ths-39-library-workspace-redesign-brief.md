# THS-39 Library Workspace Redesign Brief

## Problem

The Library workspace is close to the design system, but still has redundant actions, a prominent global Reader button, a form-heavy inspector, and collapsed-sidebar text leakage. The page should feel like a dense Linear-style workspace for capture and triage.

## Scope

- Redesign the `/app` Library page around compact URL capture, dense bookmark rows, and a toggleable right inspector.
- Remove the Library page `New collection` action; collection creation stays in the sidebar.
- Remove the global header Reader action; reader access is contextual from the selected bookmark.
- Reorder inspector content so collection, tags, and enrichment context come before reader preview and note.
- Fix collapsed sidebar dynamic group text so icon mode stays clean.

## Out Of Scope

- Convex schema, query, mutation, or backend behavior changes.
- Mobile bookmark detail drawer or inline row expansion.
- Persistent inspector collapse preferences.

## Acceptance Criteria

- Library capture, bookmark selection, collection assignment, and tag editing continue to work.
- Bookmark rows scan as compact table-like rows with title/domain, status, collection, and tags.
- The right inspector is open by default on desktop and can be collapsed.
- Mobile keeps the inspector hidden and has no horizontal overflow.
- Collapsed sidebar does not show orphan wrapped text for collections or tags.

## Manual QA

- Save a URL and confirm the saved bookmark is selected.
- Toggle the inspector open and closed on desktop.
- Assign a collection and save tags from the inspector.
- Collapse the left sidebar and confirm dynamic groups remain clean.
- Check mobile width for usable capture/list layout.

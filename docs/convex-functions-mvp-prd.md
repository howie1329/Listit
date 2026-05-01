# Convex Functions MVP PRD

## Problem

ListIt has an MVP schema for bookmarks, organization, notes, retrieval chunks, and chat history, but it needs a small Convex function layer so the app can persist real user-owned bookmark data.

## Goals

- Save URLs quickly with per-user deduplication.
- Support manual collections and tags.
- Support one editable note per bookmark.
- Expose simple bookmark list/detail/update/delete functions.
- Keep AI enrichment, embeddings, and auto-note writes behind internal function boundaries.
- Defer Ask-my-bookmarks/chat behavior until the product shape is clearer.

## Non-Goals

- No public Ask-my-bookmarks endpoint in this pass.
- No chat thread or chat message functions in this pass.
- No Firecrawl, embedding, LLM, or auto-note generation calls in this pass.
- No soft deletes, undo, note history, or multi-collection bookmarks.
- No new dependencies or test framework.

## Function Surface

### Bookmarks

- `saveUrl({ url })`
  - Requires auth.
  - Normalizes the URL, hashes the normalized URL, and dedupes by `userId + urlHash`.
  - Creates a new bookmark with pending extraction and AI organization status.
  - Updates an existing bookmark's timestamps and original URL when deduped.
  - Defaults `autoNoteEnabled` to false.
- `list({ collectionId?, tagId? })`
  - Requires auth.
  - Returns the user's bookmarks, optionally filtered by collection or tag.
- `get({ bookmarkId })`
  - Requires auth.
  - Returns one owned bookmark plus manual tags.
- `update({ bookmarkId, title?, description?, collectionId?, autoNoteEnabled? })`
  - Requires auth.
  - Allows user-editable metadata and collection assignment only.
- `remove({ bookmarkId })`
  - Requires auth.
  - Hard deletes the bookmark, its tag joins, and its chunks.
- `updateNote({ bookmarkId, note })`
  - Requires auth.
  - Updates the editable note and `noteUpdatedAt`.
- `setTags({ bookmarkId, tagNames })`
  - Requires auth.
  - Normalizes tag names, creates missing tags, and replaces the bookmark tag set.

### Collections

- `create`, `list`, `update`, and `remove`.
- Collection assignment happens by collection ID.
- Removing a collection clears that collection from owned bookmarks.

### Tags

- `create`, `list`, `update`, and `remove`.
- Tag assignment happens by tag names through bookmark functions.
- Removing a tag removes tag joins only.

### Internal Enrichment

- Save extraction success/failure.
- Save AI organization success/failure.
- Save auto-note success/failure.
- Replace bookmark chunks with caller-provided text, source, and 1536-dimension embeddings.

## URL Deduplication

Normalize URLs by trimming input, parsing with `URL`, lowercasing protocol and hostname, removing hash fragments, removing common tracking parameters, sorting remaining query parameters, and trimming a trailing slash except for the root path.

## Acceptance Criteria

- Public functions only operate on the authenticated user's data.
- Duplicate normalized URLs update the existing bookmark instead of creating another record.
- Tag assignment by names creates missing tags and replaces existing joins.
- Collection deletion clears bookmark references.
- Bookmark deletion removes joins and chunks.
- Internal enrichment functions cannot be called directly by the client.
- `npm run check` passes.

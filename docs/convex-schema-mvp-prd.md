# Convex MVP Schema PRD

## Problem

ListIt needs a small Convex data model that supports the MVP: fast URL capture, manual organization, background enrichment, editable notes, grounded retrieval, and chat history.

## Goals

- Store user-owned bookmarks with per-user URL deduplication.
- Support one collection per bookmark and many manual tags.
- Store extracted reader text and retrieval chunks with embeddings.
- Store AI-generated organization suggestions without applying them automatically.
- Store one editable note per bookmark, optionally initialized by AI.
- Persist Ask-my-bookmarks chat threads, messages, and bookmark citations.

## Non-Goals

- No Convex functions, frontend routes, extraction jobs, or AI calls in this pass.
- No shared/global URL content records.
- No multi-collection bookmarks.
- No note history, highlights, ranges, or multiple notes per bookmark.
- No external vector database.

## Data Model

### Bookmarks

Bookmarks are owned by a Convex auth user. Each bookmark stores the original URL, normalized URL, URL hash, optional canonical URL, display metadata, optional collection, extraction state, AI organization suggestions, editable note content, auto-note state, and timestamps.

Deduplication is per user using `userId + urlHash`.

### Manual Organization

Collections are first-class user-owned records. A bookmark can point to one collection.

Tags are first-class user-owned records. Bookmark/tag assignment uses a `bookmarkTags` join table so tag rename and delete behavior remains simple.

### Enrichment and Retrieval

Bookmarks store truncated extracted page text for reader view.

`bookmarkChunks` stores retrieval-sized text chunks with `source` set to `extracted` or `note`. Chunks include a 1536-dimension embedding and a Convex vector index filtered by `userId`.

### AI Suggestions and Auto Notes

AI organization output is stored on bookmarks as suggested tag names, topic names, and collection names. These suggestions never create or assign manual organization records automatically.

Auto note taking is controlled per bookmark with `autoNoteEnabled`, defaulting to false in future mutations. AI-generated note content writes into the same editable `note` field the user edits later.

### Chat

Chat threads and messages are user-owned. Assistant messages can store citations to bookmarks and optional chunks so answers remain inspectable.

## Acceptance Criteria

- Schema compiles with strict Convex validators.
- Generated Convex types include bookmarks, collections, tags, bookmarkTags, bookmarkChunks, chatThreads, and chatMessages.
- Indexes support bookmark list queries, dedupe lookup, collection filtering, tag filtering, enrichment status queues, vector search by user, and chat history.
- `npm run check` passes after codegen.

# ListIt MVP

ListIt is a keyboard-driven personal bookmarking and lightweight knowledge retrieval app. It helps solo users save links quickly and ask grounded questions against what they have already saved.

## Problem

Solo users need a fast way to capture web links and later ask questions grounded in what they saved. Current tooling fragments capture across tools and makes retrieval untrustworthy and slow.

## Target User

Solo users who want a keyboard-driven personal bookmarking and lightweight knowledge retrieval system.

## Goals

- Enable instant bookmark capture with deduplication.
- Organize bookmarks with manual tags and collections.
- Provide basic auto-organization (AI-generated tags/topics and suggested collections).
- Support "Ask my bookmarks" with grounded answers and citations.
- Provide reader view with stored extracted text and per-bookmark notes.
- Keep UI fast using a background enrichment pipeline.
- Keep architecture minimal while retaining Convex as backend.
- Support optional auto note taking per bookmark.

## MVP Scope

### Core

- Save bookmark URL and show it immediately with `pending_extraction` status.
- List bookmarks with filters by collection and manual tags.
- Manage manual tags and collections.
- Deduplicate by normalized/canonical URL and record hash.

### Background Enrichment Pipeline

- Fetch and extract content once in background, truncate to cap, store extracted content.
- Run AI auto-organization to generate tags/topics and suggested collections (stored as suggestions).

### Optional AI Auto Note Taking

- Users can enable/disable auto note taking per bookmark.
- When enabled and enrichment completes, AI generates a structured note/page from extracted content.
- Generated notes are editable and stored per bookmark.
- Notes are used as additional context for "Ask my bookmarks" alongside extracted chunks.

### Retrieval + Chat

- Use embeddings and vector indexing for chunk-based retrieval.
- Provide Ask-my-bookmarks chat endpoint with grounded answers and bookmark citations.
- If nothing relevant is retrieved, return an insufficient-information response and suggest saving more bookmarks.

### Reader + Editing

- Reader view shows extracted/truncated content and notes.
- Notes are simple per-bookmark text notes (no highlight/range-based annotation in MVP).
- Notes can be created/edited and persist across reloads.

### State Behavior

- Bookmark extraction state and auto-note generation state can progress independently.

## Out Of Scope

- Highlight/range-based annotation
- Document/PDF uploads beyond URL bookmarks
- Complex agentic workflows
- Multi-user team collaboration
- Dedicated enterprise search UI
- Advanced reranking or complex citation formatting

## Test Scenarios

- Save a new URL and it appears immediately with `pending_extraction`.
- Save the same URL twice and verify dedup updates the existing record.
- Create/edit manual tags and assign bookmarks to collections.
- Verify enrichment updates status from `pending_extraction` to `enriched`.
- Verify reader view shows extracted/truncated content after enrichment.
- Verify AI auto-organize outputs tags/topics and collection suggestions.
- Enable/disable auto note taking per bookmark.
- Verify auto note generation when enabled and no generation when disabled.
- Verify notes are editable and persist across reloads.
- Verify Ask-my-bookmarks answers are grounded with bookmark citations.
- Verify notes are included in Ask-my-bookmarks retrieval context.
- Verify insufficient-information response when no relevant chunks exist.
- Verify auth-protected routes redirect unauthenticated users and allow authenticated users.

## Research Plan

- Confirm TanStack Start integration approach with Convex auth helpers (hosted email/password session).
- Decide MVP vector search strategy (Convex-only vs dedicated vector store) by complexity/performance tradeoffs.
- Validate extraction provider behavior/cost limits and define truncation cap.
- Decide prompting strategy and cost/limits for structured auto note generation.
- Review existing ListIt code paths to port: routes, keyboard navigation, Convex client setup, and background job triggers.

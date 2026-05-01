# ListIt

ListIt is a keyboard-driven personal bookmarking and lightweight knowledge retrieval app built with SvelteKit + Convex.

The MVP helps solo users save links quickly, organize what they save, and ask grounded questions based on their own bookmarks.

## Problem

Solo users need a fast way to capture web links and later ask questions grounded in what they saved. Current tooling fragments capture across tools and makes retrieval untrustworthy and slow.

## Target User

Solo users who want a keyboard-driven personal bookmarking and lightweight knowledge retrieval system.

## MVP Goals

- Enable instant bookmark capture with deduplication.
- Allow organizing bookmarks with manual tags and collections.
- Provide basic auto-organization (AI-generated tags/topics and suggested collections).
- Support "Ask my bookmarks" grounded answers with citations to saved bookmarks.
- Provide reader view with stored extracted text and per-bookmark notes.
- Ship with a background enrichment pipeline to keep UI fast.
- Keep architecture minimal and buildable while retaining Convex as backend.
- Add optional auto note taking per bookmark.

## MVP Scope

### Core

- Save bookmark URL with immediate appearance (`pending_extraction` status).
- List bookmarks with filters by collection and manual tags.
- Manual tag and collection management.
- Dedup by normalized/canonical URL and record hash.

### Background Enrichment Pipeline

- Background pipeline fetches and extracts once, truncates to cap, and stores extracted content.
- AI auto-organize generates tags/topics and suggested collections (stored as suggestions, not enforced).

### Optional AI Auto Note Taking

- Users can enable/disable auto note taking per bookmark.
- When enabled and enrichment completes, AI:
  - Generates a structured note/page from extracted/truncated content.
  - Stores it as editable bookmark notes (or a dedicated editable auto-note field).
- Users can still save bookmarks without auto notes and edit notes later in reader view.
- Notes are used as additional context for "Ask my bookmarks" along with extracted chunks.

### Retrieval + Chat

- Embeddings + vector indexing for chunk-based retrieval (can start Convex-only if acceptable).
- Ask-my-bookmarks chat retrieves relevant chunks and generates grounded answers with citations.
- If no relevant chunks are found, return an insufficient-information response and suggest saving more bookmarks.

### Reader + Editing

- Reader view displays extracted/truncated content and available notes.
- Notes are simple per-bookmark text notes (no highlight/range annotation in v1).
- Notes can be created/edited and persist across reloads.

### State Behavior

- Bookmark extraction state and auto-note generation state progress independently.

## Out of Scope

- Full highlight/range-based annotation.
- Document/PDF upload ingestion beyond URL bookmarks.
- Complex agentic workflows.
- Multi-user team collaboration.
- Dedicated enterprise search UI.
- Advanced content reranking or complex citation formatting beyond basic bookmark citations.

## Test Scenarios

- Save a new URL and it appears immediately with `pending_extraction`.
- Save the same URL twice and dedup updates existing record instead of creating duplicate.
- Create/edit manual tags and assign bookmarks to collections.
- Background pipeline updates bookmark from `pending_extraction` to `enriched`.
- Reader view displays extracted/truncated content after enrichment.
- AI auto-organize generates tags/topics and suggested collections for enriched bookmark.
- User can enable/disable auto note taking per bookmark.
- If auto note taking is enabled, AI generates an editable note/page after enrichment.
- If auto note taking is disabled, no auto note is generated (manual notes still available).
- Ask-my-bookmarks returns grounded answers with citations to relevant bookmarks.
- Notes are included as context for Ask-my-bookmarks when present.
- If no relevant chunks exist, response indicates insufficient information and suggests adding bookmarks.
- Notes can be created/edited and persist across reloads.
- Auth-protected routes redirect unauthenticated users and allow authenticated users to access `/bookmarks` and `/chat`.

## Research Plan

- Confirm SvelteKit integration approach with Convex auth helpers (hosted email/password session).
- Decide vector search strategy for MVP (Convex-only vs dedicated) based on complexity and performance.
- Validate extraction provider behavior/cost limits for Firecrawl and define truncation cap.
- Decide prompting strategy and cost/limits for generating structured notes/pages from extracted content.
- Review current SvelteKit code paths to identify what to build first: routes, keyboard navigation, Convex client setup, and background job triggers.

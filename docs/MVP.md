# ListIt MVP on SvelteKit + Convex

## Problem

Solo users need a fast way to capture web links and later ask questions grounded in what they saved. Current tooling fragments capture across tools and makes retrieval untrustworthy and slow.

## Target user

solo users who want a keyboard-driven personal bookmarking and lightweight knowledge retrieval system.

## Goals

- Enable instant bookmark capture with deduplication
- Allow organizing bookmarks with manual tags and collections
- Provide basic auto-organization (AI-generated tags/topics + suggested collections)
- Support “Ask my bookmarks” grounded answers with citations to saved bookmarks
- Provide reader view with stored extracted text and per-bookmark notes
- Ship with a background enrichment pipeline to keep UI fast
- Keep architecture minimal and buildable while retaining Convex as backend
- Add optional “auto note taking” per bookmark to generate a readable note/page from extracted content

## MVP scope

### Core

- Save bookmark URL with immediate appearance (pending_extraction status)
- List bookmarks with filters by collection + manual tags
- Manual tag + collection management
- Dedup by normalized/canonical URL + record hash

### Background enrichment pipeline

- Background pipeline: fetch+extract once, truncate to cap, store extracted content
- AI auto-organize: generate tags/topics and suggested collections (store results, not enforce)

### Optional AI auto “note taking” (new)

- Users can enable/disable **auto note taking per bookmark** (default can be off or on; MVP should support toggling)
- When enabled and enrichment completes, AI will:
  - generate a structured “note/page” from the extracted/truncated content
  - store it as the bookmark’s notes content (or as a dedicated auto-generated note field that is editable)
- Users can still:
  - save bookmarks without auto notes
  - later open the reader view and read/edit existing notes
- Notes content is also used as **context** for “Ask my bookmarks” (in addition to extracted chunks)

### Retrieval + chat

- Embeddings + vector indexing for chunk-based retrieval (implementation choice can start with Convex-only if acceptable)
- Ask-my-bookmarks chat endpoint: retrieve relevant chunks and generate grounded answer with citations
- If no relevant chunks are found, response indicates insufficient information and suggests creating more bookmarks

### Reader + editing

- Reader view: display extracted/truncated content and available notes
- Notes per bookmark (simple text notes; no highlights/ranges in v1)
- Notes can be created/edited and persist across reloads

### Background enrichment behavior

- Bookmark can have independent states for extracted content vs auto-note generation

## Out of scope

- Full highlight/range-based annotation
- Document/PDF upload ingestion beyond URL bookmarks
- Complex agentic workflows
- Multi-user team collaboration
- Dedicated enterprise search UI
- Advanced content re-ranking or complex citation formatting beyond basic bookmark citations

## Test scenarios

- User saves a new URL and it appears immediately with status pending_extraction
- Saving the same URL twice dedups and updates the existing record instead of creating a duplicate
- User can create/edit manual tags and assign bookmarks to collections
- Background pipeline updates bookmark status from pending_extraction to enriched
- Reader view displays extracted/truncated content for a bookmark after enrichment
- AI auto-organize generates tags/topics and suggested collections for an enriched bookmark
- User can enable/disable auto note taking per bookmark
- If auto note taking is enabled, AI generates an editable note/page after enrichment completes
- If auto note taking is disabled, no auto note is generated (user can still manually create/edit notes later)
- Ask-my-bookmarks returns an answer grounded in retrieved chunks and includes citations to relevant bookmarks
- Notes content is used as context for Ask-my-bookmarks when present
- If no relevant chunks are found, response indicates insufficient information and suggests creating more bookmarks
- Notes can be created/edited per bookmark and persist across reloads
- Auth-protected routes work: unauthenticated users are redirected to login; authenticated users can access /bookmarks and /chat

## Research plan

- Confirm SvelteKit integration approach with Convex auth helpers (hosted email/password session)
- Decide vector search strategy for MVP (Convex-only vs dedicated) based on implementation complexity and performance
- Validate extraction provider behavior/cost limits for Firecrawl and define truncation cap
- Decide prompting strategy + cost/limits for generating structured notes/page from extracted content
- Review current SvelteKit code paths to identify what to build first: routes, keyboard navigation, Convex client setup, and background job triggers

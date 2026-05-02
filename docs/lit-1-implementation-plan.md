# LIT-1 Implementation Plan

## Summary

Verify that the Convex schema and generated types match the MVP schema docs. This is a verification-first task: only change schema code if a concrete acceptance gap is found.

Linear issue: LIT-1, "Verify Convex schema and generated types match MVP docs"

Branch: `howardthomas13/lit-1-verify-convex-schema-and-generated-types-match-mvp-docs`

## Source Docs

- `docs/convex-schema-mvp-prd.md`
- `docs/MVP.md`
- `src/convex/_generated/ai/guidelines.md`

## Acceptance Criteria

- Schema supports `bookmarks`, `collections`, `tags`, `bookmarkTags`, `bookmarkChunks`, `chatThreads`, and `chatMessages`.
- Indexes support bookmark list queries, dedupe lookup, collection filtering, tag filtering, enrichment queues, vector search by user, and chat history.
- Generated Convex types reflect the MVP schema.
- `npm run check` passes.

## Verification Notes

- `src/convex/schema.ts` defines all required MVP tables.
- Bookmark URL dedupe is supported by the `bookmarks.by_user_url_hash` index.
- Bookmark listing and collection filtering are supported by `bookmarks.by_user_created` and `bookmarks.by_user_collection`.
- Tag filtering is supported by `bookmarkTags.by_tag` and `bookmarkTags.by_user_bookmark`.
- Enrichment queues are supported by `bookmarks.by_extraction_status` and `bookmarks.by_auto_note_status`.
- Vector retrieval by user is supported by the `bookmarkChunks.by_embedding` vector index filtered by `userId`.
- Chat history is supported by `chatThreads.by_user_updated`, `chatMessages.by_thread`, and `chatMessages.by_user_thread`.
- Generated Convex types derive from `src/convex/schema.ts` in `src/convex/_generated/dataModel.d.ts`.

## Test Plan

- Run `npm run check`.
- Inspect generated data model types for schema-derived table coverage.
- No schema patch is required unless verification finds a mismatch.

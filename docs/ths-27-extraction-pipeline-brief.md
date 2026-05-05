# THS-27 Extraction Pipeline Brief

## Problem

Saved bookmarks currently stop at `pending` extraction. ListIt needs real background URL extraction so saved links become reader-ready without blocking capture.

## Scope

- Schedule extraction immediately after creating a new bookmark.
- Scrape the saved URL with FireCrawl.
- Store truncated extracted markdown and metadata on the bookmark.
- Record explicit enriched and failed states.
- Let users retry failed extraction from the selected bookmark inspector.

## Out of scope

- Retrieval chunks and embeddings.
- AI organization and auto-note generation.
- Cron polling or a failed-bookmarks queue.
- Schema changes or data migration.

## Acceptance criteria

- New bookmark saves return immediately and schedule background extraction.
- Successful extraction writes text, metadata, `extractedAt`, and `extractionStatus: 'enriched'`.
- Failed extraction writes `extractionStatus: 'failed'` and `extractionError`.
- Retrying a failed bookmark marks it pending and schedules extraction again.
- Deduped saves do not rerun extraction automatically.
- `npm run check` passes.

## Implementation plan

- Add a Convex internal action that calls FireCrawl `scrape(url, { formats: ['markdown'], onlyMainContent: true })`.
- Truncate stored markdown to `100_000` characters.
- Reuse existing internal enrichment mutations for success and failure writes.
- Update `bookmarks.saveUrl` to schedule extraction only for newly created bookmarks.
- Add `bookmarks.retryExtraction` for owned bookmarks.
- Add compact retry UI in the selected bookmark inspector when extraction failed.

## Environment

- `FIRECRAWL_API_KEY` must be set in the Convex deployment environment.

# API Routes MVP PRD

## Summary

Add a small SvelteKit API route layer for server-only MVP flows: bookmark enrichment, AI organization, auto notes, stateless ask, and persisted chat. Convex remains the source of truth for data, ownership, chat history, and enrichment state.

## Goals

- Keep provider keys out of browser code.
- Expose explicit HTTP endpoints for UI flows that need server orchestration.
- Enforce authentication and bookmark ownership before running provider work.
- Persist enrichment, AI suggestions, notes, chat messages, and citations through Convex.
- Keep routes thin and easy to replace as the backend matures.

## Route Surface

### `POST /api/bookmarks/[bookmarkId]/enrich`

Runs extraction for one owned bookmark.

Response:

```json
{
	"bookmarkId": "bookmark id",
	"status": "enriched"
}
```

Failure responses use non-2xx status codes and persist extraction failure state when the bookmark can be verified.

### `POST /api/bookmarks/[bookmarkId]/auto-organize`

Runs AI organization for one owned enriched bookmark. The route stores suggested tags, topics, and collections only. It does not create or assign manual organization records.

Response:

```json
{
	"bookmarkId": "bookmark id",
	"suggestedTags": [],
	"suggestedTopics": [],
	"suggestedCollections": []
}
```

### `POST /api/bookmarks/[bookmarkId]/auto-note`

Runs AI note generation for one owned enriched bookmark when auto notes are enabled.

Response:

```json
{
	"bookmarkId": "bookmark id",
	"status": "complete"
}
```

If auto notes are disabled or extracted content is unavailable, the route returns a clear non-2xx response without generating a note.

### `POST /api/ask`

Accepts a single question and returns a grounded answer with bookmark citations.

Request:

```json
{
	"question": "What did I save about Svelte route groups?"
}
```

Response:

```json
{
	"answer": "Answer text",
	"citations": []
}
```

When no relevant chunks are found, the answer states that there is not enough saved context and suggests saving more bookmarks.

### `POST /api/chat`

Accepts a new chat message and optionally a thread ID. If no thread ID is provided, Convex creates a new thread.

Request:

```json
{
	"threadId": "optional existing thread id",
	"message": "Question text"
}
```

Response:

```json
{
	"threadId": "chat thread id",
	"userMessageId": "chat message id",
	"assistantMessageId": "chat message id",
	"answer": "Answer text",
	"citations": []
}
```

## Auth And Data Flow

- Routes require a bearer token in the `Authorization` header.
- Routes delegate to Convex actions using the same auth token.
- Convex derives the authenticated user from auth context; clients never send `userId`.
- Bookmark-specific actions verify ownership before provider calls.
- Provider keys live in server/Convex environment variables only.

## Provider Boundaries

- Firecrawl handles extraction.
- OpenAI-compatible APIs handle embeddings, organization, notes, and answer generation.
- Missing provider configuration returns a concise server error.
- Provider failures are converted into explicit route errors; enrichment, organization, and auto-note failures persist to Convex where applicable.

## Acceptance Criteria

- All MVP routes exist under `src/routes/api/.../+server.ts`.
- Every route rejects unauthenticated requests.
- Bookmark routes verify ownership.
- `/api/ask` is stateless.
- `/api/chat` persists thread and message data in Convex.
- Ask/chat responses include citations when relevant context exists.
- Empty retrieval returns the MVP insufficient-information response.
- `npm run check` and `npm run lint` pass.

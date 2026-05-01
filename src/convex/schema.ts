import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
	...authTables,
	bookmarks: defineTable({
		userId: v.id('users'),
		url: v.string(),
		normalizedUrl: v.string(),
		urlHash: v.string(),
		canonicalUrl: v.optional(v.string()),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		siteName: v.optional(v.string()),
		faviconUrl: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		collectionId: v.optional(v.id('collections')),
		extractionStatus: v.union(v.literal('pending'), v.literal('enriched'), v.literal('failed')),
		extractedText: v.optional(v.string()),
		extractedAt: v.optional(v.number()),
		extractionError: v.optional(v.string()),
		autoOrgStatus: v.union(
			v.literal('pending'),
			v.literal('complete'),
			v.literal('failed'),
			v.literal('skipped')
		),
		suggestedTags: v.array(v.string()),
		suggestedTopics: v.array(v.string()),
		suggestedCollections: v.array(v.string()),
		autoOrgAt: v.optional(v.number()),
		autoOrgError: v.optional(v.string()),
		autoNoteEnabled: v.boolean(),
		note: v.optional(v.string()),
		noteUpdatedAt: v.optional(v.number()),
		noteGeneratedAt: v.optional(v.number()),
		autoNoteStatus: v.union(
			v.literal('idle'),
			v.literal('pending'),
			v.literal('complete'),
			v.literal('failed')
		),
		autoNoteError: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
		lastSavedAt: v.optional(v.number())
	})
		.index('by_user', ['userId'])
		.index('by_user_created', ['userId', 'createdAt'])
		.index('by_user_url_hash', ['userId', 'urlHash'])
		.index('by_user_collection', ['userId', 'collectionId'])
		.index('by_extraction_status', ['extractionStatus'])
		.index('by_auto_note_status', ['autoNoteStatus']),
	collections: defineTable({
		userId: v.id('users'),
		name: v.string(),
		description: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_user_name', ['userId', 'name']),
	tags: defineTable({
		userId: v.id('users'),
		name: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_user_name', ['userId', 'name']),
	bookmarkTags: defineTable({
		userId: v.id('users'),
		bookmarkId: v.id('bookmarks'),
		tagId: v.id('tags'),
		createdAt: v.number()
	})
		.index('by_bookmark', ['bookmarkId'])
		.index('by_tag', ['tagId'])
		.index('by_user_bookmark', ['userId', 'bookmarkId']),
	bookmarkChunks: defineTable({
		userId: v.id('users'),
		bookmarkId: v.id('bookmarks'),
		chunkIndex: v.number(),
		text: v.string(),
		source: v.union(v.literal('extracted'), v.literal('note')),
		embedding: v.array(v.float64()),
		createdAt: v.number()
	})
		.index('by_bookmark', ['bookmarkId'])
		.index('by_user', ['userId'])
		.vectorIndex('by_embedding', {
			vectorField: 'embedding',
			dimensions: 1536,
			filterFields: ['userId']
		}),
	chatThreads: defineTable({
		userId: v.id('users'),
		title: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_user_updated', ['userId', 'updatedAt']),
	chatMessages: defineTable({
		userId: v.id('users'),
		threadId: v.id('chatThreads'),
		role: v.union(v.literal('user'), v.literal('assistant')),
		content: v.string(),
		citations: v.optional(
			v.array(
				v.object({
					bookmarkId: v.id('bookmarks'),
					chunkId: v.optional(v.id('bookmarkChunks')),
					title: v.optional(v.string()),
					url: v.string(),
					snippet: v.optional(v.string())
				})
			)
		),
		createdAt: v.number()
	})
		.index('by_thread', ['threadId'])
		.index('by_user_thread', ['userId', 'threadId'])
});

export default schema;

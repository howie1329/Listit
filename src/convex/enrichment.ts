import { v } from 'convex/values';

import { internalMutation, internalQuery } from './_generated/server';

const metadataValidator = {
	title: v.optional(v.string()),
	description: v.optional(v.string()),
	siteName: v.optional(v.string()),
	faviconUrl: v.optional(v.string()),
	imageUrl: v.optional(v.string()),
	canonicalUrl: v.optional(v.string())
};

export const getExtractionTarget = internalQuery({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) return null;
		return { url: bookmark.normalizedUrl || bookmark.url };
	}
});

export const saveExtractionSuccess = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		extractedText: v.string(),
		...metadataValidator
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		const now = Date.now();
		await ctx.db.patch(args.bookmarkId, {
			title: args.title,
			description: args.description,
			siteName: args.siteName,
			faviconUrl: args.faviconUrl,
			imageUrl: args.imageUrl,
			canonicalUrl: args.canonicalUrl,
			extractedText: args.extractedText,
			extractedAt: now,
			extractionStatus: 'enriched',
			extractionError: undefined,
			updatedAt: now
		});
		return args.bookmarkId;
	}
});

export const saveExtractionFailure = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		error: v.string()
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		await ctx.db.patch(args.bookmarkId, {
			extractionStatus: 'failed',
			extractionError: args.error,
			updatedAt: Date.now()
		});
		return args.bookmarkId;
	}
});

export const saveAutoOrganizationSuccess = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		suggestedTags: v.array(v.string()),
		suggestedTopics: v.array(v.string()),
		suggestedCollections: v.array(v.string())
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		const now = Date.now();
		await ctx.db.patch(args.bookmarkId, {
			suggestedTags: args.suggestedTags,
			suggestedTopics: args.suggestedTopics,
			suggestedCollections: args.suggestedCollections,
			autoOrgStatus: 'complete',
			autoOrgAt: now,
			autoOrgError: undefined,
			updatedAt: now
		});
		return args.bookmarkId;
	}
});

export const saveAutoOrganizationFailure = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		error: v.string()
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		await ctx.db.patch(args.bookmarkId, {
			autoOrgStatus: 'failed',
			autoOrgError: args.error,
			updatedAt: Date.now()
		});
		return args.bookmarkId;
	}
});

export const saveAutoNoteSuccess = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		note: v.string()
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		const now = Date.now();
		await ctx.db.patch(args.bookmarkId, {
			note: args.note,
			noteGeneratedAt: now,
			noteUpdatedAt: now,
			autoNoteStatus: 'complete',
			autoNoteError: undefined,
			updatedAt: now
		});
		return args.bookmarkId;
	}
});

export const saveAutoNoteFailure = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		error: v.string()
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		await ctx.db.patch(args.bookmarkId, {
			autoNoteStatus: 'failed',
			autoNoteError: args.error,
			updatedAt: Date.now()
		});
		return args.bookmarkId;
	}
});

export const replaceChunks = internalMutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		chunks: v.array(
			v.object({
				text: v.string(),
				source: v.union(v.literal('extracted'), v.literal('note')),
				embedding: v.array(v.float64())
			})
		)
	},
	handler: async (ctx, args) => {
		const bookmark = await ctx.db.get(args.bookmarkId);
		if (!bookmark) throw new Error('Bookmark not found');

		for (const chunk of args.chunks) {
			if (chunk.embedding.length !== 1536) {
				throw new Error('Chunk embeddings must have 1536 dimensions');
			}
		}

		const existing = await ctx.db
			.query('bookmarkChunks')
			.withIndex('by_bookmark', (q) => q.eq('bookmarkId', args.bookmarkId))
			.collect();
		for (const chunk of existing) {
			await ctx.db.delete(chunk._id);
		}

		const now = Date.now();
		for (const [chunkIndex, chunk] of args.chunks.entries()) {
			await ctx.db.insert('bookmarkChunks', {
				userId: bookmark.userId,
				bookmarkId: args.bookmarkId,
				chunkIndex,
				text: chunk.text,
				source: chunk.source,
				embedding: chunk.embedding,
				createdAt: now
			});
		}

		await ctx.db.patch(args.bookmarkId, { updatedAt: now });
		return args.bookmarkId;
	}
});

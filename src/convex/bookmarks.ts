import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import {
	normalizeUrl,
	requireOwnedBookmark,
	requireOwnedCollection,
	requireUserId,
	stableHash,
	uniqueNames
} from './helpers';

export const saveUrl = mutation({
	args: {
		url: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const now = Date.now();
		const normalizedUrl = normalizeUrl(args.url);
		const urlHash = stableHash(normalizedUrl);
		const existing = await ctx.db
			.query('bookmarks')
			.withIndex('by_user_url_hash', (q) => q.eq('userId', userId).eq('urlHash', urlHash))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				url: args.url.trim(),
				normalizedUrl,
				updatedAt: now,
				lastSavedAt: now
			});
			return { bookmarkId: existing._id, created: false };
		}

		const bookmarkId = await ctx.db.insert('bookmarks', {
			userId,
			url: args.url.trim(),
			normalizedUrl,
			urlHash,
			extractionStatus: 'pending',
			autoOrgStatus: 'pending',
			suggestedTags: [],
			suggestedTopics: [],
			suggestedCollections: [],
			autoNoteEnabled: false,
			autoNoteStatus: 'idle',
			createdAt: now,
			updatedAt: now,
			lastSavedAt: now
		});

		return { bookmarkId, created: true };
	}
});

export const list = query({
	args: {
		collectionId: v.optional(v.id('collections')),
		tagId: v.optional(v.id('tags'))
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		if (args.collectionId) {
			await requireOwnedCollection(ctx, args.collectionId);
		}

		if (args.tagId) {
			const tag = await ctx.db.get(args.tagId);
			if (!tag || tag.userId !== userId) {
				throw new Error('Tag not found');
			}

			const joins = await ctx.db
				.query('bookmarkTags')
				.withIndex('by_tag', (q) => q.eq('tagId', args.tagId as Id<'tags'>))
				.collect();
			const bookmarks = await Promise.all(joins.map((join) => ctx.db.get(join.bookmarkId)));
			return bookmarks
				.filter((bookmark): bookmark is Doc<'bookmarks'> =>
					Boolean(bookmark && bookmark.userId === userId)
				)
				.filter((bookmark) => !args.collectionId || bookmark.collectionId === args.collectionId)
				.sort((left, right) => right.createdAt - left.createdAt);
		}

		const base = args.collectionId
			? ctx.db
					.query('bookmarks')
					.withIndex('by_user_collection', (q) =>
						q.eq('userId', userId).eq('collectionId', args.collectionId)
					)
			: ctx.db.query('bookmarks').withIndex('by_user_created', (q) => q.eq('userId', userId));

		return await base.order('desc').collect();
	}
});

export const get = query({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		const { userId, bookmark } = await requireOwnedBookmark(ctx, args.bookmarkId);
		const joins = await ctx.db
			.query('bookmarkTags')
			.withIndex('by_user_bookmark', (q) =>
				q.eq('userId', userId).eq('bookmarkId', args.bookmarkId)
			)
			.collect();
		const tags = await Promise.all(joins.map((join) => ctx.db.get(join.tagId)));

		return {
			bookmark,
			tags: tags.filter((tag) => tag && tag.userId === userId)
		};
	}
});

export const update = mutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		collectionId: v.optional(v.union(v.id('collections'), v.null())),
		autoNoteEnabled: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		await requireOwnedBookmark(ctx, args.bookmarkId);
		const patch: {
			title?: string;
			description?: string;
			collectionId?: Id<'collections'> | undefined;
			autoNoteEnabled?: boolean;
			updatedAt: number;
		} = {
			updatedAt: Date.now()
		};

		if (args.title !== undefined) patch.title = args.title.trim() || undefined;
		if (args.description !== undefined) patch.description = args.description.trim() || undefined;
		if (args.collectionId !== undefined) {
			if (args.collectionId === null) {
				patch.collectionId = undefined;
			} else {
				await requireOwnedCollection(ctx, args.collectionId);
				patch.collectionId = args.collectionId;
			}
		}
		if (args.autoNoteEnabled !== undefined) patch.autoNoteEnabled = args.autoNoteEnabled;

		await ctx.db.patch(args.bookmarkId, patch);
		return args.bookmarkId;
	}
});

export const updateNote = mutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		note: v.string()
	},
	handler: async (ctx, args) => {
		await requireOwnedBookmark(ctx, args.bookmarkId);
		const now = Date.now();
		await ctx.db.patch(args.bookmarkId, {
			note: args.note,
			noteUpdatedAt: now,
			updatedAt: now
		});
		return args.bookmarkId;
	}
});

export const setAutoNoteEnabled = mutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		enabled: v.boolean()
	},
	handler: async (ctx, args) => {
		await requireOwnedBookmark(ctx, args.bookmarkId);
		await ctx.db.patch(args.bookmarkId, {
			autoNoteEnabled: args.enabled,
			updatedAt: Date.now()
		});
		return args.bookmarkId;
	}
});

export const setTags = mutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		tagNames: v.array(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await requireOwnedBookmark(ctx, args.bookmarkId);
		const names = uniqueNames(args.tagNames);
		const now = Date.now();
		const tagIds: Id<'tags'>[] = [];

		for (const name of names) {
			const existing = await ctx.db
				.query('tags')
				.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', name))
				.unique();

			tagIds.push(
				existing
					? existing._id
					: await ctx.db.insert('tags', {
							userId,
							name,
							createdAt: now,
							updatedAt: now
						})
			);
		}

		const currentJoins = await ctx.db
			.query('bookmarkTags')
			.withIndex('by_user_bookmark', (q) =>
				q.eq('userId', userId).eq('bookmarkId', args.bookmarkId)
			)
			.collect();
		for (const join of currentJoins) {
			await ctx.db.delete(join._id);
		}

		for (const tagId of tagIds) {
			await ctx.db.insert('bookmarkTags', {
				userId,
				bookmarkId: args.bookmarkId,
				tagId,
				createdAt: now
			});
		}

		await ctx.db.patch(args.bookmarkId, { updatedAt: now });
		return args.bookmarkId;
	}
});

export const remove = mutation({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		const { userId } = await requireOwnedBookmark(ctx, args.bookmarkId);
		const joins = await ctx.db
			.query('bookmarkTags')
			.withIndex('by_user_bookmark', (q) =>
				q.eq('userId', userId).eq('bookmarkId', args.bookmarkId)
			)
			.collect();
		for (const join of joins) {
			await ctx.db.delete(join._id);
		}

		const chunks = await ctx.db
			.query('bookmarkChunks')
			.withIndex('by_bookmark', (q) => q.eq('bookmarkId', args.bookmarkId))
			.collect();
		for (const chunk of chunks) {
			await ctx.db.delete(chunk._id);
		}

		await ctx.db.delete(args.bookmarkId);
		return args.bookmarkId;
	}
});

import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { normalizeName, requireOwnedCollection, requireUserId } from './helpers';

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const name = normalizeName(args.name);
		if (!name) throw new Error('Collection name is required');

		const existing = await ctx.db
			.query('collections')
			.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', name))
			.unique();
		if (existing) return existing._id;

		const now = Date.now();
		return await ctx.db.insert('collections', {
			userId,
			name,
			description: args.description?.trim() || undefined,
			createdAt: now,
			updatedAt: now
		});
	}
});

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		return await ctx.db
			.query('collections')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
	}
});

export const update = mutation({
	args: {
		collectionId: v.id('collections'),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		await requireOwnedCollection(ctx, args.collectionId);
		const patch: {
			name?: string;
			description?: string;
			updatedAt: number;
		} = {
			updatedAt: Date.now()
		};

		if (args.name !== undefined) {
			const name = normalizeName(args.name);
			if (!name) throw new Error('Collection name is required');
			patch.name = name;
		}
		if (args.description !== undefined) patch.description = args.description.trim() || undefined;

		await ctx.db.patch(args.collectionId, patch);
		return args.collectionId;
	}
});

export const remove = mutation({
	args: {
		collectionId: v.id('collections')
	},
	handler: async (ctx, args) => {
		const { userId } = await requireOwnedCollection(ctx, args.collectionId);
		const bookmarks = await ctx.db
			.query('bookmarks')
			.withIndex('by_user_collection', (q) =>
				q.eq('userId', userId).eq('collectionId', args.collectionId)
			)
			.collect();

		const now = Date.now();
		for (const bookmark of bookmarks) {
			await ctx.db.patch(bookmark._id, {
				collectionId: undefined,
				updatedAt: now
			});
		}

		await ctx.db.delete(args.collectionId);
		return args.collectionId;
	}
});

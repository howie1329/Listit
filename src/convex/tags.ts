import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { normalizeName, requireOwnedTag, requireUserId } from './helpers';

export const create = mutation({
	args: {
		name: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const name = normalizeName(args.name);
		if (!name) throw new Error('Tag name is required');

		const existing = await ctx.db
			.query('tags')
			.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', name))
			.unique();
		if (existing) return existing._id;

		const now = Date.now();
		return await ctx.db.insert('tags', {
			userId,
			name,
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
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
	}
});

export const update = mutation({
	args: {
		tagId: v.id('tags'),
		name: v.string()
	},
	handler: async (ctx, args) => {
		await requireOwnedTag(ctx, args.tagId);
		const name = normalizeName(args.name);
		if (!name) throw new Error('Tag name is required');

		await ctx.db.patch(args.tagId, {
			name,
			updatedAt: Date.now()
		});
		return args.tagId;
	}
});

export const remove = mutation({
	args: {
		tagId: v.id('tags')
	},
	handler: async (ctx, args) => {
		const { userId } = await requireOwnedTag(ctx, args.tagId);
		const joins = await ctx.db
			.query('bookmarkTags')
			.withIndex('by_tag', (q) => q.eq('tagId', args.tagId))
			.collect();

		for (const join of joins) {
			if (join.userId === userId) {
				await ctx.db.delete(join._id);
			}
		}

		await ctx.db.delete(args.tagId);
		return args.tagId;
	}
});

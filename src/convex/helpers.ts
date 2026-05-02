import { getAuthUserId } from '@convex-dev/auth/server';

import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

const TRACKING_PARAMS = new Set([
	'fbclid',
	'gclid',
	'gbraid',
	'igshid',
	'msclkid',
	'ref',
	'ref_src',
	'utm_campaign',
	'utm_content',
	'utm_medium',
	'utm_source',
	'utm_term'
]);

type AuthedCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: AuthedCtx) {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error('Authentication required');
	}
	return userId;
}

export async function requireOwnedBookmark(ctx: AuthedCtx, bookmarkId: Id<'bookmarks'>) {
	const userId = await requireUserId(ctx);
	const bookmark = await ctx.db.get(bookmarkId);
	if (!bookmark || bookmark.userId !== userId) {
		throw new Error('Unauthorized');
	}
	return { userId, bookmark };
}

export async function requireOwnedCollection(ctx: AuthedCtx, collectionId: Id<'collections'>) {
	const userId = await requireUserId(ctx);
	const collection = await ctx.db.get(collectionId);
	if (!collection || collection.userId !== userId) {
		throw new Error('Unauthorized');
	}
	return { userId, collection };
}

export async function requireOwnedTag(ctx: AuthedCtx, tagId: Id<'tags'>) {
	const userId = await requireUserId(ctx);
	const tag = await ctx.db.get(tagId);
	if (!tag || tag.userId !== userId) {
		throw new Error('Unauthorized');
	}
	return { userId, tag };
}

export function normalizeUrl(input: string) {
	const parsed = new URL(input.trim());
	parsed.protocol = parsed.protocol.toLowerCase();
	parsed.hostname = parsed.hostname.toLowerCase();
	parsed.hash = '';

	const entries = Array.from(parsed.searchParams.entries())
		.filter(
			([key]) => !TRACKING_PARAMS.has(key.toLowerCase()) && !key.toLowerCase().startsWith('utm_')
		)
		.sort(([leftKey, leftValue], [rightKey, rightValue]) => {
			const keyOrder = leftKey.localeCompare(rightKey);
			return keyOrder === 0 ? leftValue.localeCompare(rightValue) : keyOrder;
		});

	parsed.search = '';
	for (const [key, value] of entries) {
		parsed.searchParams.append(key, value);
	}

	if (parsed.pathname.length > 1) {
		parsed.pathname = parsed.pathname.replace(/\/+$/, '');
	}

	return parsed.toString();
}

export function stableHash(input: string) {
	let first = 0xdeadbeef;
	let second = 0x41c6ce57;

	for (let index = 0; index < input.length; index += 1) {
		const code = input.charCodeAt(index);
		first = Math.imul(first ^ code, 2654435761);
		second = Math.imul(second ^ code, 1597334677);
	}

	first =
		Math.imul(first ^ (first >>> 16), 2246822507) ^ Math.imul(second ^ (second >>> 13), 3266489909);
	second =
		Math.imul(second ^ (second >>> 16), 2246822507) ^ Math.imul(first ^ (first >>> 13), 3266489909);

	return `${(second >>> 0).toString(16).padStart(8, '0')}${(first >>> 0).toString(16).padStart(8, '0')}`;
}

export function normalizeName(name: string) {
	return name.trim().replace(/\s+/g, ' ');
}

export function uniqueNames(names: string[]) {
	return Array.from(new Set(names.map(normalizeName).filter(Boolean)));
}

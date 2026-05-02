import { v } from 'convex/values';

import { action, internalQuery, mutation } from './_generated/server';
import { api, internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { requireUserId } from './helpers';

const INSUFFICIENT_CONTEXT =
	"I don't have enough saved bookmark context to answer that yet. Save a few more relevant bookmarks and try again.";

type Citation = {
	bookmarkId: Id<'bookmarks'>;
	chunkId?: Id<'bookmarkChunks'>;
	title?: string;
	url: string;
	snippet?: string;
};

type RetrievalContext = {
	chunk: Doc<'bookmarkChunks'>;
	bookmark: Doc<'bookmarks'>;
};

function getOpenAiKey() {
	const key = process.env.OPENAI_API_KEY;
	if (!key) throw new Error('OPENAI_API_KEY is not configured');
	return key;
}

function truncate(input: string, maxLength: number) {
	return input.length > maxLength ? `${input.slice(0, maxLength).trim()}...` : input;
}

function snippet(input: string) {
	return truncate(input.replace(/\s+/g, ' ').trim(), 240);
}

function citationsFromContext(contexts: RetrievalContext[]): Citation[] {
	const seen = new Set<string>();
	const citations: Citation[] = [];

	for (const { chunk, bookmark } of contexts) {
		if (seen.has(bookmark._id)) continue;
		seen.add(bookmark._id);
		citations.push({
			bookmarkId: bookmark._id,
			chunkId: chunk._id,
			title: bookmark.title,
			url: bookmark.url,
			snippet: snippet(chunk.text)
		});
	}

	return citations;
}

async function createEmbedding(input: string) {
	const response = await fetch('https://api.openai.com/v1/embeddings', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${getOpenAiKey()}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
			input
		})
	});

	if (!response.ok) {
		throw new Error(`Embedding request failed with status ${response.status}`);
	}

	const data = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
	const embedding = data.data?.[0]?.embedding;
	if (!embedding || embedding.length !== 1536) {
		throw new Error('Embedding response did not include a 1536-dimension vector');
	}

	return embedding;
}

async function completeJson<T>(system: string, user: string) {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${getOpenAiKey()}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user }
			],
			response_format: { type: 'json_object' },
			temperature: 0.2
		})
	});

	if (!response.ok) {
		throw new Error(`AI request failed with status ${response.status}`);
	}

	const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
	const content = data.choices?.[0]?.message?.content;
	if (!content) throw new Error('AI response was empty');
	return JSON.parse(content) as T;
}

async function completeText(system: string, user: string) {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${getOpenAiKey()}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user }
			],
			temperature: 0.2
		})
	});

	if (!response.ok) {
		throw new Error(`AI request failed with status ${response.status}`);
	}

	const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
	const content = data.choices?.[0]?.message?.content?.trim();
	if (!content) throw new Error('AI response was empty');
	return content;
}

export const searchContext = action({
	args: {
		question: v.string()
	},
	handler: async (ctx, args): Promise<RetrievalContext[]> => {
		const query = args.question.trim();
		if (!query) throw new Error('Question is required');

		const userId = await ctx.runQuery(internal.ai.currentUserId, {});
		const embedding = await createEmbedding(query);
		const results = await ctx.vectorSearch('bookmarkChunks', 'by_embedding', {
			vector: embedding,
			limit: 6,
			filter: (q) => q.eq('userId', userId)
		});

		if (results.length === 0) return [];

		return await ctx.runQuery(internal.ai.contextForChunks, {
			chunkIds: results.map((result) => result._id)
		});
	}
});

export const ask = action({
	args: {
		question: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<{
		answer: string;
		citations: Citation[];
	}> => {
		const contexts: RetrievalContext[] = await ctx.runAction(api.ai.searchContext, {
			question: args.question
		});

		if (contexts.length === 0) {
			return { answer: INSUFFICIENT_CONTEXT, citations: [] };
		}

		const contextText = contexts
			.map(({ chunk, bookmark }, index) => {
				return `Source ${index + 1}: ${bookmark.title ?? bookmark.url}\nURL: ${bookmark.url}\nText: ${truncate(chunk.text, 1800)}`;
			})
			.join('\n\n');

		const answer = await completeText(
			'Answer using only the provided bookmark context. Be concise. If the context is insufficient, say so.',
			`Question: ${args.question.trim()}\n\nBookmark context:\n${contextText}`
		);

		return {
			answer,
			citations: citationsFromContext(contexts)
		};
	}
});

export const currentUserId = internalQuery({
	args: {},
	handler: async (ctx) => {
		return await requireUserId(ctx);
	}
});

export const contextForChunks = internalQuery({
	args: {
		chunkIds: v.array(v.id('bookmarkChunks'))
	},
	handler: async (ctx, args): Promise<RetrievalContext[]> => {
		const userId = await requireUserId(ctx);
		const contexts: RetrievalContext[] = [];

		for (const chunkId of args.chunkIds) {
			const chunk = await ctx.db.get(chunkId);
			if (!chunk || chunk.userId !== userId) continue;

			const bookmark = await ctx.db.get(chunk.bookmarkId);
			if (!bookmark || bookmark.userId !== userId) continue;

			contexts.push({ chunk, bookmark });
		}

		return contexts;
	}
});

export const createChatThread = mutation({
	args: {
		title: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const now = Date.now();
		return await ctx.db.insert('chatThreads', {
			userId,
			title: args.title,
			createdAt: now,
			updatedAt: now
		});
	}
});

export const saveChatMessage = mutation({
	args: {
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
		)
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const thread = await ctx.db.get(args.threadId);
		if (!thread || thread.userId !== userId) throw new Error('Unauthorized');

		const now = Date.now();
		const messageId = await ctx.db.insert('chatMessages', {
			userId,
			threadId: args.threadId,
			role: args.role,
			content: args.content,
			citations: args.citations,
			createdAt: now
		});

		await ctx.db.patch(args.threadId, { updatedAt: now });
		return messageId;
	}
});

export const chat = action({
	args: {
		threadId: v.optional(v.id('chatThreads')),
		message: v.string()
	},
	handler: async (
		ctx,
		args
	): Promise<{
		threadId: Id<'chatThreads'>;
		userMessageId: Id<'chatMessages'>;
		assistantMessageId: Id<'chatMessages'>;
		answer: string;
		citations: Citation[];
	}> => {
		const message = args.message.trim();
		if (!message) throw new Error('Message is required');

		const threadId: Id<'chatThreads'> =
			args.threadId ??
			(await ctx.runMutation(api.ai.createChatThread, {
				title: truncate(message, 80)
			}));
		const userMessageId: Id<'chatMessages'> = await ctx.runMutation(api.ai.saveChatMessage, {
			threadId,
			role: 'user',
			content: message
		});
		const response: { answer: string; citations: Citation[] } = await ctx.runAction(api.ai.ask, {
			question: message
		});
		const assistantMessageId: Id<'chatMessages'> = await ctx.runMutation(api.ai.saveChatMessage, {
			threadId,
			role: 'assistant',
			content: response.answer,
			citations: response.citations
		});

		return {
			threadId,
			userMessageId,
			assistantMessageId,
			answer: response.answer,
			citations: response.citations
		};
	}
});

export const organizeBookmark = action({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		const detail: { bookmark: Doc<'bookmarks'> } = await ctx.runQuery(api.bookmarks.get, {
			bookmarkId: args.bookmarkId
		});
		const text = detail.bookmark.extractedText?.trim();
		if (!text) throw new Error('Bookmark must be enriched before auto-organization');

		try {
			const result = await completeJson<{
				suggestedTags?: string[];
				suggestedTopics?: string[];
				suggestedCollections?: string[];
			}>(
				'Return JSON with suggestedTags, suggestedTopics, and suggestedCollections arrays. Keep each array short.',
				`URL: ${detail.bookmark.url}\nTitle: ${detail.bookmark.title ?? ''}\nContent:\n${truncate(text, 12000)}`
			);

			const suggestedTags = result.suggestedTags?.slice(0, 8) ?? [];
			const suggestedTopics = result.suggestedTopics?.slice(0, 8) ?? [];
			const suggestedCollections = result.suggestedCollections?.slice(0, 5) ?? [];

			await ctx.runMutation(internal.enrichment.saveAutoOrganizationSuccess, {
				bookmarkId: args.bookmarkId,
				suggestedTags,
				suggestedTopics,
				suggestedCollections
			});

			return {
				bookmarkId: args.bookmarkId,
				suggestedTags,
				suggestedTopics,
				suggestedCollections
			};
		} catch (error) {
			await ctx.runMutation(internal.enrichment.saveAutoOrganizationFailure, {
				bookmarkId: args.bookmarkId,
				error: error instanceof Error ? error.message : 'Auto-organization failed'
			});
			throw error;
		}
	}
});

export const generateAutoNote = action({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		const detail: { bookmark: Doc<'bookmarks'> } = await ctx.runQuery(api.bookmarks.get, {
			bookmarkId: args.bookmarkId
		});
		const bookmark = detail.bookmark;
		if (!bookmark.autoNoteEnabled) throw new Error('Auto notes are disabled for this bookmark');
		if (!bookmark.extractedText?.trim())
			throw new Error('Bookmark must be enriched before auto notes');

		try {
			const note = await completeText(
				'Create a concise, readable personal note from the saved page. Use Markdown headings and bullets only when helpful.',
				`URL: ${bookmark.url}\nTitle: ${bookmark.title ?? ''}\nContent:\n${truncate(bookmark.extractedText, 14000)}`
			);

			await ctx.runMutation(internal.enrichment.saveAutoNoteSuccess, {
				bookmarkId: args.bookmarkId,
				note
			});

			return { bookmarkId: args.bookmarkId, status: 'complete' };
		} catch (error) {
			await ctx.runMutation(internal.enrichment.saveAutoNoteFailure, {
				bookmarkId: args.bookmarkId,
				error: error instanceof Error ? error.message : 'Auto-note generation failed'
			});
			throw error;
		}
	}
});

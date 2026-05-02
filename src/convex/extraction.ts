'use node';

import { Firecrawl } from '@mendable/firecrawl-js';
import { v } from 'convex/values';

import { action } from './_generated/server';
import { api, internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';

const EXTRACTED_TEXT_LIMIT = 60_000;
const CHUNK_SIZE = 1_500;

function truncate(input: string, maxLength: number) {
	return input.length > maxLength ? input.slice(0, maxLength).trim() : input;
}

function chunkText(input: string) {
	const chunks: string[] = [];
	for (let index = 0; index < input.length; index += CHUNK_SIZE) {
		const chunk = input.slice(index, index + CHUNK_SIZE).trim();
		if (chunk) chunks.push(chunk);
	}
	return chunks;
}

function getOpenAiKey() {
	const key = process.env.OPENAI_API_KEY;
	if (!key) throw new Error('OPENAI_API_KEY is not configured');
	return key;
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

export const enrichBookmark = action({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		const detail: { bookmark: Doc<'bookmarks'> } = await ctx.runQuery(api.bookmarks.get, {
			bookmarkId: args.bookmarkId
		});
		const bookmark = detail.bookmark;

		try {
			const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
			const document = await firecrawl.scrape(bookmark.url, { formats: ['markdown'] });
			const extractedText = truncate(
				(document.markdown ?? document.html ?? document.rawHtml ?? '').trim(),
				EXTRACTED_TEXT_LIMIT
			);

			if (!extractedText) {
				throw new Error('Extraction returned no readable content');
			}

			await ctx.runMutation(internal.enrichment.saveExtractionSuccess, {
				bookmarkId: args.bookmarkId,
				extractedText,
				title: document.metadata?.title,
				description: document.metadata?.description,
				siteName: document.metadata?.sourceURL
			});

			const chunks = await Promise.all(
				chunkText(extractedText).map(async (text) => ({
					text,
					source: 'extracted' as const,
					embedding: await createEmbedding(text)
				}))
			);

			await ctx.runMutation(internal.enrichment.replaceChunks, {
				bookmarkId: args.bookmarkId,
				chunks
			});

			return { bookmarkId: args.bookmarkId, status: 'enriched' };
		} catch (error) {
			await ctx.runMutation(internal.enrichment.saveExtractionFailure, {
				bookmarkId: args.bookmarkId,
				error: error instanceof Error ? error.message : 'Extraction failed'
			});
			throw error;
		}
	}
});

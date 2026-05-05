'use node';

import Firecrawl from '@mendable/firecrawl-js';
import type { DocumentMetadata } from '@mendable/firecrawl-js';
import { v } from 'convex/values';

import { internal } from './_generated/api';
import { internalAction } from './_generated/server';

const MAX_EXTRACTED_TEXT_LENGTH = 100_000;

function cleanOptionalText(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getExtractionError(error: unknown) {
	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}
	return 'Extraction failed.';
}

function truncateExtractedText(text: string) {
	return text.length > MAX_EXTRACTED_TEXT_LENGTH ? text.slice(0, MAX_EXTRACTED_TEXT_LENGTH) : text;
}

function metadataFromFirecrawl(metadata: DocumentMetadata | undefined) {
	return {
		title: cleanOptionalText(metadata?.title ?? metadata?.ogTitle),
		description: cleanOptionalText(metadata?.description ?? metadata?.ogDescription),
		siteName: cleanOptionalText(metadata?.ogSiteName),
		faviconUrl: cleanOptionalText(metadata?.favicon),
		imageUrl: cleanOptionalText(metadata?.ogImage),
		canonicalUrl: cleanOptionalText(metadata?.ogUrl ?? metadata?.url ?? metadata?.sourceURL)
	};
}

export const processBookmark = internalAction({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		try {
			const target: { url: string } | null = await ctx.runQuery(
				internal.enrichment.getExtractionTarget,
				{
					bookmarkId: args.bookmarkId
				}
			);
			if (!target) return;

			if (!process.env.FIRECRAWL_API_KEY) {
				throw new Error('FIRECRAWL_API_KEY is not configured.');
			}

			const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
			const result = await firecrawl.scrape(target.url, {
				formats: ['markdown'],
				onlyMainContent: true
			});
			const extractedText = cleanOptionalText(result.markdown);

			if (!extractedText) {
				throw new Error('FireCrawl did not return extracted text.');
			}

			await ctx.runMutation(internal.enrichment.saveExtractionSuccess, {
				bookmarkId: args.bookmarkId,
				extractedText: truncateExtractedText(extractedText),
				...metadataFromFirecrawl(result.metadata)
			});
		} catch (error) {
			await ctx.runMutation(internal.enrichment.saveExtractionFailure, {
				bookmarkId: args.bookmarkId,
				error: getExtractionError(error)
			});
		}
	}
});

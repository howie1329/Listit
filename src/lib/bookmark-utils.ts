import type { Doc } from '../convex/_generated/dataModel';

export function getHostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}

export function getDisplayTitle(bookmark: Doc<'bookmarks'>) {
	return bookmark.title?.trim() || getHostname(bookmark.url) || bookmark.url;
}

const MAX_ERROR_DETAIL_LENGTH = 140;

export type BookmarkReadinessState = 'extracting' | 'ready' | 'no_text' | 'failed';

function getConciseExtractionError(error?: string) {
	const trimmed = error?.trim();
	if (!trimmed) return null;
	return trimmed.length > MAX_ERROR_DETAIL_LENGTH
		? `${trimmed.slice(0, MAX_ERROR_DETAIL_LENGTH - 1).trim()}…`
		: trimmed;
}

export function getBookmarkReadiness(bookmark: Doc<'bookmarks'>) {
	if (bookmark.extractionStatus === 'failed') {
		return {
			state: 'failed' as const,
			label: 'Failed',
			context: 'Extraction failed. This bookmark is not ready for grounded answers yet.',
			contentUnavailableMessage: 'Extraction failed before reader text was saved.',
			errorDetail: getConciseExtractionError(bookmark.extractionError)
		};
	}

	if (bookmark.extractionStatus === 'pending') {
		return {
			state: 'extracting' as const,
			label: 'Extracting',
			context:
				'Reader text is still being extracted. This bookmark is not ready for grounded answers yet.',
			contentUnavailableMessage: 'Reader text will appear here after extraction finishes.',
			errorDetail: null
		};
	}

	if (bookmark.extractedText?.trim()) {
		return {
			state: 'ready' as const,
			label: 'Ready',
			context: 'Extracted text is ready for grounded answers.',
			contentUnavailableMessage: null,
			errorDetail: null
		};
	}

	return {
		state: 'no_text' as const,
		label: 'No text',
		context: 'Extraction finished, but no reader text is available.',
		contentUnavailableMessage: 'No extracted reader text is available for this bookmark.',
		errorDetail: null
	};
}

export function getExtractionContext(bookmark: Doc<'bookmarks'>) {
	return getBookmarkReadiness(bookmark).context;
}

export function formatDate(timestamp?: number) {
	if (!timestamp) return null;
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(timestamp);
}

export function normalizeTagName(name: string) {
	return name.trim().replace(/\s+/g, ' ');
}

export function normalizeTagNames(names: string[]) {
	return Array.from(new Set(names.map(normalizeTagName).filter(Boolean)));
}

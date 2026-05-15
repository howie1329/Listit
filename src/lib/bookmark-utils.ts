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

export function getExtractionContext(bookmark: Doc<'bookmarks'>) {
	if (bookmark.extractionStatus === 'enriched') {
		return 'Extracted text is ready for grounded answers.';
	}
	if (bookmark.extractionStatus === 'failed') {
		return bookmark.extractionError || 'Extraction failed. Retry when you are ready.';
	}
	return 'This bookmark becomes stronger context after enrichment finishes.';
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

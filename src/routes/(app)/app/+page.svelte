<script lang="ts">
	import {
		ArrowRight01Icon,
		CheckmarkCircle02Icon,
		Clock01Icon,
		InformationCircleIcon,
		Link01Icon,
		NoteEditIcon,
		PlusSignIcon,
		SearchList01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { postAppApi } from '$lib/app-api';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Textarea } from '$lib/components/ui/textarea';
	import { api } from '../../../convex/_generated/api.js';
	import type { Doc, Id } from '../../../convex/_generated/dataModel';
	import { convexAuth } from '$lib/convex-auth.svelte';
	import { cn } from '$lib/utils';

	type Bookmark = Doc<'bookmarks'>;
	type SaveResult = {
		bookmarkId: Id<'bookmarks'>;
		created: boolean;
	};
	type Feedback = {
		type: 'success' | 'error' | 'info';
		message: string;
	};

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;
	const bookmarksQuery = convexClient
		? useQuery(api.bookmarks.list, () =>
				!convexAuth.isLoading && convexAuth.isAuthenticated ? {} : 'skip'
			)
		: null;

	let url = $state('');
	let isSaving = $state(false);
	let selectedBookmarkId = $state<Id<'bookmarks'> | null>(null);
	let feedback = $state<Feedback | null>(null);
	const bookmarks: Bookmark[] = $derived((bookmarksQuery?.data ?? []) as Bookmark[]);
	const selectedBookmark = $derived(
		bookmarks.find((bookmark) => bookmark._id === selectedBookmarkId) ?? bookmarks[0] ?? null
	);

	const statusIcon: Record<Bookmark['extractionStatus'], typeof CheckmarkCircle02Icon> = {
		enriched: CheckmarkCircle02Icon,
		pending: Clock01Icon,
		failed: InformationCircleIcon
	};

	function titleFor(bookmark: Bookmark) {
		return bookmark.title || hostnameFor(bookmark.url);
	}

	function hostnameFor(urlValue: string) {
		try {
			return new URL(urlValue).hostname.replace(/^www\./, '');
		} catch {
			return urlValue;
		}
	}

	function statusLabel(status: Bookmark['extractionStatus']) {
		if (status === 'enriched') return 'Enriched';
		if (status === 'failed') return 'Failed';
		return 'Pending';
	}

	function getValidUrl(value: string) {
		try {
			const parsed = new URL(value.trim());
			return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
		} catch {
			return null;
		}
	}

	async function enrichBookmark(bookmarkId: Id<'bookmarks'>) {
		try {
			await postAppApi(`/api/bookmarks/${bookmarkId}/enrich`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unable to enrich this bookmark.';
			toast.error(message);
		}
	}

	async function askWithBookmark(bookmark: Bookmark) {
		const params = new URLSearchParams({
			bookmarkId: bookmark._id,
			q: `What should I remember from ${titleFor(bookmark)}?`
		});

		await goto(resolve(`/app/ask?${params.toString()}`));
	}

	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		feedback = null;

		if (!convexClient) {
			const message = 'Add VITE_CONVEX_URL before saving bookmarks locally.';
			feedback = { type: 'error', message };
			toast.error(message);
			return;
		}

		const validUrl = getValidUrl(url);
		if (!validUrl) {
			const message = 'Enter a full http:// or https:// URL.';
			feedback = { type: 'error', message };
			toast.error(message);
			return;
		}

		isSaving = true;

		try {
			const result = (await convexClient.mutation(api.bookmarks.saveUrl, {
				url: validUrl
			})) as SaveResult;
			const message = result.created ? 'Bookmark saved.' : 'Already saved. Bookmark updated.';

			selectedBookmarkId = result.bookmarkId;
			url = '';
			feedback = { type: 'success', message };
			toast.success(message);
			if (result.created) {
				void enrichBookmark(result.bookmarkId);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unable to save this URL right now.';
			feedback = { type: 'error', message };
			toast.error(message);
		} finally {
			isSaving = false;
		}
	}
</script>

<div
	class="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_24rem]"
>
	<section class="flex min-h-0 flex-col">
		<div class="border-b border-border/60 px-4 py-3">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 class="font-heading text-xl font-semibold">Library</h1>
					<p class="mt-1 text-sm text-muted-foreground">
						Save links, track enrichment, and keep notes close to the source.
					</p>
				</div>
				<Button size="sm" class="w-fit">
					<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
					New collection
				</Button>
			</div>

			<form class="mt-4" onsubmit={handleSave}>
				<InputGroup.InputGroup>
					<InputGroup.InputGroupAddon>
						<HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
					</InputGroup.InputGroupAddon>
					<InputGroup.InputGroupInput
						placeholder="Paste a URL to save it..."
						type="url"
						bind:value={url}
						disabled={isSaving}
					/>
					<InputGroup.InputGroupButton type="submit" size="sm" disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save'}
					</InputGroup.InputGroupButton>
				</InputGroup.InputGroup>
				{#if feedback}
					<p
						class={cn(
							'mt-2 text-xs',
							feedback.type === 'error' ? 'text-destructive' : 'text-muted-foreground'
						)}
					>
						{feedback.message}
					</p>
				{/if}
			</form>
		</div>

		<div
			class="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 border-b border-border/60 px-4 py-2 text-[11px] font-medium text-muted-foreground uppercase"
		>
			<span>Bookmark</span>
			<span class="hidden sm:block">Status</span>
			<span class="hidden md:block">Tags</span>
		</div>

		<ScrollArea.ScrollArea class="min-h-0 flex-1">
			<div class="flex flex-col gap-1 p-2">
				{#if !convexClient}
					<p class="px-3 py-6 text-sm text-destructive">
						Add VITE_CONVEX_URL before loading bookmarks locally.
					</p>
				{:else if convexAuth.isLoading}
					<p class="px-3 py-6 text-sm text-muted-foreground">Loading bookmarks...</p>
				{:else if !convexAuth.isAuthenticated}
					<p class="px-3 py-6 text-sm text-muted-foreground">Sign in to load your bookmarks.</p>
				{:else if bookmarksQuery?.isLoading}
					<p class="px-3 py-6 text-sm text-muted-foreground">Loading bookmarks...</p>
				{:else if bookmarksQuery?.error}
					<p class="px-3 py-6 text-sm text-destructive">
						{bookmarksQuery.error?.message}
					</p>
				{:else if bookmarks.length === 0}
					<p class="px-3 py-6 text-sm text-muted-foreground">
						Save your first URL to start building your library.
					</p>
				{:else}
					{#each bookmarks as bookmark (bookmark._id)}
						<button
							type="button"
							onclick={() => (selectedBookmarkId = bookmark._id)}
							class={cn(
								'grid min-h-16 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent sm:grid-cols-[minmax(0,1fr)_7rem] md:grid-cols-[minmax(0,1fr)_7rem_13rem]',
								selectedBookmark?._id === bookmark._id && 'bg-accent text-accent-foreground'
							)}
						>
							<span class="min-w-0">
								<span class="block truncate text-sm font-medium">{titleFor(bookmark)}</span>
								<span class="mt-1 block truncate text-xs text-muted-foreground"
									>{hostnameFor(bookmark.url)}</span
								>
							</span>
							<span class="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
								<HugeiconsIcon icon={statusIcon[bookmark.extractionStatus]} strokeWidth={2} />
								{statusLabel(bookmark.extractionStatus)}
							</span>
							<span class="hidden min-w-0 items-center gap-1.5 md:flex">
								{#each bookmark.suggestedTags.slice(0, 3) as tag (tag)}
									<span
										class="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
									>
										{tag}
									</span>
								{/each}
								{#if bookmark.suggestedTags.length === 0}
									<span class="text-[11px] text-muted-foreground">No tags yet</span>
								{/if}
							</span>
						</button>
					{/each}
				{/if}
			</div>
		</ScrollArea.ScrollArea>
	</section>

	<aside class="hidden min-h-0 border-l border-border/60 lg:flex lg:flex-col">
		<div class="border-b border-border/60 px-4 py-3">
			<p class="text-[11px] font-medium text-muted-foreground uppercase">Selected bookmark</p>
			<h2 class="mt-2 text-base font-semibold">
				{selectedBookmark ? titleFor(selectedBookmark) : 'No bookmark selected'}
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				{selectedBookmark ? hostnameFor(selectedBookmark.url) : 'Save a URL to preview it here.'}
			</p>
		</div>

		<ScrollArea.ScrollArea class="min-h-0 flex-1">
			<div class="flex flex-col gap-5 p-4">
				<section>
					<div class="flex items-center gap-2">
						<HugeiconsIcon
							icon={SearchList01Icon}
							strokeWidth={2}
							class="size-4 text-muted-foreground"
						/>
						<h3 class="text-sm font-medium">Reader preview</h3>
					</div>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">
						{#if selectedBookmark?.extractedText}
							{selectedBookmark.extractedText}
						{:else if selectedBookmark?.extractionStatus === 'failed'}
							Extraction failed. The original URL is still saved.
						{:else if selectedBookmark}
							Extraction is pending for this bookmark.
						{:else}
							Saved bookmark content will appear here after enrichment.
						{/if}
					</p>
				</section>

				<section>
					<div class="flex items-center gap-2">
						<HugeiconsIcon
							icon={NoteEditIcon}
							strokeWidth={2}
							class="size-4 text-muted-foreground"
						/>
						<h3 class="text-sm font-medium">Note</h3>
					</div>
					<Textarea
						class="mt-3 min-h-36 resize-none"
						value={selectedBookmark?.note ?? 'Notes will be editable in a later pass.'}
						readonly
					/>
				</section>

				<section class="rounded-lg border border-border/60 p-3">
					<p class="text-sm font-medium">Ask context</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						This bookmark is ready to cite in grounded answers once retrieval is wired.
					</p>
					<Button
						variant="ghost"
						size="sm"
						class="mt-3 px-0"
						disabled={!selectedBookmark}
						onclick={() => selectedBookmark && askWithBookmark(selectedBookmark)}
					>
						Ask with this bookmark
						<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
					</Button>
				</section>
			</div>
		</ScrollArea.ScrollArea>
	</aside>
</div>

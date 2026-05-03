<script lang="ts">
	import {
		ArrowRight01Icon,
		CheckmarkCircle02Icon,
		Clock01Icon,
		Link01Icon,
		MagicWand01Icon,
		NoteEditIcon,
		PlusSignIcon,
		SearchList01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Textarea } from '$lib/components/ui/textarea';
	import { cn } from '$lib/utils';

	type BookmarkRow = {
		bookmark: Doc<'bookmarks'>;
		tags: Doc<'tags'>[];
		collection: Doc<'collections'> | null;
	};

	const convexClient = useConvexClient();
	const bookmarksResponse = useQuery(api.bookmarks.list, {});
	const rows = $derived((bookmarksResponse.data ?? []) as BookmarkRow[]);
	let selectedBookmarkId = $state<string | null>(null);
	let url = $state('');
	let saveError = $state('');
	let isSaving = $state(false);

	const selectedRow = $derived(
		rows.find((row) => row.bookmark._id === selectedBookmarkId) ?? rows[0] ?? null
	);

	const statusMeta = {
		pending: { label: 'Pending', icon: Clock01Icon },
		enriched: { label: 'Enriched', icon: CheckmarkCircle02Icon },
		failed: { label: 'Failed', icon: MagicWand01Icon }
	};

	function getDisplayTitle(bookmark: Doc<'bookmarks'>) {
		return bookmark.title?.trim() || getHostname(bookmark.url) || bookmark.url;
	}

	function getHostname(url: string) {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	}

	function getReaderPreview(bookmark: Doc<'bookmarks'>) {
		return (
			bookmark.description?.trim() ||
			bookmark.extractedText?.trim().slice(0, 320) ||
			'Extraction has not added reader text for this bookmark yet.'
		);
	}

	function getTags(row: BookmarkRow) {
		return row.tags.map((tag) => tag.name);
	}

	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		const trimmedUrl = url.trim();
		if (!trimmedUrl) return;

		isSaving = true;
		saveError = '';

		try {
			const bookmarkId = await convexClient.mutation(api.bookmarks.saveUrl, { url: trimmedUrl });
			selectedBookmarkId = bookmarkId;
			url = '';
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Could not save this URL.';
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
						bind:value={url}
						placeholder="Paste a URL to save it..."
						type="url"
						disabled={isSaving}
					/>
					<InputGroup.InputGroupButton type="submit" size="sm" disabled={isSaving || !url.trim()}>
						{isSaving ? 'Saving...' : 'Save'}
					</InputGroup.InputGroupButton>
				</InputGroup.InputGroup>
				{#if saveError}
					<p class="mt-2 text-sm text-destructive">{saveError}</p>
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
			{#if bookmarksResponse.isLoading}
				<div class="flex flex-col gap-2 p-2">
					{#each Array.from({ length: 6 }) as _, index (index)}
						<div
							class="grid min-h-16 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg px-3 py-2 sm:grid-cols-[minmax(0,1fr)_7rem] md:grid-cols-[minmax(0,1fr)_7rem_13rem]"
						>
							<div class="space-y-2">
								<Skeleton class="h-4 w-2/3" />
								<Skeleton class="h-3 w-1/3" />
							</div>
							<Skeleton class="hidden h-4 w-20 sm:block" />
							<Skeleton class="hidden h-5 w-32 md:block" />
						</div>
					{/each}
				</div>
			{:else if bookmarksResponse.error}
				<div class="p-4">
					<p class="text-sm text-destructive">
						Bookmarks could not load. {bookmarksResponse.error.message}
					</p>
				</div>
			{:else if rows.length === 0}
				<div class="flex min-h-96 p-4">
					<Empty.Empty class="border border-border/60">
						<Empty.EmptyHeader>
							<Empty.EmptyMedia>
								<HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
							</Empty.EmptyMedia>
							<Empty.EmptyTitle>No bookmarks yet</Empty.EmptyTitle>
							<Empty.EmptyDescription>
								Paste a URL above to start building your library.
							</Empty.EmptyDescription>
						</Empty.EmptyHeader>
					</Empty.Empty>
				</div>
			{:else}
				<div class="flex flex-col gap-1 p-2">
					{#each rows as row (row.bookmark._id)}
						{@const status = statusMeta[row.bookmark.extractionStatus]}
						{@const tags = getTags(row)}
						<button
							type="button"
							onclick={() => (selectedBookmarkId = row.bookmark._id)}
							class={cn(
								'grid min-h-16 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent sm:grid-cols-[minmax(0,1fr)_7rem] md:grid-cols-[minmax(0,1fr)_7rem_13rem]',
								selectedRow?.bookmark._id === row.bookmark._id && 'bg-accent text-accent-foreground'
							)}
						>
							<span class="min-w-0">
								<span class="block truncate text-sm font-medium">{getDisplayTitle(row.bookmark)}</span>
								<span class="mt-1 block truncate text-xs text-muted-foreground">
									{row.bookmark.siteName || getHostname(row.bookmark.url)}
									{#if row.collection}
										<span class="mx-1">/</span>{row.collection.name}
									{/if}
								</span>
							</span>
							<span class="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
								<HugeiconsIcon icon={status.icon} strokeWidth={2} />
								{status.label}
							</span>
							<span class="hidden min-w-0 items-center gap-1.5 md:flex">
								{#if tags.length}
									{#each tags.slice(0, 3) as tag (tag)}
										<span
											class="max-w-24 truncate rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
										>
											{tag}
										</span>
									{/each}
								{:else}
									<span class="text-xs text-muted-foreground">No tags</span>
								{/if}
							</span>
						</button>
					{/each}
				</div>
			{/if}
		</ScrollArea.ScrollArea>
	</section>

	<aside class="hidden min-h-0 border-l border-border/60 lg:flex lg:flex-col">
		{#if selectedRow}
			<div class="border-b border-border/60 px-4 py-3">
				<p class="text-[11px] font-medium text-muted-foreground uppercase">Selected bookmark</p>
				<h2 class="mt-2 truncate text-base font-semibold">{getDisplayTitle(selectedRow.bookmark)}</h2>
				<p class="mt-1 truncate text-sm text-muted-foreground">
					{selectedRow.bookmark.siteName || getHostname(selectedRow.bookmark.url)}
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
						<p class="mt-3 line-clamp-6 text-sm leading-6 text-muted-foreground">
							{getReaderPreview(selectedRow.bookmark)}
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
							value={selectedRow.bookmark.note ?? ''}
							placeholder="No note yet."
							readonly
						/>
					</section>

					<section class="rounded-lg border border-border/60 p-3">
						<p class="text-sm font-medium">Ask context</p>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							{selectedRow.bookmark.extractionStatus === 'enriched'
								? 'This bookmark has extracted text ready for grounded answers.'
								: 'This bookmark will be available as stronger context after enrichment finishes.'}
						</p>
						<Button variant="ghost" size="sm" class="mt-3 px-0">
							Ask with this bookmark
							<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
						</Button>
					</section>
				</div>
			</ScrollArea.ScrollArea>
		{:else}
			<div class="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
				Select a bookmark to preview it here.
			</div>
		{/if}
	</aside>
</div>

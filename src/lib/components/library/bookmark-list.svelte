<script lang="ts">
	import {
		CheckmarkCircle02Icon,
		Clock01Icon,
		Link01Icon,
		MagicWand01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import * as Empty from '$lib/components/ui/empty';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { getDisplayTitle, getHostname } from '$lib/bookmark-utils';
	import { cn } from '$lib/utils';
	import type { Doc, Id } from '../../../convex/_generated/dataModel';

	type BookmarkRow = {
		bookmark: Doc<'bookmarks'>;
		tags: Doc<'tags'>[];
		collection: Doc<'collections'> | null;
	};

	interface Props {
		rows: BookmarkRow[];
		isLoading: boolean;
		error?: Error | null;
		selectedBookmarkId?: Id<'bookmarks'> | null;
		onselect: (bookmarkId: Id<'bookmarks'>) => void;
	}

	let { rows, isLoading, error = null, selectedBookmarkId = null, onselect }: Props = $props();

	const skeletonRows = [0, 1, 2, 3, 4, 5];
	const statusMeta = {
		pending: { label: 'Pending', icon: Clock01Icon },
		enriched: { label: 'Enriched', icon: CheckmarkCircle02Icon },
		failed: { label: 'Failed', icon: MagicWand01Icon }
	};

	function getTags(row: BookmarkRow) {
		return row.tags.map((tag) => tag.name);
	}

	function getCollectionName(row: BookmarkRow) {
		return row.collection?.name ?? 'Unassigned';
	}
</script>

<div
	class="grid h-9 grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-3 border-b border-border/50 px-4 text-[11px] font-medium text-muted-foreground uppercase sm:grid-cols-[minmax(0,1fr)_7rem_8rem] lg:grid-cols-[minmax(0,1fr)_7rem_8rem_12rem]"
>
	<span>Bookmark</span>
	<span>Status</span>
	<span class="hidden sm:block">Collection</span>
	<span class="hidden lg:block">Tags</span>
</div>

<ScrollArea.ScrollArea class="min-h-0 flex-1">
	{#if isLoading}
		<div class="flex flex-col gap-1 p-2">
			{#each skeletonRows as index (index)}
				<div
					class="grid h-11 grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-3 rounded-md px-2 sm:grid-cols-[minmax(0,1fr)_7rem_8rem] lg:grid-cols-[minmax(0,1fr)_7rem_8rem_12rem]"
				>
					<div class="space-y-2">
						<Skeleton class="h-3.5 w-2/3" />
						<Skeleton class="h-3 w-1/3" />
					</div>
					<Skeleton class="h-4 w-16" />
					<Skeleton class="hidden h-4 w-20 sm:block" />
					<Skeleton class="hidden h-5 w-28 lg:block" />
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="p-4">
			<p class="text-sm text-destructive">Bookmarks could not load. {error.message}</p>
		</div>
	{:else if rows.length === 0}
		<div class="flex min-h-96 p-4">
			<Empty.Empty class="border-0">
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
					onclick={() => onselect(row.bookmark._id)}
					class={cn(
						'grid h-11 grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-3 rounded-md px-2 text-left transition-colors hover:bg-accent sm:grid-cols-[minmax(0,1fr)_7rem_8rem] lg:grid-cols-[minmax(0,1fr)_7rem_8rem_12rem]',
						selectedBookmarkId === row.bookmark._id && 'bg-accent text-accent-foreground'
					)}
				>
					<span class="min-w-0">
						<span class="block truncate text-xs leading-tight font-medium">
							{getDisplayTitle(row.bookmark)}
						</span>
						<span class="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground">
							{row.bookmark.siteName || getHostname(row.bookmark.url)}
						</span>
					</span>
					<span class="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
						<HugeiconsIcon icon={status.icon} strokeWidth={2} class="size-3.5 shrink-0" />
						<span class="truncate">{status.label}</span>
					</span>
					<span class="hidden truncate text-[11px] text-muted-foreground sm:block">
						{getCollectionName(row)}
					</span>
					<span class="hidden min-w-0 items-center gap-1.5 lg:flex">
						{#if tags.length}
							{#each tags.slice(0, 3) as tag (tag)}
								<span
									class="max-w-24 truncate rounded-sm bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
								>
									{tag}
								</span>
							{/each}
						{:else}
							<span class="text-[11px] text-muted-foreground">No tags</span>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</ScrollArea.ScrollArea>

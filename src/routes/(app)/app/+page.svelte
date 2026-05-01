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
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Textarea } from '$lib/components/ui/textarea';
	import { cn } from '$lib/utils';

	type Bookmark = {
		title: string;
		source: string;
		status: 'Enriched' | 'Pending' | 'Tagged';
		tags: string[];
		selected?: boolean;
	};

	const bookmarks: Bookmark[] = [
		{
			title: 'Design notes for route groups',
			source: 'svelte.dev',
			status: 'Enriched',
			tags: ['Svelte', 'Routing'],
			selected: true
		},
		{
			title: 'Convex auth setup notes',
			source: 'convex.dev',
			status: 'Tagged',
			tags: ['Convex', 'Auth']
		},
		{
			title: 'Reader note draft patterns',
			source: 'linear.app',
			status: 'Pending',
			tags: ['Notes']
		},
		{
			title: 'Grounded retrieval citation examples',
			source: 'openai.com',
			status: 'Enriched',
			tags: ['AI', 'Search']
		}
	];

	const statusIcon = {
		Enriched: CheckmarkCircle02Icon,
		Pending: Clock01Icon,
		Tagged: MagicWand01Icon
	};
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

			<form class="mt-4">
				<InputGroup.InputGroup>
					<InputGroup.InputGroupAddon>
						<HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
					</InputGroup.InputGroupAddon>
					<InputGroup.InputGroupInput placeholder="Paste a URL to save it..." type="url" />
					<InputGroup.InputGroupButton type="button" size="sm">Save</InputGroup.InputGroupButton>
				</InputGroup.InputGroup>
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
				{#each bookmarks as bookmark (bookmark.title)}
					<button
						type="button"
						class={cn(
							'grid min-h-16 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent sm:grid-cols-[minmax(0,1fr)_7rem] md:grid-cols-[minmax(0,1fr)_7rem_13rem]',
							bookmark.selected && 'bg-accent text-accent-foreground'
						)}
					>
						<span class="min-w-0">
							<span class="block truncate text-sm font-medium">{bookmark.title}</span>
							<span class="mt-1 block truncate text-xs text-muted-foreground"
								>{bookmark.source}</span
							>
						</span>
						<span class="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
							<HugeiconsIcon icon={statusIcon[bookmark.status]} strokeWidth={2} />
							{bookmark.status}
						</span>
						<span class="hidden min-w-0 items-center gap-1.5 md:flex">
							{#each bookmark.tags as tag (tag)}
								<span
									class="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
								>
									{tag}
								</span>
							{/each}
						</span>
					</button>
				{/each}
			</div>
		</ScrollArea.ScrollArea>
	</section>

	<aside class="hidden min-h-0 border-l border-border/60 lg:flex lg:flex-col">
		<div class="border-b border-border/60 px-4 py-3">
			<p class="text-[11px] font-medium text-muted-foreground uppercase">Selected bookmark</p>
			<h2 class="mt-2 text-base font-semibold">Design notes for route groups</h2>
			<p class="mt-1 text-sm text-muted-foreground">svelte.dev</p>
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
						Route groups keep public marketing pages separate from authenticated product surfaces.
						The app shell can grow behind one route while the public landing page remains focused.
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
						value="Keep the first authenticated page focused on capture and review. Search can become command-driven later."
					/>
				</section>

				<section class="rounded-lg border border-border/60 p-3">
					<p class="text-sm font-medium">Ask context</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						This bookmark is ready to cite in grounded answers once retrieval is wired.
					</p>
					<Button variant="ghost" size="sm" class="mt-3 px-0">
						Ask with this bookmark
						<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
					</Button>
				</section>
			</div>
		</ScrollArea.ScrollArea>
	</aside>
</div>

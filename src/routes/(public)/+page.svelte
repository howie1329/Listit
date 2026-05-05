<script lang="ts">
	import {
		ArrowRight01Icon,
		Link01Icon,
		NoteEditIcon,
		SearchList01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { Button } from '$lib/components/ui/button';
	import { restoreAuthSession } from '$lib/convex-auth';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;
	let signedIn = $state(false);

	const bookmarks = [
		{
			title: 'Research workflow notes',
			source: 'linear.app',
			status: 'enriched',
			tag: 'Product'
		},
		{
			title: 'SvelteKit route groups',
			source: 'svelte.dev',
			status: 'tagged',
			tag: 'Frontend'
		},
		{
			title: 'Convex auth setup',
			source: 'convex.dev',
			status: 'pending',
			tag: 'Auth'
		}
	];

	const features = [
		{
			title: 'Capture',
			copy: 'Save a URL quickly and keep moving.',
			icon: Link01Icon
		},
		{
			title: 'Organize',
			copy: 'Use tags and collections only where they help.',
			icon: NoteEditIcon
		},
		{
			title: 'Ask',
			copy: 'Get grounded answers that cite saved bookmarks.',
			icon: SearchList01Icon
		}
	];

	onMount(() => {
		async function checkSession() {
			if (!convexClient) return;
			signedIn = await restoreAuthSession(convexClient);
		}

		void checkSession();
	});
</script>

<svelte:head>
	<title>ListIt</title>
	<meta
		name="description"
		content="ListIt is bookmark memory for saving links quickly, organizing them lightly, and asking grounded questions later."
	/>
</svelte:head>

<section class="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-7xl px-4 sm:px-6 lg:px-8">
	<div
		class="grid w-full gap-8 py-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-center lg:py-10"
	>
		<div class="max-w-xl">
			<p class="text-[11px] font-medium text-muted-foreground uppercase">Bookmark memory</p>
			<h1 class="mt-3 font-heading text-xl font-semibold">ListIt</h1>
			<p class="mt-4 max-w-lg text-sm leading-6 text-pretty text-muted-foreground">
				Save links quickly, organize them lightly, and ask grounded questions later with answers
				that point back to the source.
			</p>

			<div class="mt-6 flex flex-wrap items-center gap-2">
				<Button href={signedIn ? '/app' : '/signup'}>
					{signedIn ? 'Go to App' : 'Create account'}
					<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} class="size-4" />
				</Button>
				<Button href="/roadmap" variant="ghost">View roadmap</Button>
			</div>

			<div class="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
				{#each features as feature (feature.title)}
					<div class="flex items-start gap-3 border-t border-border/60 pt-3">
						<div class="mt-0.5 text-primary">
							<HugeiconsIcon icon={feature.icon} strokeWidth={2} class="size-4" />
						</div>
						<div>
							<h2 class="text-sm font-medium">{feature.title}</h2>
							<p class="mt-1 text-xs leading-5 text-muted-foreground">{feature.copy}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="min-w-0 border-t border-border/60 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
			<div class="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
				<div>
					<p class="text-sm font-medium">Workspace preview</p>
					<p class="mt-1 text-xs text-muted-foreground">Capture, read, organize, and ask.</p>
				</div>
				<p class="text-[11px] text-muted-foreground uppercase">MVP</p>
			</div>

			<div class="grid gap-5 pt-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
				<div>
					<div class="border-b border-border/60 pb-3">
						<p class="text-[11px] text-muted-foreground uppercase">Quick save</p>
						<p class="mt-1 truncate text-sm">https://example.com/article</p>
					</div>

					<ul class="mt-3 space-y-1">
						{#each bookmarks as bookmark (bookmark.title)}
							<li class="rounded-md px-2 py-2 transition-colors hover:bg-accent">
								<div class="flex items-start justify-between gap-3">
									<p class="min-w-0 truncate text-xs font-medium">{bookmark.title}</p>
									<span class="shrink-0 text-[10px] text-muted-foreground uppercase">
										{bookmark.status}
									</span>
								</div>
								<p class="mt-1 truncate text-[11px] text-muted-foreground">
									{bookmark.source} · {bookmark.tag}
								</p>
							</li>
						{/each}
					</ul>
				</div>

				<div
					class="min-w-0 border-t border-border/60 pt-4 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-5"
				>
					<p class="text-[11px] text-muted-foreground uppercase">Selected bookmark</p>
					<h2 class="mt-2 text-base font-semibold">Research workflow notes</h2>
					<p class="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
						Reader text and one editable note stay beside the saved source, so useful context does
						not disappear into another tab.
					</p>

					<div class="mt-5 border-t border-border/60 pt-4">
						<p class="text-[11px] text-muted-foreground uppercase">Ask my bookmarks</p>
						<p class="mt-2 max-w-xl text-sm leading-6">
							ListIt can answer from saved links and keep the response tied to the bookmarks that
							support it.
						</p>
						<p class="mt-2 text-[11px] text-muted-foreground">
							Cites: Research workflow notes, SvelteKit route groups
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

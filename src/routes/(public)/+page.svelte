<script lang="ts">
	import {
		ArrowRight01Icon,
		Clock01Icon,
		Link01Icon,
		NoteEditIcon,
		SearchList01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';

	const savedLinks = [
		{
			title: 'Design notes for route groups',
			source: 'svelte.dev',
			status: 'Enriched',
			tag: 'Frontend'
		},
		{
			title: 'Convex auth setup',
			source: 'convex.dev',
			status: 'Tagged',
			tag: 'Product'
		},
		{
			title: 'Reader note draft',
			source: 'example.com',
			status: 'Pending',
			tag: 'Personal'
		}
	];

	const workflow = [
		{
			title: 'Capture',
			copy: 'Paste a URL and keep moving.',
			icon: Link01Icon
		},
		{
			title: 'Enrich',
			copy: 'Extract, tag, and note in the background.',
			icon: Clock01Icon
		},
		{
			title: 'Ask',
			copy: 'Get grounded answers with bookmark citations.',
			icon: SearchList01Icon
		}
	];

	const details = [
		'Manual collections stay editable.',
		'Duplicate URLs resolve to one bookmark.',
		'Notes become retrieval context.'
	];
</script>

<svelte:head>
	<title>ListIt</title>
	<meta
		name="description"
		content="ListIt is a lightweight bookmark memory for saving links quickly, organizing them lightly, and asking grounded questions later."
	/>
</svelte:head>

<section class="landing-hero overflow-hidden border-b border-border/60">
	<div
		class="grid min-h-[calc(100svh-6rem)] grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(34rem,1.08fr)]"
	>
		<div class="flex min-h-[31rem] items-end px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
			<div class="hero-copy w-full max-w-xl">
				<p class="text-sm font-medium text-muted-foreground">Personal bookmark memory</p>
				<h1
					class="mt-4 font-heading text-6xl leading-none font-semibold text-balance sm:text-7xl lg:text-8xl"
				>
					ListIt
				</h1>
				<p class="mt-5 max-w-lg text-xl leading-8 text-pretty text-foreground/90">
					Save links fast. Ask them later.
				</p>
				<p class="mt-3 max-w-lg text-sm leading-6 text-pretty text-muted-foreground">
					A keyboard-first library for saved links, lightweight organization, editable notes, and
					answers that cite the original bookmark.
				</p>

				<div class="mt-7 flex flex-wrap items-center gap-3">
					<Button href="/signup" size="lg" class="rounded-full px-4">
						Create account
						<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} class="size-4" />
					</Button>
					<Button href="/roadmap" variant="outline" size="lg" class="rounded-full px-4">
						View roadmap
					</Button>
				</div>
			</div>
		</div>

		<div class="workspace-plane border-t border-border/60 lg:border-t-0 lg:border-l">
			<div class="flex h-full min-h-[34rem] flex-col">
				<div class="flex h-12 items-center justify-between border-b border-border/60 px-4">
					<div>
						<p class="text-sm font-medium">Library</p>
						<p class="text-[11px] text-muted-foreground">Live workspace preview</p>
					</div>
					<div class="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase">
						<span class="size-1.5 rounded-full bg-primary"></span>
						Ready
					</div>
				</div>

				<div class="grid min-h-0 flex-1 lg:grid-cols-[16rem_minmax(0,1fr)]">
					<aside class="border-b border-border/60 p-3 lg:border-r lg:border-b-0">
						<div class="rounded-lg border border-input bg-background px-3 py-2">
							<p class="text-[11px] font-medium text-muted-foreground uppercase">Quick save</p>
							<p class="mt-1 truncate text-sm">https://example.com/article</p>
						</div>

						<div class="mt-4 flex flex-col gap-1">
							{#each savedLinks as link (link.title)}
								<button
									type="button"
									class="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-150 hover:bg-accent"
								>
									<span class="min-w-0">
										<span class="block truncate text-sm font-medium">{link.title}</span>
										<span class="mt-1 block truncate text-xs text-muted-foreground">
											{link.source} &middot; {link.tag}
										</span>
									</span>
									<span class="text-[11px] text-muted-foreground uppercase">{link.status}</span>
								</button>
							{/each}
						</div>
					</aside>

					<div class="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_15rem]">
						<section
							class="flex min-h-0 flex-col border-b border-border/60 p-4 lg:border-r lg:border-b-0"
						>
							<p class="text-[11px] font-medium text-muted-foreground uppercase">Reader note</p>
							<h2 class="mt-3 max-w-sm text-2xl leading-tight font-semibold text-balance">
								One saved link becomes usable context.
							</h2>
							<p class="mt-4 max-w-sm text-sm leading-6 text-pretty text-muted-foreground">
								Extraction runs behind the list, notes stay editable, and answers stay tied to the
								source.
							</p>

							<div class="mt-8 max-w-sm border-l border-border/70 pl-4">
								<p class="text-[11px] font-medium text-muted-foreground uppercase">
									Ask my bookmarks
								</p>
								<p class="mt-3 text-sm leading-6">
									Route groups keep public pages clean while the authenticated workspace grows
									behind them.
								</p>
								<p class="mt-3 text-[11px] text-muted-foreground">
									Cites: Design notes, Convex auth setup
								</p>
							</div>
						</section>

						<aside class="space-y-5 p-4">
							<div>
								<p class="text-[11px] font-medium text-muted-foreground uppercase">Collections</p>
								<p class="mt-2 text-sm leading-6">Frontend, Product, Personal</p>
							</div>
							<div>
								<p class="text-[11px] font-medium text-muted-foreground uppercase">Auto notes</p>
								<p class="mt-2 text-sm leading-6 text-muted-foreground">
									Optional after enrichment, editable afterward.
								</p>
							</div>
							<div>
								<p class="text-[11px] font-medium text-muted-foreground uppercase">
									Deduped capture
								</p>
								<p class="mt-2 text-sm leading-6 text-muted-foreground">
									Normalized URLs keep repeat saves calm.
								</p>
							</div>
						</aside>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="border-b border-border/60 px-4 py-6 sm:px-6 lg:px-8">
	<div class="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
		{#each workflow as item (item.title)}
			<div class="workflow-item flex items-start gap-3 border-t border-border/60 pt-3">
				<div class="mt-0.5 text-muted-foreground">
					<HugeiconsIcon icon={item.icon} strokeWidth={2} class="size-4" />
				</div>
				<div>
					<h2 class="text-sm font-medium">{item.title}</h2>
					<p class="mt-1 text-sm leading-6 text-pretty text-muted-foreground">{item.copy}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
		<div>
			<p class="text-sm font-medium text-muted-foreground">MVP focus</p>
			<h2 class="mt-3 font-heading text-3xl leading-tight font-semibold text-balance">
				Just enough structure to make saved links useful.
			</h2>
		</div>

		<div class="divide-y divide-border/60 border-t border-border/60">
			{#each details as detail (detail)}
				<div class="flex items-center gap-3 py-4">
					<HugeiconsIcon icon={NoteEditIcon} strokeWidth={2} class="size-4 text-muted-foreground" />
					<p class="text-sm">{detail}</p>
				</div>
			{/each}
			<div class="flex flex-wrap items-center gap-3 py-5">
				<Button href="/signup" size="sm" class="rounded-full">Start saving</Button>
				<Button href="/login" variant="ghost" size="sm" class="rounded-full">Sign in</Button>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-copy,
	.workspace-plane,
	.workflow-item {
		animation: land 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.workspace-plane {
		animation-delay: 90ms;
	}

	.workflow-item {
		animation-delay: 150ms;
	}

	@keyframes land {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-copy,
		.workspace-plane,
		.workflow-item {
			animation-duration: 1ms;
			animation-delay: 0ms;
		}
	}
</style>

<script lang="ts">
	import {
		ArrowRight01Icon,
		Link01Icon,
		NoteEditIcon,
		SearchList01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';

	const queue = [
		{
			title: 'Design notes for route groups',
			tag: 'Frontend',
			state: 'enriched'
		},
		{
			title: 'Convex auth setup',
			tag: 'Product',
			state: 'tagged'
		},
		{
			title: 'Reader note draft',
			tag: 'Personal',
			state: 'pending'
		}
	];

	const features = [
		{
			title: 'Capture',
			copy: 'Save a URL without breaking your flow.',
			icon: Link01Icon
		},
		{
			title: 'Retrieve',
			copy: 'Ask against saved links and get citations back.',
			icon: SearchList01Icon
		},
		{
			title: 'Refine',
			copy: 'Keep one editable note next to the source.',
			icon: NoteEditIcon
		}
	];
</script>

<svelte:head>
	<title>ListIt</title>
	<meta
		name="description"
		content="ListIt is a lightweight bookmark memory for saving links quickly, organizing them lightly, and asking grounded questions later."
	/>
</svelte:head>

<section class="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden">
	<div
		aria-hidden="true"
		class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.97_0.007_120_/_0.92)_82%,var(--background))] dark:bg-[linear-gradient(to_bottom,transparent,oklch(0.16_0.012_210_/_0.92)_82%,var(--background))]"
	></div>

	<div
		class="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-7xl flex-col justify-between px-4 pb-6 sm:px-6 lg:px-8"
	>
		<div
			class="grid flex-1 gap-10 py-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-center lg:py-10"
		>
			<div class="max-w-xl">
				<p class="text-sm font-medium text-muted-foreground">Personal bookmark memory</p>
				<h1 class="mt-4 font-heading text-5xl font-semibold text-balance sm:text-6xl">ListIt</h1>
				<p class="mt-4 max-w-lg text-lg leading-7 text-pretty text-foreground/88">
					Save links. Ask later. Keep just enough structure around the things you wanted to
					remember.
				</p>
				<p class="mt-3 max-w-lg text-sm leading-6 text-pretty text-muted-foreground">
					Built for solo use, keyboard-first capture, lightweight collections, and grounded answers
					that still point back to the bookmark.
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

			<div class="relative lg:pl-6">
				<div
					class="rounded-lg border border-border/70 bg-card/90 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.4)] backdrop-blur"
				>
					<div class="flex items-center justify-between border-b border-border/70 px-4 py-3">
						<div>
							<p class="text-sm font-medium">Workspace preview</p>
							<p class="text-xs text-muted-foreground">Tiny surface, grounded memory.</p>
						</div>
						<div class="inline-flex items-center gap-2 text-[11px] text-muted-foreground uppercase">
							<span class="inline-flex items-center gap-1">
								<span class="size-1.5 rounded-full bg-primary"></span>
								live
							</span>
						</div>
					</div>

					<div class="grid lg:grid-cols-[15rem_minmax(0,1fr)]">
						<div class="border-b border-border/70 px-4 py-4 lg:border-r lg:border-b-0">
							<div class="rounded-lg border border-border/70 bg-background/70 px-3 py-2">
								<p class="text-[11px] text-muted-foreground uppercase">Quick save</p>
								<p class="mt-1 truncate text-sm">https://example.com/article</p>
							</div>

							<ul class="mt-4 space-y-2">
								{#each queue as item (item.title)}
									<li class="rounded-lg bg-background/70 px-3 py-2">
										<div class="flex items-start justify-between gap-3">
											<p class="text-sm leading-5 font-medium">{item.title}</p>
											<span class="text-[11px] text-muted-foreground uppercase">{item.state}</span>
										</div>
										<p class="mt-1 text-xs text-muted-foreground">{item.tag}</p>
									</li>
								{/each}
							</ul>
						</div>

						<div class="px-4 py-4">
							<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
								<div>
									<p class="text-[11px] text-muted-foreground uppercase">Reader note</p>
									<h2 class="mt-2 text-base font-semibold">
										One saved link becomes reusable context.
									</h2>
									<p class="mt-3 text-sm leading-6 text-muted-foreground">
										Extraction stays in the background, notes stay editable, and the answer layer
										stays tied to the source instead of improvising from nowhere.
									</p>

									<div class="mt-5 rounded-lg border border-border/70 bg-background/65 px-3 py-3">
										<p class="text-[11px] text-muted-foreground uppercase">Ask my bookmarks</p>
										<p class="mt-2 text-sm leading-6">
											Route groups keep marketing and product routes separate, so public pages can
											stay clean while the authenticated workspace grows behind them.
										</p>
										<p class="mt-2 text-[11px] text-muted-foreground">
											Cites: Convex auth setup, Design notes for route groups
										</p>
									</div>
								</div>

								<div class="space-y-3">
									<div class="rounded-lg border border-border/70 bg-background/70 px-3 py-3">
										<p class="text-sm font-medium">Collections</p>
										<p class="mt-1 text-xs text-muted-foreground">Frontend, Product, Personal</p>
									</div>
									<div class="rounded-lg border border-border/70 bg-background/70 px-3 py-3">
										<p class="text-sm font-medium">Auto notes</p>
										<p class="mt-1 text-xs text-muted-foreground">
											Optional per bookmark after enrichment
										</p>
									</div>
									<div class="rounded-lg border border-border/70 bg-background/70 px-3 py-3">
										<p class="text-sm font-medium">Deduped capture</p>
										<p class="mt-1 text-xs text-muted-foreground">
											Normalized URLs keep the list calm
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid gap-3 pb-2 sm:grid-cols-3">
			{#each features as feature (feature.title)}
				<div class="flex items-start gap-3 border-t border-border/60 pt-3">
					<div class="mt-0.5 text-primary">
						<HugeiconsIcon icon={feature.icon} strokeWidth={2} class="size-4" />
					</div>
					<div>
						<p class="text-sm font-medium">{feature.title}</p>
						<p class="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
							{feature.copy}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

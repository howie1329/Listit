<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Kbd } from '$lib/components/ui/kbd';
	import { Separator } from '$lib/components/ui/separator';

	const bookmarks = [
		{
			title: 'Convex auth notes',
			meta: 'Source · Product',
			state: 'Enriched'
		},
		{
			title: 'SvelteKit route groups',
			meta: 'Pattern · Frontend',
			state: 'Tagged'
		},
		{
			title: 'Weekend trip research',
			meta: 'Collection · Travel',
			state: 'Pending'
		}
	];

	const signals = ['Deduplicated capture', 'Grounded answers', 'Editable notes'];
</script>

<svelte:head>
	<title>ListIt</title>
	<meta
		name="description"
		content="Save links quickly, organize them lightly, and ask grounded questions against what you’ve actually kept."
	/>
</svelte:head>

<section
	class="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
>
	<div class="grid w-full gap-10 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:items-center">
		<div class="max-w-xl">
			<p class="text-sm font-medium text-muted-foreground">Personal bookmark memory</p>
			<h1 class="mt-4 font-heading text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
				Save links, ask later.
			</h1>
			<p class="mt-4 max-w-lg text-base leading-6 text-pretty text-muted-foreground sm:text-lg">
				ListIt keeps the fast part of bookmarking simple, then turns saved links into grounded
				context you can search, read, tag, and ask about without losing the source trail.
			</p>

			<div class="mt-6 flex flex-wrap items-center gap-3">
				<Button href="/signup" size="lg" class="rounded-full px-4">Start saving</Button>
				<Button href="/login" variant="outline" size="lg" class="rounded-full px-4">Sign in</Button>
			</div>

			<div class="mt-8 flex flex-wrap items-center gap-3 text-sm">
				<Kbd>Cmd</Kbd>
				<Kbd>K</Kbd>
				<span class="text-muted-foreground"
					>Keyboard-first capture, retrieval, and note editing.</span
				>
			</div>

			<Separator class="my-8 max-w-md" />

			<ul class="grid gap-3 sm:grid-cols-3">
				{#each signals as signal (signal)}
					<li class="text-sm leading-5">
						<span class="inline-block size-1.5 rounded-full bg-primary align-middle"></span>
						<span class="ml-2 text-pretty">{signal}</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="relative">
			<div class="rounded-2xl border border-border/70 bg-card shadow-sm">
				<div class="flex items-center justify-between border-b border-border/70 px-4 py-3">
					<div>
						<p class="text-sm font-medium">Today’s queue</p>
						<p class="text-xs text-muted-foreground">
							Bookmarks arrive instantly, enrichment catches up.
						</p>
					</div>
					<div class="inline-flex rounded-full bg-muted p-1 text-xs">
						<span class="rounded-full bg-background px-2.5 py-1 font-medium">Inbox</span>
						<span class="px-2.5 py-1 text-muted-foreground">Reader</span>
						<span class="px-2.5 py-1 text-muted-foreground">Ask</span>
					</div>
				</div>

				<div class="grid gap-px bg-border/70 lg:grid-cols-[15rem_minmax(0,1fr)_15rem]">
					<div class="bg-background p-3">
						<p class="text-[11px] font-medium text-muted-foreground uppercase">Saved links</p>
						<ul class="mt-3 space-y-2">
							{#each bookmarks as bookmark, index (bookmark.title)}
								<li class="rounded-xl bg-muted/35 px-3 py-2">
									<div class="flex items-center justify-between gap-3">
										<p class="truncate text-sm font-medium">{bookmark.title}</p>
										<span class="text-[11px] text-muted-foreground tabular-nums">{index + 1}</span>
									</div>
									<p class="mt-1 text-[11px] text-muted-foreground">{bookmark.meta}</p>
									<p class="mt-2 text-[11px] font-medium">{bookmark.state}</p>
								</li>
							{/each}
						</ul>
					</div>

					<div class="bg-background p-4">
						<p class="text-[11px] font-medium text-muted-foreground uppercase">Reader note</p>
						<h2 class="mt-3 text-base font-semibold">
							SvelteKit route groups keep the public surface calm
						</h2>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">
							Store public marketing pages separately from the authenticated workspace while keeping
							future URLs stable. Landing pages stay simple, product routes grow behind their own
							layout, and the app can add auth guards later without rewriting navigation.
						</p>

						<div class="mt-6 rounded-xl border border-border/70 p-3">
							<p class="text-[11px] font-medium text-muted-foreground uppercase">
								Ask my bookmarks
							</p>
							<p class="mt-2 text-sm leading-6">
								Use a public route group for marketing and reserve app routes for authenticated
								workspaces. That keeps the landing page lightweight and the future shell
								predictable.
							</p>
							<p class="mt-3 text-[11px] text-muted-foreground">
								Cites: Convex auth notes, SvelteKit route groups
							</p>
						</div>
					</div>

					<div class="bg-background p-3">
						<p class="text-[11px] font-medium text-muted-foreground uppercase">Signals</p>
						<div class="mt-3 space-y-3">
							<div class="rounded-xl border border-border/70 p-3">
								<p class="text-sm font-medium">Collections</p>
								<p class="mt-1 text-xs text-muted-foreground">
									Frontend patterns, Travel, Product ideas
								</p>
							</div>
							<div class="rounded-xl border border-border/70 p-3">
								<p class="text-sm font-medium">Auto note</p>
								<p class="mt-1 text-xs text-muted-foreground">
									Enabled per bookmark after extraction
								</p>
							</div>
							<div class="rounded-xl border border-border/70 p-3">
								<p class="text-sm font-medium">Next action</p>
								<p class="mt-1 text-xs text-muted-foreground">
									Open the reader, edit, then ask with context.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

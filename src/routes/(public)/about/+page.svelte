<svelte:head>
	<title>About | ListIt</title>
	<meta
		name="description"
		content="About ListIt, a small bookmark memory for fast capture, light organization, and grounded retrieval."
	/>
</svelte:head>

<section class="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
		<div>
			<p class="text-[11px] font-medium text-muted-foreground uppercase">About</p>
			<h1 class="mt-3 font-heading text-xl font-semibold">A smaller way to remember links.</h1>
			<p class="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
				ListIt is for solo users who save useful pages and want those pages to become searchable,
				organized context later.
			</p>
		</div>

		<div class="border-t border-border/60">
			<div class="grid gap-3 border-b border-border/60 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
				<h2 class="text-base font-semibold">What it is</h2>
				<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
					A private workspace for quick URL capture, manual tags and collections, reader notes, and
					grounded answers over saved bookmarks.
				</p>
			</div>

			<div class="grid gap-3 border-b border-border/60 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
				<h2 class="text-base font-semibold">Who it is for</h2>
				<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
					People who collect research, references, product ideas, or articles and need a focused
					place to find them again without building a large knowledge base.
				</p>
			</div>

			<div class="grid gap-3 border-b border-border/60 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
				<h2 class="text-base font-semibold">What stays small</h2>
				<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
					The MVP avoids teams, complex folder trees, multi-collection filing, document uploads, and
					broad workspace automation. One saved link should stay easy to capture, read, and reuse.
				</p>
			</div>
		</div>
	</div>
</section>

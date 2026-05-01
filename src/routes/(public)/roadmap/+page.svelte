<script lang="ts">
	const phases = [
		{
			name: 'Capture',
			copy: 'Save a URL instantly and show it in the list before enrichment finishes.'
		},
		{
			name: 'Organize',
			copy: 'Use manual tags and collections without turning the app into a filing cabinet.'
		},
		{
			name: 'Enrich',
			copy: 'Fetch, extract, truncate, and suggest structure in the background.'
		},
		{
			name: 'Ask',
			copy: 'Retrieve the useful parts and answer with bookmark citations.'
		},
		{
			name: 'Read',
			copy: 'Keep editable notes next to extracted content so memory stays usable.'
		}
	];
</script>

<svelte:head>
	<title>Roadmap | ListIt</title>
	<meta
		name="description"
		content="The public MVP roadmap for ListIt: capture, organize, enrich, ask, and read."
	/>
</svelte:head>

<section class="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
		<div class="lg:sticky lg:top-24">
			<p class="text-sm font-medium text-muted-foreground">Roadmap</p>
			<h1 class="mt-4 font-heading text-4xl font-semibold text-balance sm:text-5xl">
				Five moves, then stop.
			</h1>
			<p class="mt-4 max-w-md text-base leading-7 text-pretty text-muted-foreground">
				ListIt is deliberately small. The roadmap is about getting from saved link to useful
				retrieval without turning the product into a life operating system.
			</p>
		</div>

		<div class="space-y-3">
			{#each phases as phase, index (phase.name)}
				<div class="rounded-lg border border-border/70 bg-card/80 px-4 py-4 backdrop-blur sm:px-5">
					<div class="grid gap-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
						<p class="text-sm text-muted-foreground tabular-nums">
							{String(index + 1).padStart(2, '0')}
						</p>
						<div>
							<h2 class="text-base font-semibold">{phase.name}</h2>
							<p class="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
								{phase.copy}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

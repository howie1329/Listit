<script lang="ts">
	const phases = [
		{
			name: 'Capture',
			description: 'Save a URL instantly, normalize it, and keep duplicates from multiplying.'
		},
		{
			name: 'Organize',
			description: 'Use manual tags and collections without turning setup into a project.'
		},
		{
			name: 'Enrich',
			description: 'Fetch, extract, truncate, and add AI-generated structure in the background.'
		},
		{
			name: 'Ask',
			description: 'Retrieve relevant chunks and notes, then answer with bookmark citations.'
		},
		{
			name: 'Read and edit',
			description: 'Open the reader, review extracted content, and refine notes over time.'
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

<section
	class="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8"
>
	<div class="w-full">
		<p class="text-sm font-medium text-muted-foreground">Public roadmap</p>
		<h1 class="mt-4 font-heading text-4xl font-semibold text-balance sm:text-5xl">
			The MVP is five quiet steps, not a sprawling platform.
		</h1>
		<p class="mt-4 max-w-2xl text-base leading-6 text-pretty text-muted-foreground sm:text-lg">
			ListIt starts with fast capture and earns its complexity only where it helps: background
			enrichment, grounded answers, and a reader that keeps your notes close to the source.
		</p>

		<div class="mt-10 grid gap-3">
			{#each phases as phase, index (phase.name)}
				<div
					class="grid gap-3 rounded-2xl border border-border/70 px-4 py-4 sm:grid-cols-[3rem_minmax(0,1fr)] sm:px-5"
				>
					<p class="text-sm text-muted-foreground tabular-nums">
						{String(index + 1).padStart(2, '0')}
					</p>
					<div>
						<h2 class="text-base font-semibold">{phase.name}</h2>
						<p class="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
							{phase.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

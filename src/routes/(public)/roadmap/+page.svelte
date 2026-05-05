<script lang="ts">
	const phases = [
		{
			name: 'Capture',
			status: 'Current',
			copy: 'Save a URL instantly and show it in the library before enrichment finishes.'
		},
		{
			name: 'Organize',
			status: 'Current',
			copy: 'Use manual tags and one collection per bookmark for lightweight structure.'
		},
		{
			name: 'Enrich',
			status: 'MVP',
			copy: 'Extract readable text, truncate it for storage, and suggest useful organization.'
		},
		{
			name: 'Ask',
			status: 'MVP',
			copy: 'Retrieve relevant bookmark context and answer with citations to saved links.'
		},
		{
			name: 'Read',
			status: 'MVP',
			copy: 'Keep extracted content and one editable note close to the bookmark.'
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

<section class="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
		<div>
			<p class="text-[11px] font-medium text-muted-foreground uppercase">Roadmap</p>
			<h1 class="mt-3 font-heading text-xl font-semibold">Five MVP moves.</h1>
			<p class="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
				ListIt stays small on purpose: capture links, add light structure, enrich content, ask
				grounded questions, and read with notes.
			</p>
		</div>

		<div class="border-t border-border/60">
			{#each phases as phase, index (phase.name)}
				<div
					class="grid gap-3 border-b border-border/60 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_5rem]"
				>
					<p class="text-[11px] text-muted-foreground tabular-nums">
						{String(index + 1).padStart(2, '0')}
					</p>
					<div>
						<h2 class="text-base font-semibold">{phase.name}</h2>
						<p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{phase.copy}</p>
					</div>
					<p class="text-[11px] font-medium text-muted-foreground uppercase sm:text-right">
						{phase.status}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

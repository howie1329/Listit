<script lang="ts">
	import { Chart01Icon, CpuIcon, DatabaseIcon, UserCircle02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let displayName = $state('Howie Thomas');
	let selectedModel = $state('balanced');

	const modelOptions = [
		{
			value: 'fast',
			label: 'Fast',
			description: 'Prioritizes quick enrichment and lightweight answers.'
		},
		{
			value: 'balanced',
			label: 'Balanced',
			description: 'A middle ground for quality, speed, and future usage limits.'
		},
		{
			value: 'high-accuracy',
			label: 'High accuracy',
			description: 'Optimizes for deeper retrieval and more careful generated notes.'
		}
	] as const;

	const usageItems = [
		{ label: 'Saved links', value: 128, limit: 500, unit: 'links' },
		{ label: 'AI answers', value: 42, limit: 100, unit: 'answers' },
		{ label: 'Enrichment jobs', value: 87, limit: 250, unit: 'jobs' },
		{ label: 'Storage', value: 1.4, limit: 5, unit: 'GB' }
	] as const;

	const statsItems = [
		{ label: 'Bookmarks', value: '128', detail: 'Across all saved links' },
		{ label: 'Collections', value: '12', detail: 'Manually organized groups' },
		{ label: 'Tags', value: '34', detail: 'Reusable labels' },
		{ label: 'Notes', value: '19', detail: 'Reader notes and AI drafts' },
		{ label: 'Last enrichment', value: '2h ago', detail: 'Most recent background update' }
	] as const;
</script>

<svelte:head>
	<title>Settings | ListIt</title>
	<meta name="description" content="Manage ListIt account, AI model, usage limits, and stats." />
</svelte:head>

<main class="flex min-h-0 flex-1 flex-col">
	<header class="border-b border-border/50 px-4 py-3">
		<h1 class="font-heading text-xl font-semibold">Settings</h1>
		<p class="mt-0.5 text-xs text-muted-foreground">
			Manage account details, AI defaults, usage limits, and library stats.
		</p>
	</header>

	<div class="grid min-h-0 flex-1 lg:grid-cols-[14rem_minmax(0,42rem)]">
		<nav class="hidden border-r border-border/50 p-2 lg:block" aria-label="Settings sections">
			<a
				class="flex h-8 items-center gap-2 rounded-md bg-accent px-2 text-xs font-medium"
				href="#account"
			>
				<HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} class="size-3.5" />
				Account
			</a>
			<a
				class="mt-1 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
				href="#ai-model"
			>
				<HugeiconsIcon icon={CpuIcon} strokeWidth={2} class="size-3.5" />
				AI model
			</a>
			<a
				class="mt-1 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
				href="#usage"
			>
				<HugeiconsIcon icon={DatabaseIcon} strokeWidth={2} class="size-3.5" />
				Usage & limits
			</a>
			<a
				class="mt-1 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
				href="#stats"
			>
				<HugeiconsIcon icon={Chart01Icon} strokeWidth={2} class="size-3.5" />
				Stats
			</a>
		</nav>

		<section class="space-y-6 px-4 py-4">
			<section id="account">
				<div class="flex items-center gap-2">
					<HugeiconsIcon
						icon={UserCircle02Icon}
						strokeWidth={2}
						class="size-3.5 text-muted-foreground"
					/>
					<h2 class="text-base font-semibold">Account</h2>
				</div>
				<p class="mt-2 text-xs leading-snug text-muted-foreground">
					Profile persistence is not connected yet. These fields preview the intended account
					experience.
				</p>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="settings-name" class="text-xs">Display name</Label>
						<Input id="settings-name" bind:value={displayName} class="text-xs" />
					</div>
					<div class="space-y-1.5">
						<Label for="settings-email" class="text-xs">Email</Label>
						<Input
							id="settings-email"
							class="text-xs"
							value="howie@example.com"
							readonly
							aria-describedby="settings-email-help"
						/>
						<p id="settings-email-help" class="text-[11px] text-muted-foreground">
							Email is managed by your sign-in provider.
						</p>
					</div>
				</div>
			</section>

			<section id="ai-model" class="border-t border-border/50 pt-5">
				<div class="flex items-center gap-2">
					<HugeiconsIcon icon={CpuIcon} strokeWidth={2} class="size-3.5 text-muted-foreground" />
					<h2 class="text-base font-semibold">AI model</h2>
				</div>
				<p class="mt-2 text-xs leading-snug text-muted-foreground">
					Choose the default model profile ListIt will use for future enrichment, notes, and
					ask-my-bookmarks answers.
				</p>
				<div class="mt-3 space-y-1.5">
					<Label for="settings-ai-model" class="text-xs">Default model profile</Label>
					<select
						id="settings-ai-model"
						bind:value={selectedModel}
						class="h-8 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:max-w-xs"
					>
						{#each modelOptions as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
				<div class="mt-3 grid gap-2 sm:grid-cols-3">
					{#each modelOptions as option (option.value)}
						<div
							class="rounded-md border border-border/50 px-3 py-2 text-xs {selectedModel ===
							option.value
								? 'bg-accent text-foreground'
								: 'text-muted-foreground'}"
						>
							<div class="font-medium text-foreground">{option.label}</div>
							<p class="mt-1 text-[11px] leading-snug">{option.description}</p>
						</div>
					{/each}
				</div>
			</section>

			<section id="usage" class="border-t border-border/50 pt-5">
				<div class="flex items-center gap-2">
					<HugeiconsIcon
						icon={DatabaseIcon}
						strokeWidth={2}
						class="size-3.5 text-muted-foreground"
					/>
					<h2 class="text-base font-semibold">Usage & limits</h2>
				</div>
				<p class="mt-2 text-xs leading-snug text-muted-foreground">
					Mock limits for the future account usage dashboard. These values are not connected to real
					metering yet.
				</p>
				<div class="mt-3 space-y-3">
					{#each usageItems as item (item.label)}
						{@const percent = Math.min((item.value / item.limit) * 100, 100)}
						<div>
							<div class="flex items-center justify-between gap-3 text-xs">
								<span class="font-medium">{item.label}</span>
								<span class="text-muted-foreground">{item.value} / {item.limit} {item.unit}</span>
							</div>
							<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent" aria-hidden="true">
								<div class="h-full rounded-full bg-primary" style={`width: ${percent}%`}></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section id="stats" class="border-t border-border/50 pt-5">
				<div class="flex items-center gap-2">
					<HugeiconsIcon
						icon={Chart01Icon}
						strokeWidth={2}
						class="size-3.5 text-muted-foreground"
					/>
					<h2 class="text-base font-semibold">Stats</h2>
				</div>
				<p class="mt-2 text-xs leading-snug text-muted-foreground">
					Placeholder library activity that will eventually reflect saved bookmarks and enrichment
					status.
				</p>
				<div class="mt-3 grid gap-2 sm:grid-cols-2">
					{#each statsItems as item (item.label)}
						<div class="rounded-md border border-border/50 px-3 py-2">
							<div class="flex items-baseline justify-between gap-3">
								<span class="text-xs font-medium">{item.label}</span>
								<span class="font-mono text-xs text-foreground">{item.value}</span>
							</div>
							<p class="mt-1 text-[11px] leading-snug text-muted-foreground">{item.detail}</p>
						</div>
					{/each}
				</div>
			</section>

			<div class="flex items-center justify-between gap-3 border-t border-border/50 pt-4">
				<p class="text-[11px] text-muted-foreground">Saving will be connected in a later pass.</p>
				<Button size="sm" class="h-8" disabled>Save changes</Button>
			</div>
		</section>
	</div>
</main>

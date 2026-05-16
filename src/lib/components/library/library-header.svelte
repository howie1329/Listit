<script lang="ts">
	import { Link01Icon, PanelRightCloseIcon, PanelRightOpenIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';

	interface Props {
		count: number;
		url: string;
		isSaving: boolean;
		saveError: string;
		saveSuccess: string;
		isInspectorOpen: boolean;
		onsubmit: (event: SubmitEvent) => void;
		onToggleInspector: () => void;
	}

	let {
		count,
		url = $bindable(),
		isSaving,
		saveError,
		saveSuccess,
		isInspectorOpen,
		onsubmit,
		onToggleInspector
	}: Props = $props();
</script>

<div class="border-b border-border/50 px-4 py-3.5">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<h1 class="text-xl leading-tight font-semibold">Library</h1>
				<span
					class="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
				>
					{count} saved
				</span>
			</div>
			<p class="mt-1 text-xs leading-snug text-muted-foreground">
				Save links now. Search, organize, and ask later.
			</p>
		</div>
		{#if count > 0}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				class="hidden size-8 shrink-0 lg:inline-flex"
				onclick={onToggleInspector}
				aria-pressed={isInspectorOpen}
				title={isInspectorOpen ? 'Hide details' : 'Show details'}
			>
				<HugeiconsIcon
					icon={isInspectorOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
					strokeWidth={2}
				/>
				<span class="sr-only">{isInspectorOpen ? 'Hide details' : 'Show details'}</span>
			</Button>
		{/if}
	</div>

	<form class="mt-4" {onsubmit}>
		<InputGroup.InputGroup
			class="h-9 border-border/80 bg-accent/25 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
		>
			<InputGroup.InputGroupAddon>
				<HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
			</InputGroup.InputGroupAddon>
			<InputGroup.InputGroupInput
				bind:value={url}
				placeholder="Paste any URL to save it to your library..."
				type="text"
				inputmode="url"
				disabled={isSaving}
				class="text-xs placeholder:text-muted-foreground/80"
			/>
			<InputGroup.InputGroupButton type="submit" size="sm" disabled={isSaving || !url.trim()}>
				{isSaving ? 'Saving...' : 'Save'}
			</InputGroup.InputGroupButton>
		</InputGroup.InputGroup>
		{#if saveError}
			<p class="mt-2 text-xs text-destructive">{saveError}</p>
		{:else if saveSuccess}
			<p class="mt-2 text-xs text-muted-foreground">{saveSuccess}</p>
		{/if}
	</form>
</div>

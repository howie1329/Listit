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

<div class="border-b border-border/50 px-4 py-3">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<h1 class="text-xl leading-tight font-semibold">Library</h1>
				<span class="text-[11px] text-muted-foreground">{count} saved</span>
			</div>
			<p class="mt-0.5 text-xs leading-snug text-muted-foreground">
				Capture links, triage metadata, and keep context ready for Ask.
			</p>
		</div>
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
	</div>

	<form class="mt-3" {onsubmit}>
		<InputGroup.InputGroup class="h-8">
			<InputGroup.InputGroupAddon>
				<HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
			</InputGroup.InputGroupAddon>
			<InputGroup.InputGroupInput
				bind:value={url}
				placeholder="Paste a URL to save..."
				type="text"
				inputmode="url"
				disabled={isSaving}
				class="text-xs"
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

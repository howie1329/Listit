<script lang="ts">
	import { Moon02Icon, Sun01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';

	type Variant = 'icon' | 'sidebar';

	let { variant = 'icon' }: { variant?: Variant } = $props();
</script>

<Button
	onclick={toggleMode}
	variant="ghost"
	size={variant === 'sidebar' ? 'sm' : 'icon'}
	class={cn(
		'relative overflow-hidden text-muted-foreground',
		variant === 'icon' && 'size-8',
		variant === 'sidebar' &&
			'h-7 w-full justify-start gap-2 rounded-md px-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!'
	)}
	aria-label="Toggle theme"
	title="Toggle theme"
>
	<span class="relative flex size-4 shrink-0 items-center justify-center">
		<HugeiconsIcon
			icon={Sun01Icon}
			strokeWidth={2}
			class="absolute size-4 scale-100 rotate-0 transition-all duration-150 dark:scale-0 dark:-rotate-90"
		/>
		<HugeiconsIcon
			icon={Moon02Icon}
			strokeWidth={2}
			class="absolute size-4 scale-0 rotate-90 transition-all duration-150 dark:scale-100 dark:rotate-0"
		/>
	</span>
	{#if variant === 'sidebar'}
		<span class="truncate leading-tight group-data-[collapsible=icon]:hidden">Theme</span>
	{:else}
		<span class="sr-only">Toggle theme</span>
	{/if}
</Button>

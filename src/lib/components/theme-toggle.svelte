<script lang="ts">
	import { ComputerIcon, Moon02Icon, Sun01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { mode, resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import { cn } from '$lib/utils.js';

	const options = [
		{
			value: 'light',
			label: 'Light mode',
			icon: Sun01Icon,
			select: () => setMode('light')
		},
		{
			value: 'system',
			label: 'System mode',
			icon: ComputerIcon,
			select: () => resetMode()
		},
		{
			value: 'dark',
			label: 'Dark mode',
			icon: Moon02Icon,
			select: () => setMode('dark')
		}
	] as const;

	const selected = $derived(userPrefersMode.current ?? 'system');
	const currentLabel = $derived(
		mode.current === 'dark'
			? 'Dark mode active'
			: mode.current === 'light'
				? 'Light mode active'
				: 'Theme mode'
	);
</script>

<div
	class="inline-flex h-9 items-center rounded-full border border-border/70 bg-background/80 p-1 shadow-sm backdrop-blur"
	aria-label={currentLabel}
	role="group"
>
	{#each options as option (option.value)}
		<button
			type="button"
			class={cn(
				'inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
				selected === option.value && 'bg-foreground text-background shadow-sm'
			)}
			aria-label={option.label}
			aria-pressed={selected === option.value}
			title={option.label}
			onclick={option.select}
		>
			<HugeiconsIcon icon={option.icon} strokeWidth={2} class="size-3.5" />
		</button>
	{/each}
</div>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Loading03Icon } from '@hugeicons/core-free-icons';
	import type { SVGAttributes } from 'svelte/elements';

	let {
		class: className,
		role = 'status',
		// we add name, color, and stroke for compatibility with different icon libraries props
		name,
		color,
		stroke,
		'aria-label': ariaLabel = 'Loading'
	}: SVGAttributes<SVGSVGElement> = $props();

	const iconRole = $derived(role === null ? undefined : role);
	const iconName = $derived(name === null ? undefined : name);
	const iconColor = $derived(color === null ? undefined : color);
	const iconStroke = $derived(stroke === null ? undefined : stroke);
	const iconAriaLabel = $derived(ariaLabel === null ? undefined : ariaLabel);
</script>

<HugeiconsIcon
	icon={Loading03Icon}
	strokeWidth={2}
	role={iconRole}
	name={iconName}
	color={iconColor}
	stroke={iconStroke}
	aria-label={iconAriaLabel}
	class={cn('size-4 animate-spin', className)}
/>

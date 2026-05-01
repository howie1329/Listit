<script lang="ts">
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { applyStoredAuth } from '$lib/convex-auth';
	import { cn } from '$lib/utils.js';

	let { children } = $props();

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;
	const navItems = [{ href: '/roadmap', label: 'Roadmap' }] as const;

	onMount(() => {
		if (!convexClient) return;
		applyStoredAuth(convexClient);
	});
</script>

<div class="min-h-dvh bg-background text-foreground">
	<div
		aria-hidden="true"
		class="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_50%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_40%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,oklch(0.84_0.08_176_/_0.22),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.48_0.12_176_/_0.25),transparent_60%)]"
	></div>

	<a
		class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-sm"
		href="#main-content"
	>
		Skip to content
	</a>

	<header
		class="sticky top-0 z-40 border-b border-border/60 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72"
	>
		<div
			class="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
		>
			<a class="font-heading text-base font-semibold tracking-tight" href={resolve('/')}>ListIt</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<nav aria-label="Primary" class="hidden items-center gap-1 md:flex">
					{#each navItems as item (item.href)}
						<a
							class={cn(
								'rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
								page.url.pathname === item.href && 'bg-muted text-foreground'
							)}
							href={resolve(item.href)}
							aria-current={page.url.pathname === item.href ? 'page' : undefined}
						>
							{item.label}
						</a>
					{/each}
				</nav>

				<div class="flex items-center gap-2">
					<ThemeToggle />
					<Button href="/login" variant="ghost" size="sm" class="rounded-full">Sign In</Button>
					<Button href="/signup" size="sm" class="rounded-full">Sign Up</Button>
				</div>
			</div>
		</div>
	</header>

	<main id="main-content" class="relative">
		{@render children()}
	</main>
</div>

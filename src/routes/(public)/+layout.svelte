<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { applyStoredAuth, hasStoredAuthSession, runSignOutAuth } from '$lib/convex-auth';
	import { cn } from '$lib/utils.js';

	let { children } = $props();

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;
	const navItems = [{ href: '/roadmap', label: 'Roadmap' }] as const;
	let signedIn = $state(false);
	let isSigningOut = $state(false);

	onMount(() => {
		signedIn = hasStoredAuthSession();
		if (convexClient) {
			applyStoredAuth(convexClient);
		}
	});

	async function handleSignOut() {
		isSigningOut = true;
		await runSignOutAuth(convexClient);
		signedIn = false;
		isSigningOut = false;
		await goto(resolve('/'));
	}
</script>

<div class="min-h-dvh bg-background text-foreground">
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
					{#if signedIn}
						<Button href="/app" size="sm" class="rounded-full">Open app</Button>
						<Button
							variant="ghost"
							size="sm"
							class="rounded-full"
							disabled={isSigningOut}
							onclick={handleSignOut}
						>
							{isSigningOut ? 'Signing out...' : 'Sign out'}
						</Button>
					{:else}
						<Button href="/login" variant="ghost" size="sm" class="rounded-full">Sign In</Button>
						<Button href="/signup" size="sm" class="rounded-full">Sign Up</Button>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<main id="main-content" class="relative">
		{@render children()}
	</main>
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';

	let { children } = $props();

	const navItems = [{ href: '/roadmap', label: 'Roadmap' }] as const;

	const isHome = $derived(page.url.pathname === '/');
</script>

<div class="min-h-dvh bg-background text-foreground">
	<a
		class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-sm"
		href="#main-content"
	>
		Skip to content
	</a>

	<header
		class="border-b border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80"
	>
		<div
			class="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
		>
			<a class="font-heading text-base font-semibold" href={resolve('/')}>ListIt</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<nav aria-label="Primary" class="hidden items-center gap-1 sm:flex">
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
					<Button
						href="/login"
						variant={isHome ? 'ghost' : 'outline'}
						size="sm"
						class="rounded-full"
					>
						Sign In
					</Button>
					<Button href="/signup" size="sm" class="rounded-full">Sign Up</Button>
				</div>
			</div>
		</div>
	</header>

	<main id="main-content">
		{@render children()}
	</main>
</div>

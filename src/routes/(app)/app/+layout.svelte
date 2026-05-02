<script lang="ts">
	import {
		Archive03Icon,
		BookOpen02Icon,
		Folder01Icon,
		HelpCircleIcon,
		Home05Icon,
		Logout01Icon,
		NoteEditIcon,
		Search01Icon,
		Settings01Icon,
		Tag01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Separator from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { convexAuth } from '$lib/convex-auth.svelte';
	import { cn } from '$lib/utils';

	let { children } = $props();

	const primaryItems = [
		{ href: '/app', label: 'Library', icon: Home05Icon },
		{ href: '/app/ask', label: 'Ask', icon: Search01Icon },
		{ href: '/app/notes', label: 'Notes', icon: NoteEditIcon },
		{ href: '/app/settings', label: 'Settings', icon: Settings01Icon }
	];

	const collections = ['Reading queue', 'Product research', 'Frontend notes'];
	const tags = ['AI', 'Svelte', 'Convex'];
	let sidebarOpen = $state(true);
	let isSigningOut = $state(false);
	let redirectingToLogin = $state(false);

	$effect(() => {
		if (convexAuth.isLoading || convexAuth.isAuthenticated || redirectingToLogin) return;
		redirectingToLogin = true;
		void goto(resolve('/login'));
	});

	async function handleSignOut() {
		if (isSigningOut) return;
		isSigningOut = true;
		await convexAuth.signOut();
		isSigningOut = false;
		await goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>Library | ListIt</title>
	<meta name="description" content="Your ListIt workspace for saved links, notes, and retrieval." />
</svelte:head>

{#if convexAuth.isLoading || redirectingToLogin}
	<div class="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
		<p class="text-sm text-muted-foreground">Loading your workspace...</p>
	</div>
{:else}
	<Sidebar.Provider bind:open={sidebarOpen}>
		<Sidebar.Sidebar collapsible="icon">
			<Sidebar.SidebarHeader>
				<Sidebar.SidebarMenu>
					<Sidebar.SidebarMenuItem>
						<Sidebar.SidebarMenuButton size="lg" tooltipContent="ListIt">
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<HugeiconsIcon icon={Archive03Icon} strokeWidth={2} />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">ListIt</span>
								<span class="truncate text-xs text-muted-foreground">Workspace</span>
							</div>
						</Sidebar.SidebarMenuButton>
					</Sidebar.SidebarMenuItem>
				</Sidebar.SidebarMenu>
			</Sidebar.SidebarHeader>

			<Sidebar.SidebarContent>
				<Sidebar.SidebarGroup>
					<Sidebar.SidebarGroupLabel>Workspace</Sidebar.SidebarGroupLabel>
					<Sidebar.SidebarGroupContent>
						<Sidebar.SidebarMenu>
							{#each primaryItems as item (item.href)}
								<Sidebar.SidebarMenuItem>
									<Sidebar.SidebarMenuButton
										size="sm"
										isActive={page.url.pathname === item.href}
										tooltipContent={item.label}
									>
										<HugeiconsIcon icon={item.icon} strokeWidth={2} />
										<span>{item.label}</span>
									</Sidebar.SidebarMenuButton>
								</Sidebar.SidebarMenuItem>
							{/each}
						</Sidebar.SidebarMenu>
					</Sidebar.SidebarGroupContent>
				</Sidebar.SidebarGroup>

				<Sidebar.SidebarSeparator />

				<Sidebar.SidebarGroup>
					<Sidebar.SidebarGroupLabel>Collections</Sidebar.SidebarGroupLabel>
					<Sidebar.SidebarGroupContent>
						<Sidebar.SidebarMenu>
							{#each collections as collection (collection)}
								<Sidebar.SidebarMenuItem>
									<Sidebar.SidebarMenuButton size="sm" tooltipContent={collection}>
										<HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
										<span>{collection}</span>
									</Sidebar.SidebarMenuButton>
								</Sidebar.SidebarMenuItem>
							{/each}
						</Sidebar.SidebarMenu>
					</Sidebar.SidebarGroupContent>
				</Sidebar.SidebarGroup>

				<Sidebar.SidebarGroup>
					<Sidebar.SidebarGroupLabel>Tags</Sidebar.SidebarGroupLabel>
					<Sidebar.SidebarGroupContent>
						<Sidebar.SidebarMenu>
							{#each tags as tag (tag)}
								<Sidebar.SidebarMenuItem>
									<Sidebar.SidebarMenuButton size="sm" tooltipContent={tag}>
										<HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
										<span>{tag}</span>
									</Sidebar.SidebarMenuButton>
								</Sidebar.SidebarMenuItem>
							{/each}
						</Sidebar.SidebarMenu>
					</Sidebar.SidebarGroupContent>
				</Sidebar.SidebarGroup>
			</Sidebar.SidebarContent>

			<Sidebar.SidebarFooter>
				<Sidebar.SidebarMenu>
					<Sidebar.SidebarMenuItem>
						<Sidebar.SidebarMenuButton size="sm" tooltipContent="Help">
							<HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
							<span>Help</span>
						</Sidebar.SidebarMenuButton>
					</Sidebar.SidebarMenuItem>
					<Sidebar.SidebarMenuItem>
						<Sidebar.SidebarMenuButton
							size="sm"
							tooltipContent="Sign out"
							aria-disabled={isSigningOut}
							onclick={handleSignOut}
						>
							<HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
							<span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
						</Sidebar.SidebarMenuButton>
					</Sidebar.SidebarMenuItem>
				</Sidebar.SidebarMenu>
			</Sidebar.SidebarFooter>
			<Sidebar.SidebarRail />
		</Sidebar.Sidebar>

		<Sidebar.SidebarInset>
			<header class="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-3 sm:px-4">
				<Sidebar.SidebarTrigger />
				<Separator.Separator orientation="vertical" class="hidden h-5 sm:block" />
				<a class="hidden font-heading text-sm font-semibold sm:block" href={resolve('/app')}
					>ListIt</a
				>
				<div class="relative min-w-0 flex-1">
					<HugeiconsIcon
						icon={Search01Icon}
						strokeWidth={2}
						class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input class="h-8 pl-8" placeholder="Search bookmarks or run a command..." />
				</div>
				<Button variant="outline" size="sm" class="hidden sm:inline-flex">
					<HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} data-icon="inline-start" />
					Reader
				</Button>
				<ThemeToggle />
			</header>

			<div class={cn('min-h-0 flex-1', page.url.pathname === '/app' && 'overflow-hidden')}>
				{@render children()}
			</div>
		</Sidebar.SidebarInset>
	</Sidebar.Provider>
{/if}

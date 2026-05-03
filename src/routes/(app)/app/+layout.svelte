<script lang="ts">
	import {
		Archive03Icon,
		BookOpen02Icon,
		Folder01Icon,
		HelpCircleIcon,
		Home05Icon,
		Loading03Icon,
		Logout01Icon,
		NoteEditIcon,
		Search01Icon,
		Settings01Icon,
		Tag01Icon,
		UserCircle02Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Separator from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { restoreAuthSession, signOut } from '$lib/convex-auth';
	import { cn } from '$lib/utils';

	let { children } = $props();

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;
	let authReady = $state(false);
	let isAuthenticated = $state(false);
	let isSigningOut = $state(false);

	const currentUserResponse = useQuery(api.auth.currentUser, () =>
		authReady && isAuthenticated ? {} : 'skip'
	);
	const currentUser = $derived(currentUserResponse.data);
	const userLabel = $derived(currentUser?.name || currentUser?.email || 'Signed in');
	const userMeta = $derived(
		currentUser?.email && currentUser?.name ? currentUser.email : 'ListIt account'
	);

	const primaryItems = [
		{ href: '/app', label: 'Library', icon: Home05Icon },
		{ href: '/app/ask', label: 'Ask', icon: Search01Icon },
		{ href: '/app/notes', label: 'Notes', icon: NoteEditIcon },
		{ href: '/app/settings', label: 'Settings', icon: Settings01Icon }
	];

	const collections = ['Reading queue', 'Product research', 'Frontend notes'];
	const tags = ['AI', 'Svelte', 'Convex'];

	onMount(() => {
		async function protectAppRoute() {
			if (!convexClient) {
				await goto(resolve('/login'));
				return;
			}

			const restored = await restoreAuthSession(convexClient);
			const authenticated =
				restored || (await convexClient.query(api.auth.isAuthenticated, {}).catch(() => false));

			if (!authenticated) {
				await goto(resolve('/login'));
				return;
			}

			isAuthenticated = true;
			authReady = true;
		}

		void protectAppRoute();
	});

	async function handleSignOut() {
		if (!convexClient) return;

		isSigningOut = true;
		await signOut(convexClient);
		await goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>Library | ListIt</title>
	<meta name="description" content="Your ListIt workspace for saved links, notes, and retrieval." />
</svelte:head>

{#if !authReady}
	<div class="flex min-h-dvh items-center justify-center bg-background text-foreground">
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<HugeiconsIcon icon={Loading03Icon} strokeWidth={2} class="size-4 animate-spin" />
			Loading workspace...
		</div>
	</div>
{:else}
	<Sidebar.Provider>
		<Sidebar.Sidebar collapsible="icon">
			<Sidebar.SidebarHeader>
				<Sidebar.SidebarMenu>
					<Sidebar.SidebarMenuItem>
						<Sidebar.SidebarMenuButton size="sm" tooltipContent="ListIt">
							<div
								class="flex aspect-square size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<HugeiconsIcon icon={Archive03Icon} strokeWidth={2} class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-xs leading-tight">
								<span class="truncate font-semibold">ListIt</span>
								<span class="truncate text-[11px] text-muted-foreground">Workspace</span>
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
										<HugeiconsIcon icon={item.icon} strokeWidth={2} class="size-4" />
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
										<HugeiconsIcon icon={Folder01Icon} strokeWidth={2} class="size-4" />
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
										<HugeiconsIcon icon={Tag01Icon} strokeWidth={2} class="size-4" />
										<span>{tag}</span>
									</Sidebar.SidebarMenuButton>
								</Sidebar.SidebarMenuItem>
							{/each}
						</Sidebar.SidebarMenu>
					</Sidebar.SidebarGroupContent>
				</Sidebar.SidebarGroup>
			</Sidebar.SidebarContent>

			<Sidebar.SidebarFooter class="gap-1 border-t border-border/50">
				<Sidebar.SidebarMenu class="gap-1">
					<Sidebar.SidebarMenuItem>
						<ThemeToggle variant="sidebar" />
					</Sidebar.SidebarMenuItem>
					<Sidebar.SidebarMenuItem>
						<Sidebar.SidebarMenuButton size="sm" tooltipContent="Help">
							<HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} class="size-4" />
							<span>Help</span>
						</Sidebar.SidebarMenuButton>
					</Sidebar.SidebarMenuItem>
					<Sidebar.SidebarMenuItem>
						<Sidebar.SidebarMenuButton
							tooltipContent={userLabel}
							class="h-9 items-center gap-2 px-2 text-xs group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!"
						>
							<div class="flex size-4 shrink-0 items-center justify-center">
								<HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} class="size-4" />
							</div>
							<div class="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
								<span class="truncate text-xs leading-tight font-medium">{userLabel}</span>
								<span class="truncate text-[11px] leading-tight text-muted-foreground">{userMeta}</span>
							</div>
						</Sidebar.SidebarMenuButton>
					</Sidebar.SidebarMenuItem>
				</Sidebar.SidebarMenu>
			</Sidebar.SidebarFooter>
			<Sidebar.SidebarRail />
		</Sidebar.Sidebar>

		<Sidebar.SidebarInset>
			<header class="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-3">
				<Sidebar.SidebarTrigger />
				<Separator.Separator orientation="vertical" class="hidden h-5 sm:block" />

				<div class="relative min-w-0 flex-1">
					<HugeiconsIcon
						icon={Search01Icon}
						strokeWidth={2}
						class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
					/>
					<Input class="h-8 pl-8 text-xs" placeholder="Search bookmarks or run a command..." />
				</div>
				<Button variant="ghost" size="sm" class="hidden h-8 sm:inline-flex">
					<HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} data-icon="inline-start" />
					Reader
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="h-8"
					onclick={handleSignOut}
					disabled={isSigningOut}
				>
					<HugeiconsIcon icon={Logout01Icon} strokeWidth={2} data-icon="inline-start" />
					{isSigningOut ? 'Signing out...' : 'Sign out'}
				</Button>
			</header>

			<div class={cn('min-h-0 flex-1', page.url.pathname === '/app' && 'overflow-hidden')}>
				{@render children()}
			</div>
		</Sidebar.SidebarInset>
	</Sidebar.Provider>
{/if}

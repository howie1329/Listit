<script lang="ts">
	import { Notification01Icon, Settings01Icon, UserCircle02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<svelte:head>
	<title>Settings | ListIt</title>
	<meta name="description" content="Manage ListIt account and workspace preferences." />
</svelte:head>

<main class="flex min-h-0 flex-1 flex-col">
	<header class="border-b border-border/50 px-4 py-3">
		<h1 class="font-heading text-xl font-semibold">Settings</h1>
		<p class="mt-0.5 text-xs text-muted-foreground">
			Manage account, workspace preferences, and future automation defaults.
		</p>
	</header>

	<div class="grid min-h-0 flex-1 lg:grid-cols-[14rem_minmax(0,38rem)]">
		<nav class="hidden border-r border-border/50 p-2 lg:block" aria-label="Settings sections">
			<a
				class="flex h-8 items-center gap-2 rounded-md bg-accent px-2 text-xs font-medium"
				href="#account"
			>
				<HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} class="size-3.5" />
				Account
			</a>
			<a
				class="mt-1 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground"
				href="#workspace"
			>
				<HugeiconsIcon icon={Settings01Icon} strokeWidth={2} class="size-3.5" />
				Workspace
			</a>
			<a
				class="mt-1 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground"
				href="#notifications"
			>
				<HugeiconsIcon icon={Notification01Icon} strokeWidth={2} class="size-3.5" />
				Notifications
			</a>
		</nav>

		<section class="space-y-6 px-4 py-4">
			<section id="account">
				<div class="flex items-center gap-2">
					<HugeiconsIcon
						icon={UserCircle02Icon}
						strokeWidth={2}
						class="size-3.5 text-muted-foreground"
					/>
					<h2 class="text-base font-semibold">Account</h2>
				</div>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="settings-name" class="text-xs">Name</Label>
						<Input id="settings-name" class="text-xs" placeholder="Signed-in user" disabled />
					</div>
					<div class="space-y-1.5">
						<Label for="settings-email" class="text-xs">Email</Label>
						<Input id="settings-email" class="text-xs" placeholder="user@example.com" disabled />
					</div>
				</div>
			</section>

			<section id="workspace" class="border-t border-border/50 pt-5">
				<div class="flex items-center gap-2">
					<HugeiconsIcon
						icon={Settings01Icon}
						strokeWidth={2}
						class="size-3.5 text-muted-foreground"
					/>
					<h2 class="text-base font-semibold">Workspace</h2>
				</div>
				<p class="mt-2 text-xs leading-snug text-muted-foreground">
					Default capture, enrichment, and note preferences will live here as those workflows ship.
				</p>
			</section>

			<section id="notifications" class="border-t border-border/50 pt-5">
				<div class="flex items-center gap-2">
					<HugeiconsIcon
						icon={Notification01Icon}
						strokeWidth={2}
						class="size-3.5 text-muted-foreground"
					/>
					<h2 class="text-base font-semibold">Notifications</h2>
				</div>
				<p class="mt-2 text-xs leading-snug text-muted-foreground">
					Background enrichment and automation updates can be surfaced here later.
				</p>
			</section>

			<div class="flex justify-end border-t border-border/50 pt-4">
				<Button size="sm" class="h-8" disabled>Save changes</Button>
			</div>
		</section>
	</div>
</main>

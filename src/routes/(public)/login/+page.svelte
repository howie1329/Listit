<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { restoreAuthSession, signInWithPassword } from '$lib/convex-auth';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let isCheckingSession = $state(true);
	let errorMessage = $state('');

	onMount(() => {
		async function checkSession() {
			if (convexClient && (await restoreAuthSession(convexClient))) {
				await goto(resolve('/app'));
				return;
			}

			isCheckingSession = false;
		}

		void checkSession();
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		if (!convexClient) {
			errorMessage = 'Add VITE_CONVEX_URL before using authentication locally.';
			return;
		}

		if (!email || !password) {
			errorMessage = 'Enter your email and password to continue.';
			return;
		}

		isSubmitting = true;

		try {
			await signInWithPassword(convexClient, email, password);
			await goto(resolve('/app'));
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to sign in right now.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In | ListIt</title>
	<meta name="description" content="Sign in to ListIt with your email and password." />
</svelte:head>

<section class="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-5xl px-4 py-10 sm:px-6">
	<div class="grid w-full gap-10 self-center lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
		<div class="max-w-xl pt-2">
			<p class="text-[11px] font-medium text-muted-foreground uppercase">ListIt account</p>
			<h1 class="mt-3 font-heading text-xl font-semibold">Sign in to your workspace</h1>
			<p class="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
				Get back to saved links, notes, and grounded retrieval from one focused product surface.
			</p>
		</div>

		<div class="border-l border-border/60 pl-0 lg:pl-8">
			{#if isCheckingSession}
				<p class="text-sm text-muted-foreground">Checking session...</p>
			{:else}
				<form class="space-y-4" onsubmit={handleSubmit}>
					<div>
						<label class="mb-1.5 block text-xs font-medium" for="login-email">Email</label>
						<Input
							id="login-email"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							autocomplete="email"
						/>
					</div>

					<div>
						<label class="mb-1.5 block text-xs font-medium" for="login-password">Password</label>
						<Input
							id="login-password"
							type="password"
							placeholder="Your password"
							bind:value={password}
							autocomplete="current-password"
						/>
					</div>

					{#if errorMessage}
						<p class="text-xs text-destructive">{errorMessage}</p>
					{/if}

					<div class="flex flex-wrap items-center gap-2 pt-1">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Signing in...' : 'Sign in'}
						</Button>
						<Button href="/signup" variant="ghost">Create account</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>

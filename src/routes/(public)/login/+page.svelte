<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { applyFreshAuth, hasStoredAuthSession, runPasswordAuth } from '$lib/convex-auth';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let signedIn = $state(false);

	onMount(() => {
		signedIn = hasStoredAuthSession();
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
			const result = await runPasswordAuth(convexClient, 'signIn', email.trim(), password);
			if (result.tokens) {
				applyFreshAuth(convexClient, result.tokens);
				signedIn = true;
				await goto(resolve('/'));
				return;
			}

			errorMessage = 'Sign in did not finish. Please try again.';
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

<section class="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center">
		<div class="max-w-md">
			<p class="text-sm font-medium text-muted-foreground">Authentication</p>
			<h1 class="mt-4 font-heading text-4xl font-semibold text-balance sm:text-5xl">
				Welcome back to ListIt.
			</h1>
			<p class="mt-4 text-base leading-7 text-pretty text-muted-foreground">
				Sign in to get back to saved links, editable notes, and whatever small pile of context you
				were building.
			</p>
		</div>

		<div
			class="rounded-lg border border-border/70 bg-card/88 p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6"
		>
			{#if signedIn}
				<div class="space-y-4">
					<p class="text-sm font-medium">You are already signed in on this device.</p>
					<p class="text-sm leading-6 text-muted-foreground">
						The local session is active, so you can head back to the landing page while the rest of
						the product surface catches up.
					</p>
					<div class="flex flex-wrap gap-3">
						<Button href="/" class="rounded-full">Return home</Button>
						<Button href="/roadmap" variant="outline" class="rounded-full">See what’s next</Button>
					</div>
				</div>
			{:else}
				<form class="space-y-4" onsubmit={handleSubmit}>
					<div>
						<label class="mb-2 block text-sm font-medium" for="login-email">Email</label>
						<Input
							id="login-email"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							autocomplete="email"
						/>
					</div>

					<div>
						<label class="mb-2 block text-sm font-medium" for="login-password">Password</label>
						<Input
							id="login-password"
							type="password"
							placeholder="Your password"
							bind:value={password}
							autocomplete="current-password"
						/>
					</div>

					{#if errorMessage}
						<p class="text-sm text-destructive">{errorMessage}</p>
					{/if}

					<div class="flex flex-wrap items-center gap-3 pt-2">
						<Button type="submit" disabled={isSubmitting} class="rounded-full">
							{isSubmitting ? 'Signing in...' : 'Sign in'}
						</Button>
						<Button href="/signup" variant="outline" class="rounded-full">Create account</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>

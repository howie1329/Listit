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

	onMount(() => {
		if (hasStoredAuthSession()) {
			void goto(resolve('/app'));
		}
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
				await goto(resolve('/app'));
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

<section class="min-h-[calc(100svh-3.5rem)] border-b border-border/60">
	<div
		class="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl gap-0 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.72fr)] lg:px-8"
	>
		<div
			class="flex items-end border-b border-border/60 py-10 lg:border-r lg:border-b-0 lg:py-12 lg:pr-12"
		>
			<div class="max-w-xl">
				<p class="text-sm font-medium text-muted-foreground">Authentication</p>
				<h1 class="mt-4 font-heading text-5xl leading-tight font-semibold text-balance sm:text-6xl">
					Sign in to ListIt.
				</h1>
				<p class="mt-4 max-w-lg text-base leading-7 text-pretty text-muted-foreground">
					Return to your saved links, editable notes, and grounded answers.
				</p>
			</div>
		</div>

		<div class="flex items-center py-10 lg:pl-12">
			<div class="w-full max-w-md">
				<div class="border-b border-border/60 pb-4">
					<h2 class="text-base font-semibold">Welcome back</h2>
					<p class="mt-1 text-sm leading-6 text-muted-foreground">
						Use the email and password connected to this workspace.
					</p>
				</div>

				<form class="space-y-4 pt-5" onsubmit={handleSubmit}>
					<div>
						<label class="mb-2 block text-sm font-medium" for="login-email">Email</label>
						<Input
							id="login-email"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							autocomplete="email"
							disabled={isSubmitting}
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
							disabled={isSubmitting}
						/>
					</div>

					{#if errorMessage}
						<p class="border-l border-destructive pl-3 text-sm leading-6 text-destructive">
							{errorMessage}
						</p>
					{/if}

					<div class="flex flex-wrap items-center gap-3 border-t border-border/60 pt-5">
						<Button type="submit" disabled={isSubmitting} class="rounded-full">
							{isSubmitting ? 'Signing in...' : 'Sign in'}
						</Button>
						<Button href={resolve('/signup')} variant="ghost" class="rounded-full">
							Create account
						</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

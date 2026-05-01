<script lang="ts">
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { applyFreshAuth, hasStoredAuthSession, runPasswordAuth } from '$lib/convex-auth';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let created = $state(false);
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

		if (!email || !password || !confirmPassword) {
			errorMessage = 'Fill in every field to create your account.';
			return;
		}

		if (password.length < 8) {
			errorMessage = 'Use a password with at least 8 characters.';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Passwords need to match.';
			return;
		}

		isSubmitting = true;

		try {
			const result = await runPasswordAuth(convexClient, 'signUp', email.trim(), password);
			if (result.tokens) {
				applyFreshAuth(convexClient, result.tokens);
				created = true;
				signedIn = true;
				return;
			}

			errorMessage = 'Account creation did not finish. Please try again.';
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to create the account right now.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up | ListIt</title>
	<meta
		name="description"
		content="Create a ListIt account for lightweight bookmarking and grounded retrieval."
	/>
</svelte:head>

<section class="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center">
		<div class="max-w-md">
			<p class="text-sm font-medium text-muted-foreground">Create account</p>
			<h1 class="mt-4 font-heading text-4xl font-semibold text-balance sm:text-5xl">
				Start small. Keep what matters.
			</h1>
			<p class="mt-4 text-base leading-7 text-pretty text-muted-foreground">
				ListIt is for the links you mean to come back to. Save quickly, organize lightly, and let
				the product do the remembering after that.
			</p>
		</div>

		<div
			class="rounded-lg border border-border/70 bg-card/88 p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6"
		>
			{#if created}
				<div class="space-y-4">
					<p class="text-sm font-medium">Your account is ready.</p>
					<p class="text-sm leading-6 text-muted-foreground">
						This device now has an active local session. The rest of the product surface is still
						coming together, but the auth flow is real.
					</p>
					<div class="flex flex-wrap gap-3">
						<Button href="/" class="rounded-full">Return home</Button>
						<Button href="/roadmap" variant="outline" class="rounded-full">See the roadmap</Button>
					</div>
				</div>
			{:else if signedIn}
				<div class="space-y-4">
					<p class="text-sm font-medium">You already have an active session here.</p>
					<p class="text-sm leading-6 text-muted-foreground">
						You can sign in again later, but right now this browser already has a ListIt session.
					</p>
					<div class="flex flex-wrap gap-3">
						<Button href="/" class="rounded-full">Return home</Button>
						<Button href="/login" variant="outline" class="rounded-full">Go to sign in</Button>
					</div>
				</div>
			{:else}
				<form class="space-y-4" onsubmit={handleSubmit}>
					<div>
						<label class="mb-2 block text-sm font-medium" for="signup-email">Email</label>
						<Input
							id="signup-email"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							autocomplete="email"
						/>
					</div>

					<div>
						<label class="mb-2 block text-sm font-medium" for="signup-password">Password</label>
						<Input
							id="signup-password"
							type="password"
							placeholder="At least 8 characters"
							bind:value={password}
							autocomplete="new-password"
						/>
					</div>

					<div>
						<label class="mb-2 block text-sm font-medium" for="signup-confirm"
							>Confirm password</label
						>
						<Input
							id="signup-confirm"
							type="password"
							placeholder="Repeat password"
							bind:value={confirmPassword}
							autocomplete="new-password"
						/>
					</div>

					{#if errorMessage}
						<p class="text-sm text-destructive">{errorMessage}</p>
					{/if}

					<div class="flex flex-wrap items-center gap-3 pt-2">
						<Button type="submit" disabled={isSubmitting} class="rounded-full">
							{isSubmitting ? 'Creating account...' : 'Create account'}
						</Button>
						<Button href="/login" variant="outline" class="rounded-full"
							>Already have an account</Button
						>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>

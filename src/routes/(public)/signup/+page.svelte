<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useConvexClient } from 'convex-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { convexAuth } from '$lib/convex-auth.svelte';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	$effect(() => {
		if (!convexAuth.isLoading && convexAuth.isAuthenticated) {
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
			const result = await convexAuth.signUp(convexClient, email.trim(), password);
			if (result.tokens) {
				await goto(resolve('/app'));
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

<section class="min-h-[calc(100svh-3.5rem)] border-b border-border/60">
	<div
		class="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl gap-0 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.72fr)] lg:px-8"
	>
		<div
			class="flex items-end border-b border-border/60 py-10 lg:border-r lg:border-b-0 lg:py-12 lg:pr-12"
		>
			<div class="max-w-xl">
				<p class="text-sm font-medium text-muted-foreground">Create account</p>
				<h1 class="mt-4 font-heading text-5xl leading-tight font-semibold text-balance sm:text-6xl">
					Create your ListIt account.
				</h1>
				<p class="mt-4 max-w-lg text-base leading-7 text-pretty text-muted-foreground">
					Start with a fast bookmark library you can ask later.
				</p>
			</div>
		</div>

		<div class="flex items-center py-10 lg:pl-12">
			<div class="w-full max-w-md">
				<div class="border-b border-border/60 pb-4">
					<h2 class="text-base font-semibold">Start saving links</h2>
					<p class="mt-1 text-sm leading-6 text-muted-foreground">
						One account keeps capture, notes, and retrieval in the same workspace.
					</p>
				</div>

				<form class="space-y-4 pt-5" onsubmit={handleSubmit}>
					<div>
						<label class="mb-2 block text-sm font-medium" for="signup-email">Email</label>
						<Input
							id="signup-email"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							autocomplete="email"
							disabled={isSubmitting}
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
							disabled={isSubmitting}
						/>
					</div>

					<div>
						<label class="mb-2 block text-sm font-medium" for="signup-confirm">
							Confirm password
						</label>
						<Input
							id="signup-confirm"
							type="password"
							placeholder="Repeat password"
							bind:value={confirmPassword}
							autocomplete="new-password"
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
							{isSubmitting ? 'Creating account...' : 'Create account'}
						</Button>
						<Button href={resolve('/login')} variant="ghost" class="rounded-full">
							Already have an account
						</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

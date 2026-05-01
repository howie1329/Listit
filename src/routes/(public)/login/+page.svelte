<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>Sign In | ListIt</title>
	<meta
		name="description"
		content="Sign in to ListIt. This route is reserved for the upcoming Convex Auth flow."
	/>
</svelte:head>

<section
	class="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8"
>
	<div class="w-full rounded-2xl border border-border/70 px-6 py-8 sm:px-8">
		<p class="text-sm font-medium text-muted-foreground">Authentication</p>
		<h1 class="mt-4 font-heading text-3xl font-semibold text-balance sm:text-4xl">
			Sign in is the next public step.
		</h1>
		<p class="mt-4 max-w-xl text-base leading-6 text-pretty text-muted-foreground">
			We’ve set the sign-in path now so the public experience stays stable while account access
			comes online next.
		</p>

		<div class="mt-6 flex flex-wrap gap-3">
			<Button href="/signup" class="rounded-full">Create an account</Button>
			<Button href="/" variant="outline" class="rounded-full">Back home</Button>
		</div>
	</div>
</section>

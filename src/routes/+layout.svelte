<script lang="ts">
	import { setupConvex } from 'convex-svelte';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { convexAuth } from '$lib/convex-auth.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	if (convexUrl) {
		setupConvex(convexUrl);
	}
	const convexClient = convexUrl ? useConvexClient() : null;

	onMount(() => {
		convexAuth.initAuth(convexClient);
	});

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="system" themeColors={{ light: '#f3f5f2', dark: '#0d1318' }} />

{@render children()}

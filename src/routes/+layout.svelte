<script lang="ts">
	import { setupConvex } from 'convex-svelte';
	import { ModeWatcher } from 'mode-watcher';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	if (convexUrl) {
		setupConvex(convexUrl);
	}

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="system" themeColors={{ light: '#f3f5f2', dark: '#0d1318' }} />
<Toaster richColors closeButton />

{@render children()}

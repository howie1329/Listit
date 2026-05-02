<script lang="ts">
	import {
		ArrowRight01Icon,
		Link01Icon,
		MessageQuestionIcon,
		QuoteDownIcon,
		Search01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { page } from '$app/state';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { postAppApi } from '$lib/app-api';
	import { Button } from '$lib/components/ui/button';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Textarea } from '$lib/components/ui/textarea';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Doc, Id } from '../../../../convex/_generated/dataModel';
	import { applyStoredAuth } from '$lib/convex-auth';

	type Bookmark = Doc<'bookmarks'>;
	type Citation = {
		bookmarkId: Id<'bookmarks'>;
		chunkId?: Id<'bookmarkChunks'>;
		title?: string;
		url: string;
		snippet?: string;
	};
	type ChatResponse = {
		threadId: Id<'chatThreads'>;
		answer: string;
		citations: Citation[];
	};

	const convexUrl = import.meta.env.VITE_CONVEX_URL;
	const convexClient = convexUrl ? useConvexClient() : null;
	if (convexClient) {
		applyStoredAuth(convexClient);
	}

	const bookmarkId = $derived(page.url.searchParams.get('bookmarkId') as Id<'bookmarks'> | null);
	const initialQuestion = page.url.searchParams.get('q') ?? '';
	const bookmarkQuery = convexClient
		? useQuery(api.bookmarks.get, () => (bookmarkId ? { bookmarkId } : 'skip'))
		: null;
	const bookmark: Bookmark | null = $derived((bookmarkQuery?.data?.bookmark as Bookmark) ?? null);

	let question = $state(initialQuestion);
	let isAsking = $state(false);
	let threadId = $state<Id<'chatThreads'> | null>(null);
	let answer = $state('');
	let citations = $state<Citation[]>([]);
	let errorMessage = $state('');

	function titleFor(bookmark: Bookmark) {
		return bookmark.title || hostnameFor(bookmark.url);
	}

	function hostnameFor(urlValue: string) {
		try {
			return new URL(urlValue).hostname.replace(/^www\./, '');
		} catch {
			return urlValue;
		}
	}

	function openCitation(url: string) {
		window.open(url, '_blank', 'noreferrer');
	}

	async function handleAsk(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		const message = question.trim();
		if (!message) {
			errorMessage = 'Ask a question first.';
			return;
		}

		isAsking = true;

		try {
			const response = await postAppApi<ChatResponse>('/api/chat', {
				message,
				...(threadId ? { threadId } : {})
			});

			threadId = response.threadId;
			answer = response.answer;
			citations = response.citations;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unable to ask bookmarks right now.';
			errorMessage = message;
			toast.error(message);
		} finally {
			isAsking = false;
		}
	}
</script>

<svelte:head>
	<title>Ask | ListIt</title>
	<meta name="description" content="Ask questions grounded in your saved ListIt bookmarks." />
</svelte:head>

<div class="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
	<section class="border-b border-border/60 px-4 py-3">
		<div class="flex flex-col gap-2">
			<p class="text-[11px] font-medium text-muted-foreground uppercase">Ask my bookmarks</p>
			<h1 class="font-heading text-xl font-semibold">Grounded answers from saved links</h1>
			<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
				Ask across enriched bookmarks. Answers cite saved links when matching context exists.
			</p>
		</div>
	</section>

	<div class="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
		<main class="flex min-h-0 flex-col">
			<form class="border-b border-border/60 p-4" onsubmit={handleAsk}>
				{#if bookmark}
					<div class="mb-3 flex items-start gap-2 rounded-md border border-border/60 p-3">
						<HugeiconsIcon
							icon={Link01Icon}
							strokeWidth={2}
							class="mt-0.5 size-4 shrink-0 text-muted-foreground"
						/>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{titleFor(bookmark)}</p>
							<p class="mt-1 truncate text-xs text-muted-foreground">{hostnameFor(bookmark.url)}</p>
						</div>
					</div>
				{/if}

				<label class="mb-2 block text-sm font-medium" for="ask-question">Question</label>
				<Textarea
					id="ask-question"
					class="min-h-28 resize-none"
					placeholder="What should I remember from my saved links?"
					bind:value={question}
					disabled={isAsking}
				/>

				{#if errorMessage}
					<p class="mt-2 text-xs text-destructive">{errorMessage}</p>
				{/if}

				<div class="mt-3 flex justify-end">
					<Button type="submit" disabled={isAsking}>
						<HugeiconsIcon icon={MessageQuestionIcon} strokeWidth={2} data-icon="inline-start" />
						{isAsking ? 'Asking...' : 'Ask'}
					</Button>
				</div>
			</form>

			<ScrollArea.ScrollArea class="min-h-0 flex-1">
				<div class="p-4">
					{#if answer}
						<div class="max-w-3xl">
							<div class="flex items-center gap-2">
								<HugeiconsIcon
									icon={Search01Icon}
									strokeWidth={2}
									class="size-4 text-muted-foreground"
								/>
								<h2 class="text-base font-semibold">Answer</h2>
							</div>
							<p class="mt-3 text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
								{answer}
							</p>
						</div>
					{:else}
						<div class="max-w-xl py-10">
							<p class="text-sm font-medium">No answer yet</p>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">
								Ask a question after saving and enriching bookmarks. If there is no matching
								context, ListIt will say so instead of guessing.
							</p>
						</div>
					{/if}
				</div>
			</ScrollArea.ScrollArea>
		</main>

		<aside class="hidden min-h-0 border-l border-border/60 lg:flex lg:flex-col">
			<div class="border-b border-border/60 px-4 py-3">
				<p class="text-[11px] font-medium text-muted-foreground uppercase">Citations</p>
				<p class="mt-2 text-sm text-muted-foreground">
					{citations.length
						? `${citations.length} saved source${citations.length === 1 ? '' : 's'}`
						: 'No citations yet'}
				</p>
			</div>

			<ScrollArea.ScrollArea class="min-h-0 flex-1">
				<div class="flex flex-col gap-2 p-3">
					{#each citations as citation (citation.bookmarkId)}
						<button
							type="button"
							class="rounded-md p-2 text-left transition-colors hover:bg-accent"
							onclick={() => openCitation(citation.url)}
						>
							<div class="flex items-center gap-2">
								<HugeiconsIcon
									icon={QuoteDownIcon}
									strokeWidth={2}
									class="size-4 shrink-0 text-muted-foreground"
								/>
								<span class="min-w-0 truncate text-sm font-medium">
									{citation.title ?? hostnameFor(citation.url)}
								</span>
							</div>
							{#if citation.snippet}
								<p class="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
									{citation.snippet}
								</p>
							{/if}
							<div class="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
								<span class="truncate">{hostnameFor(citation.url)}</span>
								<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} class="size-3" />
							</div>
						</button>
					{:else}
						<p class="px-1 py-4 text-sm leading-6 text-muted-foreground">
							Citations appear here when the answer uses saved bookmark chunks.
						</p>
					{/each}
				</div>
			</ScrollArea.ScrollArea>
		</aside>
	</div>
</div>

<script lang="ts">
	import {
		ArrowRight01Icon,
		Bookmark01Icon,
		LinkSquare01Icon,
		Search01Icon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<svelte:head>
	<title>Ask | ListIt</title>
	<meta name="description" content="Ask questions grounded in your saved ListIt bookmarks." />
</svelte:head>

<main class="flex min-h-0 flex-1 flex-col">
	<header class="border-b border-border/50 px-4 py-3">
		<h1 class="font-heading text-xl font-semibold">Ask</h1>
		<p class="mt-0.5 text-xs text-muted-foreground">
			Ask across saved bookmarks and get answers grounded with citations.
		</p>
	</header>

	<div class="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<section class="flex min-h-0 flex-col px-4 py-4">
			<div
				class="flex min-h-0 flex-1 items-center justify-center rounded-md border border-dashed border-border/70 p-6"
			>
				<Empty.Empty class="border-0">
					<Empty.EmptyHeader>
						<Empty.EmptyMedia>
							<HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
						</Empty.EmptyMedia>
						<Empty.EmptyTitle>Ask is ready for routing</Empty.EmptyTitle>
						<Empty.EmptyDescription>
							Grounded answers will search enriched bookmark text and cite the saved links used.
						</Empty.EmptyDescription>
					</Empty.EmptyHeader>
				</Empty.Empty>
			</div>

			<div class="mt-3 flex items-end gap-2">
				<Textarea
					class="min-h-20 resize-none text-xs"
					placeholder="Ask a question about your saved links..."
					disabled
				/>
				<Button class="mb-0.5 h-8" disabled>
					Ask
					<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
				</Button>
			</div>
		</section>

		<aside class="hidden border-l border-border/50 lg:block">
			<div class="border-b border-border/50 px-4 py-3">
				<p class="text-[11px] font-medium text-muted-foreground uppercase">Answer context</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Future retrieval inputs for grounded answers.
				</p>
			</div>
			<div class="space-y-4 p-4">
				<section>
					<div class="flex items-center gap-2">
						<HugeiconsIcon
							icon={Bookmark01Icon}
							strokeWidth={2}
							class="size-3.5 text-muted-foreground"
						/>
						<h2 class="text-xs font-medium">Saved bookmarks</h2>
					</div>
					<p class="mt-2 text-xs leading-snug text-muted-foreground">
						Enriched bookmark content will be searched before an answer is generated.
					</p>
				</section>
				<section>
					<div class="flex items-center gap-2">
						<HugeiconsIcon
							icon={LinkSquare01Icon}
							strokeWidth={2}
							class="size-3.5 text-muted-foreground"
						/>
						<h2 class="text-xs font-medium">Citations</h2>
					</div>
					<p class="mt-2 text-xs leading-snug text-muted-foreground">
						Answers will point back to the source bookmarks that support the response.
					</p>
				</section>
			</div>
		</aside>
	</div>
</main>

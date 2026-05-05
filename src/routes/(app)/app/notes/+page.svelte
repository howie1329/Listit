<script lang="ts">
	import {
		BookOpen02Icon,
		Link01Icon,
		NoteEditIcon,
		PlusSignIcon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<svelte:head>
	<title>Notes | ListIt</title>
	<meta name="description" content="Review and edit notes attached to saved ListIt bookmarks." />
</svelte:head>

<main class="flex min-h-0 flex-1 flex-col">
	<header class="border-b border-border/50 px-4 py-3">
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="font-heading text-xl font-semibold">Notes</h1>
				<p class="mt-0.5 text-xs text-muted-foreground">
					Review notes connected to saved links and keep useful context editable.
				</p>
			</div>
			<Button size="sm" class="h-8 w-fit" disabled>
				<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
				New note
			</Button>
		</div>
	</header>

	<div class="grid min-h-0 flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
		<aside class="hidden border-r border-border/50 lg:block">
			<div class="border-b border-border/50 px-4 py-3">
				<p class="text-[11px] font-medium text-muted-foreground uppercase">Note sources</p>
				<p class="mt-1 text-xs text-muted-foreground">Notes stay attached to bookmarks.</p>
			</div>
			<div class="space-y-2 p-2">
				<div class="rounded-md px-2 py-2 text-xs text-muted-foreground">No bookmark notes yet.</div>
			</div>
		</aside>

		<section class="flex min-h-0 flex-col px-4 py-4">
			<div
				class="flex min-h-56 items-center justify-center rounded-md border border-dashed border-border/70 p-6"
			>
				<Empty.Empty class="border-0">
					<Empty.EmptyHeader>
						<Empty.EmptyMedia>
							<HugeiconsIcon icon={NoteEditIcon} strokeWidth={2} />
						</Empty.EmptyMedia>
						<Empty.EmptyTitle>No notes yet</Empty.EmptyTitle>
						<Empty.EmptyDescription>
							Saved bookmark notes will appear here for focused review and editing.
						</Empty.EmptyDescription>
					</Empty.EmptyHeader>
				</Empty.Empty>
			</div>

			<div class="mt-4 grid gap-4 lg:grid-cols-2">
				<section>
					<div class="flex items-center gap-2">
						<HugeiconsIcon
							icon={BookOpen02Icon}
							strokeWidth={2}
							class="size-3.5 text-muted-foreground"
						/>
						<h2 class="text-xs font-medium">Reader notes</h2>
					</div>
					<Textarea
						class="mt-2 min-h-32 resize-none text-xs"
						placeholder="Select a bookmark note..."
						disabled
					/>
				</section>
				<section>
					<div class="flex items-center gap-2">
						<HugeiconsIcon
							icon={Link01Icon}
							strokeWidth={2}
							class="size-3.5 text-muted-foreground"
						/>
						<h2 class="text-xs font-medium">Linked bookmark</h2>
					</div>
					<p class="mt-2 text-xs leading-snug text-muted-foreground">
						Each note will keep its source link close so edits remain grounded in the saved page.
					</p>
				</section>
			</div>
		</section>
	</div>
</main>

<script lang="ts">
	import {
		ArrowRight01Icon,
		CheckmarkCircle02Icon,
		Clock01Icon,
		Link01Icon,
		MagicWand01Icon,
		NoteEditIcon,
		PanelRightCloseIcon,
		SearchList01Icon,
		Folder01Icon,
		Tag01Icon,
		Delete02Icon,
		RefreshIcon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { page } from '$app/state';
	import { api } from '../../../convex/_generated/api.js';
	import type { Doc, Id } from '../../../convex/_generated/dataModel';
	import { Button } from '$lib/components/ui/button';
	import BookmarkList from '$lib/components/library/bookmark-list.svelte';
	import LibraryHeader from '$lib/components/library/library-header.svelte';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		formatDate,
		getBookmarkReadiness,
		getDisplayTitle,
		getHostname,
		normalizeTagName,
		normalizeTagNames
	} from '$lib/bookmark-utils';
	import { cn } from '$lib/utils';

	type BookmarkRow = {
		bookmark: Doc<'bookmarks'>;
		tags: Doc<'tags'>[];
		collection: Doc<'collections'> | null;
	};
	type BookmarkDetail = {
		bookmark: Doc<'bookmarks'>;
		tags: Doc<'tags'>[];
	};
	type TagOption = {
		name: string;
		type: 'existing' | 'create';
	};

	const convexClient = useConvexClient();
	const selectedCollectionId = $derived(
		page.url.searchParams.get('collection') as Id<'collections'> | null
	);
	const selectedTagId = $derived(page.url.searchParams.get('tag') as Id<'tags'> | null);
	const bookmarksResponse = useQuery(api.bookmarks.list, () =>
		selectedCollectionId || selectedTagId
			? {
					...(selectedCollectionId ? { collectionId: selectedCollectionId } : {}),
					...(selectedTagId ? { tagId: selectedTagId } : {})
				}
			: {}
	);
	const collectionsResponse = useQuery(api.collections.list, {});
	const tagsResponse = useQuery(api.tags.list, {});
	const rows = $derived((bookmarksResponse.data ?? []) as BookmarkRow[]);
	const collections = $derived((collectionsResponse.data ?? []) as Doc<'collections'>[]);
	const allTags = $derived((tagsResponse.data ?? []) as Doc<'tags'>[]);
	let selectedBookmarkId = $state<Id<'bookmarks'> | null>(null);
	let url = $state('');
	let saveSuccess = $state('');
	let saveError = $state('');
	let isSaving = $state(false);
	let assignmentError = $state('');
	let isAssigningCollection = $state(false);
	let tagInput = $state('');
	let tagDraft = $state<string[]>([]);
	let tagError = $state('');
	let isSavingTags = $state(false);
	let isTagInputFocused = $state(false);
	let highlightedTagOptionIndex = $state(0);
	let isInspectorOpen = $state(true);
	const hasBookmarks = $derived(rows.length > 0);
	const showInspector = $derived(isInspectorOpen && hasBookmarks);
	let retryError = $state('');
	let retryingBookmarkId = $state<Id<'bookmarks'> | null>(null);
	let noteDraft = $state('');
	let noteSaveError = $state('');
	let noteSaveStatus = $state('');
	let isSavingNote = $state(false);
	let noteDraftBookmarkId = $state<Id<'bookmarks'> | null>(null);
	let lastLoadedNote = $state('');

	const selectedRow = $derived(
		rows.find((row) => row.bookmark._id === selectedBookmarkId) ?? rows[0] ?? null
	);
	const selectedDetailResponse = useQuery(api.bookmarks.get, () =>
		selectedRow ? { bookmarkId: selectedRow.bookmark._id } : 'skip'
	);
	const selectedDetail = $derived((selectedDetailResponse.data ?? null) as BookmarkDetail | null);
	const selectedBookmark = $derived(selectedDetail?.bookmark ?? selectedRow?.bookmark ?? null);
	const selectedTags = $derived(selectedDetail?.tags ?? selectedRow?.tags ?? []);
	const selectedCollection = $derived(
		selectedBookmark?.collectionId
			? (collections.find((collection) => collection._id === selectedBookmark.collectionId) ?? null)
			: null
	);

	const readinessIcons = {
		extracting: Clock01Icon,
		ready: CheckmarkCircle02Icon,
		no_text: SearchList01Icon,
		failed: MagicWand01Icon
	};

	function openSourceUrl(url: string) {
		window.open(url, '_blank', 'noreferrer');
	}

	const savedTagNames = $derived(selectedTags.map((tag) => tag.name));
	const normalizedTagInput = $derived(normalizeTagName(tagInput));
	const selectedTagKeys = $derived(new Set(tagDraft.map((tag) => tag.toLowerCase())));
	const existingTagKeys = $derived(new Set(allTags.map((tag) => tag.name.toLowerCase())));
	const matchingTagOptions = $derived(
		allTags
			.filter((tag) => !selectedTagKeys.has(tag.name.toLowerCase()))
			.filter(
				(tag) =>
					!normalizedTagInput || tag.name.toLowerCase().includes(normalizedTagInput.toLowerCase())
			)
			.map((tag) => ({ name: tag.name, type: 'existing' }) satisfies TagOption)
	);
	const canCreateTagOption = $derived(
		Boolean(
			normalizedTagInput &&
			!selectedTagKeys.has(normalizedTagInput.toLowerCase()) &&
			!existingTagKeys.has(normalizedTagInput.toLowerCase())
		)
	);
	const tagOptions = $derived(
		canCreateTagOption
			? [...matchingTagOptions, { name: normalizedTagInput, type: 'create' } satisfies TagOption]
			: matchingTagOptions
	);
	const showTagOptions = $derived(isTagInputFocused && tagOptions.length > 0);
	const hasTagChanges = $derived(
		normalizeTagNames(savedTagNames).join('\n') !== normalizeTagNames(tagDraft).join('\n')
	);
	const hasNoteChanges = $derived(noteDraft !== lastLoadedNote);

	$effect(() => {
		tagDraft = savedTagNames;
		tagInput = '';
		tagError = '';
		isTagInputFocused = false;
		highlightedTagOptionIndex = 0;
	});

	$effect(() => {
		if (!selectedBookmark) {
			noteDraftBookmarkId = null;
			lastLoadedNote = '';
			noteDraft = '';
			noteSaveError = '';
			noteSaveStatus = '';
			return;
		}

		const selectedId = selectedBookmark._id;
		const latestNote = selectedBookmark.note ?? '';
		const changedBookmark = noteDraftBookmarkId !== selectedId;
		const serverNoteChanged = latestNote !== lastLoadedNote;
		const hasUnsavedDraft = noteDraft !== lastLoadedNote;

		if (changedBookmark || (serverNoteChanged && !hasUnsavedDraft)) {
			noteDraftBookmarkId = selectedId;
			lastLoadedNote = latestNote;
			noteDraft = latestNote;
			noteSaveError = '';
			noteSaveStatus = '';
		}
	});

	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		const trimmedUrl = url.trim();
		if (!trimmedUrl) return;

		isSaving = true;
		saveSuccess = '';
		saveError = '';

		try {
			const result = await convexClient.mutation(api.bookmarks.saveUrl, { url: trimmedUrl });
			selectedBookmarkId = result.bookmarkId;
			url = '';
			saveSuccess = result.created
				? 'Saved. Extraction is pending.'
				: 'Already saved. Moved to the top.';
		} catch (error) {
			saveError =
				error instanceof Error && error.message.includes('Invalid URL')
					? 'Enter a valid URL or domain.'
					: error instanceof Error
						? error.message
						: 'Could not save this URL.';
		} finally {
			isSaving = false;
		}
	}

	async function handleCollectionAssignment(value: string) {
		if (!convexClient || !selectedBookmark) return;

		const collectionId = value === 'unassigned' ? null : (value as Id<'collections'>);
		isAssigningCollection = true;
		assignmentError = '';

		try {
			await convexClient.mutation(api.bookmarks.update, {
				bookmarkId: selectedBookmark._id,
				collectionId
			});
		} catch (error) {
			assignmentError = error instanceof Error ? error.message : 'Could not update collection.';
		} finally {
			isAssigningCollection = false;
		}
	}

	function addTagNames(names: string[]) {
		const next = normalizeTagNames([...tagDraft, ...names]);
		tagDraft = next;
	}

	function removeTagName(name: string) {
		tagDraft = tagDraft.filter((tag) => tag !== name);
	}

	function commitTagInput() {
		const names = tagInput.split(',').map(normalizeTagName);
		addTagNames(names);
		tagInput = '';
		highlightedTagOptionIndex = 0;
	}

	function selectTagOption(option: TagOption) {
		addTagNames([option.name]);
		tagInput = '';
		highlightedTagOptionIndex = 0;
	}

	function handleTagInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' && tagOptions.length) {
			event.preventDefault();
			highlightedTagOptionIndex = (highlightedTagOptionIndex + 1) % tagOptions.length;
			return;
		}

		if (event.key === 'ArrowUp' && tagOptions.length) {
			event.preventDefault();
			highlightedTagOptionIndex =
				(highlightedTagOptionIndex - 1 + tagOptions.length) % tagOptions.length;
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			const option = tagOptions[highlightedTagOptionIndex] ?? tagOptions[0];
			if (option) {
				selectTagOption(option);
			} else {
				commitTagInput();
			}
			return;
		}

		if (event.key === ',') {
			event.preventDefault();
			commitTagInput();
		}
	}

	async function handleSaveTags() {
		if (!convexClient || !selectedBookmark) return;

		const names = normalizeTagNames([...tagDraft, ...tagInput.split(',')]);
		tagDraft = names;
		tagInput = '';

		isSavingTags = true;
		tagError = '';

		try {
			await convexClient.mutation(api.bookmarks.setTags, {
				bookmarkId: selectedBookmark._id,
				tagNames: names
			});
		} catch (error) {
			tagError = error instanceof Error ? error.message : 'Could not update tags.';
		} finally {
			isSavingTags = false;
		}
	}

	async function handleRetryExtraction() {
		if (!convexClient || !selectedBookmark) return;

		retryingBookmarkId = selectedBookmark._id;
		retryError = '';

		try {
			await convexClient.mutation(api.bookmarks.retryExtraction, {
				bookmarkId: selectedBookmark._id
			});
		} catch (error) {
			retryError = error instanceof Error ? error.message : 'Could not retry extraction.';
		} finally {
			retryingBookmarkId = null;
		}
	}

	async function handleSaveNote() {
		if (!convexClient || !selectedBookmark || !hasNoteChanges) return;

		isSavingNote = true;
		noteSaveError = '';
		noteSaveStatus = '';

		try {
			await convexClient.mutation(api.bookmarks.updateNote, {
				bookmarkId: selectedBookmark._id,
				note: noteDraft
			});
			lastLoadedNote = noteDraft;
			noteSaveStatus = 'Saved';
		} catch (error) {
			noteSaveError = error instanceof Error ? error.message : 'Could not save note.';
		} finally {
			isSavingNote = false;
		}
	}
</script>

<div
	class={cn(
		'flex h-[calc(100svh-3rem)] min-h-0 flex-col transition-[grid-template-columns] duration-200 ease-out lg:grid',
		showInspector ? 'lg:grid-cols-[minmax(0,1fr)_24rem]' : 'lg:grid-cols-[minmax(0,1fr)_0rem]'
	)}
>
	<section class="flex min-h-0 min-w-0 flex-col">
		<LibraryHeader
			count={rows.length}
			bind:url
			{isSaving}
			{saveError}
			{saveSuccess}
			{isInspectorOpen}
			onsubmit={handleSave}
			onToggleInspector={() => (isInspectorOpen = !isInspectorOpen)}
		/>

		<BookmarkList
			{rows}
			isLoading={bookmarksResponse.isLoading}
			error={bookmarksResponse.error}
			selectedBookmarkId={selectedRow?.bookmark._id ?? null}
			onselect={(bookmarkId) => (selectedBookmarkId = bookmarkId)}
		/>
	</section>

	<aside
		class={cn(
			'hidden min-h-0 overflow-hidden border-l border-border/50 transition-opacity duration-200 lg:flex lg:flex-col',
			showInspector ? 'opacity-100' : 'pointer-events-none opacity-0'
		)}
		aria-hidden={!showInspector}
	>
		{#if selectedBookmark}
			{@const readiness = getBookmarkReadiness(selectedBookmark)}
			<div class="border-b border-border/50 px-4 py-3.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex min-w-0 items-start gap-2.5">
						<span
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background text-muted-foreground"
						>
							{#if selectedBookmark.faviconUrl}
								<img src={selectedBookmark.faviconUrl} alt="" class="size-4" loading="lazy" />
							{:else}
								<HugeiconsIcon icon={Link01Icon} strokeWidth={2} class="size-4" />
							{/if}
						</span>
						<div class="min-w-0">
							<p class="text-[11px] font-medium text-muted-foreground uppercase">
								Selected bookmark
							</p>
							<h2 class="mt-1 truncate text-base leading-tight font-semibold">
								{getDisplayTitle(selectedBookmark)}
							</h2>
							<p class="mt-0.5 truncate text-xs text-muted-foreground">
								{selectedBookmark.siteName || getHostname(selectedBookmark.url)}
							</p>
						</div>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						class="size-8 shrink-0"
						onclick={() => (isInspectorOpen = false)}
						title="Hide details"
					>
						<HugeiconsIcon icon={PanelRightCloseIcon} strokeWidth={2} />
						<span class="sr-only">Hide details</span>
					</Button>
				</div>
			</div>

			<ScrollArea.ScrollArea class="min-h-0 flex-1">
				<div class="flex flex-col gap-4 p-4">
					{#if selectedDetailResponse.isLoading}
						<div class="space-y-2">
							<Skeleton class="h-3 w-32" />
							<Skeleton class="h-3 w-full" />
							<Skeleton class="h-3 w-2/3" />
						</div>
					{:else if selectedDetailResponse.error}
						<p class="text-xs text-destructive">
							Bookmark detail could not load. {selectedDetailResponse.error.message}
						</p>
					{/if}

					<section class="border-b border-border/40 pb-4">
						<div class="flex items-center gap-2">
							<HugeiconsIcon
								icon={Link01Icon}
								strokeWidth={2}
								class="size-3.5 text-muted-foreground"
							/>
							<h3 class="text-xs font-medium">Source</h3>
						</div>
						<div class="mt-2 space-y-2 text-xs leading-snug">
							<button
								type="button"
								class="block max-w-full truncate text-left text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								onclick={() => openSourceUrl(selectedBookmark.url)}
							>
								{selectedBookmark.url}
							</button>
							{#if selectedBookmark.description}
								<p class="text-muted-foreground">{selectedBookmark.description}</p>
							{/if}
							<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
								<span class="truncate">Host: {getHostname(selectedBookmark.url)}</span>
								<span class="truncate">Collection: {selectedCollection?.name ?? 'Unassigned'}</span>
								{#if selectedBookmark.canonicalUrl}
									<span class="col-span-2 truncate">
										Canonical: {selectedBookmark.canonicalUrl}
									</span>
								{/if}
								{#if selectedBookmark.extractedAt}
									<span class="truncate">
										Extracted: {formatDate(selectedBookmark.extractedAt)}
									</span>
								{/if}
								<span class="truncate">
									Saved: {formatDate(selectedBookmark.lastSavedAt ?? selectedBookmark.createdAt)}
								</span>
							</div>
						</div>
					</section>

					<section class="border-b border-border/40 pb-4">
						<div class="flex items-center gap-2">
							<HugeiconsIcon
								icon={Folder01Icon}
								strokeWidth={2}
								class="size-3.5 text-muted-foreground"
							/>
							<h3 class="text-xs font-medium">Collection</h3>
						</div>
						<select
							class="mt-2 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
							value={selectedBookmark.collectionId ?? 'unassigned'}
							onchange={(event) => handleCollectionAssignment(event.currentTarget.value)}
							disabled={isAssigningCollection || collectionsResponse.isLoading}
						>
							<option value="unassigned">Unassigned</option>
							{#if collections.length}
								{#each collections as collection (collection._id)}
									<option value={collection._id}>{collection.name}</option>
								{/each}
							{/if}
						</select>
						{#if assignmentError}
							<p class="mt-2 text-xs text-destructive">{assignmentError}</p>
						{/if}
					</section>

					<section class="border-b border-border/40 pb-4">
						<div class="flex items-center gap-2">
							<HugeiconsIcon
								icon={Tag01Icon}
								strokeWidth={2}
								class="size-3.5 text-muted-foreground"
							/>
							<h3 class="text-xs font-medium">Tags</h3>
						</div>
						<div
							class="mt-2 flex min-h-20 flex-col gap-2 rounded-lg border border-input px-2.5 py-2"
						>
							<div class="flex flex-wrap gap-1.5">
								{#if tagDraft.length}
									{#each tagDraft as tag (tag)}
										<span
											class="inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-secondary px-1.5 text-[11px] text-secondary-foreground"
										>
											<span class="truncate">{tag}</span>
											<button
												type="button"
												class="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
												onclick={() => removeTagName(tag)}
												disabled={isSavingTags}
											>
												<HugeiconsIcon icon={Delete02Icon} strokeWidth={2} class="size-3" />
												<span class="sr-only">Remove {tag}</span>
											</button>
										</span>
									{/each}
								{:else}
									<span class="text-[11px] text-muted-foreground">No tags assigned</span>
								{/if}
							</div>
							<input
								class="h-7 bg-transparent text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
								bind:value={tagInput}
								onfocus={() => (isTagInputFocused = true)}
								onblur={() => (isTagInputFocused = false)}
								oninput={() => (highlightedTagOptionIndex = 0)}
								onkeydown={handleTagInputKeydown}
								placeholder="Add tags..."
								disabled={isSavingTags}
							/>
							{#if showTagOptions}
								<div
									class="rounded-md border border-border/60 bg-popover p-1 text-xs text-popover-foreground shadow-sm"
									role="listbox"
									aria-label="Tag suggestions"
								>
									{#each tagOptions as option, index (`${option.type}-${option.name}`)}
										<button
											type="button"
											class={cn(
												'flex h-7 w-full items-center justify-between gap-2 rounded-sm px-2 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
												index === highlightedTagOptionIndex && 'bg-accent text-accent-foreground'
											)}
											onmousedown={(event) => event.preventDefault()}
											onclick={() => selectTagOption(option)}
											role="option"
											aria-selected={index === highlightedTagOptionIndex}
										>
											<span class="truncate">
												{option.type === 'create' ? `Create "${option.name}"` : option.name}
											</span>
											{#if option.type === 'existing'}
												<span class="shrink-0 text-[10px] text-muted-foreground">Existing</span>
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						<div class="mt-2 flex items-center justify-between gap-2">
							<p class="text-[11px] text-muted-foreground">Press Enter or comma to add.</p>
							<Button
								type="button"
								size="sm"
								class="h-7"
								onclick={handleSaveTags}
								disabled={isSavingTags || (!hasTagChanges && !tagInput.trim())}
							>
								{isSavingTags ? 'Saving...' : 'Save tags'}
							</Button>
						</div>
						{#if tagError}
							<p class="mt-2 text-xs text-destructive">{tagError}</p>
						{/if}
					</section>

					<section class="border-b border-border/40 pb-4">
						<div class="flex items-center gap-2">
							<HugeiconsIcon
								icon={readinessIcons[readiness.state]}
								strokeWidth={2}
								class={cn(
									'size-3.5 text-muted-foreground',
									readiness.state === 'failed' && 'text-destructive'
								)}
							/>
							<h3 class="text-xs font-medium">Ask context</h3>
						</div>
						<p class="mt-2 text-xs leading-snug text-muted-foreground">
							{readiness.context}
						</p>
						{#if readiness.errorDetail}
							<p class="mt-1 text-xs leading-snug text-destructive">{readiness.errorDetail}</p>
						{/if}
						{#if readiness.state === 'failed'}
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="mt-2 h-8 px-0 text-xs"
								onclick={handleRetryExtraction}
								disabled={retryingBookmarkId === selectedBookmark._id}
							>
								{retryingBookmarkId === selectedBookmark._id ? 'Retrying...' : 'Retry extraction'}
								<HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-end" />
							</Button>
							{#if retryError}
								<p class="mt-2 text-xs text-destructive">{retryError}</p>
							{/if}
						{/if}
						<Button variant="ghost" size="sm" class="mt-2 h-8 px-0 text-xs">
							Ask with this bookmark
							<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
						</Button>
					</section>

					<section class="border-b border-border/40 pb-4">
						<div class="flex items-center gap-2">
							<HugeiconsIcon
								icon={SearchList01Icon}
								strokeWidth={2}
								class="size-3.5 text-muted-foreground"
							/>
							<h3 class="text-xs font-medium">Extracted content</h3>
						</div>
						{#if selectedBookmark.extractedText?.trim()}
							<div
								class="mt-2 max-h-80 overflow-auto rounded-lg border border-border/60 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground"
							>
								{selectedBookmark.extractedText}
							</div>
						{:else if readiness.contentUnavailableMessage}
							<p class="mt-2 text-xs leading-snug text-muted-foreground">
								{readiness.contentUnavailableMessage}
							</p>
						{/if}
					</section>

					<section>
						<div class="flex items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<HugeiconsIcon
									icon={NoteEditIcon}
									strokeWidth={2}
									class="size-3.5 text-muted-foreground"
								/>
								<h3 class="text-xs font-medium">Note</h3>
							</div>
							{#if selectedBookmark.noteUpdatedAt}
								<span class="shrink-0 text-[11px] text-muted-foreground">
									Updated {formatDate(selectedBookmark.noteUpdatedAt)}
								</span>
							{/if}
						</div>
						<Textarea
							class="mt-2 min-h-28 resize-none text-xs"
							bind:value={noteDraft}
							placeholder="Add a note for this bookmark..."
							disabled={isSavingNote}
						/>
						<div class="mt-2 flex items-center justify-between gap-2">
							<p class="min-w-0 text-[11px] text-muted-foreground">
								{#if noteSaveError}
									<span class="text-destructive">{noteSaveError}</span>
								{:else if noteSaveStatus}
									{noteSaveStatus}
								{:else if hasNoteChanges}
									Unsaved changes
								{:else if !noteDraft}
									No note yet
								{:else}
									Note saved
								{/if}
							</p>
							<Button
								type="button"
								size="sm"
								class="h-7"
								onclick={handleSaveNote}
								disabled={isSavingNote || !hasNoteChanges}
							>
								{isSavingNote ? 'Saving...' : 'Save note'}
							</Button>
						</div>
					</section>
				</div>
			</ScrollArea.ScrollArea>
		{:else}
			<div class="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
				Select a bookmark to preview it here.
			</div>
		{/if}
	</aside>
</div>

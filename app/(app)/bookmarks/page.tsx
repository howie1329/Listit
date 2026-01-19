"use client";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useState, useEffect, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { CollectionSelector } from "@/components/features/bookmarks/CollectionSelector";
import { BookmarkSearchBar } from "@/components/features/bookmarks/BookmarkSearchBar";
import { BookmarksEmptyState } from "@/components/features/bookmarks/BookmarksEmptyState";
import { BookmarksList } from "@/components/features/bookmarks/BookmarksList";
import { CreateCollectionDialog } from "@/components/features/bookmarks/CreateCollectionDialog";
import { BookmarkKeyboardNavigationProvider, useBookmarkKeyboardNavigation } from "@/hooks/use-bookmark-keyboard-navigation";
import { BookmarkKeyboardShortcutsHelp } from "@/components/features/bookmarks/BookmarkKeyboardShortcutsHelp";

/**
 * Filters a list of bookmark-like items by a search query across multiple text fields.
 *
 * Performs a case-insensitive substring match against title, url, description, summary, each tag, and searchText.
 * If `bookmarks` is `undefined` or `searchQuery` is empty or only whitespace, returns `bookmarks` unchanged.
 *
 * @param bookmarks - The array of bookmark-like objects to filter, or `undefined`.
 * @param searchQuery - The search string used for filtering; whitespace is trimmed and matching is case-insensitive.
 * @returns The filtered array of items that match the query in any of the searchable fields, or `undefined` if the input was `undefined`.
 */
function filterBookmarks<
  T extends {
    title: string;
    url: string;
    description?: string;
    summary?: string;
    tags: string[];
    searchText: string;
  },
>(bookmarks: T[] | undefined, searchQuery: string): T[] | undefined {
  if (!bookmarks || !searchQuery.trim()) {
    return bookmarks;
  }

  const query = searchQuery.toLowerCase().trim();
  return bookmarks.filter((bookmark) => {
    // Search in multiple fields
    const titleMatch = bookmark.title.toLowerCase().includes(query);
    const urlMatch = bookmark.url.toLowerCase().includes(query);
    const descriptionMatch = bookmark.description
      ? bookmark.description.toLowerCase().includes(query)
      : false;
    const summaryMatch = bookmark.summary
      ? bookmark.summary.toLowerCase().includes(query)
      : false;
    const tagsMatch = bookmark.tags.some((tag) =>
      tag.toLowerCase().includes(query),
    );
    const searchTextMatch = bookmark.searchText
      ? bookmark.searchText.toLowerCase().includes(query)
      : false;

    return (
      titleMatch ||
      urlMatch ||
      descriptionMatch ||
      summaryMatch ||
      tagsMatch ||
      searchTextMatch
    );
  });
}

/**
 * Render the bookmark page with keyboard navigation enabled.
 *
 * @returns A React element containing BookmarkPageContent wrapped in BookmarkKeyboardNavigationProvider
 */
export default function BookmarkPage() {
  return (
    <BookmarkKeyboardNavigationProvider>
      <BookmarkPageContent />
    </BookmarkKeyboardNavigationProvider>
  );
}

/**
 * Render the bookmark management content: collection selector, search bar with keyboard handling,
 * bookmarks list (with client-side filtering), and create-collection dialog.
 *
 * Handles selection state, debounced search input, creation of collections and bookmarks, and
 * keyboard interactions for the search input (Enter to create, Escape to clear and blur).
 *
 * @returns The BookmarkPageContent React element; shows a loading state until collections and bookmarks are available.
 */
function BookmarkPageContent() {
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"bookmarkCollections"> | null>(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);
  const { searchInputRef } = useBookmarkKeyboardNavigation();
  
  const createCollection = useMutation(
    api.bookmarks.bookmarkCollectionFunctions.createCollection,
  );
  const collections = useQuery(
    api.bookmarks.bookmarkCollectionFunctions.getCollections,
    {},
  );
  const allBookmarks = useQuery(
    api.bookmarks.bookmarkFunctions.getBookmarks,
    {},
  );
  const collectionBookmarks = useQuery(
    api.bookmarks.bookmarkFunctions.getBookmarksByCollection,
    selectedCollectionId ? { collectionId: selectedCollectionId } : "skip",
  );

  const createBookmarkAction = useAction(
    api.ai.bookmarks.actions.createBookMark,
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Determine which bookmarks to display with client-side filtering
  const bookmarks = useMemo(() => {
    const baseBookmarks = selectedCollectionId
      ? collectionBookmarks
      : allBookmarks;

    if (!baseBookmarks) {
      return undefined;
    }

    // Apply client-side search filter if there's a search query
    if (debouncedSearchQuery.trim()) {
      return filterBookmarks(baseBookmarks, debouncedSearchQuery);
    }

    return baseBookmarks;
  }, [
    selectedCollectionId,
    collectionBookmarks,
    allBookmarks,
    debouncedSearchQuery,
  ]);

  const selectedCollection = collections?.find(
    (c) => c._id === selectedCollectionId,
  );

  const handleCreateCollection = async (
    name: string,
    description?: string,
  ): Promise<Id<"bookmarkCollections">> => {
    try {
      const newCollectionId = await createCollection({
        name,
        description,
      });
      setSelectedCollectionId(newCollectionId);
      toast.success("Collection created successfully");
      return newCollectionId;
    } catch (error) {
      toast.error("Failed to create collection");
      console.error("Failed to create collection:", error);
      throw error;
    }
  };

  const handleCreateBookmark = async () => {
    if (!searchQuery.trim()) return;
    setIsCreatingBookmark(true);
    try {
      toast.loading("Creating bookmark...");
      await createBookmarkAction({
        url: searchQuery.trim(),
      });
      setSearchQuery("");
      toast.success("Bookmark created successfully");
    } catch (error) {
      toast.error("Failed to create bookmark");
      console.error("Failed to create bookmark:", error);
    } finally {
      setIsCreatingBookmark(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      handleCreateBookmark();
    }
    if (e.key === "Escape") {
      setSearchQuery("");
      e.currentTarget.blur();
    }
  };

  if (bookmarks === undefined || collections === undefined) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex flex-col w-full h-full p-2 overflow-hidden">
        <div className="flex items-center px-1 gap-3 md:gap-2 mb-2 ">
          <CollectionSelector
            selectedCollectionId={selectedCollectionId}
            collections={collections}
            selectedCollection={selectedCollection}
            onCollectionChange={setSelectedCollectionId}
            onCreateCollection={() => setCreateCollectionOpen(true)}
          />
          <BookmarkSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateBookmark={handleCreateBookmark}
            isCreatingBookmark={isCreatingBookmark}
            onKeyDown={handleInputKeyDown}
            inputRef={searchInputRef}
          />
          <BookmarkKeyboardShortcutsHelp />
        </div>
        <div className="flex flex-col h-full overflow-y-auto p-1">
          {bookmarks.length === 0 ? (
            <BookmarksEmptyState
              searchQuery={searchQuery}
              selectedCollection={selectedCollection}
            />
          ) : (
            <BookmarksList bookmarks={bookmarks} collections={collections} />
          )}
        </div>
      </div>
      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
        onCreate={handleCreateCollection}
      />
    </div>
  );
}
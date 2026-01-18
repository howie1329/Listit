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

// Client-side search filter function
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

export default function BookmarkPage() {
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"bookmarkCollections"> | null>(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);
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
      <div className="flex flex-col w-full h-full p-2 overflow-y-auto">
        <div className="flex items-center gap-3 md:gap-2 mb-4 sticky top-0 bg-background z-10">
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
          />
        </div>
        {bookmarks.length === 0 ? (
          <BookmarksEmptyState
            searchQuery={searchQuery}
            selectedCollection={selectedCollection}
          />
        ) : (
          <BookmarksList bookmarks={bookmarks} collections={collections} />
        )}
      </div>
      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
        onCreate={handleCreateCollection}
      />
    </div>
  );
}

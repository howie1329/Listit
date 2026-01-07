"use client";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookmarkIcon,
  FolderIcon,
  ArrowDown01Icon,
  PlusSignIcon,
  MoreHorizontalIcon,
  PencilIcon,
  DeleteIcon,
  BookmarkAdd01Icon,
} from "@hugeicons/core-free-icons";
import { Doc } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

const BookmarkEditDialog = ({
  bookmark,
  open,
  setOpen,
}: {
  bookmark: Doc<"bookmarks">;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [url, setUrl] = useState(bookmark.url);
  const [title, setTitle] = useState(bookmark.title);
  const [description, setDescription] = useState(bookmark.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const updateBookmark = useMutation(
    api.bookmarks.bookmarkFunctions.updateBookmark,
  );

  useEffect(() => {
    if (open) {
      setUrl(bookmark.url);
      setTitle(bookmark.title);
      setDescription(bookmark.description || "");
    }
  }, [open, bookmark]);

  const handleSave = async () => {
    if (!url.trim() || !title.trim()) return;
    setIsSaving(true);
    try {
      await updateBookmark({
        bookmarkId: bookmark._id,
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Update the bookmark URL, title, and description
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            onClick={handleSave}
            disabled={isSaving || !url.trim() || !title.trim()}
          >
            {isSaving ? (
              <>
                <Spinner /> <span>Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BookmarkOptionsDropdown = ({
  bookmark,
  collections,
}: {
  bookmark: Doc<"bookmarks">;
  collections: Doc<"bookmarkCollections">[] | undefined;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const softDeleteBookmark = useMutation(
    api.bookmarks.bookmarkFunctions.softDeleteBookmark,
  );
  const updateCollection = useMutation(
    api.bookmarks.bookmarkFunctions.updateCollection,
  );

  const handleDelete = async () => {
    try {
      await softDeleteBookmark({ bookmarkId: bookmark._id });
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    }
  };

  const handleCollectionChange = async (
    collectionId: Id<"bookmarkCollections"> | null,
  ) => {
    try {
      await updateCollection({
        bookmarkId: bookmark._id,
        collectionId: collectionId || undefined,
      });
    } catch (error) {
      console.error("Failed to update collection:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <HugeiconsIcon icon={PencilIcon} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HugeiconsIcon icon={FolderIcon} />
              Add to Collection
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleCollectionChange(null)}>
                Remove from Collection
              </DropdownMenuItem>
              {collections?.map((collection) => (
                <DropdownMenuItem
                  key={collection._id}
                  onClick={() => handleCollectionChange(collection._id)}
                >
                  <HugeiconsIcon icon={FolderIcon} />
                  {collection.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <HugeiconsIcon icon={DeleteIcon} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BookmarkEditDialog
        bookmark={bookmark}
        open={editOpen}
        setOpen={setEditOpen}
      />
    </>
  );
};

export default function BookmarkPage() {
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"bookmarkCollections"> | null>(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
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

  const searchResults = useQuery(
    api.bookmarks.bookmarkFunctions.searchBookmarks,
    debouncedSearchQuery.trim()
      ? { searchQuery: debouncedSearchQuery.trim(), includeArchived: false }
      : "skip",
  );

  // Determine which bookmarks to display
  let bookmarks = selectedCollectionId ? collectionBookmarks : allBookmarks;

  // If there's a search query, use search results and filter by collection if needed
  if (debouncedSearchQuery.trim() && searchResults) {
    if (selectedCollectionId) {
      // Filter search results by selected collection
      bookmarks = searchResults.filter(
        (bookmark) => bookmark.collectionId === selectedCollectionId,
      );
    } else {
      bookmarks = searchResults;
    }
  }

  const selectedCollection = collections?.find(
    (c) => c._id === selectedCollectionId,
  );

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) return;
    setIsCreating(true);
    try {
      const newCollectionId = await createCollection({
        name: collectionName.trim(),
        description: collectionDescription.trim() || undefined,
      });
      setCollectionName("");
      setCollectionDescription("");
      setCreateCollectionOpen(false);
      setSelectedCollectionId(newCollectionId);
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateBookmark = async () => {
    if (!searchQuery.trim()) return;
    setIsCreatingBookmark(true);
    try {
      await createBookmarkAction({
        url: searchQuery.trim(),
      });
      setSearchQuery("");
    } catch (error) {
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

  if (
    bookmarks === undefined ||
    collections === undefined ||
    (debouncedSearchQuery.trim() && searchResults === undefined)
  ) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {bookmarks.length === 0 ? (
        <div className="flex flex-col w-full h-full p-4">
          <div className="flex items-center gap-3 md:gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 h-11 px-4 text-base md:h-8 md:px-3 md:text-sm"
                >
                  <HugeiconsIcon icon={FolderIcon} />
                  <span>
                    {selectedCollection
                      ? selectedCollection.name
                      : "All Bookmarks"}
                  </span>
                  <HugeiconsIcon icon={ArrowDown01Icon} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56">
                <div className="flex flex-col gap-1">
                  <Button
                    variant={
                      selectedCollectionId === null ? "secondary" : "ghost"
                    }
                    className="justify-start"
                    onClick={() => setSelectedCollectionId(null)}
                  >
                    All Bookmarks
                  </Button>
                  {collections.map((collection) => (
                    <Button
                      key={collection._id}
                      variant={
                        selectedCollectionId === collection._id
                          ? "secondary"
                          : "ghost"
                      }
                      className="justify-start"
                      onClick={() => setSelectedCollectionId(collection._id)}
                    >
                      <HugeiconsIcon icon={FolderIcon} className="mr-2" />
                      {collection.name}
                    </Button>
                  ))}
                  <div className="border-t my-1" />
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setCreateCollectionOpen(true)}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
                    Create Collection
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Search bookmarks or paste URL to add..."
              className="flex-1 h-11 text-base md:h-8 md:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isCreatingBookmark}
            />
            <Button
              onClick={handleCreateBookmark}
              disabled={isCreatingBookmark || !searchQuery.trim()}
              className="md:hidden h-11 w-11 md:h-8 md:w-8"
              aria-label="Add bookmark"
            >
              {isCreatingBookmark ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={BookmarkAdd01Icon} />
              )}
            </Button>
          </div>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={BookmarkIcon} />
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery.trim() ? "No bookmarks found" : "No bookmarks yet"}
              </EmptyTitle>
              <EmptyDescription>
                {searchQuery.trim()
                  ? `No bookmarks match "${searchQuery}". Press Enter to add it as a new bookmark.`
                  : selectedCollection
                    ? `No bookmarks in "${selectedCollection.name}" collection.`
                    : "Start saving your favorite links and articles. Type a URL and press Enter to add your first bookmark."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full p-4">
          <div className="flex items-center gap-3 md:gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 h-11 px-4 text-base md:h-8 md:px-3 md:text-sm"
                >
                  <HugeiconsIcon icon={FolderIcon} />
                  <span>
                    {selectedCollection
                      ? selectedCollection.name
                      : "All Bookmarks"}
                  </span>
                  <HugeiconsIcon icon={ArrowDown01Icon} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56">
                <div className="flex flex-col gap-1">
                  <Button
                    variant={
                      selectedCollectionId === null ? "secondary" : "ghost"
                    }
                    className="justify-start"
                    onClick={() => setSelectedCollectionId(null)}
                  >
                    All Bookmarks
                  </Button>
                  {collections.map((collection) => (
                    <Button
                      key={collection._id}
                      variant={
                        selectedCollectionId === collection._id
                          ? "secondary"
                          : "ghost"
                      }
                      className="justify-start"
                      onClick={() => setSelectedCollectionId(collection._id)}
                    >
                      <HugeiconsIcon icon={FolderIcon} className="mr-2" />
                      {collection.name}
                    </Button>
                  ))}
                  <div className="border-t my-1" />
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setCreateCollectionOpen(true)}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
                    Create Collection
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Search bookmarks or paste URL to add..."
              className="flex-1 h-11 text-base md:h-8 md:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isCreatingBookmark}
            />
            <Button
              onClick={handleCreateBookmark}
              disabled={isCreatingBookmark || !searchQuery.trim()}
              className="md:hidden h-11 w-11 md:h-8 md:w-8"
              aria-label="Add bookmark"
            >
              {isCreatingBookmark ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={BookmarkAdd01Icon} />
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {bookmarks.map((bookmark: (typeof bookmarks)[0]) => (
              <Card
                key={bookmark._id}
                className="hover:bg-accent transition-colors cursor-pointer gap-1"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {bookmark.favicon ? (
                      <Image
                        src={bookmark.favicon}
                        alt="favicon"
                        width={16}
                        height={16}
                        className="h-4 w-4"
                        unoptimized
                      />
                    ) : null}
                    {bookmark.title}
                  </CardTitle>

                  {bookmark.description && (
                    <CardDescription className="line-clamp-2">
                      {bookmark.description}
                    </CardDescription>
                  )}
                  <CardAction>
                    <BookmarkOptionsDropdown
                      bookmark={bookmark}
                      collections={collections}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {bookmark.url}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <Dialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your bookmarks
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && collectionName.trim()) {
                  handleCreateCollection();
                }
              }}
            />
            <Textarea
              placeholder="Description (optional)"
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
            />
            <Button
              onClick={handleCreateCollection}
              disabled={isCreating || !collectionName.trim()}
            >
              {isCreating ? (
                <>
                  <Spinner /> <span>Creating...</span>
                </>
              ) : (
                "Create Collection"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

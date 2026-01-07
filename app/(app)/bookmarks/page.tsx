"use client";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookmarkIcon,
  FolderIcon,
  ArrowDown01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Spinner } from "@/components/ui/spinner";

export default function BookmarkPage() {
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"bookmarkCollections"> | null>(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
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

  const bookmarks = selectedCollectionId ? collectionBookmarks : allBookmarks;

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

  if (bookmarks === undefined || collections === undefined) {
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
          <div className="flex items-center gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
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
            <Input placeholder="Search Bookmarks" className="flex-1" />
          </div>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={BookmarkIcon} />
              </EmptyMedia>
              <EmptyTitle>No bookmarks yet</EmptyTitle>
              <EmptyDescription>
                {selectedCollection
                  ? `No bookmarks in "${selectedCollection.name}" collection.`
                  : "Start saving your favorite links and articles. Paste a URL in the search bar above to add your first bookmark."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full p-4">
          <div className="flex items-center gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
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
            <Input placeholder="Search Bookmarks" className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            {bookmarks.map((bookmark: (typeof bookmarks)[0]) => (
              <div
                key={bookmark._id}
                className="border rounded-md p-3 hover:bg-accent transition-colors"
              >
                <h3 className="font-medium text-sm">{bookmark.title}</h3>
                {bookmark.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 block truncate"
                >
                  {bookmark.url}
                </a>
              </div>
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

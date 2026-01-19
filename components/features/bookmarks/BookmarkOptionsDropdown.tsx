"use client";
import { Button } from "@/components/ui/button";
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
  FolderIcon,
  MoreHorizontalIcon,
  PencilIcon,
  DeleteIcon,
} from "@hugeicons/core-free-icons";
import { Doc } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookmarkEditDialog } from "./BookmarkEditDialog";
import { useBookmarkKeyboardNavigation } from "@/hooks/use-bookmark-keyboard-navigation";

export const BookmarkOptionsDropdown = ({
  bookmark,
  collections,
}: {
  bookmark: Doc<"bookmarks">;
  collections: Doc<"bookmarkCollections">[] | undefined;
}) => {
  const { isEditing, setIsEditing, selectedBookmarkId } = useBookmarkKeyboardNavigation();
  const [localEditOpen, setLocalEditOpen] = useState(false);
  
  // Sync with keyboard navigation editing state
  const isCurrentlySelected = selectedBookmarkId === bookmark._id;
  const editOpen = localEditOpen || (isCurrentlySelected && isEditing);
  
  const setEditOpen = (open: boolean) => {
    setLocalEditOpen(open);
    if (!open && isCurrentlySelected) {
      setIsEditing(false);
    }
  };

  // When keyboard triggers edit on this selected bookmark
  useEffect(() => {
    if (isCurrentlySelected && isEditing && !localEditOpen) {
      setLocalEditOpen(true);
    }
  }, [isCurrentlySelected, isEditing, localEditOpen]);

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
            <span className="ml-auto text-xs text-muted-foreground">E</span>
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
            <span className="ml-auto text-xs text-muted-foreground">⇧⌫</span>
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


"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive02Icon,
  ArchiveOff03Icon,
  FolderIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  EyeIcon,
  DeleteIcon,
} from "@hugeicons/core-free-icons";
import { Doc } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookmarkEditDialog } from "./BookmarkEditDialog";
import { useBookmarkKeyboardNavigation } from "@/hooks/use-bookmark-keyboard-navigation";
import { toast } from "sonner";

export const BookmarkOptionsDropdown = ({
  bookmark,
  collections,
  onDelete,
}: {
  bookmark: Doc<"bookmarks">;
  collections: Doc<"bookmarkCollections">[] | undefined;
  onDelete?: () => void;
}) => {
  const { isEditing, setIsEditing, selectedBookmarkId } =
    useBookmarkKeyboardNavigation();
  const [localEditOpen, setLocalEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
  const pinBookmark = useMutation(api.bookmarks.bookmarkFunctions.pinBookmark);
  const unpinBookmark = useMutation(
    api.bookmarks.bookmarkFunctions.unpinBookmark,
  );
  const archiveBookmark = useMutation(
    api.bookmarks.bookmarkFunctions.archiveBookmark,
  );
  const unarchiveBookmark = useMutation(
    api.bookmarks.bookmarkFunctions.unarchiveBookmark,
  );
  const markAsRead = useMutation(api.bookmarks.bookmarkFunctions.markAsRead);
  const markAsUnread = useMutation(
    api.bookmarks.bookmarkFunctions.markAsUnread,
  );

  const handleDelete = async () => {
    // Trigger delete animation first
    onDelete?.();
    // Wait for animation to complete before actual deletion
    await new Promise((resolve) => setTimeout(resolve, 300));
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

  const togglePin = async () => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      if (bookmark.isPinned) {
        await unpinBookmark({ bookmarkId: bookmark._id });
        toast.success("Bookmark unpinned.");
      } else {
        await pinBookmark({ bookmarkId: bookmark._id });
        toast.success("Bookmark pinned.");
      }
    } catch (error) {
      console.error("Failed to update pin status:", error);
      toast.error("Failed to update pin status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleArchive = async () => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      if (bookmark.isArchived) {
        await unarchiveBookmark({ bookmarkId: bookmark._id });
        toast.success("Bookmark unarchived.");
      } else {
        await archiveBookmark({ bookmarkId: bookmark._id });
        toast.success("Bookmark archived.");
      }
    } catch (error) {
      console.error("Failed to update archive status:", error);
      toast.error("Failed to update archive status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleRead = async () => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      if (bookmark.isRead) {
        await markAsUnread({ bookmarkId: bookmark._id });
        toast.success("Marked as unread.");
      } else {
        await markAsRead({ bookmarkId: bookmark._id });
        toast.success("Marked as read.");
      }
    } catch (error) {
      console.error("Failed to update read status:", error);
      toast.error("Failed to update read status.");
    } finally {
      setIsUpdating(false);
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
          <DropdownMenuItem onClick={togglePin} disabled={isUpdating}>
            <HugeiconsIcon icon={bookmark.isPinned ? PinOffIcon : PinIcon} />
            {bookmark.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleArchive} disabled={isUpdating}>
            <HugeiconsIcon
              icon={bookmark.isArchived ? ArchiveOff03Icon : Archive02Icon}
            />
            {bookmark.isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleRead} disabled={isUpdating}>
            <HugeiconsIcon icon={EyeIcon} />
            {bookmark.isRead ? "Mark as unread" : "Mark as read"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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

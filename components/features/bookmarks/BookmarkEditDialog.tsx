"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Doc } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const BookmarkEditDialog = ({
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

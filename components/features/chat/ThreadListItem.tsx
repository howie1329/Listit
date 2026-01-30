"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";

interface Thread {
  _id: Id<"thread">;
  userId: Id<"users">;
  title: string;
  streamingStatus: "idle" | "streaming" | "error";
  updatedAt: string;
  _creationTime: number;
  lastMessagePreview?: string;
}

interface ThreadListItemProps {
  thread: Thread;
  isSelected: boolean;
  onSelect: (threadId: Id<"thread">) => void;
  onDelete: (threadId: Id<"thread">) => void;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export function ThreadListItem({
  thread,
  isSelected,
  onSelect,
  onDelete,
}: ThreadListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(thread._id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const isStreaming = thread.streamingStatus === "streaming";

  return (
    <>
      <div
        onClick={() => onSelect(thread._id)}
        className={cn(
          "group relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10 hover:bg-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(thread._id);
          }
        }}
      >
        {/* Thread Title */}
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-5 truncate flex-1 min-w-0",
              isSelected ? "text-foreground" : "text-foreground/90",
            )}
          >
            {thread.title}
          </p>

          {/* Streaming indicator */}
          {isStreaming && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </div>

        {/* Preview and Timestamp Row */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground leading-4 truncate flex-1 min-w-0">
            {thread.lastMessagePreview ? (
              thread.lastMessagePreview
            ) : (
              <span className="italic text-muted-foreground/60">
                No messages yet
              </span>
            )}
          </p>

          <span className="text-xs text-muted-foreground/70 shrink-0">
            {formatRelativeTime(thread.updatedAt)}
          </span>
        </div>

        {/* Delete button - appears on hover */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 focus:opacity-100",
            "hover:bg-destructive/10 hover:text-destructive",
            isSelected && "hover:bg-destructive/20",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete thread</span>
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{thread.title}&quot;? This
              action cannot be undone and all messages will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

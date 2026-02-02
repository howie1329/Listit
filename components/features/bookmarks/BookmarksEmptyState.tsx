"use client";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkIcon } from "@hugeicons/core-free-icons";
import { Doc } from "@/convex/_generated/dataModel";
import { BookmarkView } from "@/components/features/bookmarks/bookmarkView";

export const BookmarksEmptyState = ({
  searchQuery,
  selectedView,
  selectedCollection,
}: {
  searchQuery: string;
  selectedView: BookmarkView;
  selectedCollection: Doc<"bookmarkCollections"> | undefined;
}) => {
  const viewEmptyMessage = () => {
    switch (selectedView.kind) {
      case "pinned":
        return "No pinned bookmarks yet.";
      case "read":
        return "No read bookmarks yet.";
      case "archived":
        return "No archived bookmarks yet.";
      case "collection":
        return selectedCollection
          ? `No bookmarks in "${selectedCollection.name}" collection.`
          : "No bookmarks in this collection.";
      case "all":
      default:
        return "Start saving your favorite links and articles. Type a URL and press Enter to add your first bookmark.";
    }
  };

  return (
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
            : viewEmptyMessage()}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

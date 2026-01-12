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

export const BookmarksEmptyState = ({
  searchQuery,
  selectedCollection,
}: {
  searchQuery: string;
  selectedCollection: Doc<"bookmarkCollections"> | undefined;
}) => {
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
            : selectedCollection
              ? `No bookmarks in "${selectedCollection.name}" collection.`
              : "Start saving your favorite links and articles. Type a URL and press Enter to add your first bookmark."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};


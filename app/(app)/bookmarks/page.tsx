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
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkIcon } from "@hugeicons/core-free-icons";

export default function BookmarkPage() {
  const bookmarks = useQuery(api.bookmarks.bookmarkFunctions.getBookmarks, {});

  if (bookmarks === undefined) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col w-full h-full p-4">
        <Input placeholder="Search Bookmarks" className="w-full mb-4" />
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={BookmarkIcon} />
            </EmptyMedia>
            <EmptyTitle>No bookmarks yet</EmptyTitle>
            <EmptyDescription>
              Start saving your favorite links and articles. Paste a URL in the
              search bar above to add your first bookmark.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4">
      <Input placeholder="Search Bookmarks" className="w-full mb-4" />
      <div className="flex flex-col gap-2">
        {bookmarks.map((bookmark) => (
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
  );
}

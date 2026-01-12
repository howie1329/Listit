"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { BookmarkOptionsDropdown } from "./BookmarkOptionsDropdown";

export const BookmarkCard = ({
  bookmark,
  collections,
}: {
  bookmark: Doc<"bookmarks">;
  collections: Doc<"bookmarkCollections">[] | undefined;
}) => {
  return (
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
  );
};

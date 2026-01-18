"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { BookmarkCard } from "./BookmarkCard";

export const BookmarksList = ({
  bookmarks,
  collections,
}: {
  bookmarks: Doc<"bookmarks">[];
  collections: Doc<"bookmarkCollections">[] | undefined;
}) => {
  return (
    <div className="flex flex-col gap-2">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark._id}
          bookmark={bookmark}
          collections={collections}
        />
      ))}
    </div>
  );
};

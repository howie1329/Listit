"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { BookmarkCard } from "./BookmarkCard";
import { useBookmarkKeyboardNavigation } from "@/hooks/use-bookmark-keyboard-navigation";
import { useEffect, useRef } from "react";

export const BookmarksList = ({
  bookmarks,
  collections,
}: {
  bookmarks: Doc<"bookmarks">[];
  collections: Doc<"bookmarkCollections">[] | undefined;
}) => {
  const { setBookmarks, selectedBookmarkId, setSelectedBookmarkId } = useBookmarkKeyboardNavigation();
  const listRef = useRef<HTMLDivElement>(null);

  // Sync bookmarks with keyboard navigation context
  useEffect(() => {
    setBookmarks(bookmarks);
  }, [bookmarks, setBookmarks]);

  // Scroll selected bookmark into view
  useEffect(() => {
    if (selectedBookmarkId && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-bookmark-id="${selectedBookmarkId}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedBookmarkId]);

  return (
    <div 
      ref={listRef}
      className="flex flex-col gap-2"
      role="listbox"
      aria-label="Bookmarks list"
      tabIndex={0}
      onFocus={() => {
        // Select first bookmark if nothing is selected
        if (!selectedBookmarkId && bookmarks.length > 0) {
          setSelectedBookmarkId(bookmarks[0]._id);
        }
      }}
    >
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark._id}
          bookmark={bookmark}
          collections={collections}
          isSelected={selectedBookmarkId === bookmark._id}
          onSelect={() => setSelectedBookmarkId(bookmark._id)}
        />
      ))}
    </div>
  );
};

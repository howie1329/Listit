"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { BookmarkCard } from "./BookmarkCard";
import { useBookmarkKeyboardNavigation } from "@/hooks/use-bookmark-keyboard-navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

export const BookmarksList = ({
  bookmarks,
  collections,
  deletingIds,
  setDeletingIds,
}: {
  bookmarks: Doc<"bookmarks">[];
  collections: Doc<"bookmarkCollections">[] | undefined;
  deletingIds: Set<string>;
  setDeletingIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const { setBookmarks, selectedBookmarkId, setSelectedBookmarkId } =
    useBookmarkKeyboardNavigation();
  const listRef = useRef<HTMLDivElement>(null);

  // Sync bookmarks with keyboard navigation context
  useEffect(() => {
    setBookmarks(bookmarks);
  }, [bookmarks, setBookmarks]);

  // Scroll selected bookmark into view
  useEffect(() => {
    if (selectedBookmarkId && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-bookmark-id="${selectedBookmarkId}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedBookmarkId]);

  const handleDelete = (bookmarkId: string) => {
    setDeletingIds((prev) => new Set(prev).add(bookmarkId));
  };

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
      <AnimatePresence mode="popLayout">
        {bookmarks.map((bookmark, index) => (
          <BookmarkCard
            key={bookmark._id}
            bookmark={bookmark}
            collections={collections}
            isSelected={selectedBookmarkId === bookmark._id}
            onSelect={() => setSelectedBookmarkId(bookmark._id)}
            onDelete={() => handleDelete(bookmark._id)}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

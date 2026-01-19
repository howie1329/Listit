"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BookmarkKeyboardNavigationContextType {
  selectedBookmarkId: Id<"bookmarks"> | null;
  setSelectedBookmarkId: (id: Id<"bookmarks"> | null) => void;
  bookmarks: Doc<"bookmarks">[];
  setBookmarks: (bookmarks: Doc<"bookmarks">[]) => void;
  selectNextBookmark: () => void;
  selectPreviousBookmark: () => void;
  // Bookmark actions
  openSelectedBookmark: () => void;
  editSelectedBookmark: () => void;
  deleteSelectedBookmark: () => void;
  // Editing state
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  // Search focus
  focusSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const BookmarkKeyboardNavigationContext =
  createContext<BookmarkKeyboardNavigationContextType | null>(null);

export function BookmarkKeyboardNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<Id<"bookmarks"> | null>(null);
  const [bookmarks, setBookmarks] = useState<Doc<"bookmarks">[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Mutations
  const softDeleteBookmark = useMutation(
    api.bookmarks.bookmarkFunctions.softDeleteBookmark
  );

  // Get selected bookmark
  const selectedBookmark = useMemo(() => {
    return bookmarks.find((b) => b._id === selectedBookmarkId) ?? null;
  }, [bookmarks, selectedBookmarkId]);

  // Navigation
  const selectNextBookmark = useCallback(() => {
    if (bookmarks.length === 0) return;

    if (selectedBookmarkId === null) {
      setSelectedBookmarkId(bookmarks[0]._id);
      return;
    }

    const currentIndex = bookmarks.findIndex((b) => b._id === selectedBookmarkId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < bookmarks.length) {
      setSelectedBookmarkId(bookmarks[nextIndex]._id);
    }
  }, [bookmarks, selectedBookmarkId]);

  const selectPreviousBookmark = useCallback(() => {
    if (bookmarks.length === 0) return;

    if (selectedBookmarkId === null) {
      setSelectedBookmarkId(bookmarks[bookmarks.length - 1]._id);
      return;
    }

    const currentIndex = bookmarks.findIndex((b) => b._id === selectedBookmarkId);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      setSelectedBookmarkId(bookmarks[prevIndex]._id);
    }
  }, [bookmarks, selectedBookmarkId]);

  // Bookmark actions
  const openSelectedBookmark = useCallback(() => {
    if (!selectedBookmark) return;
    window.open(selectedBookmark.url, "_blank");
  }, [selectedBookmark]);

  const editSelectedBookmark = useCallback(() => {
    if (selectedBookmarkId) {
      setIsEditing(true);
    }
  }, [selectedBookmarkId]);

  const deleteSelectedBookmark = useCallback(async () => {
    if (!selectedBookmark) return;

    try {
      await softDeleteBookmark({ bookmarkId: selectedBookmark._id });
      toast.success("Bookmark deleted");
      // Select next bookmark after deletion
      selectNextBookmark();
    } catch {
      toast.error("Failed to delete bookmark");
    }
  }, [selectedBookmark, softDeleteBookmark, selectNextBookmark]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Global keyboard shortcuts for bookmark navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Skip if user is typing
      if (isTyping) return;

      switch (event.key) {
        case "ArrowDown":
        case "j":
          event.preventDefault();
          selectNextBookmark();
          break;
        case "ArrowUp":
        case "k":
          event.preventDefault();
          selectPreviousBookmark();
          break;
        case "Enter":
          if (selectedBookmarkId) {
            event.preventDefault();
            openSelectedBookmark();
          }
          break;
        case "e":
        case "E":
          if (selectedBookmarkId) {
            event.preventDefault();
            editSelectedBookmark();
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedBookmarkId && event.shiftKey) {
            event.preventDefault();
            void deleteSelectedBookmark();
          }
          break;
        case "/":
          event.preventDefault();
          focusSearch();
          break;
        case "Escape":
          setSelectedBookmarkId(null);
          setIsEditing(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectNextBookmark,
    selectPreviousBookmark,
    openSelectedBookmark,
    editSelectedBookmark,
    deleteSelectedBookmark,
    focusSearch,
    selectedBookmarkId,
  ]);

  const value = useMemo(
    () => ({
      selectedBookmarkId,
      setSelectedBookmarkId,
      bookmarks,
      setBookmarks,
      selectNextBookmark,
      selectPreviousBookmark,
      openSelectedBookmark,
      editSelectedBookmark,
      deleteSelectedBookmark,
      isEditing,
      setIsEditing,
      focusSearch,
      searchInputRef,
    }),
    [
      selectedBookmarkId,
      bookmarks,
      selectNextBookmark,
      selectPreviousBookmark,
      openSelectedBookmark,
      editSelectedBookmark,
      deleteSelectedBookmark,
      isEditing,
      focusSearch,
    ]
  );

  return (
    <BookmarkKeyboardNavigationContext.Provider value={value}>
      {children}
    </BookmarkKeyboardNavigationContext.Provider>
  );
}

export function useBookmarkKeyboardNavigation() {
  const context = useContext(BookmarkKeyboardNavigationContext);
  if (!context) {
    throw new Error(
      "useBookmarkKeyboardNavigation must be used within a BookmarkKeyboardNavigationProvider"
    );
  }
  return context;
}

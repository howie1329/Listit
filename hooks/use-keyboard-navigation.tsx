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

type Priority = "low" | "medium" | "high";

interface KeyboardNavigationContextType {
  selectedItemId: Id<"items"> | null;
  setSelectedItemId: (id: Id<"items"> | null) => void;
  items: Doc<"items">[];
  setItems: (items: Doc<"items">[]) => void;
  selectNextItem: () => void;
  selectPreviousItem: () => void;
  // Item actions
  editSelectedItemTitle: () => void;
  moveSelectedToToday: () => void;
  moveSelectedToBackBurner: () => void;
  completeSelected: () => void;
  archiveSelected: () => void;
  cyclePriority: () => void;
  addTagToSelected: () => void;
  deleteSelected: () => void;
  // Editing state
  isEditingTitle: boolean;
  setIsEditingTitle: (editing: boolean) => void;
  isAddingTag: boolean;
  setIsAddingTag: (adding: boolean) => void;
  // Search focus
  focusSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  // Create item
  openCreateItem: boolean;
  setOpenCreateItem: (open: boolean) => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | null>(null);

export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const [selectedItemId, setSelectedItemId] = useState<Id<"items"> | null>(null);
  const [items, setItems] = useState<Doc<"items">[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [openCreateItem, setOpenCreateItem] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Mutations
  const updateItem = useMutation(api.items.mutations.updateSingleItem);
  const toggleCompletion = useMutation(api.items.mutations.toogleSingleItemCompletion);

  // Get selected item
  const selectedItem = useMemo(() => {
    return items.find((item) => item._id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  // Navigation
  const selectNextItem = useCallback(() => {
    if (items.length === 0) return;
    
    const filteredItems = items.filter((item) => !item.isDeleted);
    if (filteredItems.length === 0) return;

    if (selectedItemId === null) {
      setSelectedItemId(filteredItems[0]._id);
      return;
    }

    const currentIndex = filteredItems.findIndex((item) => item._id === selectedItemId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < filteredItems.length) {
      setSelectedItemId(filteredItems[nextIndex]._id);
    }
  }, [items, selectedItemId]);

  const selectPreviousItem = useCallback(() => {
    if (items.length === 0) return;
    
    const filteredItems = items.filter((item) => !item.isDeleted);
    if (filteredItems.length === 0) return;

    if (selectedItemId === null) {
      setSelectedItemId(filteredItems[filteredItems.length - 1]._id);
      return;
    }

    const currentIndex = filteredItems.findIndex((item) => item._id === selectedItemId);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      setSelectedItemId(filteredItems[prevIndex]._id);
    }
  }, [items, selectedItemId]);

  // Item actions
  const editSelectedItemTitle = useCallback(() => {
    if (selectedItemId) {
      setIsEditingTitle(true);
    }
  }, [selectedItemId]);

  const moveSelectedToToday = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await updateItem({
        itemId: selectedItem._id,
        focusState: "today",
      });
      toast.success("Moved to Today");
    } catch {
      toast.error("Failed to move item");
    }
  }, [selectedItem, updateItem]);

  const moveSelectedToBackBurner = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await updateItem({
        itemId: selectedItem._id,
        focusState: "back_burner",
      });
      toast.success("Moved to Back Burner");
    } catch {
      toast.error("Failed to move item");
    }
  }, [selectedItem, updateItem]);

  const completeSelected = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await toggleCompletion({
        itemId: selectedItem._id,
      });
      toast.success(selectedItem.isCompleted ? "Marked incomplete" : "Marked complete");
    } catch {
      toast.error("Failed to toggle completion");
    }
  }, [selectedItem, toggleCompletion]);

  const archiveSelected = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await updateItem({
        itemId: selectedItem._id,
        isArchived: !selectedItem.isArchived,
      });
      toast.success(selectedItem.isArchived ? "Unarchived" : "Archived");
    } catch {
      toast.error("Failed to archive item");
    }
  }, [selectedItem, updateItem]);

  const cyclePriority = useCallback(async () => {
    if (!selectedItem) return;
    
    const priorities: Priority[] = ["low", "medium", "high"];
    const currentIndex = priorities.indexOf(selectedItem.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    const nextPriority = priorities[nextIndex];
    
    try {
      await updateItem({
        itemId: selectedItem._id,
        priority: nextPriority,
      });
      toast.success(`Priority: ${nextPriority}`);
    } catch {
      toast.error("Failed to update priority");
    }
  }, [selectedItem, updateItem]);

  const addTagToSelected = useCallback(() => {
    if (selectedItemId) {
      setIsAddingTag(true);
    }
  }, [selectedItemId]);

  const deleteSelected = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await updateItem({
        itemId: selectedItem._id,
        isDeleted: true,
      });
      toast.success("Item deleted");
      // Select next item after deletion
      selectNextItem();
    } catch {
      toast.error("Failed to delete item");
    }
  }, [selectedItem, updateItem, selectNextItem]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Global keyboard shortcuts for item navigation
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
          selectNextItem();
          break;
        case "ArrowUp":
        case "k":
          event.preventDefault();
          selectPreviousItem();
          break;
        case "Enter":
          if (selectedItemId) {
            event.preventDefault();
            editSelectedItemTitle();
          }
          break;
        case "t":
        case "T":
          if (selectedItemId) {
            event.preventDefault();
            void moveSelectedToToday();
          }
          break;
        case "b":
        case "B":
          if (selectedItemId) {
            event.preventDefault();
            void moveSelectedToBackBurner();
          }
          break;
        case "x":
        case "X":
          if (selectedItemId) {
            event.preventDefault();
            void completeSelected();
          }
          break;
        case "a":
        case "A":
          if (selectedItemId) {
            event.preventDefault();
            void archiveSelected();
          }
          break;
        case "#":
          if (selectedItemId) {
            event.preventDefault();
            addTagToSelected();
          }
          break;
        case "p":
        case "P":
          if (selectedItemId) {
            event.preventDefault();
            void cyclePriority();
          }
          break;
        case "Delete":
        case "Backspace":
          if (selectedItemId && event.shiftKey) {
            event.preventDefault();
            void deleteSelected();
          }
          break;
        case "/":
          event.preventDefault();
          focusSearch();
          break;
        case "n":
        case "N":
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            setOpenCreateItem(true);
          }
          break;
        case "Escape":
          setSelectedItemId(null);
          setIsEditingTitle(false);
          setIsAddingTag(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectNextItem,
    selectPreviousItem,
    editSelectedItemTitle,
    moveSelectedToToday,
    moveSelectedToBackBurner,
    completeSelected,
    archiveSelected,
    addTagToSelected,
    cyclePriority,
    deleteSelected,
    focusSearch,
    selectedItemId,
  ]);

  const value = useMemo(
    () => ({
      selectedItemId,
      setSelectedItemId,
      items,
      setItems,
      selectNextItem,
      selectPreviousItem,
      editSelectedItemTitle,
      moveSelectedToToday,
      moveSelectedToBackBurner,
      completeSelected,
      archiveSelected,
      cyclePriority,
      addTagToSelected,
      deleteSelected,
      isEditingTitle,
      setIsEditingTitle,
      isAddingTag,
      setIsAddingTag,
      focusSearch,
      searchInputRef,
      openCreateItem,
      setOpenCreateItem,
    }),
    [
      selectedItemId,
      items,
      selectNextItem,
      selectPreviousItem,
      editSelectedItemTitle,
      moveSelectedToToday,
      moveSelectedToBackBurner,
      completeSelected,
      archiveSelected,
      cyclePriority,
      addTagToSelected,
      deleteSelected,
      isEditingTitle,
      isAddingTag,
      focusSearch,
      openCreateItem,
    ]
  );

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
}

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error(
      "useKeyboardNavigation must be used within a KeyboardNavigationProvider"
    );
  }
  return context;
}

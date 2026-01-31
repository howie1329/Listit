"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { ViewEmptyState } from "./EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { SingleItemListComponent } from "./SingleItemListComponent";
import { useState, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignCircleIcon } from "@hugeicons/core-free-icons";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { motion, AnimatePresence } from "motion/react";

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ItemList = ({ items }: { items: Doc<"items">[] }) => {
  const { setItems, selectedItemId, setSelectedItemId } =
    useKeyboardNavigation();
  const listRef = useRef<HTMLDivElement>(null);

  // Sync items with keyboard navigation context
  useEffect(() => {
    setItems(items);
  }, [items, setItems]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemId && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-item-id="${selectedItemId}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedItemId]);

  if (!items) {
    return <Spinner />;
  }
  if (items.length === 0) {
    return <ViewEmptyState />;
  }

  const filteredItems = items.filter((item) => !item.isDeleted);

  return (
    <div
      ref={listRef}
      className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2"
      role="listbox"
      aria-label="Items list"
      tabIndex={0}
      onFocus={() => {
        // Select first item if nothing is selected
        if (!selectedItemId && filteredItems.length > 0) {
          setSelectedItemId(filteredItems[0]._id);
        }
      }}
    >
      <AnimatePresence mode="popLayout">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item._id}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -100 }
            }
            transition={{
              opacity: { duration: 0.35, ease: "easeOut" },
              y: { duration: 0.35, ease: "easeOut", delay: index * 0.04 },
              x: { duration: 0.3, ease: "easeOut" },
            }}
            layout={!prefersReducedMotion}
            layoutId={item._id}
          >
            <SingleItemListComponent
              item={item}
              isSelected={selectedItemId === item._id}
              onSelect={() => setSelectedItemId(item._id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <EmptySingleItemComponent />
    </div>
  );
};

const EmptySingleItemComponent = () => {
  const [isAddingState, setIsAddingState] = useState(false);
  const [title, setTitle] = useState("");
  const createItem = useMutation(api.items.mutations.createSingleItem);

  const handleCreateItem = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      await createItem({ title: trimmedTitle, description: "" });
      toast.success("Item created successfully");
    } catch (error) {
      toast.error("Failed to create item");
      console.error("Failed to create item:", error);
    } finally {
      setIsAddingState(false);
      setTitle("");
    }
  };
  return (
    <div className="flex flex-col gap-2">
      {isAddingState ? (
        <input
          type="text"
          className="w-full text-sm border focus:ring-0 focus:outline-none bg-accent/50 rounded-md p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsAddingState(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateItem();
            }
          }}
        />
      ) : (
        <div
          className="flex flex-row items-center gap-1 hover:bg-accent/50 rounded-md p-2 cursor-pointer text-muted-foreground "
          onClick={() => setIsAddingState(true)}
        >
          <HugeiconsIcon size={20} icon={PlusSignCircleIcon} />
          <p className="text-sm ">Want to add an item? Click here</p>
        </div>
      )}
    </div>
  );
};

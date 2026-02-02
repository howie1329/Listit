"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FolderIcon,
  ArrowDown01Icon,
  PlusSignIcon,
  PinIcon,
  EyeIcon,
  Archive02Icon,
} from "@hugeicons/core-free-icons";
import { Doc } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { BookmarkView } from "@/components/features/bookmarks/bookmarkView";
import { useState } from "react";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const CollectionSelector = ({
  selectedView,
  collections,
  selectedCollection,
  onViewChange,
  onCreateCollection,
}: {
  selectedView: BookmarkView;
  collections: Doc<"bookmarkCollections">[];
  selectedCollection: Doc<"bookmarkCollections"> | undefined;
  onViewChange: (view: BookmarkView) => void;
  onCreateCollection: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const virtualViews: Array<{
    view: BookmarkView;
    label: string;
    icon: typeof FolderIcon;
  }> = [
    { view: { kind: "all" }, label: "All Bookmarks", icon: FolderIcon },
    { view: { kind: "pinned" }, label: "Pinned", icon: PinIcon },
    { view: { kind: "read" }, label: "Read", icon: EyeIcon },
    { view: { kind: "archived" }, label: "Archived", icon: Archive02Icon },
  ];

  const isViewSelected = (view: BookmarkView) => {
    if (view.kind !== selectedView.kind) {
      return false;
    }
    if (view.kind === "collection") {
      return (
        selectedView.kind === "collection" &&
        view.collectionId === selectedView.collectionId
      );
    }
    return true;
  };

  const triggerLabel =
    selectedView.kind === "collection"
      ? selectedCollection?.name ?? "Collection"
      : virtualViews.find((option) => option.view.kind === selectedView.kind)
          ?.label ?? "All Bookmarks";

  const handleViewChange = (view: BookmarkView) => {
    onViewChange(view);
    setOpen(false);
  };

  const handleCreateCollection = () => {
    onCreateCollection();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-11 px-4 text-base md:h-8 md:px-3 md:text-sm"
        >
          <HugeiconsIcon icon={FolderIcon} />
          <span>{triggerLabel}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.3, ease: "easeOut" }
          }
          layout
          className="flex flex-col gap-1"
        >
          <AnimatePresence>
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 0.25, ease: "easeOut", delay: 0 * 0.03 }
              }
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            >
              <Button
                variant={
                  isViewSelected({ kind: "all" }) ? "secondary" : "ghost"
                }
                className="justify-start w-full"
                onClick={() => handleViewChange({ kind: "all" })}
              >
                <HugeiconsIcon icon={FolderIcon} className="mr-2" />
                All Bookmarks
              </Button>
            </motion.div>
            {virtualViews
              .filter((option) => option.view.kind !== "all")
              .map((option, index) => (
                <motion.div
                  key={option.view.kind}
                  initial={
                    prefersReducedMotion ? undefined : { opacity: 0, y: -8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : {
                          duration: 0.25,
                          ease: "easeOut",
                          delay: (index + 1) * 0.03,
                        }
                  }
                  whileHover={
                    prefersReducedMotion ? undefined : { scale: 1.02 }
                  }
                >
                  <Button
                    variant={isViewSelected(option.view) ? "secondary" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleViewChange(option.view)}
                  >
                    <HugeiconsIcon icon={option.icon} className="mr-2" />
                    {option.label}
                  </Button>
                </motion.div>
              ))}
            <div className="border-t my-1" />
            {collections.map((collection, index) => (
              <motion.div
                key={collection._id}
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, y: -8 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: 0.25,
                        ease: "easeOut",
                        delay: (index + 1 + virtualViews.length) * 0.03,
                      }
                }
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              >
                <Button
                  variant={
                    isViewSelected({
                      kind: "collection",
                      collectionId: collection._id,
                    })
                      ? "secondary"
                      : "ghost"
                  }
                  className="justify-start w-full"
                  onClick={() =>
                    handleViewChange({
                      kind: "collection",
                      collectionId: collection._id,
                    })
                  }
                >
                  <HugeiconsIcon icon={FolderIcon} className="mr-2" />
                  {collection.name}
                </Button>
              </motion.div>
            ))}
            <div className="border-t my-1" />
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 0.25,
                      ease: "easeOut",
                      delay: (collections.length + 1) * 0.03,
                    }
              }
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            >
              <Button
                variant="ghost"
                className="justify-start w-full"
                onClick={handleCreateCollection}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
                Create Collection
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

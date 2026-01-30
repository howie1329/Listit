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
} from "@hugeicons/core-free-icons";
import { Doc } from "@/convex/_generated/dataModel";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const CollectionSelector = ({
  selectedCollectionId,
  collections,
  selectedCollection,
  onCollectionChange,
  onCreateCollection,
}: {
  selectedCollectionId: Id<"bookmarkCollections"> | null;
  collections: Doc<"bookmarkCollections">[];
  selectedCollection: Doc<"bookmarkCollections"> | undefined;
  onCollectionChange: (id: Id<"bookmarkCollections"> | null) => void;
  onCreateCollection: () => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-11 px-4 text-base md:h-8 md:px-3 md:text-sm"
        >
          <HugeiconsIcon icon={FolderIcon} />
          <span>
            {selectedCollection ? selectedCollection.name : "All Bookmarks"}
          </span>
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
                variant={selectedCollectionId === null ? "secondary" : "ghost"}
                className="justify-start w-full"
                onClick={() => onCollectionChange(null)}
              >
                All Bookmarks
              </Button>
            </motion.div>
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
                        delay: (index + 1) * 0.03,
                      }
                }
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              >
                <Button
                  variant={
                    selectedCollectionId === collection._id
                      ? "secondary"
                      : "ghost"
                  }
                  className="justify-start w-full"
                  onClick={() => onCollectionChange(collection._id)}
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
                onClick={onCreateCollection}
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

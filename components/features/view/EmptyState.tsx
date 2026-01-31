import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { HomeIcon } from "@hugeicons/core-free-icons";
import { CreateItemModal } from "./CreateItemModal";
import { motion } from "motion/react";

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ViewEmptyState = () => {
  return (
    <motion.div
      className="flex flex-col w-full h-full p-4"
      initial={
        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
      }
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.4, ease: "easeOut" },
        scale: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={HomeIcon} />
          </EmptyMedia>
          <EmptyTitle>No items found</EmptyTitle>
          <EmptyDescription>
            Get started by creating your first item. Capture your tasks,
            bookmarks, or anything else you need to keep track of.
          </EmptyDescription>
        </EmptyHeader>
        <CreateItemModal />
      </Empty>
    </motion.div>
  );
};

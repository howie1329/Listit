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
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface BookmarkCardProps {
  bookmark: Doc<"bookmarks">;
  collections: Doc<"bookmarkCollections">[] | undefined;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  index?: number;
}

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const BookmarkCard = ({
  bookmark,
  collections,
  isSelected = false,
  onSelect,
  onDelete,
  index = 0,
}: BookmarkCardProps) => {
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isSelected ? 1.005 : 1,
      }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -100 }}
      transition={{
        opacity: { duration: 0.35, ease: "easeOut" },
        y: { duration: 0.35, ease: "easeOut", delay: index * 0.04 },
        scale: { duration: 0.2, ease: "easeOut" },
        x: { duration: 0.3, ease: "easeOut" },
      }}
      layout={!prefersReducedMotion}
      layoutId={bookmark._id}
      whileHover={
        prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2 } }
      }
    >
      <Card
        key={bookmark._id}
        className={cn(
          "transition-colors cursor-pointer gap-1",
          isSelected
            ? "bg-accent border-primary/50 ring-1 ring-primary/30"
            : "hover:bg-accent",
        )}
        onClick={onSelect}
        data-bookmark-id={bookmark._id}
        role="option"
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
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
            <span className="truncate">{bookmark.title}</span>
            {isSelected && (
              <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-1 ml-auto">
                <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 text-[10px] font-medium bg-muted/50 rounded border border-border">
                  Enter
                </kbd>
                <span>open</span>
              </span>
            )}
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
              onDelete={onDelete}
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
    </motion.div>
  );
};

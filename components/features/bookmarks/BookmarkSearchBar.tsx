"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkAdd01Icon } from "@hugeicons/core-free-icons";
import React from "react";

export const BookmarkSearchBar = ({
  searchQuery,
  onSearchChange,
  onCreateBookmark,
  isCreatingBookmark,
  onKeyDown,
  inputRef,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateBookmark: () => void;
  isCreatingBookmark: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  return (
    <>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          placeholder="Search bookmarks or paste URL to add... (press / to focus)"
          className="flex-1 h-11 text-base md:h-8 md:text-sm pr-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isCreatingBookmark}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hidden md:block">
          <kbd className="inline-flex items-center justify-center h-5 w-5 text-[10px] font-medium bg-muted/50 rounded border border-border">
            /
          </kbd>
        </span>
      </div>
      <Button
        onClick={onCreateBookmark}
        disabled={isCreatingBookmark || !searchQuery.trim()}
        className="md:hidden h-11 w-11 md:h-8 md:w-8"
        aria-label="Add bookmark"
      >
        {isCreatingBookmark ? (
          <Spinner />
        ) : (
          <HugeiconsIcon icon={BookmarkAdd01Icon} />
        )}
      </Button>
    </>
  );
};


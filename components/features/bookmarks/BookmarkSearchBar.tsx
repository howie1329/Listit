"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkAdd01Icon } from "@hugeicons/core-free-icons";

export const BookmarkSearchBar = ({
  searchQuery,
  onSearchChange,
  onCreateBookmark,
  isCreatingBookmark,
  onKeyDown,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateBookmark: () => void;
  isCreatingBookmark: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      <Input
        placeholder="Search bookmarks or paste URL to add..."
        className="flex-1 h-11 text-base md:h-8 md:text-sm"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isCreatingBookmark}
      />
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


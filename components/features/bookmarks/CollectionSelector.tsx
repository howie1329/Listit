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
        <div className="flex flex-col gap-1">
          <Button
            variant={selectedCollectionId === null ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => onCollectionChange(null)}
          >
            All Bookmarks
          </Button>
          {collections.map((collection) => (
            <Button
              key={collection._id}
              variant={
                selectedCollectionId === collection._id ? "secondary" : "ghost"
              }
              className="justify-start"
              onClick={() => onCollectionChange(collection._id)}
            >
              <HugeiconsIcon icon={FolderIcon} className="mr-2" />
              {collection.name}
            </Button>
          ))}
          <div className="border-t my-1" />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={onCreateCollection}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
            Create Collection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};


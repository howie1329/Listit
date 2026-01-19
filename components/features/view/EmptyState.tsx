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

export const ViewEmptyState = () => {
  return (
    <div className="flex flex-col w-full h-full p-4">
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
    </div>
  );
};

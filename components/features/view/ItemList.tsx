import { Doc } from "@/convex/_generated/dataModel";
import { ViewEmptyState } from "./EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { SingleItemListComponent } from "./SingleItemListComponent";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignCircleIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export const ItemList = ({ items }: { items: Doc<"items">[] }) => {
  if (!items) {
    return <Spinner />;
  }
  if (items.length === 0) {
    return <ViewEmptyState />;
  }
  return (
    <div className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2">
      {items
        .filter((item) => !item.isDeleted)
        .map((item) => (
          <SingleItemListComponent key={item._id} item={item} />
        ))}
      <EmptySingleItemComponent />
    </div>
  );
};

const EmptySingleItemComponent = () => {
  const [isAddingState, setIsAddingState] = useState(false);
  const [title, setTitle] = useState("");
  const createItem = useMutation(api.items.mutations.createSingleItem);

  const handleCreateItem = async () => {
    if (title.trim() === "") {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      await createItem({ title: title, description: "" });
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

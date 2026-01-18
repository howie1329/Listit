import { Doc } from "@/convex/_generated/dataModel";
import { ViewEmptyState } from "./EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { SingleItemListComponent } from "./SingleItemListComponent";

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
    </div>
  );
};

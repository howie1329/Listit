"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";

export default function ListPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <ListPageContent />
    </div>
  );
}

export const ListPageContent = () => {
  const lists = useQuery(api.listFunctions.getLists);

  if (lists?.length === 0) {
    return (
      <div className="flex flex-col w-full h-full">
        <p>No lists found</p>
      </div>
    );
  }

  if (!lists) {
    return (
      <div className="flex flex-col w-full h-full">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full h-full gap-2 p-4">
      {lists.map((list) => (
        <ListCard key={list._id} list={list} />
      ))}
    </div>
  );
};

const ListCard = ({ list }: { list: Doc<"list"> }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-card border h-fit max-h-94 overflow-y-auto p-2"
    >
      <CollapsibleTrigger asChild className="flex items-center w-full">
        <div className="flex flex-col items-start justify-start gap-0">
          <p className="text-sm font-medium line-clamp-1">{list.title}</p>
          <div className="flex items-center justify-between gap-2 w-full">
            <p className="text-xs text-muted-foreground line-clamp-1">
              {list.description}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {new Date(list._creationTime).toLocaleString()}
            </p>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 ">
          <p>{list.description}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

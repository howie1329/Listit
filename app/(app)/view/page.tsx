"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ViewStatusSelect } from "@/components/features/view/ViewStatusSelect";
import { useState, useMemo } from "react";
import { InputSearch } from "@/components/features/view/InputSearch";
import { ItemList } from "@/components/features/view/ItemList";
import { ViewStatus } from "@/components/features/view/ViewStatusSelect";
import { Separator } from "@/components/ui/separator";

export default function ViewPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <ViewPageContent />
    </div>
  );
}

export const ViewPageContent = () => {
  const items = useQuery(api.items.queries.getUserItems);
  const [status, setStatus] = useState<ViewStatus>("today");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const query = search.toLowerCase().trim();
    if (query !== "") {
      return items
        .filter((item) => {
          return (
            item.title.toLowerCase().includes(query) &&
            item.focusState === status
          );
        })
        .sort((a, b) => {
          return a._creationTime - b._creationTime;
        });
    }
    return items
      .filter((item) => {
        return item.focusState === status;
      })
      .sort((a, b) => {
        return a._creationTime - b._creationTime;
      });
  }, [items, search, status]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-row gap-2 w-full h-fit p-2">
        <ViewStatusSelect
          className="w-36 h-16"
          value={status}
          onChange={setStatus}
        />
        <InputSearch
          className="self-center h-8"
          search={search}
          setSearch={setSearch}
        />
      </div>
      <Separator />
      <ItemList items={filteredItems} />
    </div>
  );
};

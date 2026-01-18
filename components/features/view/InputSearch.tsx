"use client";

import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export const InputSearch = ({
  search,
  setSearch,
  className,
}: {
  search: string;
  setSearch: (search: string) => void;
  className?: string;
}) => {
  const createItem = useMutation(api.items.mutations.createSingleItem);

  const handleCreateItem = async () => {
    try {
      await createItem({ title: search, description: "" });
      toast.success("Item created successfully");
    } catch (error) {
      toast.error("Failed to create item");
      console.error("Failed to create item:", error);
    }
    setSearch("");
  };

  return (
    <Input
      className={cn(className)}
      placeholder="Search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateItem();
        }
      }}
    />
  );
};

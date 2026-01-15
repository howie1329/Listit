"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const InputSearch = ({
  search,
  setSearch,
  className,
}: {
  search: string;
  setSearch: (search: string) => void;
  className?: string;
}) => {
  return (
    <Input
      className={cn(className)}
      placeholder="Search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
};

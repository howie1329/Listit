"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ViewStatusSelect } from "@/components/features/view/ViewStatusSelect";
import { useState, useMemo, useEffect, useRef } from "react";
import { InputSearch } from "@/components/features/view/InputSearch";
import { ItemList } from "@/components/features/view/ItemList";
import { ViewStatus } from "@/components/features/view/ViewStatusSelect";
import { Separator } from "@/components/ui/separator";
import { KeyboardShortcutsHelp } from "@/components/features/view/KeyboardShortcutsHelp";
import { QuickCreateItemDialog } from "@/components/features/view/QuickCreateItemDialog";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Render the view page container that hosts the main view content.
 *
 * @returns The root React element containing the ViewPageContent component
 */
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
  const { 
    openCreateItem, 
    setOpenCreateItem,
    searchInputRef,
  } = useKeyboardNavigation();

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
    <div className="flex flex-col w-full h-full gap-1">
      <div className="flex flex-row gap-1 w-full h-fit p-1 items-center">
        <ViewStatusSelect
          className="w-36 h-16"
          value={status}
          onChange={setStatus}
        />
        <KeyboardEnabledSearch
          search={search}
          setSearch={setSearch}
          inputRef={searchInputRef}
        />
        <KeyboardShortcutsHelp />
      </div>
      <Separator />
      <ItemList items={filteredItems} />
      <QuickCreateItemDialog
        open={openCreateItem}
        onOpenChange={setOpenCreateItem}
      />
    </div>
  );
};

interface KeyboardEnabledSearchProps {
  search: string;
  setSearch: (search: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const KeyboardEnabledSearch = ({ 
  search, 
  setSearch,
  inputRef,
}: KeyboardEnabledSearchProps) => {
  return (
    <div className="relative flex-1 self-center">
      <Input
        ref={inputRef}
        className="h-8 pr-12"
        placeholder="Search items... (press / to focus)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSearch("");
            e.currentTarget.blur();
          }
        }}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
        <kbd className="inline-flex items-center justify-center h-5 w-5 text-[10px] font-medium bg-muted/50 rounded border border-border">
          /
        </kbd>
      </span>
    </div>
  );
};
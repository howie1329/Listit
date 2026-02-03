"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ViewStatusSelect } from "@/components/features/view/ViewStatusSelect";
import { useState, useMemo } from "react";
import { ItemList } from "@/components/features/view/ItemList";
import { ViewStatus } from "@/components/features/view/ViewStatusSelect";
import { Separator } from "@/components/ui/separator";
import { KeyboardShortcutsHelp } from "@/components/features/view/KeyboardShortcutsHelp";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";

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
  const { searchInputRef } = useKeyboardNavigation();

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const query = search.toLowerCase().trim();
    if (query !== "") {
      return items
        .filter((item) => {
          return (
            item.title.toLowerCase().includes(query) &&
            item.focusState === status &&
            !item.isDeleted
          );
        })
        .sort((a, b) => {
          return a._creationTime - b._creationTime;
        });
    }
    return items
      .filter((item) => {
        return item.focusState === status && !item.isDeleted;
      })
      .sort((a, b) => {
        return a._creationTime - b._creationTime;
      });
  }, [items, search, status]);

  const todayCount = useMemo(() => {
    if (!items) return 0;
    return items.filter(
      (item) => item.focusState === "today" && !item.isDeleted,
    ).length;
  }, [items]);

  const backBurnerCount = useMemo(() => {
    if (!items) return 0;
    return items.filter(
      (item) => item.focusState === "back_burner" && !item.isDeleted,
    ).length;
  }, [items]);

  return (
    <div className="flex flex-col w-full h-full gap-1">
      <div className="flex flex-row gap-1 w-full h-fit p-1 items-center">
        <ViewStatusSelect
          value={status}
          onChange={setStatus}
          todayCount={todayCount}
          backBurnerCount={backBurnerCount}
        />
        <KeyboardEnabledSearch
          search={search}
          setSearch={setSearch}
          inputRef={searchInputRef}
        />
        <KeyboardShortcutsHelp />
      </div>
      <Separator />
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          className="flex-1 min-h-0"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{
            opacity: { duration: 0.25, ease: "easeOut" },
            y: { duration: 0.25, ease: "easeOut" },
          }}
        >
          <ItemList items={filteredItems} />
        </motion.div>
      </AnimatePresence>
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

"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useModifierKey } from "@/hooks/use-keyboard-shortcuts";

export type CommandItemConfig = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  group?: string;
};

export type AppCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AppCommandPalette = ({ open, onOpenChange }: AppCommandPaletteProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { setOpenCreateItem } = useKeyboardNavigation();
  const modKey = useModifierKey();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const searchResults = useQuery(api.search.query.searchItems, {
    query: debouncedSearch,
  });

  const bookmarkCollections =
    useQuery(api.bookmarks.bookmarkCollectionFunctions.getCollections, {}) ??
    [];

  const updateBookmarkCollection = useMutation(
    api.bookmarks.bookmarkFunctions.updateCollection,
  );
  const toggleItemCompletion = useMutation(
    api.items.mutations.toogleSingleItemCompletion,
  );
  const updateItem = useMutation(api.items.mutations.updateSingleItem);

  const baseCommands: CommandItemConfig[] = [
    {
      id: "create-item",
      label: "Create New Item",
      shortcut: `${modKey} Shift C`,
      onSelect: () => {
        setTimeout(() => setOpenCreateItem(true), 0);
      },
      group: "Quick actions",
    },
    {
      id: "go-items",
      label: "Go to Items",
      shortcut: "G I",
      onSelect: () => {
        router.push("/item");
      },
      group: "Navigation",
    },
    {
      id: "go-bookmarks",
      label: "Go to Bookmarks",
      shortcut: "G B",
      onSelect: () => {
        router.push("/bookmarks");
      },
      group: "Navigation",
    },
  ];
  const searchCommands: CommandItemConfig[] =
    (searchResults ?? []).flatMap((result) => {
      if (result.type === "item") {
        const label = result.title || "Untitled item";

        const primaryCommand: CommandItemConfig = {
          id: `search-item-${result.id}`,
          label: `${result.isCompleted ? "✓" : "•"} ${label}`,
          onSelect: () => {
            toggleItemCompletion({ itemId: result.id });
          },
          group: "Search results",
        };

        const commands: CommandItemConfig[] = [
          primaryCommand,
          {
            id: `item-${result.id}-toggle-complete`,
            label: result.isCompleted
              ? `Mark as incomplete: ${label}`
              : `Mark as complete: ${label}`,
            onSelect: () => {
              toggleItemCompletion({ itemId: result.id });
            },
            group: "Search results – Items",
          },
          {
            id: `item-${result.id}-focus-today`,
            label: `Move to Today: ${label}`,
            onSelect: () => {
              updateItem({ itemId: result.id, focusState: "today" });
            },
            group: "Search results – Items",
          },
          {
            id: `item-${result.id}-focus-backburner`,
            label: `Move to Backburner: ${label}`,
            onSelect: () => {
              updateItem({ itemId: result.id, focusState: "back_burner" });
            },
            group: "Search results – Items",
          },
        ];
        return commands;
      }

      const label = result.title || result.url;

      const primaryCommand: CommandItemConfig = {
        id: `search-bookmark-${result.id}`,
        label: label,
        onSelect: () => {
          if (result.url) {
            window.open(result.url, "_blank");
          } else {
            router.push("/bookmarks");
          }
        },
        group: "Search results",
      };

      const collectionCommands: CommandItemConfig[] = bookmarkCollections.map(
        (collection) => ({
          id: `bookmark-${result.id}-collection-${collection._id}`,
          label: `Move "${label}" to ${collection.name}`,
          onSelect: () => {
            updateBookmarkCollection({
              bookmarkId: result.id,
              collectionId: collection._id,
            });
          },
          group: "Search results – Bookmarks",
        }),
      );

      const clearCollectionCommand: CommandItemConfig = {
        id: `bookmark-${result.id}-collection-none`,
        label: `Remove collection from "${label}"`,
        onSelect: () => {
          updateBookmarkCollection({
            bookmarkId: result.id,
            collectionId: undefined,
          });
        },
        group: "Search results – Bookmarks",
      };

      return [primaryCommand, ...collectionCommands, clearCollectionCommand];
    }) ?? [];

  const commands: CommandItemConfig[] = [...baseCommands, ...searchCommands];

  const groupedCommands = commands.reduce<Record<string, CommandItemConfig[]>>(
    (acc, command) => {
      const groupKey = command.group ?? "Commands";
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(command);
      return acc;
    },
    {},
  );

  const handleSelect = (item: CommandItemConfig) => {
    item.onSelect();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Type a command or search..." value={search} onValueChange={(value) => setSearch(value)} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedCommands).map(([groupLabel, groupItems]) => (
            <CommandGroup key={groupLabel} heading={groupLabel}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  value={item.label}
                >
                  <span>{item.label}</span>
                  {item.shortcut ? (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
        </CommandList>
      </Command>
    </CommandDialog>
  );
};


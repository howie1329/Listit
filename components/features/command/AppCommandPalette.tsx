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
import { useRouter } from "next/navigation";

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

  const commands: CommandItemConfig[] = [
    {
      id: "create-item",
      label: "Create New Item",
      shortcut: "Enter",
      onSelect: () => {
        // Placeholder for future “create item” flow.
        // eslint-disable-next-line no-console
        console.log("Create New Item command selected");
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
        <CommandInput placeholder="Type a command or search..." />
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



"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { KeyboardIcon } from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

/**
 * Render a dialog that exposes grouped keyboard shortcuts for bookmark navigation and actions.
 *
 * The component provides a trigger button and a dialog that lists shortcut groups with
 * descriptions and key sequences visualized as styled `<kbd>` elements.
 *
 * @returns A React element containing the trigger and the keyboard shortcuts dialog.
 */
export function BookmarkKeyboardShortcutsHelp() {
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "Navigation",
      shortcuts: [
        { keys: ["/"], description: "Focus search" },
        { keys: ["↓", "J"], description: "Next bookmark" },
        { keys: ["↑", "K"], description: "Previous bookmark" },
        { keys: ["Esc"], description: "Clear selection" },
      ],
    },
    {
      title: "Bookmark Actions",
      shortcuts: [
        { keys: ["Enter"], description: "Open bookmark in new tab" },
        { keys: ["E"], description: "Edit bookmark" },
        { keys: ["Shift", "Delete"], description: "Delete bookmark" },
      ],
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <HugeiconsIcon icon={KeyboardIcon} size={16} />
          <span className="text-xs hidden md:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={KeyboardIcon} size={20} />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {groupIndex > 0 && <Separator className="mb-4" />}
              <h3 className="text-sm font-medium mb-3">{group.title}</h3>
              <div className="grid gap-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <span key={index}>
                          <kbd className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 text-xs font-medium bg-muted rounded border border-border">
                            {key}
                          </kbd>
                          {index < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
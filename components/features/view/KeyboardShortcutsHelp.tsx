"use client";

import { useModifierKey } from "@/hooks/use-keyboard-shortcuts";
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
 * Render a button-triggered dialog that displays categorized keyboard shortcuts with visual key badges.
 *
 * @returns A React element containing the keyboard shortcuts help dialog.
 */
export function KeyboardShortcutsHelp() {
  const modKey = useModifierKey();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "Global",
      shortcuts: [
        { keys: [modKey, "N"], description: "New item" },
        { keys: ["/"], description: "Focus search / filter" },
        { keys: ["Esc"], description: "Clear selection" },
      ],
    },
    {
      title: "Navigation",
      shortcuts: [
        { keys: ["↓", "J"], description: "Next item" },
        { keys: ["↑", "K"], description: "Previous item" },
      ],
    },
    {
      title: "Item Actions",
      shortcuts: [
        { keys: ["Enter"], description: "Edit title" },
        { keys: ["T"], description: "Move to Today" },
        { keys: ["B"], description: "Move to Back Burner" },
        { keys: ["X"], description: "Toggle complete" },
        { keys: ["A"], description: "Toggle archive" },
        { keys: ["#"], description: "Add tag" },
        { keys: ["P"], description: "Cycle priority" },
        { keys: ["Shift", "Delete"], description: "Delete item" },
      ],
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <HugeiconsIcon icon={KeyboardIcon} size={16} />
          <span className="text-xs">Shortcuts</span>
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

/**
 * Render a compact inline representation of one or more keyboard keys as keycap badges.
 *
 * Renders each entry from `keys` as a styled `<kbd>` badge and separates multiple keys with a "+" glyph.
 *
 * @param keys - Ordered list of key labels to display (e.g., `["Ctrl", "K"]`)
 * @param className - Optional CSS classes applied to the wrapper element
 * @returns A JSX element containing the rendered key badges
 */
export function KeyboardHint({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={className}>
      {keys.map((key, index) => (
        <span key={index}>
          <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 text-[10px] font-medium bg-muted/50 rounded border border-border text-muted-foreground">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="mx-0.5 text-muted-foreground">+</span>
          )}
        </span>
      ))}
    </span>
  );
}
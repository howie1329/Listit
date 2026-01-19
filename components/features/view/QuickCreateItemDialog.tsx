"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { KeyboardHint } from "./KeyboardShortcutsHelp";
import { useModifierKey } from "@/hooks/use-keyboard-shortcuts";

interface QuickCreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Render a controlled dialog that lets the user quickly create a new item using a single title input.
 *
 * @param open - Whether the dialog is currently open
 * @param onOpenChange - Callback invoked with the updated open state
 * @returns The Dialog element containing the quick-create UI (title input, keyboard hints, and create action)
 */
export function QuickCreateItemDialog({
  open,
  onOpenChange,
}: QuickCreateItemDialogProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modKey = useModifierKey();

  const createItem = useMutation(api.items.mutations.createSingleItem);

  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure the dialog is mounted
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleCreate = async () => {
    if (title.trim() === "") {
      toast.error("Title cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await createItem({ title: title.trim(), description: "" });
      toast.success("Item created");
      setTitle("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create item");
      console.error("Failed to create item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Quick Create Item
            <KeyboardHint keys={[modKey, "N"]} className="ml-2" />
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            ref={inputRef}
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="text-base"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Press <KeyboardHint keys={["Enter"]} /> to create
            </span>
            <Button
              onClick={handleCreate}
              disabled={isLoading || title.trim() === ""}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
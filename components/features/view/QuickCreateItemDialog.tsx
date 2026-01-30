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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyboardHint } from "./KeyboardShortcutsHelp";
import { useModifierKey } from "@/hooks/use-keyboard-shortcuts";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuickCreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Priority = "low" | "medium" | "high";
type FocusState = "today" | "back_burner";

export function QuickCreateItemDialog({
  open,
  onOpenChange,
}: QuickCreateItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [focusState, setFocusState] = useState<FocusState>("today");
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modKey = useModifierKey();

  const createItem = useMutation(api.items.mutations.createSingleItem);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setTitle("");
      setDescription("");
      setPriority("medium");
      setFocusState("today");
      setShowDetails(false);
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
      await createItem({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        focusState,
      });
      toast.success("Item created");
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
            Quick Capture
            <KeyboardHint keys={[modKey, "Shift", "C"]} className="ml-2" />
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Title input - always visible */}
          <Input
            ref={inputRef}
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="text-base"
          />

          {/* Expandable details section */}
          {showDetails && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Textarea
                placeholder="Add a description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="min-h-[80px] text-sm"
              />

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Priority
                  </label>
                  <Select
                    value={priority}
                    onValueChange={(value: Priority) => setPriority(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Focus
                  </label>
                  <Select
                    value={focusState}
                    onValueChange={(value: FocusState) => setFocusState(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="back_burner">Back Burner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                disabled={isLoading}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Add Details
                  </>
                )}
              </Button>

              {!showDetails && (
                <span className="text-xs text-muted-foreground">
                  Press <KeyboardHint keys={["Enter"]} /> to create
                </span>
              )}
            </div>

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

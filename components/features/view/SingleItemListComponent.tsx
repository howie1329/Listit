"use client";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CenterFocusIcon,
  DeleteIcon,
  MoreHorizontalIcon,
  PencilIcon,
} from "@hugeicons/core-free-icons";
import { Streamdown } from "streamdown";

export const SingleItemListComponent = ({ item }: { item: Doc<"items"> }) => {
  // States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [editedDescription, setEditedDescription] = useState(
    item.description || "",
  );
  // Mutations
  const toggleCompletion = useMutation(
    api.items.mutations.toogleSingleItemCompletion,
  );
  const updateItem = useMutation(api.items.mutations.updateSingleItem);

  // Handlers
  const handleToggleCompletion = async () => {
    try {
      await toggleCompletion({ itemId: item._id });
    } catch {
      toast.error("Failed to toggle completion");
    }
  };
  const handleEditTitle = async () => {
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle === "" || trimmedTitle === item.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await updateItem({
        itemId: item._id,
        title: trimmedTitle,
      });
      toast.success("Title updated");
    } catch {
      toast.error("Failed to update title");
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleEditDescription = async () => {
    const trimmedDescription = editedDescription.trim();
    if (trimmedDescription === "" || trimmedDescription === item.description) {
      setIsEditingDescription(false);
      return;
    }
    try {
      await updateItem({
        itemId: item._id,
        description: trimmedDescription,
      });
      toast.success("Description updated");
    } catch {
      toast.error("Failed to update description");
    } finally {
      setIsEditingDescription(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 hover:bg-accent/50 rounded-md p-2 border border-transparent">
      {/* Title */}
      <div className="flex flex-row items-center gap-1 justify-between">
        <div className="flex flex-row items-center gap-1">
          <Checkbox
            checked={item.isCompleted}
            onCheckedChange={handleToggleCompletion}
          />
          {item.priority && <Badge variant="outline">{item.priority}</Badge>}
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              className="text-sm font-medium border focus:ring-0 focus:outline-none"
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEditTitle();
                }
                if (e.key === "Escape") {
                  setIsEditingTitle(false);
                }
              }}
            />
          ) : (
            <p
              className={cn(
                "text-sm font-medium",
                item.isCompleted && "line-through text-muted-foreground",
              )}
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {item.title}
            </p>
          )}
          {item.tags.map((tag) => (
            <Badge variant="outline" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
        <OptionsSheet item={item} />
      </div>
      {/* Description */}
      {item.description && (
        <div className="flex flex-row items-center gap-2">
          {isEditingDescription ? (
            <input
              type="text"
              value={editedDescription}
              className="text-xs focus:ring-0 focus:outline-none w-full border line-clamp-2"
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={() => setIsEditingDescription(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEditDescription();
                }
                if (e.key === "Escape") {
                  setIsEditingDescription(false);
                }
              }}
            />
          ) : (
            <p
              className="text-xs text-muted-foreground line-clamp-2 w-full"
              onDoubleClick={() => setIsEditingDescription(true)}
            >
              {item.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const OptionsSheet = ({ item }: { item: Doc<"items"> }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(item.notes ?? "");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const cancelEditRef = useRef(false);
  const isSavingRef = useRef(false);
  const notesInputRef = useRef<HTMLTextAreaElement | null>(null);

  const updateItem = useMutation(api.items.mutations.updateSingleItem);
  const toggleFocusState = useMutation(api.items.mutations.updateSingleItem);

  useEffect(() => {
    if (!isEditingNotes) {
      setEditedNotes(item.notes ?? "");
    }
  }, [item.notes, isEditingNotes]);

  useEffect(() => {
    if (isEditingNotes) {
      notesInputRef.current?.focus();
    }
  }, [isEditingNotes]);

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setIsEditingNotes(false);
      setEditedNotes(item.notes ?? "");
      cancelEditRef.current = false;
    }
  };

  const handleToggleFocusState = async () => {
    try {
      await toggleFocusState({
        itemId: item._id,
        focusState: item.focusState === "today" ? "back_burner" : "today",
      });
    } catch {
      toast.error("Failed to toggle focus state");
    }
  };

  const handleSaveNotes = async () => {
    const currentNotes = item.notes ?? "";
    if (editedNotes === currentNotes) {
      setIsEditingNotes(false);
      return;
    }
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;
    try {
      await updateItem({
        itemId: item._id,
        notes: editedNotes,
      });
      toast.success("Notes updated");
      setIsEditingNotes(false);
    } catch {
      toast.error("Failed to update notes");
    } finally {
      isSavingRef.current = false;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open item options">
            <HugeiconsIcon icon={MoreHorizontalIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsSheetOpen(true)}>
            <HugeiconsIcon icon={PencilIcon} />
            Notes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleFocusState}>
            <HugeiconsIcon icon={CenterFocusIcon} />
            {item.focusState === "today"
              ? "Move to Back Burner"
              : "Move to Today"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <HugeiconsIcon icon={DeleteIcon} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="flex flex-col gap-6">
          <SheetHeader>
            <SheetTitle>Notes</SheetTitle>
            <SheetDescription>
              Double-click the notes area to edit markdown.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                <span>Notes</span>
                <span>Markdown</span>
              </div>
              {isEditingNotes ? (
                <Textarea
                  ref={notesInputRef}
                  value={editedNotes}
                  placeholder="Write markdown notes..."
                  onChange={(event) => setEditedNotes(event.target.value)}
                  onBlur={() => {
                    if (cancelEditRef.current) {
                      cancelEditRef.current = false;
                      return;
                    }
                    void handleSaveNotes();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      cancelEditRef.current = true;
                      setIsEditingNotes(false);
                      setEditedNotes(item.notes ?? "");
                      return;
                    }
                    if (
                      (event.metaKey || event.ctrlKey) &&
                      event.key === "Enter"
                    ) {
                      event.preventDefault();
                      void handleSaveNotes();
                    }
                  }}
                  className="min-h-36"
                />
              ) : (
                <div
                  className="min-h-36 rounded-md border bg-muted/20 p-3 text-xs/relaxed"
                  onDoubleClick={() => setIsEditingNotes(true)}
                >
                  {item.notes?.trim() ? (
                    <Streamdown>{item.notes}</Streamdown>
                  ) : (
                    <p className="text-muted-foreground">
                      Double-click to add notes in markdown.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <DeleteItemAlertDialog
        itemId={item._id}
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
      />
    </>
  );
};

const DeleteItemAlertDialog = ({
  itemId,
  open,
  setOpen,
}: {
  itemId: Id<"items">;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const deleteItem = useMutation(api.items.mutations.deleteSingleItem);
  const handleDeleteItem = async () => {
    try {
      await deleteItem({ itemId });
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this item?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          This action cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteItem}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

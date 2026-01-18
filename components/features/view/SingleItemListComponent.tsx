"use client";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
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
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
  const deleteItem = useMutation(api.items.mutations.deleteSingleItem);

  // Handlers
  const handleDeleteItem = async () => {
    try {
      await deleteItem({ itemId: item._id });
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };
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
        <DeleteItemAlertDialog itemId={item._id} />
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

const DeleteItemAlertDialog = ({ itemId }: { itemId: Id<"items"> }) => {
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
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
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

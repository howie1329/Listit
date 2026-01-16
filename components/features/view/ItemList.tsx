import { Doc } from "@/convex/_generated/dataModel";
import { ViewEmptyState } from "./EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ItemList = ({ items }: { items: Doc<"items">[] }) => {
  if (!items) {
    return <Spinner />;
  }
  if (items.length === 0) {
    return <ViewEmptyState />;
  }
  return (
    <div className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2">
      {items.map((item) => (
        <MinimalSingleItem key={item._id} item={item} />
      ))}
    </div>
  );
};

const MinimalSingleItem = ({ item }: { item: Doc<"items"> }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const updateItem = useMutation(api.items.mutations.updateSingleItem);
  const toggleCompletion = useMutation(
    api.items.mutations.toogleSingleItemCompletion,
  );

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const startEditingTitle = () => {
    setEditedTitle(item.title);
    setIsEditingTitle(true);
  };

  const startEditingDescription = () => {
    setEditedDescription(item.description || "");
    setIsEditingDescription(true);
  };

  const handleTitleSubmit = async () => {
    const trimmed = editedTitle.trim();
    if (trimmed === "") {
      setIsEditingTitle(false);
      return;
    }
    if (trimmed !== item.title) {
      try {
        await updateItem({
          itemId: item._id,
          title: trimmed,
        });
        toast.success("Title updated");
      } catch {
        toast.error("Failed to update title");
      }
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSubmit = async () => {
    const trimmedValue = editedDescription.trim();
    if (trimmedValue !== (item.description || "")) {
      try {
        await updateItem({
          itemId: item._id,
          description: trimmedValue || undefined,
        });
        toast.success("Description updated");
      } catch {
        toast.error("Failed to update description");
      }
    }
    setIsEditingDescription(false);
  };

  const handlePriorityChange = async (priority: "low" | "medium" | "high") => {
    try {
      await updateItem({
        itemId: item._id,
        priority,
      });
      toast.success("Priority updated");
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const handleToggleCompletion = async () => {
    try {
      await toggleCompletion({ itemId: item._id });
    } catch {
      toast.error("Failed to toggle completion");
    }
  };

  const handleTagRemove = async (tagToRemove: string) => {
    const newTags = item.tags.filter((tag) => tag !== tagToRemove);
    try {
      await updateItem({
        itemId: item._id,
        tags: newTags,
      });
      toast.success("Tag removed");
    } catch {
      toast.error("Failed to remove tag");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-2 py-1 rounded-md transition-colors",
        isHovered && "border border-border bg-accent/50",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row items-center gap-2">
        <Checkbox
          checked={item.isCompleted}
          onCheckedChange={handleToggleCompletion}
        />
        {isHovered ? (
          <Select value={item.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-6 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">low</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="high">high</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">{item.priority}</Badge>
        )}
        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTitleSubmit();
              }
              if (e.key === "Escape") {
                setIsEditingTitle(false);
              }
            }}
            className="h-6 flex-1"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            className={cn(
              "flex-1 cursor-pointer",
              item.isCompleted && "line-through text-muted-foreground",
            )}
            onDoubleClick={startEditingTitle}
          >
            {item.title}
          </p>
        )}
        {item.tags.map((tag) => (
          <Badge
            variant="outline"
            key={tag}
            className={cn(
              "cursor-pointer",
              isHovered && "hover:bg-destructive/10",
            )}
            onClick={() => isHovered && handleTagRemove(tag)}
          >
            {tag} {isHovered && "×"}
          </Badge>
        ))}
      </div>
      {isHovered && item.description && (
        <div className="flex flex-row items-center gap-2">
          {isEditingDescription ? (
            <Input
              ref={descriptionInputRef}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleDescriptionSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleDescriptionSubmit();
                }
                if (e.key === "Escape") {
                  setIsEditingDescription(false);
                }
              }}
              className="text-xs h-6"
              placeholder="Description"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p
              className="text-xs text-muted-foreground cursor-pointer flex-1"
              onDoubleClick={startEditingDescription}
            >
              {item.description}
            </p>
          )}
        </div>
      )}
      {isHovered && !item.description && (
        <div className="flex flex-row items-center gap-2">
          <Input
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmedValue = editedDescription.trim();
                if (trimmedValue !== "") {
                  try {
                    await updateItem({
                      itemId: item._id,
                      description: trimmedValue,
                    });
                    toast.success("Description added");
                    setEditedDescription("");
                  } catch {
                    toast.error("Failed to add description");
                  }
                }
              }
            }}
            className="border-none bg-transparent text-xs h-6"
            placeholder="Add a description (Press Enter)"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

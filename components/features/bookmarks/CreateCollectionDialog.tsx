"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";

export const CreateCollectionDialog = ({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    name: string,
    description?: string,
  ) => Promise<Id<"bookmarkCollections">>;
}) => {
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setCollectionName("");
      setCollectionDescription("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!collectionName.trim()) return;
    setIsCreating(true);
    try {
      await onCreate(
        collectionName.trim(),
        collectionDescription.trim() || undefined,
      );
      setCollectionName("");
      setCollectionDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your bookmarks
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Collection Name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && collectionName.trim()) {
                handleCreate();
              }
            }}
          />
          <Textarea
            placeholder="Description (optional)"
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <Button
            onClick={handleCreate}
            disabled={isCreating || !collectionName.trim()}
          >
            {isCreating ? (
              <>
                <Spinner /> <span>Creating...</span>
              </>
            ) : (
              "Create Collection"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export const CreateListModel = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createList = useMutation(api.listFunctions.createList);

  const handleCreateList = async () => {
    setIsLoading(true);
    await createList({ title, description });
    setIsLoading(false);
    setTitle("");
    setDescription("");
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>
            Create a new list to get started
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="List Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="List Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            onClick={handleCreateList}
            disabled={isLoading || title.length === 0}
          >
            {isLoading ? (
              <>
                <Spinner /> <span>Creating List...</span>
              </>
            ) : (
              "Create List"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

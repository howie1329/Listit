import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export const CreateItemModal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const createItem = useMutation(api.items.mutations.createSingleItem);

  const handleCreateSingleItem = async () => {
    setIsLoading(true);
    try {
      await createItem({ title, description });
      setTitle("");
      setDescription("");
      setOpen(false);
      toast.success("Item created successfully");
    } catch (error) {
      toast.error("Failed to create item");
      console.error("Failed to create item:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} className="mt-4">
          <HugeiconsIcon icon={PlusSignIcon} />
          Create Your First Item
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
          <DialogDescription>
            Create a new item to get started
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Item Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Item Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            onClick={handleCreateSingleItem}
            disabled={isLoading || title.length === 0}
          >
            {isLoading ? (
              <>
                <Spinner /> <span>Creating Item...</span>
              </>
            ) : (
              "Create Item"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

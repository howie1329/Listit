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

export const CreateListModel = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Create List</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>
            Create a new list to get started
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input placeholder="List Title" />
          <Textarea placeholder="List Description" />
          <Button>Create List</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  DeleteIcon,
  MoreHorizontalIcon,
  PencilIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export default function ListPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <ListPageContent />
    </div>
  );
}

export const ListPageContent = () => {
  const lists = useQuery(api.listFunctions.getLists);

  if (lists?.length === 0) {
    return (
      <div className="flex flex-col w-full h-full">
        <p>No lists found</p>
      </div>
    );
  }

  if (!lists) {
    return (
      <div className="flex flex-col w-full h-full">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full h-full gap-2 p-4">
      {lists.map((list) => (
        <ListCard key={list._id} list={list} />
      ))}
    </div>
  );
};

const ListCard = ({ list }: { list: Doc<"list"> }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-card border h-fit max-h-94 overflow-y-auto p-2"
    >
      <CollapsibleTrigger asChild className="flex items-center w-full">
        <div className="flex flex-col items-start justify-start gap-0">
          <div className="flex items-center justify-between gap-2 w-full">
            <p className="text-sm font-medium line-clamp-1">{list.title}</p>
            <ListOptionsDropdown list={list} />
          </div>
          <div className="flex items-center justify-between gap-2 w-full">
            <p className="text-xs text-muted-foreground line-clamp-1">
              {list.description}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {new Date(list._creationTime).toLocaleString()}
            </p>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 ">
          <p>{list.description}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const ListEditModal = ({
  list,
  editOpen,
  setEditOpen,
}: {
  list: Doc<"list">;
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description);
  const updateList = useMutation(api.listFunctions.updateList);

  const handleUpdateList = async () => {
    await updateList({
      listId: list._id,
      title,
      description,
      isCompleted: list.isCompleted,
      isDeleted: list.isDeleted,
      isArchived: list.isArchived,
      isPinned: list.isPinned,
      isPublic: list.isPublic,
    });
    setEditOpen(false);
  };
  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleUpdateList}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};

const ListOptionsDropdown = ({ list }: { list: Doc<"list"> }) => {
  const [editOpen, setEditOpen] = useState(false);
  const softDeleteList = useMutation(api.listFunctions.softDeleteList);

  const handleSoftDelete = async () => {
    await softDeleteList({ listId: list._id });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <HugeiconsIcon icon={MoreHorizontalIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setEditOpen(true)}>
          <HugeiconsIcon icon={PencilIcon} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSoftDelete}>
          <HugeiconsIcon icon={DeleteIcon} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ListEditModal
        list={list}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
      />
    </DropdownMenu>
  );
};

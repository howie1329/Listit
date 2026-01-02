"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full h-full gap-4 p-4">
      {lists.map((list) => (
        <ListCard key={list._id} list={list} />
      ))}
    </div>
  );
};

const ListCard = ({ list }: { list: Doc<"list"> }) => {
  return (
    <Card className=" h-fit">
      <CardHeader className="flex flex-col justify-center h-16">
        <CardTitle>{list.title}</CardTitle>
        <CardDescription>{list.description}</CardDescription>
        <CardFooter>
          <div className="flex items-center gap-2">
            <p>{new Date(list._creationTime).toLocaleString()}</p>
          </div>
          <Button variant="outline">View List</Button>
        </CardFooter>
      </CardHeader>
    </Card>
  );
};

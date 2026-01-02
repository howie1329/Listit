"use client";

import {
  Card,
  CardDescription,
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
    <div className="flex flex-col w-full h-full">
      {lists.map((list) => (
        <ListCard key={list._id} list={list} />
      ))}
    </div>
  );
};

const ListCard = ({ list }: { list: Doc<"list"> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{list.title}</CardTitle>
        <CardDescription>{list.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

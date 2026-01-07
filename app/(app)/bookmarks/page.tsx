"use client";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function BookmarkPage() {
  const bookmarks = useQuery(api.bookmarks.bookmarkFunctions.getBookmarks, {});
  const searchBookmarks = useQuery(
    api.bookmarks.bookmarkFunctions.searchBookmarks,
    {
      searchQuery: "",
    },
  );
  return (
    <div className="flex flex-col w-full h-full">
      BookmarkPage
      <Input placeholder="Search Bookmarks" className="w-full" />
    </div>
  );
}

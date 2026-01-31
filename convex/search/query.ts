import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";

// Search across all items, bookmarks, and lists

type SearchItemData = Doc<"items">

type SearchBookmarkData = Doc<"bookmarks">

type ItemSearchResult = {
    type: "item";
    id: Id<"items">;
    title: string;
    description?: string;
    tags: string[];
    priority?: "low" | "medium" | "high";
    focusState?: "today" | "back_burner";
    isCompleted?: boolean;
    isDeleted?: boolean;
    isArchived?: boolean;
};

type BookmarkSearchResult = {
    type: "bookmark";
    id: Id<"bookmarks">;
    title: string;
    description?: string;
    url: string;
    tags: string[];
};

type SearchResult = ItemSearchResult | BookmarkSearchResult




export const searchItems = query({
    args: {
        query: v.string(),
    },
    returns: v.array(v.union(
        v.object({
            type: v.literal("item"),
            id: v.id("items"),
            title: v.string(),
            description: v.optional(v.string()),
            tags: v.array(v.string()),
            priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
            focusState: v.optional(v.union(v.literal("today"), v.literal("back_burner"))),
            isCompleted: v.optional(v.boolean()),
            isDeleted: v.optional(v.boolean()),
            isArchived: v.optional(v.boolean()),
        }),
        v.object({
            type: v.literal("bookmark"),
            id: v.id("bookmarks"),
            title: v.string(),
            description: v.optional(v.string()),
            url: v.string(),
            tags: v.array(v.string()),
        })
    )),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User not found");
        }

        const [items, bookmarks] = await Promise.all([
            ctx.db.query("items").withSearchIndex("search_items", (q) => q.search("title", args.query).eq("userId", userId)).collect(),
            ctx.db.query("bookmarks").withSearchIndex("search_bookmarks", (q) => q.search("title", args.query).eq("userId", userId)).collect(),
        ]);
        const results: SearchResult[] = [
            ...items.map((item) => ({
                type: "item" as const,
                id: item._id,
                title: item.title,
                description: item.description,
                tags: item.tags,
                priority: item.priority,
                focusState: item.focusState,
                isCompleted: item.isCompleted,
                isDeleted: item.isDeleted,
                isArchived: item.isArchived,
            })),
            ...bookmarks.map((bookmark) => ({
                type: "bookmark" as const,
                id: bookmark._id,
                title: bookmark.title,
                description: bookmark.description,
                url: bookmark.url,
                tags: bookmark.tags,
            })),
        ];
        return results;
    }
})
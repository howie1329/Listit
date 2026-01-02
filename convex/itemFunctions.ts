import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: {
    listId: v.id("list"),
  },
  returns: v.array(
    v.object({
      _id: v.id("items"),
      listId: v.id("list"),
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      _creationTime: v.number(),
      updatedAt: v.string(),
      isCompleted: v.boolean(),
      isDeleted: v.boolean(),
      isArchived: v.boolean(),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .collect();
    return items;
  },
});

export const createItem = mutation({
  args: {
    listId: v.id("list"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("items", {
      listId: args.listId,
      userId: userId,
      title: args.title,
      description: args.description ?? "",
      updatedAt: new Date().toISOString(),
      isCompleted: false,
      isDeleted: false,
      isArchived: false,
      priority: "low",
    });
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    title: v.string(),
    description: v.optional(v.string()),
    isCompleted: v.boolean(),
    isDeleted: v.boolean(),
    isArchived: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("You are not authorized to update this item");
    }
    return await ctx.db.patch(args.itemId, {
      title: args.title,
      description: args.description ?? "",
      updatedAt: new Date().toISOString(),
      isCompleted: args.isCompleted,
      isDeleted: args.isDeleted,
      isArchived: args.isArchived,
      priority: args.priority,
    });
  },
});

export const toogleItemCompletion = mutation({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("You are not authorized to update this item");
    }
    return await ctx.db.patch(args.itemId, {
      isCompleted: !item.isCompleted,
      updatedAt: new Date().toISOString(),
    });
  },
});

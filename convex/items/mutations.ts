import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Create a single item
export const createSingleItem = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    focusState: v.optional(
      v.union(v.literal("today"), v.literal("back_burner")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("items", {
      userId: userId,
      title: args.title,
      description: args.description ?? "",
      updatedAt: new Date().toISOString(),
      isCompleted: false,
      isDeleted: false,
      isArchived: false,
      priority: args.priority ?? "medium",
      tags: args.tags ?? [],
      notes: args.notes ?? "",
      focusState: args.focusState ?? "today",
    });
  },
});

// Delete a single item
export const deleteSingleItem = mutation({
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
      throw new Error("You are not authorized to delete this item");
    }
    return await ctx.db.patch(args.itemId, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Update an existing item
export const updateSingleItem = mutation({
  args: {
    itemId: v.id("items"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    focusState: v.optional(
      v.union(v.literal("today"), v.literal("back_burner")),
    ),
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
      title: args.title ?? item.title,
      description: args.description ?? item.description,
      updatedAt: new Date().toISOString(),
      isCompleted: args.isCompleted ?? item.isCompleted,
      isDeleted: args.isDeleted ?? item.isDeleted,
      isArchived: args.isArchived ?? item.isArchived,
      priority: args.priority ?? item.priority,
      tags: args.tags ?? item.tags,
      notes: args.notes ?? item.notes,
      focusState: args.focusState ?? item.focusState,
    });
  },
});

// Toggle the completion status of an item
export const toogleSingleItemCompletion = mutation({
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

// Create multiple items
export const createMultipleItems = mutation({
  args: {
    items: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    for (const item of args.items) {
      await ctx.db.insert("items", {
        userId: userId,
        title: item.title,
        description: item.description ?? "",
        updatedAt: new Date().toISOString(),
        isCompleted: false,
        isDeleted: false,
        isArchived: false,
        priority: "low",
        tags: item.tags ?? [],
        focusState: "back_burner",
      });
    }
  },
});

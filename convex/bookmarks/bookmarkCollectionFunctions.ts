import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getCollections = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("bookmarkCollections"),
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      _creationTime: v.number(),
      updatedAt: v.string(),
      isDeleted: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const collections = await ctx.db
      .query("bookmarkCollections")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
    return collections;
  },
});

export const getCollection = query({
  args: {
    collectionId: v.id("bookmarkCollections"),
  },
  returns: v.union(
    v.object({
      _id: v.id("bookmarkCollections"),
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      _creationTime: v.number(),
      updatedAt: v.string(),
      isDeleted: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== userId) {
      return null;
    }
    return collection;
  },
});

export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("bookmarkCollections", {
      userId: userId,
      name: args.name,
      description: args.description,
      color: args.color,
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    });
  },
});

export const updateCollection = mutation({
  args: {
    collectionId: v.id("bookmarkCollections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== userId) {
      throw new Error("You are not authorized to update this collection");
    }
    const updateData: {
      updatedAt: string;
      name?: string;
      description?: string;
      color?: string;
    } = {
      updatedAt: new Date().toISOString(),
    };
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.color !== undefined) updateData.color = args.color;
    return await ctx.db.patch(args.collectionId, updateData);
  },
});

export const deleteCollection = mutation({
  args: {
    collectionId: v.id("bookmarkCollections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== userId) {
      throw new Error("You are not authorized to delete this collection");
    }
    return await ctx.db.patch(args.collectionId, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const hardDeleteCollection = mutation({
  args: {
    collectionId: v.id("bookmarkCollections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== userId) {
      throw new Error("You are not authorized to delete this collection");
    }
    if (!collection) {
      throw new Error("Collection not found");
    }
    await ctx.db.delete(args.collectionId);
  },
});

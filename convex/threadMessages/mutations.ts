import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const addThreadMessage = mutation({
  args: {
    threadId: v.id("thread"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("threadMessage", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateThreadMessage = mutation({
  args: {
    threadMessageId: v.id("threadMessage"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.threadMessageId, {
      content: args.content,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteThreadMessage = mutation({
  args: {
    threadMessageId: v.id("threadMessage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.threadMessageId);
    return true;
  },
});

export const deleteThreadMessages = mutation({
  args: {
    threadId: v.id("thread"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("threadMessage")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    return true;
  },
});

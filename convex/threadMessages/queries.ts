import { query } from "../_generated/server";
import { v } from "convex/values";

export const getThreadMessages = query({
  args: {
    threadId: v.id("thread"),
  },
  returns: v.array(
    v.object({
      _id: v.id("threadMessage"),
      threadId: v.id("thread"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      _creationTime: v.number(),
      content: v.string(),
      updatedAt: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("threadMessage")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    return messages;
  },
});

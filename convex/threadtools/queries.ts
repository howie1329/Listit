import { v } from "convex/values";
import { query } from "../_generated/server";

export const getThreadTools = query({
  args: {
    threadId: v.id("thread"),
  },
  returns: v.array(
    v.object({
      _id: v.id("threadTools"),
      threadId: v.id("thread"),
      threadMessageId: v.id("threadMessage"),
      toolName: v.string(),
      toolOutput: v.string(),
      status: v.union(
        v.literal("running"),
        v.literal("completed"),
        v.literal("error"),
      ),
      errorMessage: v.optional(v.string()),
      updatedAt: v.string(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const threadTools = await ctx.db
      .query("threadTools")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();
    return threadTools;
  },
});

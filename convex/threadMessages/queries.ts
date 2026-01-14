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
      threadTools: v.optional(
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
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("threadMessage")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    const threadTools = await ctx.db
      .query("threadTools")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    const timeline = messages.map((message) => {
      const threadTool = threadTools.find(
        (tool) => tool.threadMessageId === message._id,
      );
      return {
        ...message,
        threadTools: threadTool,
      };
    });

    console.log("Timeline", timeline);
    return timeline;
  },
});

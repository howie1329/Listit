import { query } from "../_generated/server";
import { v } from "convex/values";

export const getMastraThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("mastra_messages"),
      content: v.string(),
      createdAt: v.string(),
      id: v.string(),
      resourceId: v.optional(v.string()),
      role: v.string(),
      thread_id: v.string(),
      type: v.string(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("mastra_messages")
      .withIndex("by_thread", (q) => q.eq("thread_id", args.threadId))
      .collect();
    return messages.map((message) => ({
      _id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      id: message.id,
      resourceId: message.resourceId,
      role: message.role,
      thread_id: message.thread_id,
      type: message.type,
      _creationTime: message._creationTime,
    }));
  },
});

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

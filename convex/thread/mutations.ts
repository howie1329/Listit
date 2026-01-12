import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createThread = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("thread", {
      userId: userId,
      title: args.title,
      streamingStatus: "idle",
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateThreadStreamingStatus = mutation({
  args: {
    threadId: v.id("thread"),
    streamingStatus: v.union(
      v.literal("idle"),
      v.literal("streaming"),
      v.literal("error"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, {
      streamingStatus: args.streamingStatus,
    });
  },
});

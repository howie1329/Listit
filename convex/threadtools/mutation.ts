import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addThreadTool = mutation({
  args: {
    threadId: v.id("thread"),
    threadMessageId: v.id("threadMessage"),
    toolName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("threadTools", {
      threadId: args.threadId,
      threadMessageId: args.threadMessageId,
      toolName: args.toolName,
      toolOutput: "",
      status: "running",
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateThreadTool = mutation({
  args: {
    threadToolId: v.id("threadTools"),
    toolOutput: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Updating thread tool: ", args);
    console.log("Thread Tool ID: ", args.threadToolId);
    console.log("Tool Output: ", args.toolOutput);
    console.log("Status: ", args.status);
    console.log("Error Message: ", args.errorMessage);

    const updatedThreadTool = await ctx.db.patch(args.threadToolId, {
      toolOutput: args.toolOutput,
      status: args.status,
      errorMessage: args.errorMessage,
      updatedAt: new Date().toISOString(),
    });

    console.log("Updated Thread Tool: ", updatedThreadTool);
    return updatedThreadTool;
  },
});

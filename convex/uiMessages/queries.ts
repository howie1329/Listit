import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUIMessages = query({
  args: {
    threadId: v.id("thread"),
  },
  returns: v.array(
    v.object({
      _id: v.id("uiMessages"),
      threadId: v.id("thread"),
      id: v.string(),
      role: v.union(
        v.literal("system"),
        v.literal("user"),
        v.literal("assistant"),
      ),
      metadata: v.optional(v.any()),
      parts: v.array(
        v.union(
          v.object({
            type: v.literal("step-start"),
          }),
          v.object({
            type: v.literal("text"),
            text: v.string(),
            state: v.optional(
              v.union(v.literal("streaming"), v.literal("done")),
            ),
          }),
          v.object({
            type: v.literal("reasoning"),
            text: v.string(),
            state: v.optional(
              v.union(v.literal("streaming"), v.literal("done")),
            ),
            providerMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.string(),
            toolCallId: v.string(),
            state: v.literal("input-streaming"),
            input: v.optional(v.any()),
            providerExecuted: v.optional(v.boolean()),
            callProviderMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.string(),
            toolCallId: v.string(),
            state: v.literal("input-available"),
            input: v.any(),
            providerExecuted: v.optional(v.boolean()),
            callProviderMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.string(),
            toolCallId: v.string(),
            state: v.literal("output-available"),
            input: v.any(),
            output: v.any(),
            providerExecuted: v.optional(v.boolean()),
            callProviderMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.string(),
            toolCallId: v.string(),
            state: v.literal("output-error"),
            input: v.any(),
            errorText: v.string(),
            providerExecuted: v.optional(v.boolean()),
            callProviderMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.string(),
            id: v.optional(v.string()),
            data: v.any(),
          }),
          v.object({
            type: v.literal("source-url"),
            sourceId: v.string(),
            url: v.string(),
            title: v.optional(v.string()),
            providerMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.literal("source-document"),
            sourceId: v.string(),
            mediaType: v.string(),
            title: v.string(),
            filename: v.optional(v.string()),
            providerMetadata: v.optional(v.any()),
          }),
          v.object({
            type: v.literal("file"),
            mediaType: v.string(),
            filename: v.optional(v.string()),
            url: v.string(),
          }),
        ),
      ),
      updatedAt: v.string(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const uiMessages = await ctx.db
      .query("uiMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();
    return uiMessages.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );
  },
});

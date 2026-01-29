import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const addUIMessage = mutation({
  args: {
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
          state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
        }),
        v.object({
          type: v.literal("reasoning"),
          text: v.string(),
          state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("uiMessages", {
      threadId: args.threadId,
      id: args.id,
      role: args.role,
      metadata: args.metadata,
      parts: args.parts,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Reuse the parts schema for updateUIMessage
const partsSchema = v.array(
  v.union(
    v.object({
      type: v.literal("step-start"),
    }),
    v.object({
      type: v.literal("text"),
      text: v.string(),
      state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
    }),
    v.object({
      type: v.literal("reasoning"),
      text: v.string(),
      state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
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
);

export const updateUIMessage = mutation({
  args: {
    threadId: v.id("thread"),
    id: v.string(), // AI SDK message id
    parts: v.optional(partsSchema),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Find the message by threadId and id (string ID from AI SDK)
    const message = await ctx.db
      .query("uiMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!message) {
      throw new Error(
        `UIMessage with id ${args.id} not found in thread ${args.threadId}`,
      );
    }

    // Update only the fields that are provided
    const updates: {
      parts?: typeof args.parts;
      metadata?: typeof args.metadata;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (args.parts !== undefined) {
      updates.parts = args.parts;
    }
    if (args.metadata !== undefined) {
      updates.metadata = args.metadata;
    }

    return await ctx.db.patch(message._id, updates);
  },
});

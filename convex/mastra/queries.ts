import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Helper to parse stored Mastra message content.
 * Content is stored as JSON string and needs to be parsed.
 */
function parseMessageContent(content: unknown): unknown {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      // If parsing fails, return as-is (might already be an object or plain text)
      return content;
    }
  }
  return content;
}

/**
 * Convert stored Mastra message to MastraDBMessage format.
 * This handles the parsing of stored content and date conversion.
 */
function convertStoredMessage(storedMessage: Record<string, unknown>): Record<string, unknown> {
  const content = parseMessageContent(storedMessage.content);
  
  return {
    id: storedMessage.id,
    role: storedMessage.role,
    content: content,
    createdAt: storedMessage.createdAt 
      ? new Date(storedMessage.createdAt as string)
      : new Date(),
    threadId: storedMessage.thread_id,
    resourceId: storedMessage.resourceId,
    type: storedMessage.type,
  };
}

/**
 * Get all messages for a specific Mastra thread.
 * Use this when reading messages stored via Mastra's memory system.
 *
 * Mastra message schema in storage:
 * - id: string (primary key)
 * - thread_id: string (note: underscore naming)
 * - content: string (JSON stringified MastraMessageContentV2)
 * - role: string (user/assistant/system)
 * - type: string (message type)
 * - createdAt: string (ISO timestamp)
 * - resourceId: string (user identifier)
 *
 * Returns messages in MastraDBMessage format compatible with toAISdkV5Messages.
 */
export const getMastraThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    // Note: Mastra uses snake_case "thread_id", not camelCase
    const messages = await ctx.db
      .query("mastra_messages")
      .withIndex("by_thread", (q) => q.eq("thread_id", args.threadId))
      .collect();

    // Sort by creation time ascending (oldest first)
    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.createdAt as string).getTime() -
        new Date(b.createdAt as string).getTime(),
    );

    // Convert to MastraDBMessage format
    return sortedMessages.map(convertStoredMessage);
  },
});

/**
 * Get raw messages without parsing - useful for debugging.
 */
export const getMastraThreadMessagesRaw = query({
  args: {
    threadId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("mastra_messages")
      .withIndex("by_thread", (q) => q.eq("thread_id", args.threadId))
      .collect();

    return messages.sort(
      (a, b) =>
        new Date(a.createdAt as string).getTime() -
        new Date(b.createdAt as string).getTime(),
    );
  },
});

/**
 * Get all Mastra threads for a specific resource (user).
 * The resourceId is typically the user ID passed to memory.resource.
 */
export const getMastraThreads = query({
  args: {
    resourceId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("mastra_threads")
      .filter((q) => q.eq(q.field("resourceId"), args.resourceId))
      .collect();

    // Sort by update time descending (most recent first)
    return threads.sort(
      (a, b) =>
        new Date(b.updatedAt as string).getTime() -
        new Date(a.updatedAt as string).getTime(),
    );
  },
});

/**
 * Get a single Mastra thread by ID.
 */
export const getMastraThread = query({
  args: {
    threadId: v.string(),
  },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("mastra_threads")
      .filter((q) => q.eq(q.field("id"), args.threadId))
      .first();

    return thread ?? null;
  },
});

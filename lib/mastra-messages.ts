import type {
  MastraDBMessage,
  MastraMessageContentV2,
} from "@mastra/core/agent";

/**
 * Type for what Convex returns from mastra_messages query
 */
export interface ConvexMastraMessage {
  _id: string;
  id: string;
  role: string;
  createdAt: string;
  thread_id: string;
  resourceId?: string;
  type: string;
  content: string;
  _creationTime: number;
}

/**
 * Recursively unwraps nested stringified JSON content.
 * Handles cases where content was double/triple encoded.
 * Preserves all part types including custom data-* and tool-* parts.
 */
function parseAndUnwrapContent(contentString: string): {
  format: 2;
  parts: Array<{ type: string; [key: string]: unknown }>;
  reasoning?: unknown;
  toolInvocations?: unknown;
  experimental_attachments?: unknown;
  content?: string;
  metadata?: Record<string, unknown>;
  providerMetadata?: unknown;
  annotations?: unknown;
  [key: string]: unknown;
} {
  try {
    let parsed = JSON.parse(contentString);

    // Keep unwrapping while we detect nested format:2 structures
    // Only unwrap if we have a single text part (indicating corruption)
    while (parsed.format === 2) {
      // Check if we have a single text part that contains stringified JSON
      if (
        parsed.parts?.length === 1 &&
        parsed.parts[0].type === "text" &&
        typeof parsed.parts[0].text === "string"
      ) {
        try {
          const inner = JSON.parse(parsed.parts[0].text);
          // If inner is also a format:2 structure, unwrap it
          if (inner.format === 2 && inner.parts) {
            parsed = inner;
            continue; // Keep unwrapping
          }
        } catch {
          // Inner text is not JSON, stop unwrapping
          break;
        }
      }

      // If we get here, the structure is valid (not nested)
      // This means we have multiple parts, or non-text parts, or properly formatted content
      break;
    }

    // Ensure we have the required structure
    if (!parsed.format || parsed.format !== 2) {
      return { format: 2, parts: [{ type: "text", text: contentString }] };
    }

    if (!Array.isArray(parsed.parts)) {
      parsed.parts = [{ type: "text", text: contentString }];
    }

    // Return with all parts preserved (text, reasoning, tool-invocation, data-*, tool-*, etc.)
    return parsed;
  } catch {
    // If parsing fails entirely, return as plain text structure
    return { format: 2, parts: [{ type: "text", text: contentString }] };
  }
}

/**
 * Transforms Convex mastra_messages query results into MastraDBMessage format.
 * Preserves all part types including reasoning, tool-invocation, custom data-*, etc.
 *
 * @param convexMessages - Array of messages from Convex query
 * @returns Array of MastraDBMessage objects ready for toAISdkV5Messages()
 *
 * @example
 * ```typescript
 * const convexMessages = await ctx.db.query("mastra_messages")...;
 * const mastraMessages = convexToMastraDBMessages(convexMessages);
 * const uiMessages = toAISdkV5Messages(mastraMessages);
 * ```
 */
export function convexToMastraDBMessages(
  convexMessages: ConvexMastraMessage[],
): MastraDBMessage[] {
  return convexMessages.map((msg) => {
    // Parse and unwrap the content - this returns a loosely typed object
    const parsedContent = parseAndUnwrapContent(msg.content);

    // Cast to MastraMessageContentV2 since we're parsing from JSON
    // The parsed content structure matches the expected format
    const content = parsedContent as unknown as MastraMessageContentV2;

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      createdAt: new Date(msg.createdAt),
      threadId: msg.thread_id,
      resourceId: msg.resourceId,
      type: msg.type,
      content,
    };
  });
}

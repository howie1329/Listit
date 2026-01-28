import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defaultModelValidator } from "./lib/modelMapping";
import {
  mastraThreadsTable,
  mastraMessagesTable,
  mastraResourcesTable,
  mastraWorkflowSnapshotsTable,
  mastraScoresTable,
  mastraVectorIndexesTable,
  mastraVectorsTable,
  mastraDocumentsTable,
} from "@mastra/convex/schema";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  mastra_threads: mastraThreadsTable,
  mastra_messages: mastraMessagesTable,
  mastra_resources: mastraResourcesTable,
  mastra_scorers: mastraScoresTable,
  mastra_vector_indexes: mastraVectorIndexesTable,
  mastra_vectors: mastraVectorsTable,
  mastra_documents: mastraDocumentsTable,
  mastra_workflow_snapshots: defineTable({
    id: v.string(),
    workflow_name: v.string(),
    run_id: v.string(),
    resourceId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    snapshot: v.any(),
  })
    .index("by_record_id", ["id"])
    .index("by_workflow_run", ["workflow_name", "run_id"])
    .index("by_workflow", ["workflow_name"])
    .index("by_resource", ["resourceId"])
    .index("by_created", ["createdAt"]),
  // Matches Vercel AI SDK UIMessage structure: https://v5.ai-sdk.dev/docs/reference/ai-sdk-core/ui-message#uimessage
  workingMemory: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    preferences: v.optional(v.string()),
    location: v.optional(v.string()),
    interests: v.optional(v.string()),
    tendencies: v.optional(v.string()),
    notes: v.optional(v.string()),
    extra: v.optional(v.any()),
  }).index("by_userId", ["userId"]),
  uiMessages: defineTable({
    threadId: v.id("thread"),
    id: v.string(), // Unique identifier for the message (as per AI SDK spec)
    role: v.union(
      v.literal("system"),
      v.literal("user"),
      v.literal("assistant"),
    ),
    metadata: v.optional(v.any()), // Custom metadata (AI SDK uses 'metadata', not 'metaData')
    parts: v.array(
      v.union(
        // StepStartUIPart - no fields except type
        v.object({
          type: v.literal("step-start"),
        }),
        // TextUIPart - text is required
        v.object({
          type: v.literal("text"),
          text: v.string(),
          state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
        }),
        // ReasoningUIPart - text is required
        v.object({
          type: v.literal("reasoning"),
          text: v.string(),
          state: v.optional(v.union(v.literal("streaming"), v.literal("done"))),
          providerMetadata: v.optional(v.any()),
        }),
        // ToolUIPart - input-streaming state
        v.object({
          type: v.string(), // Will be "tool-{toolName}" dynamically (e.g., "tool-weather")
          toolCallId: v.string(),
          state: v.literal("input-streaming"),
          input: v.optional(v.any()), // DeepPartial<TOOLS[NAME]['input']> | undefined
          providerExecuted: v.optional(v.boolean()),
          callProviderMetadata: v.optional(v.any()),
        }),
        // ToolUIPart - input-available state
        v.object({
          type: v.string(), // Will be "tool-{toolName}" dynamically
          toolCallId: v.string(),
          state: v.literal("input-available"),
          input: v.any(), // TOOLS[NAME]['input']
          providerExecuted: v.optional(v.boolean()),
          callProviderMetadata: v.optional(v.any()),
        }),
        // ToolUIPart - output-available state
        v.object({
          type: v.string(), // Will be "tool-{toolName}" dynamically
          toolCallId: v.string(),
          state: v.literal("output-available"),
          input: v.any(), // TOOLS[NAME]['input']
          output: v.any(), // TOOLS[NAME]['output']
          providerExecuted: v.optional(v.boolean()),
          callProviderMetadata: v.optional(v.any()),
        }),
        // ToolUIPart - output-error state
        v.object({
          type: v.string(), // Will be "tool-{toolName}" dynamically
          toolCallId: v.string(),
          state: v.literal("output-error"),
          input: v.any(), // TOOLS[NAME]['input']
          errorText: v.string(),
          providerExecuted: v.optional(v.boolean()),
          callProviderMetadata: v.optional(v.any()),
        }),
        // DataUIPart - for custom data types (e.g., "data-weather-tool")
        v.object({
          type: v.string(), // Will be "data-{dataTypeName}" dynamically
          id: v.optional(v.string()),
          data: v.any(), // DATA_TYPES[NAME]
        }),
        // SourceUrlUIPart
        v.object({
          type: v.literal("source-url"),
          sourceId: v.string(),
          url: v.string(),
          title: v.optional(v.string()),
          providerMetadata: v.optional(v.any()),
        }),
        // SourceDocumentUIPart
        v.object({
          type: v.literal("source-document"),
          sourceId: v.string(),
          mediaType: v.string(),
          title: v.string(),
          filename: v.optional(v.string()),
          providerMetadata: v.optional(v.any()),
        }),
        // FileUIPart
        v.object({
          type: v.literal("file"),
          mediaType: v.string(),
          filename: v.optional(v.string()),
          url: v.string(),
        }),
      ),
    ),
    updatedAt: v.string(),
  }).index("by_threadId", ["threadId"]),
  threadTools: defineTable({
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
  })
    .index("by_threadId", ["threadId"])
    .index("by_threadMessageId", ["threadMessageId"]),
  thread: defineTable({
    userId: v.id("users"),
    title: v.string(),
    streamingStatus: v.union(
      v.literal("idle"),
      v.literal("streaming"),
      v.literal("error"),
    ),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
  threadMessage: defineTable({
    threadId: v.id("thread"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    updatedAt: v.string(),
  }).index("by_threadId", ["threadId"]),
  items: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.string(), // UTC string
    isCompleted: v.boolean(),
    isDeleted: v.boolean(),
    isArchived: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    focusState: v.union(v.literal("today"), v.literal("back_burner")),
  }).index("by_userId", ["userId"]),
  userSettings: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    profilePicture: v.optional(v.string()),
    defaultModel: defaultModelValidator(),
    updatedAt: v.string(), // UTC string
    isAiEnabled: v.boolean(),
    onboardingCompleted: v.boolean(),
  }).index("by_userId", ["userId"]),
  bookmarks: defineTable({
    userId: v.id("users"),
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    favicon: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    screenshot: v.optional(v.string()),
    summary: v.optional(v.string()),
    extractedContent: v.optional(v.string()),
    tags: v.array(v.string()),
    collectionId: v.optional(v.id("bookmarkCollections")),
    isArchived: v.boolean(),
    isDeleted: v.boolean(),
    isPinned: v.boolean(),
    isRead: v.boolean(),
    isPublic: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
    readAt: v.optional(v.string()),
    readingTime: v.optional(v.number()),
    searchText: v.string(), // Composite field for full-text search
  })
    .index("by_userId", ["userId"])
    .index("by_userId_archived", ["userId", "isArchived"])
    .index("by_userId_deleted", ["userId", "isDeleted"])
    .index("by_url", ["url"])
    .searchIndex("search_bookmarks", {
      searchField: "searchText",
      filterFields: ["userId", "isDeleted", "isArchived"],
    }),

  bookmarkCollections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    updatedAt: v.string(),
    isDeleted: v.boolean(),
  }).index("by_userId", ["userId"]),
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defaultModelValidator } from "./lib/modelMapping";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  // TODO: Look into vercel ai sdk for message ui structure. We need to match the structure as closely as possible.
  // TODO: This then could combine threadTools and threadMessages into a single table
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

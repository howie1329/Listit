import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  thread: defineTable({
    userId: v.id("users"),
    title: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),
  threadMessage: defineTable({
    threadId: v.id("thread"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    updatedAt: v.string(),
  }).index("by_threadId", ["threadId"]),
  list: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    updatedAt: v.string(), // UTC string
    isCompleted: v.boolean(),
    isDeleted: v.boolean(),
    isArchived: v.boolean(),
    isPinned: v.boolean(),
    isPublic: v.boolean(),
  }).index("by_userId", ["userId"]),
  items: defineTable({
    listId: v.id("list"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.string(), // UTC string
    isCompleted: v.boolean(),
    isDeleted: v.boolean(),
    isArchived: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  })
    .index("by_listId", ["listId"])
    .index("by_listId_userId", ["listId", "userId"]),
  userSettings: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    profilePicture: v.optional(v.string()),
    theme: v.union(v.literal("light"), v.literal("dark")),
    defaultModel: v.union(v.literal("gpt-4o"), v.literal("gpt-4o-mini")),
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

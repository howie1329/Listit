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
});

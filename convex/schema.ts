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
    userId: v.id('users'),
    title: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isCompleted: v.boolean(),
    isDeleted: v.boolean(),
    isArchived: v.boolean(),
    isPinned: v.boolean(),
    isPublic: v.boolean()
  })
});
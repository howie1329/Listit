import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all items for a user
export const getUserItems = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("items"),
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      _creationTime: v.number(),
      updatedAt: v.string(),
      isCompleted: v.boolean(),
      isDeleted: v.boolean(),
      isArchived: v.boolean(),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
      ),
      tags: v.array(v.string()),
      notes: v.optional(v.string()),
      focusState: v.union(v.literal("today"), v.literal("back_burner")),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const items = await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return items;
  },
});

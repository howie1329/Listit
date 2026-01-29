import { query } from "../_generated/server";
import { v } from "convex/values";

export const getChatMemory = query({
    args: {
        userId: v.id("users"),
    },
    returns: v.union(
        v.object({
            _id: v.id("workingMemory"),
            userId: v.id("users"),
            name: v.optional(v.string()),
            age: v.optional(v.number()),
            preferences: v.optional(v.string()),
            location: v.optional(v.string()),
            interests: v.optional(v.string()),
            tendencies: v.optional(v.string()),
            extra: v.optional(v.any()),
            notes: v.optional(v.string()),
            _creationTime: v.number(),
        }),
        v.null(),
    ),
    handler: async (ctx, args) => {
        const memory = await ctx.db
            .query("workingMemory")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
        if (!memory) {
            return null;
        }
        return memory;
    },
});
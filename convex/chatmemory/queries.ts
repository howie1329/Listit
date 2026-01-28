import { query } from "../_generated/server";
import { v } from "convex/values";

export const getChatMemory = query({
    args: {
        userId: v.id("users"),
    },
    returns: v.any(),
    handler: async (ctx, args) => {
        const memory = await ctx.db.query("workingMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
        if (!memory) {
            return null;
        }
        return memory.data;
    },
});
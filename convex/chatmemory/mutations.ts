import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const setChatMemory = mutation({
    args: {
        userId: v.id("users"),
        data: v.any(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const memory = await ctx.db.query("workingMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
        if (!memory) {
            await ctx.db.insert("workingMemory", { userId: args.userId, data: args.data });
        } else {
            await ctx.db.patch(memory._id, { data: args.data });
        }
        return null;
    },
});
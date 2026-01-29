import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const setChatMemory = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        age: v.optional(v.number()),
        preferences: v.optional(v.string()),
        location: v.optional(v.string()),
        interests: v.optional(v.string()),
        tendencies: v.optional(v.string()),
        extra: v.optional(v.any()),
        notes: v.optional(v.string()),
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
        const memory = await ctx.db.query("workingMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
        if (!memory) {
            await ctx.db.insert("workingMemory", { userId: args.userId, name: args.name, age: args.age, preferences: args.preferences, location: args.location, interests: args.interests, tendencies: args.tendencies, extra: args.extra, notes: args.notes });
            const newMemory = await ctx.db.query("workingMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
            return newMemory;
        } else {
            await ctx.db.patch(memory._id, {
                name: args.name ?? memory.name,
                age: args.age ?? memory.age,
                preferences: args.preferences ?? memory.preferences,
                location: args.location ?? memory.location,
                interests: args.interests ?? memory.interests,
                tendencies: args.tendencies ?? memory.tendencies,
                extra: args.extra ?? memory.extra,
                notes: args.notes ?? memory.notes,
            });

            const updatedMemory = await ctx.db
                .query("workingMemory")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .unique();
            return updatedMemory;
        }
    },
});

export const ensureChatMemory = mutation({
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
        const memory = await ctx.db.query("workingMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
        if (!memory) {
            await ctx.db.insert("workingMemory", { userId: args.userId, name: "", age: 0, preferences: "", location: "", interests: "", tendencies: "", extra: {}, notes: "" });
            const newMemory = await ctx.db.query("workingMemory").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
            return newMemory;
        } else {
            return memory;
        }
    },
});
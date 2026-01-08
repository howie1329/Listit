import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createUserSettings = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    theme: v.union(v.literal("light"), v.literal("dark")),
    defaultModel: v.union(v.literal("gpt-4o"), v.literal("gpt-4o-mini")),
    isAiEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .first();

    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (userSettings) {
      return userSettings._id;
    }
    return await ctx.db.insert("userSettings", {
      userId: userId,
      name: args.name ?? "",
      email: user?.email ?? args.email ?? "",
      profilePicture: args.profilePicture ?? "",
      theme: args.theme ?? "dark",
      defaultModel: args.defaultModel ?? "gpt-4o",
      isAiEnabled: args.isAiEnabled ?? true,
      onboardingCompleted: false,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const fetchUserSettings = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("userSettings"),
      userId: v.id("users"),
      name: v.string(),
      email: v.string(),
      profilePicture: v.optional(v.string()),
      theme: v.union(v.literal("light"), v.literal("dark")),
      defaultModel: v.union(v.literal("gpt-4o"), v.literal("gpt-4o-mini")),
      isAiEnabled: v.boolean(),
      onboardingCompleted: v.boolean(),
      updatedAt: v.string(),
      _creationTime: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!userSettings) {
      return null;
    }
    return userSettings;
  },
});

export const updateUserSettings = mutation({
  args: {
    name: v.optional(v.string()),
    defaultModel: v.optional(
      v.union(v.literal("gpt-4o"), v.literal("gpt-4o-mini")),
    ),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    isAiEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!userSettings) {
      throw new Error("User settings not found");
    }
    return await ctx.db.patch(userSettings._id, {
      name: args.name ?? userSettings.name,
      defaultModel: args.defaultModel ?? userSettings.defaultModel,
      isAiEnabled: args.isAiEnabled ?? userSettings.isAiEnabled,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

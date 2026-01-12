import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { defaultModelValidator, DefaultModel } from "./lib/modelMapping";

export const createUserSettings = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    defaultModel: defaultModelValidator(),
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
      defaultModel: args.defaultModel ?? ("gpt-4o" as DefaultModel),
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
      defaultModel: defaultModelValidator(),
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
    email: v.optional(v.string()),
    defaultModel: v.optional(defaultModelValidator()),
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
      email: args.email ?? userSettings.email,
      defaultModel: args.defaultModel ?? userSettings.defaultModel,
      isAiEnabled: args.isAiEnabled ?? userSettings.isAiEnabled,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

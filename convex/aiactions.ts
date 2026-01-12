import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod/v3";
import { generateObject } from "ai";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Available fallback models for OpenRouter
 */
const FALLBACK_MODELS = [
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-oss-20b:free",
] as const;

/**
 * Maps user settings defaultModel to OpenRouter model identifier
 */
function mapModelToOpenRouter(
  defaultModel: "gpt-4o" | "gpt-4o-mini" | "openai/gpt-oss-20b:free",
): string {
  switch (defaultModel) {
    case "gpt-4o":
      return "openai/gpt-4o";
    case "gpt-4o-mini":
      return "openai/gpt-4o-mini";
    case "openai/gpt-oss-20b:free":
      return "openai/gpt-oss-20b:free"; // Already in OpenRouter format
    default:
      return "openai/gpt-4o"; // fallback
  }
}

type aiResult = {
  items: aiResultItems[];
};

type aiResultItems = {
  title: string;
  description: string;
};

export const generateList = action({
  args: {
    listId: v.id("list"),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<aiResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.runQuery(api.listFunctions.getList, {
      listId: args.listId,
      userId: args.userId,
    });
    console.log("Passed IN List", list);
    if (!list) {
      throw new Error("List not found");
    }
    if (list.userId !== args.userId) {
      throw new Error(
        "You are not authorized to generate a list for this list",
      );
    }

    // Fetch user settings to get defaultModel
    const userSettings = await ctx.runQuery(
      api.userFunctions.fetchUserSettings,
    );

    // Map user's defaultModel to OpenRouter format, with fallback
    const modelName =
      userSettings?.defaultModel != null
        ? mapModelToOpenRouter(userSettings.defaultModel)
        : "openai/gpt-4o"; // fallback if settings not found

    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_AI_KEY,
    });
    const { object }: { object: aiResult } = await generateObject({
      model: openRouter(modelName, {
        extraBody: {
          models: FALLBACK_MODELS,
        },
      }),
      prompt: `Generate a list of 2 items for the list ${list.title} with the following description: ${list.description}`,
      schema: z.object({
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          }),
        ),
      }),
      maxRetries: 3,
    });

    await ctx.runMutation(api.itemFunctions.createItems, {
      userId: args.userId,
      listId: args.listId,
      items: object.items,
    });

    return object;
  },
});

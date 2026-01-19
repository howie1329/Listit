import { action } from "../../_generated/server";
import { v } from "convex/values";
import { z } from "zod/v4";
import { api } from "../../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { FALLBACK_MODELS } from "../../lib/modelMapping";
import { generateObject, LanguageModel } from "ai";

const openroutermodel = createOpenRouter({
  apiKey: process.env.OPENROUTER_AI_KEY,
});

const itemSchema = z.object({
  title: z.string(),
  description: z.optional(z.string()),
  priority: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
  tags: z.array(z.string()),
  notes: z.optional(z.string()),
});

// Generate items based on user input
export const generateItems = action({
  args: {
    input: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const userSettings = await ctx.runQuery(
      api.userFunctions.fetchUserSettings,
    );
    if (!userSettings) {
      throw new Error("User settings not found");
    }

    const modelName = userSettings.defaultModel;

    const model = openroutermodel(modelName, {
      extraBody: {
        models: FALLBACK_MODELS,
      },
    }) as LanguageModel;

    const { object } = await generateObject({
      model: model,
      prompt: `Generate items based on the users input: ${args.input}`,
      schema: z.object({
        items: z.array(itemSchema),
      }),
    });

    if (object.items.length === 0) {
      throw new Error("No items generated");
    }

    for (const item of object.items) {
      await ctx.runMutation(api.items.mutations.createSingleItem, {
        title: item.title,
        description: item.description,
        priority: item.priority,
        tags: item.tags,
        notes: item.notes,
      });
    }

    return object;
  },
});

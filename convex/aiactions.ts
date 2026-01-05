import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod/v3";
import { generateObject } from "ai";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_AI_KEY,
    });
    const { object }: { object: aiResult } = await generateObject({
      model: openRouter("openai/gpt-oss-20b:free", {
        extraBody: {
          models: ["openai/gpt-oss-20b", "openai/gpt-5-nano"],
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

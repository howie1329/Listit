"use node";
import { action } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { basicFirecrawlScraper } from "../tools/firecrawlAgent";
import { api } from "../../_generated/api";

export const createBookMark = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    const results = await basicFirecrawlScraper(args.url);
    if (!results) {
      throw new Error("Failed to scrape website");
    }
    await ctx.runMutation(api.bookmarks.bookmarkFunctions.createBookmark, {
      url: args.url,
      title: results.title,
      description: results.description ?? "",
      summary: results.summary ?? "",
      favicon: results.favicon ?? "",
    });
    return true;
  },
});

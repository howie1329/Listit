"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { z } from "zod";
import { tool } from "ai";

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Need To test to see if this works... if not move to js file and and new Tool
export const firecrawlTool = tool({
  name: "firecrawl",
  description: "Use this tool to search the web for information",
  inputSchema: z.object({
    query: z.string().describe("The query to search the web for"),
  }),
  execute: async ({ query }) => {
    console.log("Firecrawl Query: ", query);
    const results = await firecrawl.search(query, {
      limit: 3,
      scrapeOptions: { formats: ["summary", "json"] },
    });

    console.log("Firecrawl Results: ", results);
    return results;
  },
});

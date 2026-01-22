import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Firecrawl from "@mendable/firecrawl-js";

export const websearchTool = createTool({
  id: "websearch",
  description: "use this tool to search the web for information",
  inputSchema: z.object({
    query: z.string().describe("the query to search the web for"),
  }),
  outputSchema: z.object({
    results: z.array(z.string()).describe("the results of the search"),
  }),
  execute: async ({ query }) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const searchResults = await firecrawl.search(query, {
      limit: 3,
      scrapeOptions: { formats: ["summary"] },
    });

    const results = searchResults?.web
      ? searchResults.web.map(
          (item: {
            title?: string;
            url?: string;
            summary?: string;
            description?: string;
          }) => {
            const title = item.title || item.url || "";
            const content = item.summary || item.description || "";
            return `${title}: ${content}`;
          },
        )
      : [];

    return { results };
  },
});

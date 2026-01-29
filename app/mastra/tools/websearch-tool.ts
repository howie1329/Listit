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
    results: z.any().describe("the results of the search"),
  }),
  execute: async ({ query }) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const result = await firecrawl.agent({ prompt: query, model: "spark-1-mini" })
    if (result.data) {
      return { results: result.data }
    }
    return { results: [] };
  },
});

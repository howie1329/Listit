"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { z } from "zod";
import { tool } from "ai";
import { ActionCtx } from "../../_generated/server";
import { api } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export const tools = (
  ctx: ActionCtx,
  threadId: Id<"thread">,
  threadMessageId: Id<"threadMessage">,
) => {
  return {
    firecrawlTool: tool({
      description: "Use this tool to search the web for information",
      inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
      }),
      execute: async ({ query }) => {
        console.log("Firecrawl Query: ", query);
        const threadToolId = await ctx.runMutation(
          api.threadtools.mutation.addThreadTool,
          {
            threadId: threadId,
            threadMessageId: threadMessageId,
            toolName: "firecrawl",
          },
        );
        console.log("Thread Tool ID: ", threadToolId);
        const results = await firecrawl.search(query, {
          limit: 3,
          scrapeOptions: { formats: ["summary", "json"] },
        });

        console.log("Firecrawl Results: ", results);
        await ctx.runMutation(api.threadtools.mutation.updateThreadTool, {
          threadToolId: threadToolId,
          toolOutput: JSON.stringify(results),
          status: "completed",
        });

        return results;
      },
    }),
  };
};

export const secondTool = (
  convex: ConvexHttpClient,
  threadId: Id<"thread">,
  threadMessageId: Id<"threadMessage">,
) => {
  return {
    firecrawlTool: tool({
      description: "Use this tool to search the web for information",
      inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
      }),
      execute: async ({ query }) => {
        const toolWriter = new toolWriters(
          convex,
          threadId,
          threadMessageId,
          "firecrawl",
          null,
        );
        await toolWriter.initialize();
        console.log("Firecrawl Query: ", query);
        const results = await firecrawl.search(query, {
          limit: 3,
          scrapeOptions: { formats: ["summary", "json"] },
        });

        await toolWriter.update(
          JSON.stringify(results),
          "completed",
          undefined,
        );

        console.log("Firecrawl Results: ", results);
        return results;
      },
    }),
  };
};
// Need To test to see if this works... if not move to js file and and new Tool
export const firecrawlTool = tool({
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

type firecrawlresponse = {
  title: string;
  description: string;
  url: string;
  summary: string;
  favicon: string;
};

export const basicFirecrawlScraper = async (
  url: string,
): Promise<firecrawlresponse> => {
  const results = await firecrawl.scrape(url, {
    formats: [{ type: "summary" }, { type: "screenshot" }],
  });
  if (!results) {
    throw new Error("Failed to scrape website");
  }

  console.log("Basic Firecrawl Scraper Results: ", results);

  const response: firecrawlresponse = {
    title: results.metadata?.title || results.metadata?.ogTitle || "",
    description:
      results.metadata?.description || results.metadata?.ogDescription || "",
    url: results.metadata?.url || results.metadata?.ogUrl || url,
    summary: results.summary || "",
    favicon: results.metadata?.favicon || "",
  };

  return response;
};

export const firecrawlScraperTool = tool({
  description: "Use this tool to scrape a website for information",
  inputSchema: z.object({
    url: z.string().describe("The URL of the website to scrape"),
  }),
  execute: async ({ url }) => {
    console.log("Firecrawl Scraper URL: ", url);
    const results = await firecrawl.scrape(url, {
      formats: [
        { type: "json", schema: schema },
        { type: "summary" },
        { type: "screenshot" },
      ],
    });
    console.log("Firecrawl Scraper Results: ", results);
    return results;
  },
});

const schema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
});

class toolWriters {
  constructor(
    private convexItem: ConvexHttpClient,
    private threadId: Id<"thread">,
    private threadMessageId: Id<"threadMessage">,
    private toolName: string,
    private toolId: Id<"threadTools"> | null,
  ) {
    this.convexItem = convexItem;
    this.threadId = threadId;
    this.threadMessageId = threadMessageId;
    this.toolName = toolName;
    this.toolId = toolId;
  }

  async initialize() {
    this.toolId = await this.convexItem.mutation(
      api.threadtools.mutation.addThreadTool,
      {
        threadId: this.threadId,
        threadMessageId: this.threadMessageId,
        toolName: this.toolName,
      },
    );
  }

  async update(
    toolOutput: string,
    status: "running" | "completed" | "error",
    errorMessage: string | undefined,
  ) {
    await this.convexItem.mutation(api.threadtools.mutation.updateThreadTool, {
      threadToolId: this.toolId as Id<"threadTools">,
      toolOutput: toolOutput,
      status: status,
      errorMessage: errorMessage,
    });
  }
}

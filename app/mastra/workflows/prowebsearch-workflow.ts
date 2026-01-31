import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {tavily} from "@tavily/core"
import { Firecrawl } from "@mendable/firecrawl-js";


/**
 * This workflow is a pro workflow that uses multiple tools to search the web for information.
 * 
 */

// Step 1: Take the users query and use a agent to build a more detailed query.

const refineQuery = createStep({
    id: "refine-query",
    description: "Refine the user's query to be more specific and detailed.",
    inputSchema: z.object({
        query: z.string().describe("The user's query to search the web for"),
    }),
    outputSchema: z.object({
        query: z.string().describe("The refined query to search the web for"),
    }),
    execute: async ({ inputData }) => {
        const query = inputData.query;
       
        const agent = new Agent({
            id: "refine-query-agent",
            name: "Refine Query Agent",
            instructions: `
            You are a helpful assistant that refines user queries to be more specific and detailed.
            Your output will be used to search the web for information.
            Your output should be a single query that is more specific and detailed.
            `,
            model: "openrouter/openai/gpt-5-nano"
            
        })
        const response = await agent.generate([{
            role: "user",
            content: `
            Refine the following query: ${query}
            `,
        }]);
        return { query: response.text };
    },
})

// Step 2: Use the refined query to search the web for information using tavily.

const tavilySearch = createStep({
    id: "tavily-search",
    description: "Search the web for information using the refined query using tavily.",
    inputSchema: z.object({
        query: z.string().describe("The refined query to search the web for using tavily"),
    }),
    outputSchema: z.object({
        query: z.string().describe("The refined query to search the web for using tavily"),
        tavilyResults: z.array(z.string()).describe("The results of the search using tavily"),
    }),
    execute: async ({ inputData }) => {
        const query = inputData.query;
        const client = tavily({apiKey: process.env.TAVILY_API_KEY!})
        const response = await client.search(query)
        return {query: query, tavilyResults: response.results.map((result) => result.content)}
    }
})

// Step 3: use the refined query to search the web for information using firecrawl.
const firecrawlSearch = createStep({
    id: "firecrawl-search",
    description: "Search the web for information using the refined query using firecrawl.",
    inputSchema: z.object({
        query: z.string().describe("The refined query to search the web for using firecrawl"),
        tavilyResults: z.array(z.string()).describe("The results of the search using tavily"),
    }),
    outputSchema: z.object({
        firecrawlResults: z.array(z.string()).describe("The results of the search using firecrawl"),
        tavilyResults: z.array(z.string()).describe("The results of the search using tavily"),
    }),
    execute: async ({ inputData }) => {
        const query = inputData.query;
        const client = new Firecrawl({apiKey: process.env.FIRECRAWL_API_KEY!})
        const response = await client.search(query, {
            limit: 3,
            scrapeOptions: { formats: ["summary"] },
        })
        const results = response?.web
      ? response.web.map(
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
        return {firecrawlResults: results, tavilyResults: inputData.tavilyResults}
    }
})

// Step 4: Combine the results from tavily and firecrawl.

const combineResults = createStep({
    id: "combine-results",
    description: "Combine the results from tavily and firecrawl.",
    inputSchema: z.object({
        tavilyResults: z.array(z.string()).describe("The results of the search using tavily"),
        firecrawlResults: z.array(z.string()).describe("The results of the search using firecrawl"),
    }),
    outputSchema: z.object({
        results: z.array(z.string()).describe("The combined results of the search"),
    }),
    execute: async ({ inputData }) => {
        const tavilyResults = inputData.tavilyResults;
        const firecrawlResults = inputData.firecrawlResults;
        const results = [...tavilyResults, ...firecrawlResults];
        return {results: results}
    }
})

// Complete Workflow 
export const proWebsearchWorkflow = createWorkflow({
    id: "pro-websearch-workflow",
    description: "A workflow that uses multiple tools to search the web for information.",
    inputSchema: z.object({
        query: z.string().describe("The user's query to search the web for"),
    }),
    outputSchema: z.object({
        results: z.array(z.string()).describe("The results of the search"),
    })
})
.then(refineQuery)
.then(tavilySearch)
.then(firecrawlSearch)
.then(combineResults)
.commit()

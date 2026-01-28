import { CustomToolCallCapturePart } from "@/app/api/chat/route";
import { UIMessageStreamWriter, tool } from "ai";
import Firecrawl from "@mendable/firecrawl-js";
import z from "zod";
import { v } from "convex/values";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Base tools for the application. This is a collection of tools that are used in the application.
 * @param writer - The writer to write the tool data to
 * @returns The base tools
 */
export const baseTools = ({
  writer,
  customToolCallCapture,
}: {
  writer: UIMessageStreamWriter;
  customToolCallCapture: CustomToolCallCapturePart[];
}) => {
  return {
    workingMemoryTool: tool({
      description: "Use this tool to update the working memory",
      inputSchema: z.object({
        name: z.optional(z.string()).describe("The name to update the working memory with"),
        age: z.optional(z.number()).describe("The age to update the working memory with"),
        preferences: z.optional(z.string()).describe("The preferences to update the working memory with"),
        location: z.optional(z.string()).describe("The location to update the working memory with"),
        interests: z.optional(z.string()).describe("The interests to update the working memory with"),
        tendencies: z.optional(z.string()).describe("The tendencies to update the working memory with"),
        notes: z.optional(z.string()).describe("The notes to update the working memory with"),
        extra: z.optional(z.any()).describe("The extra to update the working memory with"),
      }),
      execute: async ({ name, age, preferences, location, interests, tendencies, notes, extra }, { experimental_context: context }) => {
        try {
          const passedContext = context as { userId: string }
          const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
          await convex.mutation(api.chatmemory.mutations.setChatMemory, {
            userId: passedContext.userId as unknown as Id<"users">,
            name: name,
            age: age,
            preferences: preferences,
            location: location,
            interests: interests,
            tendencies: tendencies,
            notes: notes,
            extra: extra,
          });
        } catch (error) {
          console.error("Error updating working memory: ", error);
          return { success: false, error: "Error updating working memory" };
        }
        return { success: true, message: "Working memory updated successfully" };
      },
    }),
    weatherTool: tool({
      description: "Use this tool to get the weather for a given location",
      inputSchema: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      execute: async ({ location }) => {
        const toolId = crypto.randomUUID();
        writer.write({
          type: "data-weather-tool",
          id: toolId,
          data: {
            location: location,
            status: "running",
          },
        });

        const result = `The weather in ${location} is 75 degrees and sunny`;

        writer.write({
          type: "data-weather-tool",
          id: toolId,
          data: {
            location: location,
            status: "completed",
            result: result,
          },
        });
        customToolCallCapture.push({
          type: "data-weather-tool",
          id: toolId,
          data: {
            location: location,
            status: "completed",
            result: result,
          },
        });
        return result;
      },
    }),
    searchWebTool: tool({
      description: "Use this tool to search the web for information",
      inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
      }),
      outputSchema: z.object({
        results: z.any().describe("The results of the search"),

      }),
      execute: async ({ query }) => {
        const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
        const toolId = crypto.randomUUID();
        writer.write({
          type: "data-search-web-tool",
          id: toolId,
          data: {
            query: query,
            status: "running",
          },
        });

        const result = await firecrawl.agent({ prompt: query, model: "spark-1-mini" })
        console.log("Result: ", result);
        if (result.data) {
          writer.write({
            type: "data-search-web-tool",
            id: toolId,
            data: {
              query: query,
              status: "completed",
              results: result.data,
            },
          });
          return { results: result.data }
        }


        return { results: [] };
      },
    })
  };
};

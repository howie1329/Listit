import { CustomToolCallCapturePart } from "@/app/api/chat/route";
import { UIMessageStreamWriter, tool } from "ai";
import Firecrawl from "@mendable/firecrawl-js";
import z from "zod";

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

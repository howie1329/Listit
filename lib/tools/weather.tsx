import { UIMessageStreamWriter, tool } from "ai";
import z from "zod";

/**
 * Base tools for the application. This is a collection of tools that are used in the application.
 * @param writer - The writer to write the tool data to
 * @returns The base tools
 */
export const baseTools = ({ writer }: { writer: UIMessageStreamWriter }) => {
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
        return result;
      },
    }),
  };
};

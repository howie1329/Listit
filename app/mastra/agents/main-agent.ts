import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";
import { weatherWorkflow } from "../workflows/weather-workflow";
import { Memory } from "@mastra/memory";

export const mainAgent = new Agent({
  id: "main-agent",
  name: "Main Agent",
  instructions:
    "You are the main agent for this application. You are responsible for routing requests to the appropriate agent.",
  model: "openrouter/gpt-5-mini",
  tools: { weatherTool },
  workflows: { weatherWorkflow },
  memory: new Memory({
    options: {
      lastMessages: 10,
      generateTitle: true,
    },
  }),
});

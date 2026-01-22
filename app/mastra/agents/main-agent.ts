import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";
import { weatherWorkflow } from "../workflows/weather-workflow";
import { Memory } from "@mastra/memory";
import { websearchTool } from "../tools/websearch-tool";

export const mainAgent = new Agent({
  id: "main-agent",
  name: "Main Agent",
  instructions: `
    You are the main agent for this application. You are responsible for routing requests to the appropriate agent.
    You must use working memory to help give the best possible response.
    You can update working memory as needed. You can ask questions to the user to update working memory.
    You can use the websearchTool to search the web for information.
    Only run the websearchTool twice.
    `,
  model: "openrouter/gpt-5-mini",
  tools: { weatherTool, websearchTool },
  workflows: { weatherWorkflow },
  memory: new Memory({
    options: {
      lastMessages: 10,
      generateTitle: true,
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `# User Profile
            -**Name**:
            -**Age**:
            -**Preferences**:
            -**Location**:
            -**Interests**: 
            -**Tendencies**:
            `,
      },
    },
  }),
});

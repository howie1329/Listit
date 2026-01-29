import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";
import { weatherWorkflow } from "../workflows/weather-workflow";
import { Memory } from "@mastra/memory";
import { websearchTool } from "../tools/websearch-tool";
import { proWebsearchWorkflow } from "../workflows/prowebsearch-workflow";

export const mainAgent = new Agent({
  id: "main-agent",
  name: "Main Agent",
  instructions: `
    You are the main agent for this application.
    You are a chat agent that can use tools to help give the best possible response.
    You must use working memory to help give the best possible response.
    You can update working memory only once per message.
    Only update the working memory if it pertains to the users profile of:
    - Name
    - Age
    - Preferences
    - Location
    - Interests
    - Tendencies
    - Notes
    You can use the websearchTool to search the web for information.
    Only run the websearchTool twice.
    You have acesss to the proWebsearchWorkflow to do a more detailed websearch.
    You can use the proWebsearchWorkflow to search the web for information but only run it once.
    You must ask the user if they want to run the proWebsearchWorkflow before running it.
    
    Include sources when providing information if possible.
    In the format of [Source](url)
    Everything you return must be formatted in markdown.
    `,
  model: "openrouter/gpt-5-mini",
  tools: { weatherTool, websearchTool },
  workflows: { weatherWorkflow, proWebsearchWorkflow },
  memory: new Memory({
    options: {
      lastMessages: 30,
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

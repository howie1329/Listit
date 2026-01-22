import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import {
  Observability,
  DefaultExporter,
  CloudExporter,
  SensitiveDataFilter,
} from "@mastra/observability";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { ConvexStore } from "@mastra/convex";
import { mainAgent } from "./agents/main-agent";
import { websearchTool } from "./tools/websearch-tool";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { mainAgent },
  tools: { websearchTool },
  storage: new ConvexStore({
    id: "convex-storage",
    deploymentUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    adminAuthToken: process.env.CONVEX_ADMIN_KEY!,
    storageFunction: "mastra/storage:handle",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra",
        exporters: [
          new DefaultExporter(), // Persists traces to storage for Mastra Studio
          new CloudExporter(), // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});

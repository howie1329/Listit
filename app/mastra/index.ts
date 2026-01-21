import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import {
  Observability,
  DefaultExporter,
  CloudExporter,
  SensitiveDataFilter,
} from "@mastra/observability";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import { ConvexStore } from "@mastra/convex";
import { mainAgent } from "./agents/main-agent";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { mainAgent },
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

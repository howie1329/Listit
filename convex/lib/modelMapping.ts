import { v } from "convex/values";

export type DefaultModel = "gpt-4o" | "gpt-4o-mini" | "openai/gpt-oss-20b:free";

export type OpenRouterModels =
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini"
  | "openai/gpt-oss-20b:free";

export const FALLBACK_MODELS: OpenRouterModels[] = [
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-oss-20b:free",
];

export function mapModelToOpenRouter(model: DefaultModel): OpenRouterModels {
  switch (model) {
    case "gpt-4o":
      return "openai/gpt-4o";
    case "gpt-4o-mini":
      return "openai/gpt-4o-mini";
    case "openai/gpt-oss-20b:free":
      return "openai/gpt-oss-20b:free";
  }
}

// Helper function to create the Convex validator for DefaultModel
export function defaultModelValidator() {
  return v.union(
    v.literal("gpt-4o"),
    v.literal("gpt-4o-mini"),
    v.literal("openai/gpt-oss-20b:free"),
  );
}

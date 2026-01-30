"use client";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import React, { useMemo } from "react";
import { ChatStatus } from "ai";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ModelType = {
  id: string;
  displayName: string;
  slug: string;
  provider: string;
  openrouterslug: string;
};
const models: ModelType[] = [
  {
    id: "deepseek/deepseek-r1-0528:free",
    displayName: "DeepSeek R1 0528",
    slug: "openrouter/deepseek/deepseek-r1-0528:free",
    provider: "deepseek",
    openrouterslug: "deepseek/deepseek-r1-0528:free",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    displayName: "Llama 3.3 70B Instruct",
    slug: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
    provider: "meta-llama",
    openrouterslug: "meta-llama/llama-3.3-70b-instruct:free",
  },
  {
    id: "mistralai/ministral-8b",
    displayName: "Mistral Ministral 8B",
    slug: "openrouter/mistralai/ministral-8b",
    provider: "mistralai",
    openrouterslug: "mistralai/ministral-8b",
  },
  {
    id: "arcee-ai/trinity-large-preview:free",
    displayName: "Trinity Large Preview",
    slug: "openrouter/trinity-large-preview:free",
    provider: "arcee-ai",
    openrouterslug: "arcee-ai/trinity-large-preview:free",
  },

  {
    id: "moonshotai/kimi-k2.5",
    displayName: "Kimi K2.5",
    slug: "openrouter/kimi-k2.5",
    provider: "moonshotai",
    openrouterslug: "moonshotai/kimi-k2.5",
  },
  {
    id: "moonshotai/kimi-k2",
    displayName: "Kimi K2",
    slug: "openrouter/kimi-k2",
    provider: "moonshotai",
    openrouterslug: "moonshotai/kimi-k2-0905",
  },
  {
    id: "openai/gpt-5-mini",
    displayName: "GPT-5 Mini",
    slug: "openrouter/gpt-5-mini",
    provider: "openai",
    openrouterslug: "openai/gpt-5-mini",
  },
  {
    id: "openai/gpt-5-nano",
    displayName: "GPT-5 Nano",
    slug: "openrouter/gpt-5-nano",
    provider: "openai",
    openrouterslug: "openai/gpt-5-nano",
  },
  {
    id: "x-ai/grok-4.1-fast",
    displayName: "Grok 4.1 Fast",
    slug: "openrouter/grok-4.1-fast",
    provider: "x-ai",
    openrouterslug: "x-ai/grok-4.1-fast",
  },
];

export const ChatBaseInput = ({
  onSubmit,
  status,
  setInput,
  input,
  model,
  setModel,
  className,
}: {
  onSubmit: () => void;
  status: ChatStatus;
  setInput: (input: string) => void;
  input: string;
  model: ModelType | undefined;
  setModel: (model: ModelType | undefined) => void;
  className?: string;
}) => {
  // Parse commands from input
  const detectedCommands = useMemo(() => {
    const commands: Array<{
      type: "@basic" | "@search" | "@workingMemory" | "@summarize";
      index: number;
    }> = [];
    const text = input.toLowerCase();

    if (text.includes("@basic")) {
      commands.push({ type: "@basic", index: text.indexOf("@basic") });
    }
    if (text.includes("@search")) {
      commands.push({ type: "@search", index: text.indexOf("@search") });
    }
    if (text.includes("@workingmemory")) {
      commands.push({
        type: "@workingMemory",
        index: text.indexOf("@workingmemory"),
      });
    }
    if (text.includes("@summarize")) {
      commands.push({ type: "@summarize", index: text.indexOf("@summarize") });
    }

    return commands.sort((a, b) => a.index - b.index);
  }, [input]);

  const getCommandLabel = (type: string) => {
    switch (type) {
      case "@basic":
        return "Basic Search";
      case "@search":
        return "Web Search";
      case "@workingMemory":
        return "Update Memory";
      case "@summarize":
        return "Generate Summary";
      default:
        return type;
    }
  };

  const getCommandColor = (type: string) => {
    switch (type) {
      case "@basic":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "@search":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "@workingMemory":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "@summarize":
        return "bg-amber-500/10 text-amber-700 border-amber-500/30";
      default:
        return "";
    }
  };

  return (
    <div className={className}>
      {detectedCommands.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2">
          {detectedCommands.map((cmd, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className={getCommandColor(cmd.type)}
            >
              {getCommandLabel(cmd.type)}
            </Badge>
          ))}
        </div>
      )}
      <PromptInputProvider>
        <PromptInput globalDrop onSubmit={() => onSubmit()}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
          </PromptInputBody>
          <PromptInputFooter className="w-full flex flex-row justify-end">
            <PromptInputTools>
              <ModelSelector>
                <ModelSelectorTrigger>
                  <Button type="button" variant="outline">
                    {model ? model.displayName : "Select a model"}
                  </Button>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput
                    asChild
                    placeholder="Search for a model"
                  />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No Models Found</ModelSelectorEmpty>
                    <ModelSelectorGroup>
                      {models.map((model) => (
                        <ModelSelectorItem
                          key={model.id}
                          onSelect={() => setModel(model)}
                        >
                          <ModelSelectorName>
                            {model.displayName}
                          </ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
              <PromptInputSubmit
                disabled={status === "streaming" || model === undefined}
                status={status}
              />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  );
};

export default ChatBaseInput;

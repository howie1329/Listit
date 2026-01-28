"use client";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputProvider, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import React from "react";
import { ChatStatus } from "ai";
import { ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorName, ModelSelectorTrigger } from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";

export type ModelType = {
    id: string;
    displayName: string;
    slug: string;
    provider: string;
    openrouterslug: string
}
const models: ModelType[] = [
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
    }
]

export const ChatBaseInput = ({ onSubmit, status, setInput, input, model, setModel, className }: { onSubmit: () => void, status: ChatStatus, setInput: (input: string) => void, input: string, model: ModelType | undefined, setModel: (model: ModelType | undefined) => void, className?: string }) => {
    return (
        <div className={className}>
            <PromptInputProvider>
                <PromptInput globalDrop onSubmit={() => onSubmit()}>
                    <PromptInputBody>
                        <PromptInputTextarea value={input} onChange={(e) => setInput(e.currentTarget.value)} />
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
                                    <ModelSelectorInput asChild placeholder="Search for a model" />
                                    <ModelSelectorList>
                                        <ModelSelectorEmpty>No Models Found</ModelSelectorEmpty>
                                        <ModelSelectorGroup>
                                            {models.map((model) => (
                                                <ModelSelectorItem key={model.id} onSelect={() => setModel(model)}>
                                                    <ModelSelectorName>{model.displayName}</ModelSelectorName>
                                                </ModelSelectorItem>
                                            ))}
                                        </ModelSelectorGroup>
                                    </ModelSelectorList>
                                </ModelSelectorContent>
                            </ModelSelector>
                            <PromptInputSubmit disabled={status === "streaming" || model === undefined} status={status} />
                        </PromptInputTools>
                    </PromptInputFooter>

                </PromptInput>

            </PromptInputProvider>
        </div>

    )
}

export default ChatBaseInput;
"use client";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputProvider, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import React from "react";
import { ChatStatus } from "ai";
import { ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorName, ModelSelectorTrigger } from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";

export type ModelType = {
    id: string;
    displayName: string;
    slug: string;
    provider: string;
}
const models: ModelType[] = [
    {
        id: "moonshotai/kimi-k2",
        displayName: "Kimi K2",
        slug: "openrouter/kimi-k2",
        provider: "moonshotai",
    },
    {
        id: "openai/gpt-5-mini",
        displayName: "GPT-5 Mini",
        slug: "openrouter/gpt-5-mini",
        provider: "openai",
    },
    {
        id: "x-ai/grok-4.1-fast",
        displayName: "Grok 4.1 Fast",
        slug: "openrouter/grok-4.1-fast",
        provider: "x-ai",
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
                        <ModelSelector>
                            <ModelSelectorTrigger asChild>
                                {model && (
                                    <Button variant="outline">{model.displayName}</Button>
                                )}
                                {!model && (
                                    <Button variant="outline">Select a model</Button>
                                )}
                            </ModelSelectorTrigger>
                            <ModelSelectorContent>
                                <ModelSelectorInput placeholder="Search for a model" />
                                <ModelSelectorList>
                                    <ModelSelectorEmpty>No Models Found</ModelSelectorEmpty>
                                    <ModelSelectorGroup>
                                        {models.map((model) => (
                                            <ModelSelectorItem key={model.id}>
                                                <ModelSelectorName>{model.displayName}</ModelSelectorName>
                                            </ModelSelectorItem>
                                        ))}
                                    </ModelSelectorGroup>
                                </ModelSelectorList>
                            </ModelSelectorContent>
                        </ModelSelector>
                        <PromptInputSubmit status={status} />
                    </PromptInputFooter>

                </PromptInput>

            </PromptInputProvider>
        </div>

    )
}

export default ChatBaseInput;
"use client";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputProvider, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import React from "react";
import { ChatStatus } from "ai";

export const ChatBaseInput = ({ onSubmit, status, setInput, input, className }: { onSubmit: () => void, status: ChatStatus, setInput: (input: string) => void, input: string, className?: string }) => {
    return (
        <div className={className}>
            <PromptInputProvider>
                <PromptInput globalDrop onSubmit={() => onSubmit()}>
                    <PromptInputBody>
                        <PromptInputTextarea value={input} onChange={(e) => setInput(e.currentTarget.value)} />
                    </PromptInputBody>
                    <PromptInputFooter className="w-full flex flex-row justify-end">
                        <PromptInputSubmit status={status} />
                    </PromptInputFooter>

                </PromptInput>

            </PromptInputProvider>
        </div>

    )
}

export default ChatBaseInput;
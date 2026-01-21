"use client";
import { useChat } from "@ai-sdk/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputProvider,
} from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport } from "ai";
import { UIMessage } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { toast } from "sonner";
export default function MastraPage() {
  const [input, setInput] = useState("");
  const [selectedThread, setSelectedThread] = useState<Id<"thread"> | null>(
    null,
  );
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mastra",
    }),
    messages: [],
    experimental_throttle: 0,
  });

  const threads = useQuery(api.thread.queries.getUserThreads);
  const uiMessages = useQuery(
    api.uiMessages.queries.getUIMessages,
    selectedThread ? { threadId: selectedThread } : "skip",
  );
  const createThread = useMutation(api.thread.mutations.createThread);
  const handleCreateThread = async () => {
    const thread = await createThread({
      title: "New Thread",
    });
    setSelectedThread(thread);
  };
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedThread) {
      return;
    }
    try {
      await sendMessage(
        { text: input },
        {
          body: {
            userId: "123",
            threadId: selectedThread,
          },
        },
      );
      setInput("");
    } catch (error) {
      toast.error("Error sending message");
    }
  };
  useEffect(() => {
    if (uiMessages) {
      setMessages(
        uiMessages.map((message) => ({
          id: message.id,
          role: message.role,
          parts: message.parts,
        })) as UIMessage[],
      );
    }
  }, [uiMessages, setMessages]);
  return (
    <div className="flex flex-row w-full h-full ">
      <div className="flex flex-col w-2/12 h-full items-center border-r px-2">
        <p>Your Threads</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleCreateThread}
        >
          Create New Thread
        </Button>
        <Separator />
        <div className="flex flex-col w-full gap-2 py-2">
          {threads &&
            threads.map((thread) => (
              <Button
                key={thread._id}
                className="w-full"
                onClick={() => setSelectedThread(thread._id)}
              >
                <p>{thread.title}</p>
              </Button>
            ))}
        </div>
      </div>
      <div className="flex flex-col w-10/12 h-full items-center ">
        <p>{selectedThread}</p>
        <Separator />
        <Conversation className="w-full h-full">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text": // we don't use any reasoning or tool calls in this example
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
        </Conversation>
        <PromptInputProvider>
          <div className="flex flex-row w-full gap-2 py-2 border px-2 items-center">
            <PromptInputTextarea
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <PromptInputSubmit
              status={status === "streaming" ? "streaming" : "ready"}
              disabled={!input.trim()}
              onClick={handleSendMessage}
            />
          </div>
        </PromptInputProvider>
      </div>
    </div>
  );
}

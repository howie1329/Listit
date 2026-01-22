"use client";
import { useChat } from "@ai-sdk/react";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
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
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { toast } from "sonner";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import { convexToMastraDBMessages } from "@/lib/mastra-messages";

export default function MastraPage() {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mastra",
    }),
    messages: [],
    experimental_throttle: 0,
  });

  const mastraThreads = useQuery(api.thread.queries.getMastraThreads);
  const singleMastraThread = useQuery(
    api.thread.queries.getSingleMastraThread,
    threadId ? { threadId: threadId } : "skip",
  );
  const mastraThreadMessages = useQuery(
    api.threadMessages.queries.getMastraThreadMessages,
    threadId ? { threadId: threadId } : "skip",
  );

  //const createThread = useMutation(api.thread.mutations.createMastraThread);
  const handleClearThread = async () => {
    setThreadId(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId) {
      return;
    }
    try {
      await sendMessage(
        { text: input },
        {
          body: {
            userId: "123",
            threadId: threadId,
          },
        },
      );
      setInput("");
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error sending message: ", error);
    }
  };

  useEffect(() => {
    if (threadId && mastraThreadMessages) {
      try {
        // Transform Convex messages to MastraDBMessage format
        const mastraMessages = convexToMastraDBMessages(mastraThreadMessages);

        // Convert to AI SDK V5 format for useChat
        const uiMessages = toAISdkV5Messages(mastraMessages);

        setMessages(uiMessages);
      } catch (error) {
        console.error("Error converting messages:", error);
        toast.error("Failed to load messages");
      }
    }
  }, [threadId, mastraThreadMessages, setMessages]);
  return (
    <div className="flex flex-row w-full h-full ">
      <div className="flex flex-col w-2/12 h-full items-center border-r px-2">
        <p>Your Threads</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleClearThread}
        >
          Create New Thread
        </Button>
        <Separator />
        <div className="flex flex-col w-full gap-2 py-2">
          {mastraThreads &&
            mastraThreads.map((thread) => (
              <Button
                key={thread.id}
                className="w-full"
                onClick={() => setThreadId(thread.id)}
              >
                <p>{thread.title}</p>
              </Button>
            ))}
        </div>
      </div>

      {threadId && (
        <div className="flex flex-col w-10/12 h-full items-center ">
          <p>{singleMastraThread?.title}</p>
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
      )}

      {!threadId && (
        <div className="flex flex-col w-10/12 h-full items-center ">
          <p>No thread selected</p>
        </div>
      )}
    </div>
  );
}

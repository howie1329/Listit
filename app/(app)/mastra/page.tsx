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
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

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
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const singleMastraThread = useQuery(
    api.thread.queries.getSingleMastraThread,
    threadId ? { threadId: threadId } : "skip",
  );

  //const createThread = useMutation(api.thread.mutations.createMastraThread);
  const handleClearThread = async () => {
    setThreadId(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    let currentThreadId: string | null = threadId || null;
    if (!input.trim() || !userSettings?.userId) {
      return;
    }
    if (!currentThreadId) {
      const newThreadId = crypto.randomUUID();
      currentThreadId = newThreadId;
    }
    try {
      await sendMessage(
        { text: input },
        {
          body: {
            userId: userSettings.userId,
            threadId: currentThreadId,
          },
        },
      ).then(() => {
        setInput("");
        setThreadId(currentThreadId);
      });
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error sending message: ", error);
    }
  };

  // Load message history from API route when thread changes
  useEffect(() => {
    if (threadId && userSettings?.userId) {
      fetch(
        `/api/mastra/messages?threadId=${threadId}&userId=${userSettings.userId}`,
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setMessages(data.messages);
        })
        .catch((err) => {
          console.error("Error loading messages:", err);
          toast.error("Failed to load messages");
        });
    } else {
      setMessages([]);
    }
  }, [threadId, setMessages, userSettings?.userId]);
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
                          case "reasoning":
                            return (
                              <Reasoning isStreaming={status === "streaming"}>
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
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
              {status === "streaming" && <Shimmer>Thinking...</Shimmer>}
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
        <div className="flex flex-col w-10/12 h-full items-center justify-center px-4">
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
    </div>
  );
}

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
  DefaultChatTransport, ToolUIPart
} from "ai";
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
import ChatBaseInput, { ModelType } from "@/components/features/mastra/ChatBaseInput";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
export default function MastraPage() {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [model, setModel] = useState<ModelType | undefined>(undefined);
  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mastra",
    }),
    messages: [],
  });

  const mastraThreads = useQuery(api.thread.queries.getMastraThreads);
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const singleMastraThread = useQuery(
    api.thread.queries.getSingleMastraThread,
    threadId ? { threadId: threadId } : "skip",
  );

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
            model: model || "moonshotai/kimi-k2",
            generateTitle: () => {
              if (messages.length > 0) {
                return false;
              }
              return true;
            }
          },
        },
      ).then(() => {
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
          console.log("data", data);
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
    <div className="flex flex-row w-full h-full overflow-x-hidden ">
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
                <p className="text-left truncate">{thread.title}</p>
              </Button>
            ))}
        </div>
      </div>

      {threadId && (
        <div className="flex flex-col w-10/12 max-w-10/12 h-full items-center">
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
                        if (part.type === "step-start") {
                          return null;
                        }
                        if (part.type.includes("tool-") && "toolCallId" in part && "state" in part) {
                          const toolPart = part as ToolUIPart;
                          return (
                            <Tool key={toolPart.toolCallId}>
                              <ToolHeader type={toolPart.type} state={toolPart.state} />
                              <ToolContent>
                                <ToolInput input={toolPart.input} />
                                <ToolOutput
                                  output={toolPart.output}
                                  errorText={toolPart.errorText}
                                />
                              </ToolContent>
                            </Tool>
                          );
                        }
                        if (part.type === "reasoning") {
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              isStreaming={status === "streaming"}
                              defaultOpen={false}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        }
                        if (part.type === "text") {
                          return (
                            <Streamdown plugins={{ code, mermaid, math, cjk }} isAnimating={status === "streaming"} key={`${message.id}-${i}`}>
                              {part.text}
                            </Streamdown>
                          );
                        }

                      })}
                    </MessageContent>
                  </Message>
                ))
              )}
              {status === "streaming" && <Shimmer>Thinking...</Shimmer>}
            </ConversationContent>
          </Conversation>
          <ChatBaseInput className="p-4 w-full" onSubmit={() => handleSendMessage()} status={status} setInput={setInput} input={input} model={model} setModel={setModel} />
        </div>
      )}

      {!threadId && (
        <ChatBaseInput className="p-4 w-full self-center" onSubmit={() => handleSendMessage()} status={status} setInput={setInput} input={input} model={model} setModel={setModel} />
      )}
    </div>
  );
}

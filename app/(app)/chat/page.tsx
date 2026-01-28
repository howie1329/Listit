"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { mapModelToOpenRouter } from "@/convex/lib/modelMapping";
import { Streamdown } from "streamdown";
import { Conversation, ConversationContent, ConversationEmptyState } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { ReasoningContent, Reasoning, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import ChatBaseInput, { ModelType } from "@/components/features/mastra/ChatBaseInput";
import { Task } from "@/components/ai-elements/task";

export default function ChatPage() {
  const [model, setModel] = useState<ModelType | undefined>();
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const createThread = useMutation(api.thread.mutations.createThread);
  const [selectedThread, setSelectedThread] = useState<Id<"thread"> | null>(
    null,
  );
  const uiMessages = useQuery(
    api.uiMessages.queries.getUIMessages,
    selectedThread
      ? {
        threadId: selectedThread,
      }
      : "skip",
  );

  const {
    messages: chatMessages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: [],
    experimental_throttle: 100,
  });

  const prevThreadRef = useRef<Id<"thread"> | null>(null);

  useEffect(() => {
    if (
      uiMessages &&
      selectedThread &&
      selectedThread !== prevThreadRef.current
    ) {
      if (status !== "streaming") {
        prevThreadRef.current = selectedThread;
        setMessages(
          uiMessages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            metadata: message.metadata,
          })) as UIMessage[],
        );
      }
    }
  }, [uiMessages, setMessages, selectedThread, status]);

  const [message, setMessage] = useState("");

  const threads = useQuery(api.thread.queries.getUserThreads);

  const handleSendMessage = async () => {
    if (!(selectedThread || model || message)) {
      return;
    }
    try {
      await sendMessage(
        { text: message },
        {
          body: {
            threadId: selectedThread,
            model: model?.openrouterslug,
          },
        },
      )
      setMessage("");

    } catch (error) {
      toast.error("Error sending message");
      console.warn("Error sending message: ", error);
    }
  };

  const handleCreateThread = async () => {
    try {
      const thread = await createThread({
        title: "New Thread",
      });
      setSelectedThread(thread);
    } catch (error) {
      toast.error("Error creating thread");
      console.warn("Error creating thread: ", error);
    }
  };

  return (
    <div className="flex flex-row border-2 border-red-500 w-full h-full p-2 gap-2">
      <div className="flex flex-col gap-4 border w-1/6">
        <h1 className="text-center ">Your Threads</h1>
        <Button onClick={handleCreateThread}>Create New Thread</Button>
        {threads &&
          threads.map((thread) => (
            <div key={thread._id} onClick={() => setSelectedThread(thread._id)}>
              <p
                className={`${selectedThread === thread._id ? "text-blue-500" : ""}`}
              >
                {thread.title}
              </p>
            </div>
          ))}
      </div>

      <div className="flex flex-col gap-4 border w-5/6 h-full overflow-y-auto">
        <h1 className="text-center">Chat</h1>
        <Conversation>
          <ConversationContent>
            {!chatMessages || chatMessages.length === 0 ? (
              <ConversationEmptyState />
            ) : (
              chatMessages.map((message) => (
                message.parts.map((part, index) => {
                  if (part.type === "reasoning") {
                    return (
                      <Reasoning
                        key={index}
                        defaultOpen={false}
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  }
                  if (part.type.includes("tool-")) {
                    if ('toolCallId' in part) {
                      return (
                        <Tool key={index}>
                          <ToolHeader key={index} title={part.type.split("-").slice(1).join("-")} type={part.type as `tool-${string}`} state={part.state} />
                          <ToolContent>
                            <ToolInput
                              key={index}
                              input={part.input}
                            />
                            <ToolOutput
                              key={index}
                              output={part.output}
                              errorText={part.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      )
                    }
                  }
                  if (part.type === "text") {
                    return (
                      <Message from={message.role} key={index}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    )
                  }
                })
              ))
            )}
            {status === "streaming" && <Loader />}
          </ConversationContent>
        </Conversation>
        <ChatBaseInput onSubmit={handleSendMessage} status={status} setInput={setMessage} input={message} model={model} setModel={setModel} />

      </div>
    </div>
  );
}

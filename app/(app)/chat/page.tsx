"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  ReasoningContent,
  Reasoning,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import ChatBaseInput, {
  ModelType,
} from "@/components/features/mastra/ChatBaseInput";
import { ThreadListItem } from "@/components/features/chat/ThreadListItem";
import { MessageSquare, Plus } from "lucide-react";
import { SummaryDialog } from "@/components/features/chat/SummaryDialog";

export default function ChatPage() {
  const [model, setModel] = useState<ModelType | undefined>();
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const createThread = useMutation(api.thread.mutations.createThread);
  const deleteThread = useMutation(api.thread.mutations.deleteThread);
  const updateThreadTitle = useMutation(api.thread.mutations.updateThreadTitle);
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

  const threads = useQuery(api.thread.queries.getUserThreadsWithPreview);

  // Sort threads by updatedAt (most recent first)
  const sortedThreads = threads
    ? [...threads].sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
    : [];

  const handleSendMessage = async () => {
    if (!(selectedThread || model || message || userSettings)) {
      return;
    }
    try {
      await sendMessage(
        { text: message },
        {
          body: {
            userId: userSettings?.userId,
            threadId: selectedThread,
            model: model?.openrouterslug,
          },
        },
      );
      setMessage("");
    } catch (error) {
      toast.error("Error sending message");
      console.warn("Error sending message: ", error);
    }
  };

  const handleCreateThread = async () => {
    try {
      const thread = await createThread({});
      setSelectedThread(thread);
    } catch (error) {
      toast.error("Error creating thread");
      console.warn("Error creating thread: ", error);
    }
  };

  const handleDeleteThread = async (threadId: Id<"thread">) => {
    try {
      await deleteThread({ threadId });
      toast.success("Thread deleted");

      // If we deleted the currently selected thread, clear selection
      if (selectedThread === threadId) {
        setSelectedThread(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error("Error deleting thread");
      console.warn("Error deleting thread: ", error);
    }
  };

  return (
    <div className="flex flex-row w-full h-full p-2 gap-2">
      <div className="flex flex-col gap-3 w-1/6 min-w-[200px] border-r pr-2">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-lg font-semibold">Your Threads</h1>
        </div>

        <Button onClick={handleCreateThread} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Thread
        </Button>

        {sortedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-muted-foreground">
                Start a new chat to begin
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateThread}
              className="gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Start Chatting
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1 overflow-y-auto flex-1">
            {sortedThreads.map((thread) => (
              <ThreadListItem
                key={thread._id}
                thread={thread}
                isSelected={selectedThread === thread._id}
                onSelect={setSelectedThread}
                onDelete={handleDeleteThread}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-5/6 h-full overflow-y-auto">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-center text-lg font-semibold uppercase tracking-wide">
            Chat
          </h1>
          {selectedThread && <SummaryDialog threadId={selectedThread} />}
        </div>
        <Conversation className="flex-1">
          <ConversationContent>
            {!chatMessages || chatMessages.length === 0 ? (
              <ConversationEmptyState />
            ) : (
              chatMessages.map((message) =>
                message.parts.map((part, index) => {
                  if (part.type === "reasoning") {
                    return (
                      <Reasoning key={index} defaultOpen={false}>
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  }
                  if (part.type.includes("tool-")) {
                    if ("toolCallId" in part) {
                      return (
                        <Tool key={index}>
                          <ToolHeader
                            key={index}
                            title={part.type.split("-").slice(1).join("-")}
                            type={part.type as `tool-${string}`}
                            state={part.state}
                          />
                          <ToolContent>
                            <ToolInput key={index} input={part.input} />
                            <ToolOutput
                              key={index}
                              output={part.output}
                              errorText={part.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                  }
                  if (part.type === "text") {
                    return (
                      <Message from={message.role} key={index}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }
                }),
              )
            )}
            {status === "streaming" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <ChatBaseInput
          onSubmit={handleSendMessage}
          status={status}
          setInput={setMessage}
          input={message}
          model={model}
          setModel={setModel}
        />
      </div>
    </div>
  );
}

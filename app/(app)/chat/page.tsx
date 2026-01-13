"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

export default function ChatPage() {
  const createThread = useMutation(api.thread.mutations.createThread);
  const [selectedThread, setSelectedThread] = useState<Id<"thread"> | null>(
    null,
  );
  const threadMessages = useQuery(
    api.threadMessages.queries.getThreadMessages,
    selectedThread
      ? {
          threadId: selectedThread,
        }
      : "skip",
  );

  const threadTools = useQuery(
    api.threadtools.queries.getThreadTools,
    selectedThread
      ? {
          threadId: selectedThread,
        }
      : "skip",
  );

  // Move this to a convex query
  const combinedData = useMemo(() => {
    return threadMessages?.map((message) => ({
      ...message,
      threadTools: threadTools?.find(
        (tool) => tool.threadMessageId === message._id,
      ),
    }));
  }, [threadMessages, threadTools]);

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
    experimental_throttle: 1000,
  });

  const prevStatusState = useRef(status);

  useEffect(() => {
    const wasStreaming = prevStatusState.current === "streaming";
    prevStatusState.current = status;

    if (
      combinedData &&
      status === "ready" &&
      (wasStreaming || chatMessages.length === 0)
    ) {
      setMessages(
        combinedData.map((message) => ({
          id: message._id,
          role: message.role as "user" | "assistant",
          content: message.content,
          parts: [{ type: "text", text: message.content }],
        })),
      );
    }
  }, [combinedData, setMessages, status, chatMessages.length]);

  const [message, setMessage] = useState("");

  const threads = useQuery(api.thread.queries.getUserThreads);

  const handleSendMessage = async () => {
    if (!selectedThread || !message) {
      return;
    }
    try {
      await sendMessage(
        { text: message },
        { body: { threadId: selectedThread } },
      );
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
        {chatMessages &&
          chatMessages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, index) => {
                switch (part.type) {
                  case "text":
                    return <p key={index}>{part.text}</p>;
                  default:
                    return null;
                }
              })}
              <p>{message.role}</p>
            </div>
          ))}
        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button onClick={handleSendMessage} disabled={status !== "ready"}>
          {status === "streaming" ? (
            <>
              <Spinner /> <span>Generating...</span>
            </>
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  );
}

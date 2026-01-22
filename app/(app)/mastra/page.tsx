"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";

/**
 * Example chat page using Mastra's memory system.
 *
 * Key differences from the manual approach:
 * 1. Uses /api/mastra endpoint which handles message persistence automatically
 * 2. Queries mastra_messages table instead of uiMessages
 * 3. Uses toAISdkV5Messages to convert stored messages to AI SDK format
 * 4. Thread IDs are strings (not Convex document IDs)
 */
export default function MastraChatPage() {
  const userSettings = useQuery(api.userFunctions.fetchUserSettings);
  const userId = userSettings?._id ?? null;

  // For Mastra, thread IDs are strings, not Convex document IDs
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  // Query Mastra's thread table
  const mastraThreads = useQuery(
    api.mastra.queries.getMastraThreads,
    userId ? { resourceId: String(userId) } : "skip",
  );

  // Query messages from Mastra's message table
  const mastraMessages = useQuery(
    api.mastra.queries.getMastraThreadMessages,
    selectedThread ? { threadId: selectedThread } : "skip",
  );

  // useChat hook configured for Mastra endpoint
  const {
    messages: chatMessages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mastra", // Uses Mastra's handleChatStream
    }),
    messages: [],
    experimental_throttle: 100,
  });

  const prevThreadRef = useRef<string | null>(null);

  // Sync messages when thread changes
  useEffect(() => {
    if (
      mastraMessages &&
      selectedThread &&
      selectedThread !== prevThreadRef.current
    ) {
      if (status !== "streaming") {
        prevThreadRef.current = selectedThread;
        try {
          // Convert Mastra messages to AI SDK V5 format
          const convertedMessages = toAISdkV5Messages(mastraMessages);
          setMessages(convertedMessages as UIMessage[]);
        } catch (error) {
          console.error("Error converting messages:", error);
          setMessages([]);
        }
      }
    }
  }, [mastraMessages, setMessages, selectedThread, status]);

  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    if (!selectedThread || !message || !userId) {
      return;
    }
    try {
      await sendMessage(
        { text: message },
        {
          body: {
            threadId: selectedThread,
            userId: String(userId), // Mastra uses this as memory.resource
          },
        },
      );
      setMessage("");
    } catch (error) {
      toast.error("Error sending message");
      console.warn("Error sending message: ", error);
    }
  };

  // Create a new thread (generates a UUID for Mastra)
  const handleCreateThread = () => {
    const newThreadId = crypto.randomUUID();
    setSelectedThread(newThreadId);
    setMessages([]);
    prevThreadRef.current = null;
  };

  return (
    <div className="flex flex-row border-2 border-blue-500 w-full h-full p-2 gap-2">
      <div className="flex flex-col gap-4 border w-1/6 p-2">
        <h1 className="text-center font-bold">Mastra Threads</h1>
        <Button onClick={handleCreateThread}>New Thread</Button>

        {mastraThreads?.map((thread) => (
          <div
            key={thread.id}
            onClick={() => setSelectedThread(thread.id)}
            className="cursor-pointer p-2 rounded hover:bg-gray-100"
          >
            <p
              className={`${selectedThread === thread.id ? "text-blue-500 font-bold" : ""}`}
            >
              {thread.title || "Untitled Thread"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(thread.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}

        {selectedThread && !mastraThreads?.find((t) => t.id === selectedThread) && (
          <div className="p-2 rounded bg-blue-50">
            <p className="text-blue-500 font-bold">New Thread</p>
            <p className="text-xs text-gray-500">(not yet saved)</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border w-5/6 h-full p-2">
        <h1 className="text-center font-bold">
          Chat {selectedThread ? `(${selectedThread.slice(0, 8)}...)` : "(select a thread)"}
        </h1>

        <div className="flex-1 overflow-y-auto space-y-4">
          {chatMessages?.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded ${
                msg.role === "user" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">{msg.role}</p>
              {msg.parts.map((part, index) => {
                switch (part.type) {
                  case "text":
                    return <Streamdown key={index}>{part.text}</Streamdown>;
                  case "data-weather-tool": {
                    const data = part.data as {
                      location: string;
                      status: string;
                      result: string;
                    };
                    return (
                      <div key={index} className="p-2 bg-yellow-50 rounded">
                        {data.status === "running" && (
                          <p>Getting weather for {data.location}...</p>
                        )}
                        {data.status === "completed" && <p>{data.result}</p>}
                        {data.status === "error" && (
                          <p className="text-red-500">
                            Error getting weather for {data.location}
                          </p>
                        )}
                      </div>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              status !== "ready" ||
              !selectedThread ||
              !userId ||
              !message.trim()
            }
          >
            {status === "streaming" ? (
              <>
                <Spinner /> <span>...</span>
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>

        {/* Debug info */}
        <details className="text-xs text-gray-500">
          <summary>Debug Info</summary>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(
              {
                selectedThread,
                userId: userId ? String(userId) : null,
                mastraMessagesCount: mastraMessages?.length ?? 0,
                chatMessagesCount: chatMessages?.length ?? 0,
                status,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}

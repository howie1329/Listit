"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { Spinner } from "@/components/ui/spinner";

export default function ChatPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const generateThreadResponse = useAction(
    api.ai.actions.generateThreadResponse,
  );
  const threads = useQuery(api.thread.queries.getUserThreads);
  const [selectedThread, setSelectedThread] = useState<Id<"thread"> | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const messages = useQuery(
    api.threadMessages.queries.getThreadMessages,
    selectedThread
      ? {
          threadId: selectedThread,
        }
      : "skip",
  );
  const createThread = useMutation(api.thread.mutations.createThread);
  const handleCreateThread = async () => {
    const thread = await createThread({
      title: "New Thread",
    });
    setSelectedThread(thread);
  };
  const handleSendMessage = async () => {
    if (!selectedThread || !message) {
      return;
    }
    setIsGenerating(true);
    await generateThreadResponse({
      threadId: selectedThread,
      usersMessage: message,
    });
    setIsGenerating(false);
    setMessage("");
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
        {messages &&
          messages.map((message) => (
            <div key={message._id}>
              <p>{message.content}</p>
              <p>{message.role}</p>
              <p>{message.updatedAt}</p>
            </div>
          ))}
        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button onClick={handleSendMessage} disabled={isGenerating}>
          {isGenerating ? (
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

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export type SummaryMessageRange = {
  fromMessageId: string;
  toMessageId: string;
  messageCount: number;
  fromIndex: number;
  toIndex: number;
  tokenCount: number;
};

export async function getMessagesWithSummaries(
  convex: ConvexHttpClient,
  threadId: string,
  minMessages: number = 4,
  maxMessages: number = 10,
) {
  const allMessages = await convex.query(api.uiMessages.queries.getUIMessages, {
    threadId: threadId as any,
  });

  const { summaries } = await convex.query(
    api.threadSummaries.queries.getLatestSummariesForContext,
    { threadId: threadId as any },
  );

  let startIndex = 0;
  if (summaries.length > 0) {
    const lastSummary = summaries[0];
    const lastSummarizedIndex = allMessages.findIndex(
      (m) => m._id === lastSummary.messageRange.toMessageId,
    );
    if (lastSummarizedIndex !== -1) {
      startIndex = lastSummarizedIndex + 1;
    }
  }

  const messagesAfterSummary = allMessages.slice(startIndex);
  const messagesToInclude = Math.max(
    minMessages,
    Math.min(maxMessages, messagesAfterSummary.length),
  );

  const contextMessages = allMessages.slice(-messagesToInclude);
  const pendingTokenCount = messagesAfterSummary.reduce((acc, message) => {
    const text = message.parts
      .filter(
        (part: any) => part.type === "text" || part.type.startsWith("tool-"),
      )
      .map(
        (part: any) => part.text || JSON.stringify(part.output || part.input),
      )
      .join(" ");
    return acc + estimateTokenCount(text);
  }, 0);

  const messageRange: SummaryMessageRange = {
    fromMessageId: messagesAfterSummary[0]?._id ?? "",
    toMessageId:
      messagesAfterSummary[messagesAfterSummary.length - 1]?._id ?? "",
    messageCount: messagesAfterSummary.length,
    fromIndex: startIndex,
    toIndex: allMessages.length - 1,
    tokenCount: pendingTokenCount,
  };

  return {
    contextMessages,
    summaries,
    pendingMessages: messagesAfterSummary,
    pendingMessageCount: messagesAfterSummary.length,
    pendingTokenCount,
    messageRange,
  };
}

export function estimateTokenCount(text: string): number {
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.ceil(wordCount * 1.3);
}

export async function triggerBackgroundSummarization(
  convex: ConvexHttpClient,
  threadId: string,
  messageRange: SummaryMessageRange,
) {
  const messages = await convex.query(api.uiMessages.queries.getUIMessages, {
    threadId: threadId as any,
  });
  const messagesToSummarize = messages.slice(
    messageRange.fromIndex,
    messageRange.toIndex + 1,
  );

  if (messagesToSummarize.length < 4) return;

  const summaryId = await convex.mutation(
    api.threadSummaries.mutations.createSummary,
    {
      threadId: threadId as any,
      triggerType: "auto",
      messageRange: {
        fromMessageId: messagesToSummarize[0]._id,
        toMessageId: messagesToSummarize[messagesToSummarize.length - 1]._id,
        messageCount: messagesToSummarize.length,
        fromIndex: messageRange.fromIndex,
        toIndex: messageRange.toIndex,
      },
      sourceTokenCount:
        messageRange.tokenCount ||
        estimateTokenCount(
          messagesToSummarize
            .map((message) =>
              message.parts
                .filter((part: any) => part.type === "text")
                .map((part: any) => part.text)
                .join(" "),
            )
            .join(" "),
        ),
    },
  );

  await convex.action(api.threadSummaries.actions.generateSummary, {
    summaryId,
    threadId: threadId as any,
  });

  console.log(
    `[Summary] Auto-triggered for thread ${threadId}, summary ${summaryId}`,
  );
}

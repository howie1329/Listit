"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  Loader2,
  Clock,
  DollarSign,
} from "lucide-react";

interface SummaryDialogProps {
  threadId: Id<"thread">;
}

const formatCost = (cost?: number | null) => {
  if (!cost) return "Free";
  return `$${cost.toFixed(6)}`;
};

const statusBadge = (status?: string) => {
  switch (status) {
    case "generating":
      return (
        <Badge variant="outline" className="grid auto-cols-max gap-1">
          <Sparkles className="h-3 w-3 animate-spin" />
          Generating...
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="grid auto-cols-max gap-1">
          <Loader2 className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "partial":
      return (
        <Badge variant="outline" className="grid auto-cols-max gap-1">
          Partial
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="grid auto-cols-max gap-1">
          Complete
        </Badge>
      );
  }
};

export function SummaryDialog({ threadId }: SummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const summaries = useQuery(api.threadSummaries.queries.getThreadSummaries, {
    threadId,
  });
  const isGenerating = useQuery(
    api.threadSummaries.queries.isSummarizationInProgress,
    { threadId },
  );
  const manualSummarize = useMutation(
    api.threadSummaries.mutations.manualSummarize,
  );

  const latestSummary = summaries?.[0];
  const previousSummary = summaries?.[1];

  const handleManualSummarize = async () => {
    try {
      const result = await manualSummarize({ threadId });
      if (result.success) {
        toast.success("Generating summary...");
      } else {
        toast.error(result.reason ?? "Unable to start summarization");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to trigger summarization");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Summaries
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Conversation Summary</DialogTitle>
            {statusBadge(latestSummary?.status)}
          </div>
          <DialogDescription>
            View the latest structured summary with token + cost metadata.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {isGenerating && (
            <div className="rounded-lg border border-yellow-200/80 bg-yellow-50/80 p-3 text-sm text-yellow-600">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" />
                Generating summary...
              </div>
              <p className="text-xs text-yellow-700/70">
                This may take a few moments. The dialog will update
                automatically when complete.
              </p>
            </div>
          )}

          {!latestSummary && !isGenerating && (
            <div className="rounded-lg border border-muted/40 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
              No summary generated yet.
            </div>
          )}

          {latestSummary?.status === "failed" && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {latestSummary.errorInfo?.message ?? "Summary generation failed"}
            </div>
          )}

          {latestSummary && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(latestSummary.createdAt).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCost(latestSummary.costUsd)}
                </span>
                <span className="flex items-center gap-1">
                  💬 {latestSummary.sourceTokenCount.toLocaleString()} tokens
                </span>
                <Badge variant="outline" className="py-0.5">
                  {latestSummary.modelUsed}
                </Badge>
              </div>

              <div className="space-y-2 rounded-xl border border-border/70 p-3">
                <h3 className="text-sm font-semibold">Overview</h3>
                <p className="text-sm leading-relaxed text-foreground">
                  {latestSummary.summary.overview}
                </p>
              </div>

              {latestSummary.summary.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Key Points</h4>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {latestSummary.summary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {latestSummary.summary.decisions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Decisions</h4>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {latestSummary.summary.decisions.map((decision, index) => (
                      <li key={index}>{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              {latestSummary.summary.actionItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Action Items</h4>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {latestSummary.summary.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {latestSummary.summary.openQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Open Questions</h4>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {latestSummary.summary.openQuestions.map(
                      (question, index) => (
                        <li key={index}>{question}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              {latestSummary.summary.toolResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Tool Results</h4>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    {latestSummary.summary.toolResults.map((tool, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-border/60 bg-muted/10 p-3"
                      >
                        <div className="flex items-center justify-between text-xs text-foreground">
                          <span>{tool.toolName}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {tool.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tool.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {previousSummary && (
            <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
                Previous Summary Snapshot
              </p>
              <p className="text-sm">{previousSummary.summary.overview}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {latestSummary
              ? `Updated ${new Date(latestSummary.createdAt).toLocaleString()}`
              : "Tailored summaries appear after 10 messages"}
          </span>
          <Button
            onClick={handleManualSummarize}
            disabled={isGenerating}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Summarize Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

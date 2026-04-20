"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { type AiInsightError, generatePortfolioInsight } from "@/actions/ai";
import type { AiInsight } from "@/db/schema";
import { formatDate } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import { AIInsightErrorState } from "./AIInsightErrorState";

interface Props {
  initialInsight: AiInsight | null;
}

export function AIInsightCard({ initialInsight }: Props) {
  const [insight, setInsight] = useState<AiInsight | null>(initialInsight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AiInsightError | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    setShowDetails(false);

    const result = await generatePortfolioInsight();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setInsight({
        id: "temp",
        snapshotAt: new Date(),
        prompt: "",
        response: result.data,
        model: "claude-sonnet-4-20250514",
        createdAt: new Date(),
      });
    }

    setLoading(false);
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-medium text-muted-foreground">
            AI portfolio insight
          </h3>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          {loading ? "Analysing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <AIInsightErrorState
          error={error}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((current) => !current)}
        />
      )}

      {!insight && !loading && !error && (
        <div className="rounded-md bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No insight generated yet.
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Generate your first insight →
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-2.5 animate-pulse">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      )}

      {insight && !loading && (
        <>
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground">
            <ReactMarkdown>{insight.response}</ReactMarkdown>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Generated {formatDate(insight.createdAt)} · {insight.model} · Not
            financial advice.
          </p>
        </>
      )}
    </div>
  );
}

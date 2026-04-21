"use client";

import { AlertTriangle, Clock3, RotateCcw, Wrench } from "lucide-react";
import type { AiInsightError } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  error: AiInsightError;
  loading: boolean;
  countdownSeconds: number | null;
  autoRetryEnabled: boolean;
  onAutoRetryChange: (enabled: boolean) => void;
  onRetry: () => void;
}

function formatRetryDelay(seconds: number | null, autoRetryEnabled: boolean) {
  if (seconds === null) return null;
  if (!autoRetryEnabled) {
    return seconds === 1
      ? "Retry available in about 1 second."
      : `Retry available in about ${seconds} seconds.`;
  }
  if (seconds === 0) return "Retrying now…";
  return seconds === 1
    ? "Auto retry in 1 second."
    : `Auto retry in ${seconds} seconds.`;
}

export function AIInsightErrorState({
  error,
  loading,
  countdownSeconds,
  autoRetryEnabled,
  onAutoRetryChange,
  onRetry,
}: Props) {
  const retryMessage = formatRetryDelay(countdownSeconds, autoRetryEnabled);

  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-border/50 px-5 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{error.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {error.message}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 px-5 py-4">
        {(error.suggestion || retryMessage) && (
          <div className="grid gap-2.5 md:grid-cols-2">
            {error.suggestion && (
              <div className="rounded-md bg-muted/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  <Wrench className="h-3 w-3" />
                  What to do
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {error.suggestion}
                </p>
              </div>
            )}
            {retryMessage && (
              <div className="rounded-md bg-muted/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  Retry window
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {retryMessage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {loading ? "Retrying…" : "Retry now"}
          </Button>
          {countdownSeconds !== null && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={autoRetryEnabled}
                onCheckedChange={(checked) =>
                  onAutoRetryChange(Boolean(checked))
                }
                className="h-3.5 w-3.5"
              />
              Auto retry
            </label>
          )}
        </div>

        {/* Details */}
        {error.details && error.details.length > 0 && (
          <div className="rounded-md bg-muted/50 p-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Current issue
            </div>
            <ul className="space-y-1.5">
              {error.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-baseline gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-500" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/50 px-5 py-2.5">
        <span className="rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {error.statusCode ? `HTTP ${error.statusCode}` : "Provider error"}
        </span>
        <p className="text-[11px] text-muted-foreground">
          Full provider errors are in server logs.
        </p>
      </div>
    </div>
  );
}

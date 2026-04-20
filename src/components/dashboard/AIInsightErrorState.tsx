"use client";

import { AlertTriangle, Clock3, Wrench } from "lucide-react";
import type { AiInsightError } from "@/actions/ai";

interface Props {
  error: AiInsightError;
  loading: boolean;
  countdownSeconds: number | null;
  autoRetryEnabled: boolean;
  onAutoRetryChange: (enabled: boolean) => void;
  onRetry: () => void;
}

function formatRetryDelay(seconds: number | null, autoRetryEnabled: boolean) {
  if (seconds === null) {
    return null;
  }

  if (!autoRetryEnabled) {
    return seconds === 1
      ? "Retry available in about 1 second."
      : `Retry available in about ${seconds} seconds.`;
  }

  if (seconds === 0) {
    return "Retrying now…";
  }

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
    <div className="overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-background to-rose-50 shadow-sm dark:border-amber-900/60 dark:from-amber-950/40 dark:via-background dark:to-rose-950/20">
      <div className="border-b border-amber-200/70 px-4 py-3 dark:border-amber-900/60">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {error.title}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {error.message}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {(error.suggestion || retryMessage) && (
          <div className="grid gap-3 md:grid-cols-2">
            {error.suggestion && (
              <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5" />
                  What to do
                </div>
                <p className="text-sm leading-6 text-foreground/90">
                  {error.suggestion}
                </p>
              </div>
            )}

            {retryMessage && (
              <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Retry window
                </div>
                <p className="text-sm leading-6 text-foreground/90">
                  {retryMessage}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400"
          >
            {loading ? "Retrying…" : "Retry now"}
          </button>

          {countdownSeconds !== null && (
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={autoRetryEnabled}
                onChange={(event) => onAutoRetryChange(event.target.checked)}
                className="h-4 w-4 rounded border-border text-amber-600 focus:ring-amber-500"
              />
              Auto retry
            </label>
          )}
        </div>

        {error.details && error.details.length > 0 && (
          <div className="rounded-lg border border-border/70 bg-background/80 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current issue
            </div>
            <ul className="space-y-2 text-sm leading-6 text-foreground/90">
              {error.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-border/70 pt-1">
          <div className="text-xs text-muted-foreground">
            {error.statusCode ? `HTTP ${error.statusCode}` : "Provider error"}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Developer note: full provider errors are still available in the
            server logs.
          </p>
        </div>
      </div>
    </div>
  );
}

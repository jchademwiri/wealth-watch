"use client";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock3,
  Wrench,
} from "lucide-react";
import type { AiInsightError } from "@/actions/ai";
import { cn } from "@/lib/utils";

interface Props {
  error: AiInsightError;
  showDetails: boolean;
  onToggleDetails: () => void;
}

function formatRetryDelay(value?: string) {
  if (!value) {
    return null;
  }

  const seconds = Number.parseInt(value.replace(/\D/g, ""), 10);
  if (Number.isNaN(seconds) || seconds <= 0) {
    return value;
  }

  return seconds === 1
    ? "Try again in about 1 second."
    : `Try again in about ${seconds} seconds.`;
}

export function AIInsightErrorState({
  error,
  showDetails,
  onToggleDetails,
}: Props) {
  const retryMessage = formatRetryDelay(error.retryAfter);

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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-1">
          <div className="text-xs text-muted-foreground">
            {error.statusCode ? `HTTP ${error.statusCode}` : "Provider error"}
          </div>

          {error.technicalDetails && (
            <button
              type="button"
              onClick={onToggleDetails}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {showDetails
                ? "Hide technical details"
                : "Show technical details"}
              {showDetails ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {showDetails && error.technicalDetails && (
          <pre
            className={cn(
              "max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-3 text-[11px] leading-5 text-slate-100",
              "dark:border-slate-800",
            )}
          >
            {error.technicalDetails}
          </pre>
        )}
      </div>
    </div>
  );
}

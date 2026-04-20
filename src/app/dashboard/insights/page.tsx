import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAllInsights } from "@/actions/ai";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDate } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const insights = await getAllInsights();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">AI Insights</h1>
        <p className="text-sm text-muted-foreground">
          Full history of AI-generated portfolio analyses.
        </p>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No insights yet."
          description="AI-generated insights will appear here once you start saving portfolio snapshots."
        />
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-lg border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-medium">
                  {formatDate(insight.createdAt)}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {insight.model}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-sm">
                <ReactMarkdown>{insight.response}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

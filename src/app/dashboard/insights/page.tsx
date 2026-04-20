import { getAllInsights } from '@/actions/ai'
import { formatDate } from '@/lib/formatting'
import ReactMarkdown from 'react-markdown'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const insights = await getAllInsights()

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">AI Insights</h1>
        <p className="text-sm text-muted-foreground">
          Full history of AI-generated portfolio analyses.
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No insights yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a snapshot or click Refresh on the dashboard to generate your first insight.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => (
            <div key={insight.id} className="rounded-lg border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-medium">{formatDate(insight.createdAt)}</span>
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
  )
}

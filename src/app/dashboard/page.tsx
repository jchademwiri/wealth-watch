import { Suspense } from "react";
import { Camera } from "lucide-react";
import Link from "next/link";
import { getPortfolioSummary } from "@/lib/portfolio";
import { getLatestInsight } from "@/actions/ai";
import { getDeposits } from "@/actions/deposits";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { AllocationDonut } from "@/components/dashboard/AllocationDonut";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { formatDate, formatZAR } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, latestInsight, allDeposits] = await Promise.all([
    getPortfolioSummary(),
    getLatestInsight(),
    getDeposits(),
  ]);

  // Check if we have a snapshot this week
  const latestSnap = summary.snapshots.at(-1);
  const daysSinceSnap = latestSnap
    ? Math.floor(
        (Date.now() - new Date(latestSnap.snapshotAt).getTime()) / 86400000,
      )
    : null;
  const needsUpdate = daysSinceSnap === null || daysSinceSnap >= 7;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Portfolio</h1>
          {latestSnap && (
            <p className="text-sm text-muted-foreground">
              Last updated {formatDate(latestSnap.snapshotAt)}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/snapshots/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Camera className="h-4 w-4" />
          Record snapshot
        </Link>
      </div>

      {needsUpdate && (
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {daysSinceSnap === null
              ? "No snapshots yet — add your first portfolio update."
              : `Your last snapshot was ${daysSinceSnap} days ago. Time for a weekly update.`}
          </p>
          <Link
            href="/dashboard/snapshots/new"
            className="ml-4 flex-shrink-0 text-sm font-medium text-amber-700 hover:underline dark:text-amber-300"
          >
            Update now →
          </Link>
        </div>
      )}

      <MetricCards
        totalDeposited={summary.totalDeposited}
        currentValue={summary.currentValue}
        pnl={summary.pnl}
        returnPct={summary.returnPct}
        twrr={summary.twrr}
      />

      <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
        <div className="h-full md:col-span-2">
          <PortfolioChart snapshots={summary.snapshots} />
        </div>
        <div className="h-full">
          <AllocationDonut assets={summary.assets} />
        </div>
      </div>

      <HoldingsTable
        assets={summary.assets}
        totalValue={summary.currentValue}
        totalDeposited={summary.totalDeposited}
      />

      <AIInsightCard initialInsight={latestInsight} />

      {/* Recent Deposits */}
      <div className="rounded-md border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Recent deposits
          </h3>
          <Link
            href="/dashboard/deposits"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {allDeposits.slice(0, 5).map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-sm flex-shrink-0"
                  style={{ background: (d as any).asset?.color ?? "#888" }}
                />
                <span className="text-muted-foreground">
                  {(d as any).asset?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(d.depositedAt)}
                </span>
              </div>
              <span className="font-mono font-medium">
                {formatZAR(parseFloat(d.amount))}
              </span>
            </div>
          ))}
          {allDeposits.length === 0 && (
            <p className="text-sm text-muted-foreground">No deposits yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

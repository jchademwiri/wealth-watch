import { Plus } from "lucide-react";
import Link from "next/link";
import { getPortfolioSnapshots } from "@/actions/snapshots";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDate, formatPct, formatZAR } from "@/lib/formatting";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SnapshotsPage() {
  const snapshots = await getPortfolioSnapshots();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Portfolio snapshots</h1>
          <p className="text-sm text-muted-foreground">
            History of all portfolio value snapshots
          </p>
        </div>
        <Link
          href="/dashboard/snapshots/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New snapshot
        </Link>
      </div>

      {snapshots.length === 0 ? (
        <EmptyState
          title="No snapshots recorded yet."
          actionHref="/dashboard/snapshots/new"
          actionLabel="Create your first snapshot →"
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total value
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Deposited
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    P&L
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Return
                  </th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap, idx) => {
                  const totalValue = parseFloat(snap.totalValue);
                  const totalDeposited = parseFloat(snap.totalDeposited);
                  const pnl = parseFloat(snap.pnl);
                  const pnlPct = parseFloat(snap.pnlPct);
                  const olderSnap =
                    idx < snapshots.length - 1 ? snapshots[idx + 1] : null;
                  const prevValue = olderSnap
                    ? parseFloat(olderSnap.totalValue)
                    : null;
                  const weekChange = prevValue ? totalValue - prevValue : null;

                  return (
                    <tr
                      key={snap.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {formatDate(snap.snapshotAt)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatZAR(totalValue)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {formatZAR(totalDeposited)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-mono",
                          pnl >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-500 dark:text-red-400",
                        )}
                      >
                        {pnl >= 0 ? "+" : ""}
                        {formatZAR(pnl)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: pnl >= 0 ? "#EAF3DE" : "#FCEBEB",
                            color: pnl >= 0 ? "#3B6D11" : "#A32D2D",
                          }}
                        >
                          {formatPct(pnlPct)}
                        </span>
                        {weekChange !== null && (
                          <div
                            className={cn(
                              "text-xs mt-1",
                              weekChange >= 0
                                ? "text-emerald-600"
                                : "text-red-500",
                            )}
                          >
                            {weekChange >= 0 ? "+" : ""}
                            {formatZAR(weekChange)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

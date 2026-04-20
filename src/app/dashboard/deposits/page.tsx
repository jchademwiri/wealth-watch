import { Plus } from "lucide-react";
import Link from "next/link";
import { getDeposits, getTotalDeposited } from "@/actions/deposits";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDate, formatZAR } from "@/lib/formatting";
import { DeleteDepositButton } from "./DeleteDepositButton";

export const dynamic = "force-dynamic";

export default async function DepositsPage() {
  const [deposits, totalDeposited] = await Promise.all([
    getDeposits(),
    getTotalDeposited(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Deposits</h1>
          <p className="text-sm text-muted-foreground">
            Total invested:{" "}
            <span className="font-mono font-medium text-foreground">
              {formatZAR(totalDeposited)}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/deposits/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Log deposit
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        {deposits.length === 0 ? (
          <EmptyState
            title="No deposits yet."
            actionHref="/dashboard/deposits/new"
            actionLabel="Log your first deposit →"
            className="border-0 shadow-none"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Asset
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                    Notes
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit) => {
                  const asset = deposit as typeof deposit & {
                    asset?: { color?: string; name?: string };
                  };

                  return (
                    <tr
                      key={deposit.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(deposit.depositedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 flex-shrink-0 rounded-full"
                            style={{
                              background: asset.asset?.color ?? "#888",
                            }}
                          />
                          {asset.asset?.name ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatZAR(parseFloat(deposit.amount))}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {deposit.notes ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DeleteDepositButton id={deposit.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {formatZAR(totalDeposited)}
                  </td>
                  <td colSpan={2} className="hidden md:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

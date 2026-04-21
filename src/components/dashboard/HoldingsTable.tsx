import { formatZAR, formatPct, pnlBadgeClass } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import type { AssetWithLatestSnapshot } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  assets: AssetWithLatestSnapshot[];
  totalValue: number;
  totalDeposited: number;
}

export function HoldingsTable({ assets, totalValue, totalDeposited }: Props) {
  const totalPnl = totalValue - totalDeposited;
  const totalReturn =
    totalDeposited > 0
      ? ((totalValue - totalDeposited) / totalDeposited) * 100
      : 0;

  return (
    <div className="rounded-md border bg-card">
      <div className="border-b p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Holdings breakdown
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Asset
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Deposited
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                P&L
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Return
              </TableHead>
              <TableHead className="hidden px-4 py-2.5 md:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const weight =
                totalValue > 0 ? (asset.latestValue / totalValue) * 100 : 0;

              return (
                <TableRow
                  key={asset.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                        style={{ background: asset.color }}
                      />
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.ticker && (
                          <p className="text-xs text-muted-foreground">
                            {asset.ticker}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono">
                    {asset.totalDeposited > 0 ? (
                      formatZAR(asset.totalDeposited)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono">
                    {formatZAR(asset.latestValue)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-4 py-3 text-right font-mono",
                      asset.pnl >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400",
                    )}
                  >
                    {asset.totalDeposited > 0 ? (
                      `${asset.pnl >= 0 ? "+" : ""}${formatZAR(asset.pnl)}`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {asset.totalDeposited > 0 ? (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium",
                          pnlBadgeClass(asset.returnPct),
                        )}
                      >
                        {formatPct(asset.returnPct)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-sm bg-muted">
                        <div
                          className="h-full rounded-sm transition-all"
                          style={{
                            width: `${weight}%`,
                            background: asset.color,
                          }}
                        />
                      </div>
                      <span className="w-9 text-right text-xs text-muted-foreground">
                        {weight.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="border-t bg-muted/30">
              <TableCell className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total
              </TableCell>
              <TableCell className="px-4 py-3 text-right font-mono font-medium">
                {formatZAR(totalDeposited)}
              </TableCell>
              <TableCell className="px-4 py-3 text-right font-mono font-medium">
                {formatZAR(totalValue)}
              </TableCell>
              <TableCell
                className={cn(
                  "px-4 py-3 text-right font-mono font-medium",
                  totalPnl >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400",
                )}
              >
                {totalPnl >= 0 ? "+" : ""}
                {formatZAR(totalPnl)}
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-medium",
                    pnlBadgeClass(totalReturn),
                  )}
                >
                  {formatPct(totalReturn)}
                </span>
              </TableCell>
              <TableCell className="hidden px-4 py-3 md:table-cell" />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

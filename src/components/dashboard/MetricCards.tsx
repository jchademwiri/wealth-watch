import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import {
  formatZAR,
  formatPct,
  pnlColor,
  pnlBadgeClass,
} from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface MetricCardsProps {
  totalDeposited: number;
  currentValue: number;
  pnl: number;
  returnPct: number;
  twrr: number;
}

export function MetricCards({
  totalDeposited,
  currentValue,
  pnl,
  returnPct,
  twrr,
}: MetricCardsProps) {
  const TrendIcon =
    returnPct > 1 ? TrendingUp : returnPct < -1 ? TrendingDown : Minus;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard
        label="Total deposited"
        value={formatZAR(totalDeposited)}
        icon={<Wallet className="h-4 w-4" />}
        sub="your actual money in"
      />
      <MetricCard
        label="Current value"
        value={formatZAR(currentValue)}
        icon={<PiggyBank className="h-4 w-4" />}
        sub="latest snapshot total"
      />
      <MetricCard
        label="Unrealised P&L"
        value={formatZAR(Math.abs(pnl))}
        valuePrefix={pnl >= 0 ? "+R" : "-R"}
        valueRaw={pnl}
        icon={<TrendIcon className="h-4 w-4" />}
        sub={`${formatPct(returnPct)} simple return`}
        highlight
      />
      <MetricCard
        label="TWRR"
        value={formatPct(twrr)}
        icon={<BarChart3 className="h-4 w-4" />}
        sub="time-weighted return"
        valueRaw={twrr}
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  valuePrefix?: string;
  valueRaw?: number;
  icon: React.ReactNode;
  sub: string;
  highlight?: boolean;
}

function MetricCard({
  label,
  value,
  valueRaw,
  icon,
  sub,
  highlight,
}: MetricCardProps) {
  const colored = valueRaw !== undefined;
  return (
    <div className="rounded-md bg-muted/50 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={cn(
          "font-mono text-2xl font-medium",
          colored ? pnlColor(valueRaw!) : "text-foreground",
        )}
      >
        {value}
      </p>
      {highlight && valueRaw !== undefined ? (
        <span
          className={cn(
            "mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium",
            pnlBadgeClass(valueRaw),
          )}
        >
          {sub}
        </span>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

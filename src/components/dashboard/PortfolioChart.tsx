"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatDateShort, formatZAR } from "@/lib/formatting";
import type { PortfolioSnapshot } from "@/db/schema";

interface Props {
  snapshots: PortfolioSnapshot[];
}

export function PortfolioChart({ snapshots }: Props) {
  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.snapshotAt).getTime() - new Date(b.snapshotAt).getTime(),
  );

  const data = sorted.map((s) => ({
    date: formatDateShort(s.snapshotAt),
    deposited: parseFloat(s.totalDeposited),
    value: parseFloat(s.totalValue),
    pnl: parseFloat(s.pnl),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const dep = payload.find((p: any) => p.dataKey === "deposited")?.value ?? 0;
    const val = payload.find((p: any) => p.dataKey === "value")?.value ?? 0;
    const diff = val - dep;
    return (
      <div className="rounded-sm border bg-background p-3 text-sm shadow-md">
        <p className="mb-2 font-medium">{label}</p>
        <p className="text-muted-foreground">
          Deposited:{" "}
          <span className="font-mono text-foreground">{formatZAR(dep)}</span>
        </p>
        <p className="text-muted-foreground">
          Value:{" "}
          <span className="font-mono text-foreground">{formatZAR(val)}</span>
        </p>
        <p
          className={`mt-1 font-mono text-xs font-medium ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {diff >= 0 ? "+" : ""}
          {formatZAR(diff)}
        </p>
      </div>
    );
  };

  const hasData = data.length > 0;

  return (
    <div className="h-full rounded-sm border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Deposited vs portfolio value
      </h3>
      {hasData ? (
        <>
          <div className="mb-3 flex gap-4">
            <LegendItem
              color="#378ADD"
              label="Total deposited"
              dashed={false}
              filled
            />
            <LegendItem color="#E24B4A" label="Portfolio value" dashed />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            >
              <defs>
                <linearGradient id="depositedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#378ADD" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `R${(v / 1000).toFixed(1)}k`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="deposited"
                stroke="#378ADD"
                strokeWidth={2}
                fill="url(#depositedGrad)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#E24B4A"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ fill: "#E24B4A", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-sm border border-dashed border-border/70 bg-muted/50 text-center text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">
              No portfolio snapshots available.
            </p>
            <p className="mt-2 max-w-xs">
              Snapshots will appear here once you save your first portfolio
              snapshot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
  filled,
}: {
  color: string;
  label: string;
  dashed: boolean;
  filled?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="inline-block h-0.5 w-5 rounded"
        style={{
          background: filled ? color : "transparent",
          borderTop: dashed ? `2px dashed ${color}` : `2px solid ${color}`,
          height: dashed ? 0 : undefined,
          backgroundColor: filled ? color : undefined,
        }}
      />
      {label}
    </span>
  );
}

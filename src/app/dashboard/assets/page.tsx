import { Archive, Plus } from "lucide-react";
import Link from "next/link";
import { getAssets } from "@/actions/assets";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ToggleAssetButton } from "./ToggleAssetButton";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  etf: "ETF",
  stock: "Stock",
  crypto: "Crypto",
  unit_trust: "Unit Trust",
  cash: "Cash",
  bond: "Bond",
  reit: "REIT",
  other: "Other",
};

const BROKER_LABELS: Record<string, string> = {
  easy_equities: "EasyEquities",
  luno: "Luno",
  satrix: "Satrix",
  allan_gray: "Allan Gray",
  tfg: "TFG",
  absa: "ABSA",
  fnb: "FNB",
  nedbank: "Nedbank",
  standard_bank: "Standard Bank",
  other: "Other",
};

export default async function AssetsPage() {
  const assets = await getAssets();
  const active = assets.filter((a) => a.isActive);
  const archived = assets.filter((a) => !a.isActive);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/70">
            Portfolio setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Assets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active.length} active · {archived.length} archived
          </p>
        </div>
        <Link
          href="/dashboard/assets/new"
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-md px-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md",
          )}
        >
          <Plus className="h-4 w-4" />
          Add asset
        </Link>
      </div>

      <Card className="overflow-hidden bg-card/90">
        {active.length === 0 && (
          <EmptyState
            title="No assets yet."
            actionHref="/dashboard/assets/new"
            actionLabel="Add your first asset →"
            className="border-0 shadow-none"
          />
        )}
        <div className="divide-y divide-border/70">
          {active.map((asset) => (
            <div
              key={asset.id}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/35"
            >
              <span
                className="h-3.5 w-3.5 flex-shrink-0 rounded-full shadow-[0_0_0_5px_color-mix(in_oklch,var(--color-muted)_82%,transparent)]"
                style={{ background: asset.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-medium tracking-tight text-foreground">
                    {asset.name}
                  </p>
                  <Badge variant="secondary">{TYPE_LABELS[asset.type]}</Badge>
                  {asset.ticker && (
                    <Badge variant="outline">{asset.ticker}</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Held with {BROKER_LABELS[asset.broker]}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                <Link
                  href={`/dashboard/assets/${asset.id}`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "rounded-lg text-muted-foreground",
                  )}
                >
                  Edit
                </Link>
                <ToggleAssetButton id={asset.id} isActive={true} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {archived.length > 0 && (
        <div className="mt-8">
          <Card className="overflow-hidden border-dashed bg-card/70">
            <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Archived assets</CardTitle>
              </div>
              <CardDescription>
                {archived.length} kept for history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {archived.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span
                      className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                      style={{ background: asset.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{asset.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {TYPE_LABELS[asset.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {BROKER_LABELS[asset.broker]}
                        </span>
                      </div>
                    </div>
                    <ToggleAssetButton id={asset.id} isActive={false} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

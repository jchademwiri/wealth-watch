import { db } from "@/db";
import { eq } from "drizzle-orm";
import { assets, snapshots } from "@/db/schema";
import {
  calcTotalDeposited,
  calcPnL,
  calcReturnPct,
  calcTWRR,
  monthsBetween,
  calcRecentTrend,
} from "@/lib/calculations";
import type { PortfolioSummary, AssetWithLatestSnapshot } from "@/types";

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  try {
    const [allDeposits, allPortfolioSnaps, activeAssets, allSnapshots] =
      await Promise.all([
        db.query.deposits.findMany({
          limit: 1000,
        }),
        db.query.portfolioSnapshots.findMany({
          orderBy: (p, { asc }) => [asc(p.snapshotAt)],
          limit: 500,
        }),
        db.query.assets.findMany({
          where: eq(assets.isActive, true),
          orderBy: (a, { asc }) => [asc(a.sortOrder)],
          limit: 100,
        }),
        db.query.snapshots.findMany({
          limit: 1000,
        }),
      ]);

    const totalDeposited = calcTotalDeposited(allDeposits);

    // Latest value per asset — filter in memory
    const latestPerAsset: Record<string, number> = {};
    for (const asset of activeAssets) {
      const assetSnaps = allSnapshots
        .filter((s) => s.assetId === asset.id)
        .sort(
          (a, b) =>
            new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime(),
        );
      latestPerAsset[asset.id] = assetSnaps[0]
        ? parseFloat(assetSnaps[0].value)
        : 0;
    }

    // Build assets with latest values
    const assetsWithValues: AssetWithLatestSnapshot[] = activeAssets.map(
      (asset) => {
        const latestValue = latestPerAsset[asset.id] ?? 0;
        const assetDeposited = allDeposits
          .filter((d) => d.assetId === asset.id)
          .reduce((s, d) => s + parseFloat(d.amount), 0);
        const pnl = calcPnL(latestValue, assetDeposited);
        const returnPct = calcReturnPct(latestValue, assetDeposited);

        return {
          ...asset,
          latestValue,
          totalDeposited: assetDeposited,
          pnl,
          returnPct,
        };
      },
    );

    const currentValue = assetsWithValues.reduce(
      (s, a) => s + a.latestValue,
      0,
    );
    const pnl = calcPnL(currentValue, totalDeposited);
    const returnPct = calcReturnPct(currentValue, totalDeposited);
    const twrr = calcTWRR(allPortfolioSnaps, allDeposits);

    return {
      totalDeposited,
      currentValue,
      pnl,
      returnPct,
      twrr,
      assets: assetsWithValues,
      snapshots: allPortfolioSnaps,
    };
  } catch (error) {
    console.error("Failed to load portfolio summary:", error);
    return {
      totalDeposited: 0,
      currentValue: 0,
      pnl: 0,
      returnPct: 0,
      twrr: 0,
      assets: [],
      snapshots: [],
    };
  }
}

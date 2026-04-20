'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { snapshots, portfolioSnapshots } from '@/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { calcDepositedAsOf, calcPnL, calcReturnPct } from '@/lib/calculations'

export async function getPortfolioSnapshots() {
  try {
    return await db.query.portfolioSnapshots.findMany({
      orderBy: (p, { asc }) => [asc(p.snapshotAt)],
    })
  } catch (error) {
    console.error('Failed to load portfolio snapshots:', error)
    return []
  }
}

export async function getLatestPortfolioSnapshot() {
  try {
    return await db.query.portfolioSnapshots.findFirst({
      orderBy: (p, { desc }) => [desc(p.snapshotAt)],
    })
  } catch (error) {
    console.error('Failed to load latest portfolio snapshot:', error)
    return null
  }
}

export async function getSnapshotsByAsset(assetId: string) {
  try {
    return await db.query.snapshots.findMany({
      where: eq(snapshots.assetId, assetId),
      orderBy: (s, { asc }) => [asc(s.snapshotAt)],
    })
  } catch (error) {
    console.error('Failed to load snapshots by asset:', error)
    return []
  }
}

/**
 * Save a bulk snapshot for all assets on a given date.
 * Computes & caches the portfolio-level aggregate.
 */
export async function saveBulkSnapshot(
  date: Date,
  entries: Array<{ assetId: string; value: string }>,
) {
  if (entries.length === 0) return { error: 'No entries provided' }

  // Upsert individual asset snapshots
  for (const entry of entries) {
    // Delete existing snapshot for this asset on this date
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const existing = await db.query.snapshots.findFirst({
      where: and(
        eq(snapshots.assetId, entry.assetId),
        gte(snapshots.snapshotAt, dayStart),
        lte(snapshots.snapshotAt, dayEnd),
      ),
    })

    if (existing) {
      await db
        .update(snapshots)
        .set({ value: entry.value })
        .where(eq(snapshots.id, existing.id))
    } else {
      await db.insert(snapshots).values({
        assetId:    entry.assetId,
        value:      entry.value,
        snapshotAt: date,
      })
    }
  }

  // Re-compute portfolio aggregate
  const totalValue    = entries.reduce((s, e) => s + parseFloat(e.value), 0)
  const allDeposits   = await db.query.deposits.findMany()
  const totalDeposited = calcDepositedAsOf(allDeposits, date)
  const pnl           = calcPnL(totalValue, totalDeposited)
  const pnlPct        = calcReturnPct(totalValue, totalDeposited)

  await db
    .insert(portfolioSnapshots)
    .values({
      snapshotAt:     date,
      totalValue:     totalValue.toFixed(2),
      totalDeposited: totalDeposited.toFixed(2),
      pnl:            pnl.toFixed(2),
      pnlPct:         pnlPct.toFixed(4),
    })
    .onConflictDoUpdate({
      target: portfolioSnapshots.snapshotAt,
      set: {
        totalValue:     totalValue.toFixed(2),
        totalDeposited: totalDeposited.toFixed(2),
        pnl:            pnl.toFixed(2),
        pnlPct:         pnlPct.toFixed(4),
      },
    })

  revalidatePath('/')
  revalidatePath('/dashboard/snapshots')

  return { ok: true, totalValue, totalDeposited, pnl, pnlPct }
}

/**
 * Get the last known value for each active asset.
 * Used to pre-fill the bulk snapshot form.
 */
export async function getLastValuePerAsset(): Promise<Record<string, number>> {
  try {
    const activeAssets = await db.query.assets.findMany({
      where: (a, { eq }) => eq(a.isActive, true),
    })

    const result: Record<string, number> = {}

    for (const asset of activeAssets) {
      const latest = await db.query.snapshots.findFirst({
        where: eq(snapshots.assetId, asset.id),
        orderBy: (s, { desc }) => [desc(s.snapshotAt)],
      })
      result[asset.id] = latest ? parseFloat(latest.value) : 0
    }

    return result
  } catch (error) {
    console.error('Failed to load last values per asset:', error)
    return {}
  }
}

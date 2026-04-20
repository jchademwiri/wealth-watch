import type { Deposit, PortfolioSnapshot } from '@/db/schema'

/**
 * Total money you actually put in across all deposits.
 */
export function calcTotalDeposited(deposits: Deposit[]): number {
  return deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0)
}

/**
 * Total deposited up to and including a given date.
 */
export function calcDepositedAsOf(deposits: Deposit[], asOf: Date): number {
  return deposits
    .filter(d => new Date(d.depositedAt) <= asOf)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0)
}

/**
 * Simple unrealised P&L: current value minus total deposited.
 */
export function calcPnL(currentValue: number, totalDeposited: number): number {
  return currentValue - totalDeposited
}

/**
 * Simple return percentage: (current - deposited) / deposited * 100
 * This is "did I make money?" — affected by timing of deposits.
 */
export function calcReturnPct(currentValue: number, totalDeposited: number): number {
  if (totalDeposited === 0) return 0
  return ((currentValue - totalDeposited) / totalDeposited) * 100
}

/**
 * Time-Weighted Rate of Return (TWRR).
 * Removes the effect of deposit timing — shows how the investments
 * themselves performed, independent of when you added money.
 *
 * Formula per sub-period: end_value / (start_value + new_deposits)
 * Then chain-multiply all sub-periods.
 */
export function calcTWRR(
  snapshots: PortfolioSnapshot[],
  deposits: Deposit[],
): number {
  if (snapshots.length < 2) return 0

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.snapshotAt).getTime() - new Date(b.snapshotAt).getTime()
  )

  let twrr = 1

  for (let i = 1; i < sorted.length; i++) {
    const prevSnap   = sorted[i - 1]
    const currSnap   = sorted[i]
    const startValue = parseFloat(prevSnap.totalValue)

    // Sum deposits that fell between the two snapshot dates
    const newDeposits = deposits
      .filter(d => {
        const dt = new Date(d.depositedAt)
        return dt > new Date(prevSnap.snapshotAt) && dt <= new Date(currSnap.snapshotAt)
      })
      .reduce((sum, d) => sum + parseFloat(d.amount), 0)

    const beginValue = startValue + newDeposits
    if (beginValue === 0) continue

    twrr *= parseFloat(currSnap.totalValue) / beginValue
  }

  return (twrr - 1) * 100
}

/**
 * Number of months between two dates (approximate).
 */
export function monthsBetween(start: Date, end: Date): number {
  return Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  )
}

/**
 * Determine recent trend by comparing last two portfolio snapshots.
 */
export function calcRecentTrend(
  snapshots: PortfolioSnapshot[],
): 'improving' | 'declining' | 'stable' {
  if (snapshots.length < 2) return 'stable'
  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime()
  )
  const latest = parseFloat(sorted[0].totalValue)
  const prev   = parseFloat(sorted[1].totalValue)
  const diff   = ((latest - prev) / prev) * 100
  if (diff > 1) return 'improving'
  if (diff < -1) return 'declining'
  return 'stable'
}

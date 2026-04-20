/**
 * Seed script — populates the database with your actual portfolio history.
 * Run with: bun run db:seed
 *
 * Safe to run multiple times — clears existing data first.
 */

import { db } from './index'
import {
  assets,
  deposits,
  snapshots,
  portfolioSnapshots,
  userSettings,
} from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // ── Clear existing data (order matters for FK constraints) ─────────────────
  await db.delete(portfolioSnapshots)
  await db.delete(snapshots)
  await db.delete(deposits)
  await db.delete(assets)
  // await db.delete(userSettings)
  console.log('✓ Cleared existing data')

  // ── User settings ──────────────────────────────────────────────────────────
  // await db.insert(userSettings).values({
  //   id:                1,
  //   firstName:         'Jacob Chademwiri',
  //   reminderEmail:     'hello@example.com', // ← update this
  //   reminderFrequency: 'weekly',
  //   reminderDay:       'monday',
  //   reminderTime:      '08:00',
  //   currencySymbol:    'R',
  // })
  // console.log('✓ User settings created')

  // ── Assets ─────────────────────────────────────────────────────────────────
  const [largeCap, blueChip, tqqq, sp500, gold] = await db
    .insert(assets)
    .values([
      {
        name:      'Large Cap',
        ticker:    null,
        type:      'etf',
        broker:    'easy_equities',
        color:     '#1B3A8A',
        isActive:  true,
        sortOrder: 1,
        notes:     'EasyEquities Large Cap ETF',
      },
      {
        name:      'Blue Chip+',
        ticker:    null,
        type:      'etf',
        broker:    'easy_equities',
        color:     '#7F77DD',
        isActive:  true,
        sortOrder: 2,
        notes:     'EasyEquities Blue Chip+ ETF',
      },
      {
        name:      'TQQQ',
        ticker:    'TQQQ',
        type:      'etf',
        broker:    'easy_equities',
        color:     '#D85A30',
        isActive:  true,
        sortOrder: 3,
        notes:     'ProShares UltraPro QQQ — 3x leveraged NASDAQ. High risk.',
      },
      {
        name:      'S&P 500 SPDR',
        ticker:    'SPY',
        type:      'etf',
        broker:    'easy_equities',
        color:     '#378ADD',
        isActive:  true,
        sortOrder: 4,
        notes:     'SPDR S&P 500 ETF',
      },
      {
        name:      'SPDR Gold',
        ticker:    'GLD',
        type:      'etf',
        broker:    'easy_equities',
        color:     '#BA7517',
        isActive:  true,
        sortOrder: 5,
        notes:     'SPDR Gold Shares ETF — ZAR hedge',
      },
    ])
    .returning()

  console.log('✓ Assets created:', [largeCap, blueChip, tqqq, sp500, gold].map(a => a.name))

  // ── Deposits ───────────────────────────────────────────────────────────────
  await db.insert(deposits).values([
    // 01 October 2025 — Initial deposit into Large Cap
    {
      assetId:     largeCap.id,
      amount:      '3000.00',
      depositedAt: new Date('2025-10-01'),
      notes:       'Initial investment',
    },
    // 01 November 2025 — Diversification deposits
    {
      assetId:     tqqq.id,
      amount:      '500.00',
      depositedAt: new Date('2025-11-01'),
    },
    {
      assetId:     sp500.id,
      amount:      '500.00',
      depositedAt: new Date('2025-11-01'),
    },
    {
      assetId:     gold.id,
      amount:      '100.00',
      depositedAt: new Date('2025-11-01'),
    },
    // 12 March 2026 — Blue Chip+ entry
    {
      assetId:     blueChip.id,
      amount:      '600.00',
      depositedAt: new Date('2026-03-12'),
    },
    // 19 March 2026 — Top up Blue Chip+
    {
      assetId:     blueChip.id,
      amount:      '400.00',
      depositedAt: new Date('2026-03-19'),
    },
  ])

  console.log('✓ Deposits seeded — total: R5,100')

  // ── Snapshots ─────────────────────────────────────────────────────────────
  // Historical snapshot data per asset per date

  const snapshotData: Array<{ date: string; values: Record<string, string> }> = [
    {
      date: '2025-10-01',
      values: {
        largeCap: '3000.00',
        blueChip: '0.00',
        tqqq:     '0.00',
        sp500:    '0.00',
        gold:     '0.00',
      },
    },
    {
      date: '2025-11-01',
      values: {
        largeCap: '2650.00',
        blueChip: '0.00',
        tqqq:     '500.00',
        sp500:    '500.00',
        gold:     '100.00',
      },
    },
    {
      date: '2025-12-01',
      values: {
        largeCap: '2308.88',
        blueChip: '0.00',
        tqqq:     '448.03',
        sp500:    '497.65',
        gold:     '86.48',
      },
    },
    {
      date: '2026-03-12',
      values: {
        largeCap: '1640.69',
        blueChip: '600.00',
        tqqq:     '387.33',
        sp500:    '475.06',
        gold:     '102.63',
      },
    },
    {
      date: '2026-03-19',
      values: {
        largeCap: '1705.71',
        blueChip: '987.75',
        tqqq:     '378.56',
        sp500:    '475.70',
        gold:     '96.45',
      },
    },
    {
      date: '2026-04-01',
      values: {
        largeCap: '1679.56',
        blueChip: '983.35',
        tqqq:     '384.79',
        sp500:    '479.60',
        gold:     '94.15',
      },
    },
    {
      date: '2026-04-03',
      values: {
        largeCap: '1603.87',
        blueChip: '953.36',
        tqqq:     '350.86',
        sp500:    '474.23',
        gold:     '94.90',
      },
    },
    {
      date: '2026-04-15',
      values: {
        largeCap: '1716.99',
        blueChip: '1012.83',
        tqqq:     '414.99',
        sp500:    '484.36',
        gold:     '94.35',
      },
    },
  ]

  const assetMap = {
    largeCap: largeCap.id,
    blueChip: blueChip.id,
    tqqq:     tqqq.id,
    sp500:    sp500.id,
    gold:     gold.id,
  }

  // Running total of deposits per snapshot date (for P&L calc)
  const depositTotals: Record<string, number> = {
    '2025-10-01': 3000,
    '2025-11-01': 4100,
    '2025-12-01': 4100,
    '2026-03-12': 4700,
    '2026-03-19': 5100,
    '2026-04-01': 5100,
    '2026-04-03': 5100,
    '2026-04-15': 5100,
  }

  for (const { date, values } of snapshotData) {
    const snapshotAt = new Date(date)
    const rows = []

    for (const [key, value] of Object.entries(values)) {
      if (parseFloat(value) === 0 && (key === 'blueChip' && date < '2026-03-12')) continue
      rows.push({
        assetId:    assetMap[key as keyof typeof assetMap],
        value,
        snapshotAt,
      })
    }

    await db.insert(snapshots).values(rows)

    // Build portfolio snapshot aggregate
    const totalValue     = Object.values(values).reduce((s, v) => s + parseFloat(v), 0)
    const totalDeposited = depositTotals[date]
    const pnl            = totalValue - totalDeposited
    const pnlPct         = (pnl / totalDeposited) * 100

    await db.insert(portfolioSnapshots).values({
      snapshotAt,
      totalValue:     totalValue.toFixed(2),
      totalDeposited: totalDeposited.toFixed(2),
      pnl:            pnl.toFixed(2),
      pnlPct:         pnlPct.toFixed(4),
    }).onConflictDoNothing()
  }

  console.log('✓ Snapshots seeded —', snapshotData.length, 'dates')
  console.log('\n✅ Seed complete!')
  console.log('   Total deposited : R5,100.00')
  console.log('   Current value   : R3,723.52')
  console.log('   P&L             : -R1,376.48 (-26.99%)')
  console.log('\n   👉 Update reminderEmail in seed.ts before running in production')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

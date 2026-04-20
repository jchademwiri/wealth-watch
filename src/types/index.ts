import type { Asset, Deposit, Snapshot, PortfolioSnapshot } from '@/db/schema'

// ─── Extended types with relations ────────────────────────────────────────────

export type AssetWithLatestSnapshot = Asset & {
  latestValue:     number
  totalDeposited:  number
  pnl:             number
  returnPct:       number
}

export type PortfolioSummary = {
  totalDeposited:  number
  currentValue:    number
  pnl:             number
  returnPct:       number
  twrr:            number
  assets:          AssetWithLatestSnapshot[]
  snapshots:       PortfolioSnapshot[]
}

export type SnapshotWithAsset = Snapshot & {
  asset: Asset
}

export type DepositWithAsset = Deposit & {
  asset: Asset
}

export type BulkSnapshotEntry = {
  assetId:    string
  assetName:  string
  color:      string
  lastValue:  number
  newValue:   string
}

export type PortfolioInsightData = {
  totalDeposited:   number
  currentValue:     number
  pnl:              number
  pnlPct:           number
  twrr:             number
  periodMonths:     number
  holdings:         Array<{
    name:       string
    deposited:  number
    current:    number
    returnPct:  number
    weight:     number
  }>
  deposits: Array<{
    date:       string
    amount:     number
    assetName:  string
  }>
  recentTrend: 'improving' | 'declining' | 'stable'
}

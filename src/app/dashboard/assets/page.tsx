import Link from 'next/link'
import { Plus, Archive } from 'lucide-react'
import { getAssets } from '@/actions/assets'
import { ToggleAssetButton } from './ToggleAssetButton'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  etf:        'ETF',
  stock:      'Stock',
  crypto:     'Crypto',
  unit_trust: 'Unit Trust',
  cash:       'Cash',
  bond:       'Bond',
  reit:       'REIT',
  other:      'Other',
}

const BROKER_LABELS: Record<string, string> = {
  easy_equities:  'EasyEquities',
  luno:           'Luno',
  satrix:         'Satrix',
  allan_gray:     'Allan Gray',
  tfg:            'TFG',
  absa:           'ABSA',
  fnb:            'FNB',
  nedbank:        'Nedbank',
  standard_bank:  'Standard Bank',
  other:          'Other',
}

export default async function AssetsPage() {
  const assets = await getAssets()
  const active   = assets.filter(a => a.isActive)
  const archived = assets.filter(a => !a.isActive)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets</h1>
          <p className="text-sm text-muted-foreground">{active.length} active · {archived.length} archived</p>
        </div>
        <Link
          href="/dashboard/assets/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add asset
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        {active.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No assets yet.</p>
            <Link href="/dashboard/assets/new" className="mt-2 inline-block text-sm text-primary hover:underline">
              Add your first asset →
            </Link>
          </div>
        )}
        <div className="divide-y">
          {active.map(asset => (
            <div key={asset.id} className="flex items-center gap-3 px-4 py-3">
              <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: asset.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABELS[asset.type]} · {BROKER_LABELS[asset.broker]}
                  {asset.ticker && ` · ${asset.ticker}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/assets/${asset.id}`}
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  Edit
                </Link>
                <ToggleAssetButton id={asset.id} isActive={true} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {archived.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Archived</h2>
          </div>
          <div className="rounded-lg border bg-card opacity-60">
            <div className="divide-y">
              {archived.map(asset => (
                <div key={asset.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: asset.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{TYPE_LABELS[asset.type]} · {BROKER_LABELS[asset.broker]}</p>
                  </div>
                  <ToggleAssetButton id={asset.id} isActive={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

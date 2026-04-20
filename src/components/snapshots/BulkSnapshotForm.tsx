'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { saveBulkSnapshot } from '@/actions/snapshots'
import { generatePortfolioInsight } from '@/actions/ai'
import { formatZAR } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import type { Asset } from '@/db/schema'

interface Props {
  assets:        Asset[]
  lastValues:    Record<string, number>
  defaultDate?:  string
}

export function BulkSnapshotForm({ assets, lastValues, defaultDate }: Props) {
  const router   = useRouter()
  const [pending, startTransition] = useTransition()

  const today = defaultDate ?? new Date().toISOString().split('T')[0]
  const [date,   setDate]   = useState(today)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    assets.forEach(a => {
      init[a.id] = lastValues[a.id]?.toFixed(2) ?? '0.00'
    })
    return init
  })
  const [done,  setDone]  = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalValue = Object.values(values).reduce((s, v) => s + (parseFloat(v) || 0), 0)

  function handleChange(assetId: string, raw: string) {
    setValues(prev => ({ ...prev, [assetId]: raw }))
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const entries = assets.map(a => ({
        assetId: a.id,
        value:   (parseFloat(values[a.id] ?? '0') || 0).toFixed(2),
      }))

      const result = await saveBulkSnapshot(new Date(date + 'T12:00:00'), entries)

      if ('error' in result && result.error) {
        setError(String(result.error))
        return
      }

      // Fire-and-forget AI insight generation
      generatePortfolioInsight().catch(console.error)

      setDone(true)
      setTimeout(() => router.push('/'), 1500)
    })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
        <p className="text-lg font-medium">Snapshot saved!</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Snapshot date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            Enter current value for each asset
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pre-filled from last snapshot. Update with today&apos;s values from your broker / Luno.
          </p>
        </div>
        <div className="divide-y">
          {assets.map(asset => {
            const last    = lastValues[asset.id] ?? 0
            const current = parseFloat(values[asset.id] ?? '0') || 0
            const diff    = current - last
            const pct     = last > 0 ? (diff / last) * 100 : 0

            return (
              <div key={asset.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ background: asset.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{asset.name}</p>
                  {asset.ticker && (
                    <p className="text-xs text-muted-foreground">{asset.ticker}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">R</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={values[asset.id] ?? ''}
                      onChange={e => handleChange(asset.id, e.target.value)}
                      className="w-28 rounded border bg-background px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  {last > 0 && (
                    <p className={cn(
                      'mt-0.5 text-right text-xs',
                      diff > 0  ? 'text-emerald-600 dark:text-emerald-400' :
                      diff < 0  ? 'text-red-500 dark:text-red-400' :
                      'text-muted-foreground'
                    )}>
                      {diff >= 0 ? '+' : ''}{pct.toFixed(1)}% vs last
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="font-mono font-medium">{formatZAR(totalValue)}</span>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving snapshot…
          </>
        ) : (
          'Save snapshot'
        )}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        An AI insight will be generated automatically after saving.
      </p>
    </div>
  )
}

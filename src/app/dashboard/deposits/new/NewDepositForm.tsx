'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createDeposit } from '@/actions/deposits'
import type { Asset } from '@/db/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  assets: Asset[]
}

export function NewDepositForm({ assets }: Props) {
  const router  = useRouter()
  const [pending, startTransition] = useTransition()
  const [error,   setError]   = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createDeposit({
        assetId:     fd.get('assetId') as string,
        amount:      fd.get('amount') as string,
        depositedAt: new Date(fd.get('date') as string + 'T12:00:00'),
        notes:       (fd.get('notes') as string) || null,
      })

      if (result.error) {
        setError(JSON.stringify(result.error))
      } else {
        router.push('/dashboard/deposits')
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Asset <span className="text-red-500">*</span></label>
          <Select name="assetId" defaultValue="" disabled={pending} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an asset…" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}{a.ticker ? ` (${a.ticker})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Amount (ZAR) <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">R</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="500.00"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Date <span className="text-red-500">*</span></label>
          <input
            name="date"
            type="date"
            required
            defaultValue={today}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Notes <span className="text-muted-foreground">(optional)</span></label>
          <input
            name="notes"
            type="text"
            placeholder="e.g. Monthly contribution"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Log deposit'}
      </button>
    </form>
  )
}

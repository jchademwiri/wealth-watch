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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  assets: Asset[]
}

export function NewDepositForm({ assets }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createDeposit({
        assetId: fd.get('assetId') as string,
        amount: fd.get('amount') as string,
        depositedAt: new Date(fd.get('date') as string + 'T12:00:00'),
        notes: (fd.get('notes') as string) || null,
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
          <Label className="mb-1.5 block">Asset <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="amount" className="mb-1.5 block">
            Amount (ZAR) <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">R</span>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="500.00"
              className="flex-1 min-w-0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="date" className="mb-1.5 block">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={today}
          />
        </div>

        <div>
          <Label htmlFor="notes" className="mb-1.5 block">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="notes"
            name="notes"
            type="text"
            placeholder="e.g. Monthly contribution"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Saving…' : 'Log deposit'}
      </Button>
    </form>
  )
}

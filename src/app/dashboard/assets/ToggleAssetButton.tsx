'use client'

import { useTransition } from 'react'
import { toggleAssetActive } from '@/actions/assets'

export function ToggleAssetButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleAssetActive(id))}
      className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
    >
      {pending ? '…' : isActive ? 'Archive' : 'Restore'}
    </button>
  )
}

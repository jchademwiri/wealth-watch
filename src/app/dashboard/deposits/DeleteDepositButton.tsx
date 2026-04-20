'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteDeposit } from '@/actions/deposits'
import { Button } from '@/components/ui/button'

export function DeleteDepositButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      disabled={pending}
      onClick={() => {
        if (!confirm('Delete this deposit?')) return
        startTransition(() => {
          void deleteDeposit(id)
        })
      }}
      className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 dark:hover:bg-red-950"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}

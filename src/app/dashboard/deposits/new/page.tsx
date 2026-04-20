import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getActiveAssets } from '@/actions/assets'
import { NewDepositForm } from './NewDepositForm'

export const dynamic = 'force-dynamic'

export default async function NewDepositPage() {
  const assets = await getActiveAssets()

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/deposits" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">Log deposit</h1>
      </div>
      <div className="mx-auto max-w-lg">
        <NewDepositForm assets={assets} />
      </div>
    </div>
  )
}

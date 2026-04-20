import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NewAssetForm } from './NewAssetForm'

export default function NewAssetPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/assets" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">Add asset</h1>
      </div>
      <div className="mx-auto max-w-lg">
        <NewAssetForm />
      </div>
    </div>
  )
}
